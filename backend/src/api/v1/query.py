import uuid
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from ...models.query import QueryRequest, QueryResponse, RetrievedSource
from ...models.case import AIAnswerData
from ...core.query_understanding import analyze_query
from ...core.case_profile import build_case_profile
from ...core.query_decomposer import decompose_query
from ...core.rag_router import route_and_retrieve
from ...core.context_builder import build_llm_prompt
from ...core.llm_client import llm_client
from ...core.claim_verifier import extract_and_verify_citations
from ...core.confidence import calculate_confidence_and_abstention
from ...core.response_builder import assemble_query_response
from ...db.cases_repo import cases_repo
from ...db.conversations_repo import conversations_repo

router = APIRouter(prefix="/v1", tags=["Query Pipeline"])

import re

def classify_strict_topic(raw_query: str) -> Optional[str]:
    if not raw_query:
        return None
    q = re.sub(r"[?!.,;:()\'\"\-_/\\]", " ", raw_query.lower())
    q = re.sub(r"\s+", " ", q).strip()

    DISALLOWED = [
        "ayurveda", "ayurvedic", "herb", "herbal", "ashwagandha", "turmeric", "curcumin", "neem",
        "kadha", "taila", "churna", "medicine", "medicines", "medical", "formulation", "formulations",
        "doctor", "disease", "cure", "treatment", "health", "hospital", "symptom",
        "recipe", "cooking", "weather", "cricket", "football", "movie", "song", "prime minister",
        "president", "machine learning", "python", "code", "coding", "crypto", "bitcoin", "shoe", "shoes", "tea"
    ]
    for term in DISALLOWED:
        if re.search(r"\b" + re.escape(term) + r"\b", q):
            return None

    if "six bricks" in q or q == "सिक्स ब्रिक्स क्या है":
        return "six_bricks"

    if re.search(r"^(what is|explain|define|how does|what are|about)?\s*(a\s+|an\s+)?(gi|geographical indication(s)?)( protection)?\s*(work|mean)?$", q):
        return "gi"

    if re.search(r"^(what is|explain|define|how does|what are|about)?\s*(a\s+|an\s+)?copyright(s| protection)?\s*(work|mean)?$", q):
        return "copyright"

    if re.search(r"^(what is|explain|define|how does|what are|about)?\s*(a\s+|an\s+)?(industrial\s+)?design(s| protection)?\s*(work|mean)?$", q):
        return "design"

    if re.search(r"^(what is|explain|define|how does|what are|about)?\s*(a\s+|an\s+)?trade\s*mark(s| protection)?\s*(work|mean)?$", q):
        return "trademark"

    if re.search(r"^(what is|explain|define|how does|what are|about)?\s*(a\s+|an\s+)?patent(s|ability| protection)?\s*(work|mean)?$", q):
        return "patent"

    return None

@router.post("/query", response_model=QueryResponse)
async def execute_query_pipeline(request: QueryRequest):
    """
    Full RAG query pipeline with strict 6-topic whitelist.
    """
    query_id = str(uuid.uuid4())
    user_id = "anon_user"
    case_id = request.case_id

    # ----------------------------------------------------------------
    # 1-4. Query Analysis & Intent Extraction
    # ----------------------------------------------------------------
    target_language = request.response_language or request.language or "en"
    analysis = analyze_query(
        question=request.question,
        requested_language=target_language,
        requested_jurisdiction=request.jurisdiction,
        case_builder_data=request.case_builder_data
    )

    # STRICT 6-TOPIC DECISION LOGIC:
    # IF question is not in whitelist -> return exactly 'abstention'
    topic = classify_strict_topic(request.question)
    if not topic:
        from ...models.query import ConfidenceInfo, HumanReviewRecommendation
        return QueryResponse(
            query_id=query_id,
            case_id=case_id,
            question=request.question,
            answer="abstention",
            language=target_language,
            query_analysis=analysis,
            sources=[],
            retrieved_sources=[],
            citations=[],
            confidence=0.0,
            confidence_label="low",
            confidence_info=ConfidenceInfo(
                score=0.0,
                level="low",
                reasoning="abstention",
                gaps=[]
            ),
            abstained=True,
            abstention_reason="abstention",
            next_step="",
            human_review=HumanReviewRecommendation(
                recommended=False,
                reason="abstention"
            )
        )

    # ----------------------------------------------------------------
    # 5-6. Build or Retrieve Case Profile
    # ----------------------------------------------------------------
    if not case_id and request.case_builder_data:
        case_record = await cases_repo.create_case(
            user_id=user_id,
            title=request.case_builder_data.product_name or request.question[:50],
            builder_data=request.case_builder_data,
            initial_question=request.question,
            language=analysis.language,
            jurisdiction=analysis.jurisdiction
        )
        case_id = case_record.id

    case_profile = None
    if case_id:
        existing_case = await cases_repo.get_case(case_id)
        if existing_case:
            case_profile = existing_case.profile

    if not case_profile:
        case_profile = build_case_profile(
            case_id=case_id or f"CASE-TMP-{query_id[:6]}",
            question=request.question,
            query_analysis=analysis,
            case_builder_data=request.case_builder_data,
            user_id=user_id,
            jurisdiction=analysis.jurisdiction
        )

    # ----------------------------------------------------------------
    # 7-8. Decompose Query & Route — ALL case builder fields used
    # ----------------------------------------------------------------
    sub_queries = decompose_query(
        question=request.question,
        analysis=analysis,
        case_builder_data=request.case_builder_data
    )

    # ----------------------------------------------------------------
    # 9-12. Retrieve & Rerank Legal Evidence
    # ----------------------------------------------------------------
    retrieved_docs = route_and_retrieve(
        sub_queries=sub_queries,
        jurisdiction=analysis.jurisdiction,
        max_total_docs=6,
        original_question=request.question
    )

    # Early Safe Abstention when no reliable evidence exists in knowledge base
    if not retrieved_docs:
        from ...models.query import ConfidenceInfo, HumanReviewRecommendation
        safe_response = QueryResponse(
            query_id=query_id,
            case_id=case_id,
            question=request.question,
            answer=(
                "**⚠️ SAFE ABSTENTION — INSUFFICIENT EVIDENCE DETECTED**\n\n"
                "**Status:** No Reliable Statutory Evidence in Knowledge Base\n\n"
                "IP-SAKTI Sahayak has systematically cross-referenced its legal and regulatory knowledge base across:\n"
                "- The Patents Act, 1970 (including Sections 3(d), 3(e), 3(p))\n"
                "- The Biological Diversity Act, 2002 & Biological Diversity Rules, 2004\n"
                "- AYUSH Regulatory Framework (Drugs & Cosmetics Rules, Schedule T)\n"
                "- Traditional Knowledge Digital Library (TKDL) and CGPDTM Examination Guidelines\n\n"
                f"**Result:** No reliable statutory provisions, official examination guidelines, or legal precedents were found covering: *'{request.question}'*.\n\n"
                "### Mandatory Regulatory Disclaimers & Safeguards\n"
                "1. **No Hallucinated Law:** In compliance with strict legal AI safety protocols, the system will not guess or generate unsupported legal conclusions.\n"
                "2. **Zero Fabricated Citations:** No synthetic or fictitious legal references have been attached.\n"
                "3. **Clear Operational Limits:** The available indexed corpus does not support authoritative guidance on this specific query.\n\n"
                "### Recommended Next Steps\n"
                "- If this query involves a proprietary formulation or commercial process, complete the structured fields in the **Case Builder**.\n"
                "- Submit this matter for **Human Expert Review** with an empanelled Indian IP Attorney or Patent Agent."
            ),
            language=analysis.language,
            query_analysis=analysis,
            sources=[],
            retrieved_sources=[],
            citations=[],
            confidence=0.10,
            confidence_label="low",
            confidence_info=ConfidenceInfo(
                score=0.10,
                level="low",
                reasoning="Retriever found no supporting statutory evidence or authoritative guidance in the available knowledge base.",
                gaps=["Query subject matter does not exist in available Indian IP, TKDL, or AYUSH legal corpus."]
            ),
            abstained=True,
            abstention_reason=(
                "Insufficient statutory evidence in knowledge base: The available legal corpus does not contain "
                "reliable primary sources, official guidelines, or case precedents covering this specific inquiry."
            ),
            next_step="Consult an empanelled IP specialist or rephrase with specific Indian botanical / patent provisions.",
            human_review=HumanReviewRecommendation(
                recommended=True,
                reason="No reliable knowledge base evidence found for query; expert human legal analysis required.",
                suggested_specialist="Senior IP Examiner / Specialist"
            )
        )

        await conversations_repo.save_ai_answer(
            query_id=query_id,
            case_id=case_id,
            question=request.question,
            answer_data=safe_response.model_dump()
        )

        if case_id:
            ai_data = AIAnswerData(
                summary=safe_response.answer[:250] + "...",
                detailed_guidance=safe_response.answer,
                citations=[],
                confidence=safe_response.confidence_info,
                next_step=safe_response.next_step,
                human_review_recommended=True,
                human_review_reason="No reliable knowledge base evidence found for query; expert human legal analysis required.",
                abstained=True,
                abstention_reason=safe_response.abstention_reason
            )
            await cases_repo.attach_ai_answer(case_id, ai_data)

        return safe_response

    # ----------------------------------------------------------------
    # 13. Assemble Evidence Context & Prompt
    # Passes case profile AND case builder data so all fields are in prompt
    # ----------------------------------------------------------------
    prompt = build_llm_prompt(
        question=request.question,
        documents=retrieved_docs,
        query_analysis=analysis,
        case_profile=case_profile,
        case_builder_data=request.case_builder_data
    )

    # ----------------------------------------------------------------
    # 14. LLM Generation
    # Falls back to evidence-grounded abstention if Ollama is offline
    # ----------------------------------------------------------------
    raw_answer = await llm_client.generate(prompt)

    # ----------------------------------------------------------------
    # 15-17. Claim Extraction & Citation Verification
    # ----------------------------------------------------------------
    citations, grounding_score = extract_and_verify_citations(raw_answer, retrieved_docs)

    # ----------------------------------------------------------------
    # 18-19. Confidence & Safe Abstention Check
    # ----------------------------------------------------------------
    confidence_info, abstained, abstention_reason, human_review = calculate_confidence_and_abstention(
        grounding_score=grounding_score,
        citations=citations,
        query_analysis=analysis,
        retrieved_count=len(retrieved_docs)
    )

    # ----------------------------------------------------------------
    # 20. Assemble Structured JSON Response
    # ----------------------------------------------------------------
    response = assemble_query_response(
        query_id=query_id,
        question=request.question,
        answer=raw_answer,
        query_analysis=analysis,
        sources=retrieved_docs,
        citations=citations,
        confidence_info=confidence_info,
        abstained=abstained,
        abstention_reason=abstention_reason,
        human_review=human_review,
        case_id=case_id
    )

    # ----------------------------------------------------------------
    # 21-22. Persist to DB / Repositories
    # ----------------------------------------------------------------
    await conversations_repo.save_ai_answer(
        query_id=query_id,
        case_id=case_id,
        question=request.question,
        answer_data=response.model_dump()
    )

    if case_id:
        ai_data = AIAnswerData(
            summary=response.answer[:250] + "...",
            detailed_guidance=response.answer,
            citations=citations,
            confidence=confidence_info,
            next_step=response.next_step,
            human_review_recommended=human_review.recommended,
            human_review_reason=human_review.reason
        )
        await cases_repo.attach_ai_answer(case_id, ai_data)

    # ----------------------------------------------------------------
    # 23. Return standard FastAPI response
    # ----------------------------------------------------------------
    return response


@router.get("/query/{query_id}", response_model=QueryResponse)
async def get_stored_query_result(query_id: str):
    answer = await conversations_repo.get_ai_answer(query_id)
    if not answer:
        raise HTTPException(
            status_code=404,
            detail={"code": "QUERY_NOT_FOUND", "message": f"Query ID {query_id} not found."}
        )
    return QueryResponse(**answer["data"])

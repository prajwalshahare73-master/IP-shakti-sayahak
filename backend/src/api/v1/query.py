import uuid
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from ...models.query import QueryRequest, QueryResponse
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

@router.post("/query", response_model=QueryResponse)
async def execute_query_pipeline(request: QueryRequest):
    """
    Full 23-step legal RAG query pipeline connecting query understanding,
    multi-domain decomposition, Chroma+BM25+RRF+Reranker retrieval,
    LLaMA 3.1 generation, citation grounding, confidence calculation, and persistence.
    """
    query_id = str(uuid.uuid4())
    user_id = "anon_user"
    case_id = request.case_id

    # 1-4. Query Analysis & Intent Extraction
    target_language = request.response_language or request.language or "en"
    analysis = analyze_query(
        question=request.question,
        requested_language=target_language,
        requested_jurisdiction=request.jurisdiction,
        case_builder_data=request.case_builder_data
    )

    # Early Safe Abstention for Out-of-Scope Queries
    if analysis.query_type == "out_of_scope":
        from ...models.query import ConfidenceInfo, HumanReviewRecommendation
        return QueryResponse(
            query_id=query_id,
            case_id=case_id,
            question=request.question,
            answer="**OUT OF SCOPE / NOT VERIFIED:** This query is outside the scope of IP-SAKTI Sahayak. IP-SAKTI Sahayak provides statutory and regulatory guidance exclusively on Indian Intellectual Property Law (Patents Act 1970, Trade Marks Act 1999, Copyright, GI, Designs), Traditional Knowledge (TKDL), Biological Diversity (Biological Diversity Act 2002 / NBA & SBB), and AYUSH regulatory compliance (Drugs & Cosmetics Rules). Please submit a question relating to Ayurveda formulation patentability, trademark protection, prior art, or ABS statutory obligations.",
            language=analysis.language,
            query_analysis=analysis,
            sources=[],
            citations=[],
            confidence=0.1,
            confidence_label="low",
            confidence_info=ConfidenceInfo(
                score=0.1,
                level="low",
                reasoning="The question falls outside the legal and regulatory domain of IP-SAKTI Sahayak.",
                gaps=["Query is not related to Indian Intellectual Property, Traditional Knowledge, or AYUSH regulations."]
            ),
            abstained=True,
            abstention_reason="Out-of-scope query: Question does not relate to Indian IP or Ayurveda regulatory frameworks.",
            next_step="Ask an IP or Ayurveda question (e.g. Can I patent a polyherbal formulation under Section 3(p)?).",
            human_review=HumanReviewRecommendation(
                recommended=False,
                reason="Query is outside the system's legal advisory scope."
            )
        )

    # 5-6. Build or retrieve Case Profile
    case_id = request.case_id
    if not case_id and request.case_builder_data:
        # Create case record if Case Builder data was submitted with query
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

    # 7-8. Decompose Query & Route
    sub_queries = decompose_query(
        question=request.question,
        analysis=analysis,
        case_builder_data=request.case_builder_data
    )

    # 9-12. Retrieve & Rerank Legal Evidence (Chroma + BM25 + RRF + Reranker + Authority Filter)
    retrieved_docs = route_and_retrieve(
        sub_queries=sub_queries,
        jurisdiction=analysis.jurisdiction,
        max_total_docs=6
    )

    # 13. Assemble Evidence Context & Prompt
    prompt = build_llm_prompt(
        question=request.question,
        documents=retrieved_docs,
        query_analysis=analysis,
        case_profile=case_profile,
        case_builder_data=request.case_builder_data
    )

    # 14. LLaMA 3.1 Generation via Ollama
    raw_answer = await llm_client.generate(prompt)

    # 15-17. Claim Extraction & Citation Verification
    citations, grounding_score = extract_and_verify_citations(raw_answer, retrieved_docs)

    # 18-19. Confidence & Safe Abstention Check
    confidence_info, abstained, abstention_reason, human_review = calculate_confidence_and_abstention(
        grounding_score=grounding_score,
        citations=citations,
        query_analysis=analysis,
        retrieved_count=len(retrieved_docs)
    )

    # 20. Assemble Structured JSON Response
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

    # 21-22. Persist to DB / Repositories
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

    # 23. Return standard FastAPI response
    return response

@router.get("/query/{query_id}", response_model=QueryResponse)
async def get_stored_query_result(query_id: str):
    answer = await conversations_repo.get_ai_answer(query_id)
    if not answer:
        raise HTTPException(status_code=404, detail={"code": "QUERY_NOT_FOUND", "message": f"Query ID {query_id} not found."})
    return QueryResponse(**answer["data"])

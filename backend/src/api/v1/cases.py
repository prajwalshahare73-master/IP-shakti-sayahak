from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime

from ...models.case import (
    CaseRecord, CaseCreateRequest, CaseStatusUpdateRequest, CaseStatus, 
    AIAnswerData, CaseAnalyzeRequest
)
from ...db.cases_repo import cases_repo
from ...auth.jwt import get_current_user_payload
from ...core.query_understanding import analyze_query
from ...core.query_decomposer import decompose_query
from ...core.rag_router import route_and_retrieve
from ...core.context_builder import build_llm_prompt
from ...core.llm_client import llm_client
from ...models.query import ConfidenceInfo, HumanReviewRecommendation
from ...core.claim_verifier import extract_and_verify_citations
from ...core.confidence import calculate_confidence_and_abstention

router = APIRouter(prefix="/v1", tags=["Cases"])

@router.post("/cases", response_model=CaseRecord)
async def create_case(request: CaseCreateRequest, auth_user = Depends(get_current_user_payload)):
    user_id = auth_user.get("sub", "anon_user") if auth_user else "anon_user"
    record = await cases_repo.create_case(
        user_id=user_id,
        title=request.title,
        builder_data=request.case_builder_data,
        initial_question=request.initial_question,
        language=request.language or "en",
        jurisdiction=request.jurisdiction or "india"
    )
    return record

@router.get("/cases", response_model=List[CaseRecord])
async def list_cases(auth_user = Depends(get_current_user_payload)):
    user_id = auth_user.get("sub", "anon_user") if auth_user else "anon_user"
    return await cases_repo.list_cases_for_user(user_id)

@router.get("/cases/{case_id}", response_model=CaseRecord)
async def get_case(case_id: str):
    record = await cases_repo.get_case(case_id)
    if not record:
        raise HTTPException(
            status_code=404, 
            detail={"code": "CASE_NOT_FOUND", "message": f"Case with ID {case_id} not found."}
        )
    return record

@router.patch("/cases/{case_id}", response_model=CaseRecord)
async def update_case_status(case_id: str, request: CaseStatusUpdateRequest, auth_user = Depends(get_current_user_payload)):
    actor_id = auth_user.get("sub") if auth_user else None
    actor_role = auth_user.get("role", "user") if auth_user else "user"

    try:
        updated = await cases_repo.update_status(
            case_id=case_id,
            new_status=request.status,
            actor_id=actor_id,
            actor_role=actor_role,
            note=request.note
        )
        return updated
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_CASE_STATUS_TRANSITION", "message": str(e)}
        )


@router.post("/cases/{case_id}/analyze")
async def analyze_case(
    case_id: str, 
    request: Optional[CaseAnalyzeRequest] = None,
    response_language: Optional[str] = None,
    auth_user=Depends(get_current_user_payload)
):
    """
    Runs the full RAG pipeline on an existing case to generate structured AI legal analysis.
    Stores AIAnswerData in the case record and transitions status to IN_REVIEW.
    Honors user's selected language as the authoritative source of truth.
    """
    case = await cases_repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})

    profile = case.profile
    target_language = (
        (request.response_language if request and request.response_language else None)
        or (request.language if request and request.language else None)
        or response_language
        or (profile.language if profile and profile.language else "en")
    )
    if profile:
        profile.language = target_language

    question = (
        (request.question if request and request.question else None)
        or (profile.key_questions[0] if profile and profile.key_questions else None)
        or (f"Analyze IP protection strategy for {profile.product_name}" if profile and profile.product_name else "General IP analysis for Ayurvedic formulation.")
    )
    jurisdiction = (request.jurisdiction if request and request.jurisdiction else None) or (profile.jurisdiction if profile and profile.jurisdiction else "india")

    analysis = analyze_query(
        question=question, 
        requested_language=target_language, 
        requested_jurisdiction=jurisdiction, 
        case_builder_data=case.builder_data
    )

    if analysis.query_type == "out_of_scope":
        ai_data = AIAnswerData(
            summary="**OUT OF SCOPE / NOT VERIFIED:** This case/question falls outside the statutory scope of IP-SAKTI Sahayak.",
            detailed_guidance="### SAFE ABSTENTION\nThis case falls outside the scope of Indian Intellectual Property, Traditional Knowledge (TKDL), and Biological Diversity (NBA) frameworks. IP-SAKTI Sahayak cannot provide legal assessment on topics outside Indian IP or AYUSH regulatory laws.\n\nPlease consult an appropriate legal specialist.",
            citations=[],
            confidence=ConfidenceInfo(
                score=0.1,
                level="low",
                reasoning="The inquiry is outside the statutory scope of Indian IP and AYUSH regulatory frameworks.",
                gaps=["Case does not relate to Indian Patents Act 1970, Traditional Knowledge, or Biological Diversity Act 2002."]
            ),
            next_step="Submit an inquiry relating to Ayurvedic formulations, patentability, or NBA compliance.",
            human_review_recommended=True,
            human_review_reason="Out of scope matter requires independent specialist advice."
        )
        await cases_repo.attach_ai_answer(case_id, ai_data)
        return {
            "case_id": case_id,
            "status": "analysis_complete",
            "language": target_language,
            "confidence": 0.1,
            "confidence_level": "low",
            "abstained": True,
            "citations_count": 0,
            "human_review_recommended": True,
            "analysis_summary": ai_data.summary,
            "detailed_guidance": ai_data.detailed_guidance,
            "citations": []
        }

    sub_queries = decompose_query(question=question, analysis=analysis, case_builder_data=case.builder_data)
    retrieved_docs = route_and_retrieve(sub_queries=sub_queries, jurisdiction=analysis.jurisdiction, max_total_docs=6)
    prompt = build_llm_prompt(question=question, documents=retrieved_docs, query_analysis=analysis, case_profile=profile, case_builder_data=case.builder_data)
    raw_answer = await llm_client.generate(prompt)
    citations, grounding_score = extract_and_verify_citations(raw_answer, retrieved_docs)
    confidence_info, abstained, abstention_reason, human_review = calculate_confidence_and_abstention(
        grounding_score=grounding_score, citations=citations, query_analysis=analysis, retrieved_count=len(retrieved_docs)
    )

    ai_data = AIAnswerData(
        summary=raw_answer[:300].strip() + ("..." if len(raw_answer) > 300 else ""),
        detailed_guidance=raw_answer if not abstained else f"### SAFE ABSTENTION\n{abstention_reason}\n\nPlease consult an IP expert.",
        citations=citations,
        confidence=confidence_info,
        next_step=human_review.reason or "Proceed with prior art search and statutory compliance checklist.",
        human_review_recommended=human_review.recommended,
        human_review_reason=human_review.reason
    )
    await cases_repo.attach_ai_answer(case_id, ai_data)

    try:
        await cases_repo.update_status(case_id=case_id, new_status=CaseStatus.IN_REVIEW, actor_id="system", actor_role="system", note="AI analysis generated.")
    except ValueError:
        pass

    return {
        "case_id": case_id, 
        "status": "analysis_complete",
        "language": target_language,
        "confidence": confidence_info.score, 
        "confidence_level": confidence_info.level,
        "abstained": abstained, 
        "citations_count": len(citations),
        "human_review_recommended": human_review.recommended, 
        "analysis_summary": ai_data.summary,
        "detailed_guidance": ai_data.detailed_guidance,
        "citations": [c.dict() for c in citations]
    }


@router.get("/cases/{case_id}/report")
async def get_case_report(case_id: str, language: Optional[str] = None):
    """
    Returns a structured JSON report for PDF rendering / printing.
    Multilingual disclaimers: en, hi, mr, sa, gu, te, kn, bn, hinglish.
    """
    case = await cases_repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})

    profile = case.profile
    ai = case.ai_answer
    report_lang = (language or (profile.language if profile and profile.language else "en")).lower()

    DISCLAIMERS = {
        "en": "This report is generated by IP-SAKTI Sahayak for informational purposes only. It does not constitute legal advice.",
        "hi": "यह रिपोर्ट IP-SAKTI सहायक द्वारा केवल सूचनात्मक उद्देश्यों के लिए तैयार की गई है। यह कानूनी सलाह नहीं है।",
        "mr": "हा अहवाल IP-SAKTI सहायक द्वारे केवळ माहितीच्या उद्देशाने तयार केला आहे. हे कायदेशीर सल्ला नाही.",
        "sa": "इदम् प्रतिवेदनम् IP-SAKTI सहायकेन केवलं सूचनार्थं निर्मितम्। एतद् विधिपरामर्शं नास्ति।",
        "gu": "આ રિપોર્ટ IP-SAKTI સહાયક દ્વારા ફક્ત માહિતી હેતુ માટે બનાવવામાં આવ્યો છે.",
        "te": "ఈ నివేదిక IP-SAKTI సహాయక్ ద్వారా సమాచార ప్రయోజనాల కోసం మాత్రమే రూపొందించబడింది.",
        "kn": "ಈ ವರದಿಯನ್ನು IP-SAKTI ಸಹಾಯಕ ಮಾಹಿತಿ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಮಾತ್ರ ಉತ್ಪಾದಿಸಲಾಗಿದೆ.",
        "bn": "এই প্রতিবেদনটি IP-SAKTI সহায়ক দ্বারা শুধুমাত্র তথ্যগত উদ্দেশ্যে তৈরি করা হয়েছে।",
        "hinglish": "Yeh report IP-SAKTI Sahayak ne sirf informational purpose ke liye generate ki hai. Yeh legal advice nahi hai."
    }

    low_confidence_warnings = []
    missing_info = []
    if ai and ai.confidence:
        if ai.confidence.level == "low":
            low_confidence_warnings.append({"section": "Overall Assessment", "reason": ai.confidence.reasoning or "Insufficient statutory grounding.", "percentage": int(ai.confidence.score * 100)})
        if ai.confidence.gaps:
            missing_info = ai.confidence.gaps

    return JSONResponse(content={
        "report_id": f"RPT-{case_id}",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "language": report_lang,
        "case": {"id": case.id, "title": case.title, "status": case.status.value, "created_at": case.created_at.isoformat(), "jurisdiction": profile.jurisdiction if profile else "india"},
        "applicant": {"type": profile.applicant_type if profile else None, "product_name": profile.product_name if profile else None, "ip_categories": profile.ip_categories if profile else [], "biological_material_involved": profile.biological_material if profile else False, "tk_involved": profile.tk_involved if profile else False, "ingredients": profile.ingredients if profile else []},
        "ai_analysis": {"available": ai is not None, "summary": ai.summary if ai else None, "detailed_guidance": ai.detailed_guidance if ai else None, "confidence_score": ai.confidence.score if ai else None, "confidence_level": ai.confidence.level if ai else None, "human_review_recommended": ai.human_review_recommended if ai else False, "citations": [{"id": c.id, "title": c.title, "section": c.section, "act": c.act, "authority_level": c.authority_level, "url": c.url, "snippet": c.snippet} for c in (ai.citations if ai else [])]},
        "low_confidence_warnings": low_confidence_warnings,
        "missing_information": missing_info,
        "case_timeline": [{"event": e.event_type, "title": e.title, "description": e.description, "actor_role": e.actor_role, "timestamp": e.created_at.isoformat()} for e in case.events],
        "disclaimer": DISCLAIMERS.get(report_lang, DISCLAIMERS["en"]),
        "legal_notice": "Verify current law at ipindia.gov.in, nbaindia.org, ayush.gov.in."
    })

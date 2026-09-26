from typing import List, Dict, Any, Optional
from ..models.query import (
    QueryResponse, QueryAnalysis, Citation,
    ConfidenceInfo, HumanReviewRecommendation, RetrievedSource
)


def _map_doc_to_retrieved_source(doc: Dict[str, Any]) -> RetrievedSource:
    """
    Maps a raw retriever document dict to a structured RetrievedSource.
    These are surfaced to the frontend Evidence panel so users can inspect
    the actual statutory text used to generate the answer.
    """
    return RetrievedSource(
        id=doc.get("id", "unknown"),
        title=doc.get("title") or doc.get("source_name") or "Legal Authority",
        act=doc.get("act") or doc.get("source_name"),
        section=doc.get("section"),
        authority_level=doc.get("authority_level", 1),
        jurisdiction=doc.get("jurisdiction", "india"),
        url=doc.get("url") or doc.get("official_url"),
        content=doc.get("content", ""),
        snippet=doc.get("snippet") or doc.get("content", "")[:300],
        relevance_score=doc.get("rerank_score") or doc.get("similarity_score") or doc.get("bm25_score")
    )


def assemble_query_response(
    query_id: str,
    question: str,
    answer: str,
    query_analysis: QueryAnalysis,
    sources: List[Dict[str, Any]],
    citations: List[Citation],
    confidence_info: ConfidenceInfo,
    abstained: bool,
    abstention_reason: Optional[str],
    human_review: HumanReviewRecommendation,
    case_id: Optional[str] = None,
    next_step: Optional[str] = None
) -> QueryResponse:
    """
    Constructs the final standardised FastAPI QueryResponse object.

    Includes `retrieved_sources` — a structured list of all documents retrieved
    from the knowledge base — so the frontend Evidence panel can expose the
    full statutory text to the user for complete RAG traceability.
    """
    if not next_step:
        if human_review.recommended:
            next_step = f"Submit case for formal review by {human_review.suggested_specialist or 'an IP Expert'}."
        else:
            next_step = "Proceed with detailed prior art search and provisional specification drafting."

    # Build structured retrieved sources for frontend Evidence panel
    retrieved_sources = [_map_doc_to_retrieved_source(doc) for doc in sources]

    final_answer = (
        answer
        if not abstained
        else (
            f"### ⚠️ Insufficient Evidence — Expert Review Required\n\n"
            f"{abstention_reason}\n\n"
            "The system could not generate a confidently grounded answer from the "
            "available knowledge base. Please submit this case for expert human consultation.\n\n"
            "The retrieved statutory sources are listed in the Evidence panel below."
        )
    )

    return QueryResponse(
        query_id=query_id,
        case_id=case_id,
        question=question,
        answer=final_answer,
        language=query_analysis.language,
        query_analysis=query_analysis,
        sources=sources,
        retrieved_sources=retrieved_sources,
        citations=citations,
        confidence=confidence_info.score,
        confidence_label=confidence_info.level,
        confidence_info=confidence_info,
        abstained=abstained,
        abstention_reason=abstention_reason,
        next_step=next_step,
        human_review=human_review
    )

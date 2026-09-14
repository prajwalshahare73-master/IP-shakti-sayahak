import uuid
from typing import List, Dict, Any, Optional
from ..models.query import QueryResponse, QueryAnalysis, Citation, ConfidenceInfo, HumanReviewRecommendation

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
    Constructs the final standardized FastAPI QueryResponse object.
    """
    if not next_step:
        if human_review.recommended:
            next_step = f"Submit case for formal review by {human_review.suggested_specialist or 'an IP Expert'}."
        else:
            next_step = "Proceed with detailed prior art search and provisional specification drafting."

    return QueryResponse(
        query_id=query_id,
        case_id=case_id,
        question=question,
        answer=answer if not abstained else f"### System Notice\n{abstention_reason}\n\nPlease submit this case for expert human consultation.",
        language=query_analysis.language,
        query_analysis=query_analysis,
        sources=sources,
        citations=citations,
        confidence=confidence_info.score,
        confidence_label=confidence_info.level,
        confidence_info=confidence_info,
        abstained=abstained,
        abstention_reason=abstention_reason,
        next_step=next_step,
        human_review=human_review
    )

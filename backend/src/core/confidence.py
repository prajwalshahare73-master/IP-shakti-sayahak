from typing import List, Dict, Any, Tuple, Optional
from ..models.query import ConfidenceInfo, HumanReviewRecommendation, Citation, QueryAnalysis

def calculate_confidence_and_abstention(
    grounding_score: float,
    citations: List[Citation],
    query_analysis: QueryAnalysis,
    retrieved_count: int
) -> Tuple[ConfidenceInfo, bool, Optional[str], HumanReviewRecommendation]:
    """
    Computes confidence score, level, reasoning, gaps, safe abstention flag, and expert review recommendation.
    """
    gaps: List[str] = []
    
    # Base confidence calculation
    if retrieved_count == 0:
        base_score = 0.2
        level = "low"
        reasoning = "No primary statutory or guideline documents found in the database."
        gaps.append("Missing primary statutory authority in knowledge base")
    elif grounding_score >= 0.7 and len(citations) >= 2:
        base_score = min(0.92, 0.75 + (0.15 * grounding_score))
        level = "high"
        reasoning = "Strong statutory basis with verified legal citations from primary Indian IP/ABS statutes."
    elif grounding_score >= 0.4 or len(citations) >= 1:
        base_score = 0.76
        level = "medium"
        reasoning = "Good legal basis; specific experimental or factual evidence may require closer scrutiny."
        if "TRADITIONAL_KNOWLEDGE" in query_analysis.intent:
            gaps.append("Synergistic bio-assay data required to overcome Section 3(e)")
        if "ABS_BIODIVERSITY" in query_analysis.intent:
            gaps.append("Exact source location (state/wild vs cultivated) needed for SBB vs NBA determination")
    else:
        base_score = 0.45
        level = "low"
        reasoning = "Preliminary evaluation based on general principles; full statutory grounding is partial."
        gaps.append("Full prior art and classical formulary review required")

    # Safe Abstention logic
    abstained = False
    abstention_reason = None
    if base_score < 0.3:
        abstained = True
        abstention_reason = "Insufficient statutory evidence to provide a confident legal assessment without human expert guidance."

    # Human Review Recommendation
    human_review_recommended = False
    human_review_reason = None
    suggested_specialist = "IP Specialist"

    if "TRADITIONAL_KNOWLEDGE" in query_analysis.intent and "ABS_BIODIVERSITY" in query_analysis.intent:
        human_review_recommended = True
        human_review_reason = "Multi-domain case involving both Traditional Knowledge (Section 3p) and Biological Diversity Act compliance (NBA Form III)."
        suggested_specialist = "Senior Multi-Domain TK & ABS Expert"
    elif "TRADITIONAL_KNOWLEDGE" in query_analysis.intent:
        human_review_recommended = True
        human_review_reason = "Formulation involves traditional herbal components subject to Patent Office TKDL scrutiny."
        suggested_specialist = "Traditional Knowledge Specialist"
    elif "ABS_BIODIVERSITY" in query_analysis.intent:
        human_review_recommended = True
        human_review_reason = "Commercial utilization of biological resources requires formal State Biodiversity Board / NBA compliance check."
        suggested_specialist = "Biological Diversity & ABS Expert"
    elif level == "low":
        human_review_recommended = True
        human_review_reason = "Complex factual scenario with moderate confidence; expert evaluation recommended."
        suggested_specialist = "Senior IP Examiner"

    confidence_info = ConfidenceInfo(
        score=round(base_score, 2),
        level=level,
        reasoning=reasoning,
        gaps=gaps
    )

    human_rec = HumanReviewRecommendation(
        recommended=human_review_recommended,
        reason=human_review_reason,
        suggested_specialist=suggested_specialist
    )

    return confidence_info, abstained, abstention_reason, human_rec

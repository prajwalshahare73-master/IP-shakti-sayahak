from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class CaseBuilderInput(BaseModel):
    """
    Structured input from the Case Builder UI.
    ALL fields are used in retrieval query construction and LLM prompt assembly.
    None of these fields should trigger hard-coded legal conclusions — they only
    shape and focus the RAG retrieval.
    """
    product_name: Optional[str] = None
    applicant_type: Optional[str] = None
    ip_category: Optional[str] = None
    biological_material: Optional[bool] = False
    tk_involved: Optional[bool] = False
    export_planned: Optional[bool] = False
    ingredients: Optional[List[str]] = Field(default_factory=list)
    formulation_details: Optional[str] = None
    process_description: Optional[str] = None
    target_countries: Optional[List[str]] = Field(default_factory=list)


class QueryAnalysis(BaseModel):
    language: str = "en"
    intent: List[str] = Field(default_factory=list)
    ip_type: List[str] = Field(default_factory=list)
    domain: List[str] = Field(default_factory=list)
    jurisdiction: str = "india"
    query_type: str = "general"
    requires_case_context: bool = False
    reformulated_query: Optional[str] = None


class Citation(BaseModel):
    """
    A retrieved and verified statutory citation.
    All citations must originate from retrieved documents — never hard-coded.
    """
    id: str
    title: str
    section: Optional[str] = None
    act: Optional[str] = None
    authority_level: int = 1
    url: Optional[str] = None
    snippet: str
    year: Optional[int] = None
    relevance_score: Optional[float] = None


class ConfidenceInfo(BaseModel):
    score: float = 0.8
    level: str = "medium"  # "high", "medium", "low"
    reasoning: Optional[str] = None
    gaps: Optional[List[str]] = Field(default_factory=list)


class HumanReviewRecommendation(BaseModel):
    recommended: bool = False
    reason: Optional[str] = None
    suggested_specialist: Optional[str] = None


class RetrievedSource(BaseModel):
    """
    Full retrieved document surfaced to the frontend for evidence transparency.
    The frontend Evidence panel should display these sources so users can inspect
    the raw statutory text the LLM used to generate its answer.
    """
    id: str
    title: str
    act: Optional[str] = None
    section: Optional[str] = None
    authority_level: int = 1
    jurisdiction: str = "india"
    url: Optional[str] = None
    content: str
    snippet: str
    relevance_score: Optional[float] = None


class QueryRequest(BaseModel):
    question: str
    case_id: Optional[str] = None
    session_id: Optional[str] = None
    language: Optional[str] = "en"
    response_language: Optional[str] = None
    jurisdiction: Optional[str] = "india"
    case_builder_data: Optional[CaseBuilderInput] = None
    search_context: Optional[Dict[str, Any]] = None


class QueryResponse(BaseModel):
    """
    Full structured response from the RAG pipeline.

    Key RAG traceability fields:
    - sources       : top retrieved documents (for Evidence panel)
    - citations     : verified citations extracted from the generated answer
    - abstained     : whether the system could not answer confidently
    - abstention_reason : why the system abstained
    - confidence_info   : breakdown of confidence factors

    No field in this response should be populated with hard-coded legal text.
    Every factual claim in `answer` must be grounded in `sources` / `citations`.
    """
    query_id: str
    case_id: Optional[str] = None
    question: str
    answer: str
    language: str = "en"
    query_analysis: QueryAnalysis
    sources: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Retrieved statutory documents ranked by relevance"
    )
    retrieved_sources: List[RetrievedSource] = Field(
        default_factory=list,
        description="Structured retrieved sources for frontend Evidence panel"
    )
    citations: List[Citation] = Field(
        default_factory=list,
        description="Verified citations extracted from the generated answer"
    )
    confidence: float = 0.8
    confidence_label: str = "medium"
    confidence_info: Optional[ConfidenceInfo] = None
    abstained: bool = False
    abstention_reason: Optional[str] = None
    next_step: Optional[str] = None
    human_review: HumanReviewRecommendation

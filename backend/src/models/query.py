from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class CaseBuilderInput(BaseModel):
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

class Citation(BaseModel):
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
    query_id: str
    case_id: Optional[str] = None
    question: str
    answer: str
    language: str = "en"
    query_analysis: QueryAnalysis
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    citations: List[Citation] = Field(default_factory=list)
    confidence: float = 0.8
    confidence_label: str = "medium"
    confidence_info: Optional[ConfidenceInfo] = None
    abstained: bool = False
    abstention_reason: Optional[str] = None
    next_step: Optional[str] = None
    human_review: HumanReviewRecommendation

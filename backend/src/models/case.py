from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field
from .query import CaseBuilderInput, Citation, ConfidenceInfo, HumanReviewRecommendation

class CaseStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    ASSIGNED = "ASSIGNED"
    IN_REVIEW = "IN_REVIEW"
    NEED_MORE_INFORMATION = "NEED_MORE_INFORMATION"
    REVIEW_COMPLETED = "REVIEW_COMPLETED"
    CLOSED = "CLOSED"

# Server-enforced valid status transitions
ALLOWED_TRANSITIONS = {
    CaseStatus.SUBMITTED: [CaseStatus.ASSIGNED, CaseStatus.IN_REVIEW, CaseStatus.CLOSED],
    CaseStatus.ASSIGNED: [CaseStatus.IN_REVIEW, CaseStatus.CLOSED],
    CaseStatus.IN_REVIEW: [CaseStatus.NEED_MORE_INFORMATION, CaseStatus.REVIEW_COMPLETED, CaseStatus.CLOSED],
    CaseStatus.NEED_MORE_INFORMATION: [CaseStatus.IN_REVIEW, CaseStatus.CLOSED],
    CaseStatus.REVIEW_COMPLETED: [CaseStatus.CLOSED],
    CaseStatus.CLOSED: []
}

class CaseProfile(BaseModel):
    case_id: str
    user_id: Optional[str] = "anon_user"
    title: str
    product_name: Optional[str] = None
    applicant_type: Optional[str] = None
    ip_categories: List[str] = Field(default_factory=list)
    biological_material: bool = False
    tk_involved: bool = False
    export_planned: bool = False
    key_questions: List[str] = Field(default_factory=list)
    ingredients: List[str] = Field(default_factory=list)
    language: str = "en"
    jurisdiction: str = "india"
    created_at: Optional[datetime] = None

class AIAnswerData(BaseModel):
    summary: str
    detailed_guidance: str
    citations: List[Citation] = Field(default_factory=list)
    confidence: ConfidenceInfo
    next_step: Optional[str] = None
    human_review_recommended: bool = False
    human_review_reason: Optional[str] = None

class CaseEvent(BaseModel):
    id: str
    case_id: str
    event_type: str  # "CASE_SUBMITTED", "AI_GUIDANCE_GENERATED", "ESCALATED", "ASSIGNED_TO_EXPERT", "INFO_REQUESTED", "INFO_PROVIDED", "REVIEW_SUBMITTED", "CASE_CLOSED"
    title: str
    description: str
    actor_id: Optional[str] = None
    actor_role: Optional[str] = "user"  # "user", "system", "expert", "admin"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CaseCreateRequest(BaseModel):
    title: str
    case_builder_data: Optional[CaseBuilderInput] = None
    initial_question: Optional[str] = None
    language: Optional[str] = "en"
    jurisdiction: Optional[str] = "india"

class CaseAnalyzeRequest(BaseModel):
    response_language: Optional[str] = None
    language: Optional[str] = None
    jurisdiction: Optional[str] = None
    question: Optional[str] = None

class CaseStatusUpdateRequest(BaseModel):
    status: CaseStatus
    note: Optional[str] = None

class CaseEscalateRequest(BaseModel):
    reason: str
    domain: Optional[str] = None
    additional_notes: Optional[str] = None

class CaseAdditionalInfoRequest(BaseModel):
    response_text: str
    attachments: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class CaseRecord(BaseModel):
    id: str
    user_id: str
    title: str
    status: CaseStatus = CaseStatus.SUBMITTED
    profile: Optional[CaseProfile] = None
    builder_data: Optional[CaseBuilderInput] = None
    ai_answer: Optional[AIAnswerData] = None
    expert_id: Optional[str] = None
    expert_name: Optional[str] = None
    expert_domain: Optional[str] = None
    events: List[CaseEvent] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

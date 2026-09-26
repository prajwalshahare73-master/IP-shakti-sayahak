from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ExpertLoginRequest(BaseModel):
    email: str
    password: str

class ExpertLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expert_id: str
    name: str
    email: str
    role: str  # "EXPERT", "SENIOR_EXPERT", "ADMIN"
    domain_specializations: List[str]

class ExpertProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str = "EXPERT"
    domain_specializations: List[str] = Field(default_factory=list)
    active_cases_count: int = 0
    max_cases_capacity: int = 10

class ExpertReviewSubmitRequest(BaseModel):
    action: str = "MODIFY_OPINION"  # "ENDORSE" or "MODIFY_OPINION"
    expert_opinion: str
    legal_basis: Optional[str] = None
    recommended_actions: Optional[List[str]] = Field(default_factory=list)
    revised_citations: Optional[List[Any]] = Field(default_factory=list)

class ExpertRequestInfoRequest(BaseModel):
    question: str
    required_documents: Optional[List[str]] = Field(default_factory=list)

class EmpanelledExpertRecord(BaseModel):
    id: str
    name: str
    email: str
    role: str = "EXPERT"
    role_title: str
    domain: str
    domain_label: str
    specialization: List[str] = Field(default_factory=list)
    experience_years: int
    cases_resolved: int = 0
    expertise: List[str] = Field(default_factory=list)
    jurisdiction: str = "India"
    status: str = "Available"  # "Available", "Busy", "Offline"
    organization: Optional[str] = None
    qualification: Optional[str] = None
    verification_status: str = "Verified Expert"
    match_score: Optional[int] = None
    match_badge: Optional[str] = None
    match_reasons: List[str] = Field(default_factory=list)

class ExpertMatchingRequest(BaseModel):
    case_id: Optional[str] = None
    title: Optional[str] = None
    query: Optional[str] = None
    domain: Optional[str] = None
    jurisdiction: Optional[str] = "India"
    product_type: Optional[str] = None
    is_traditional: Optional[str] = None
    biological_material: Optional[bool] = False
    tk_involved: Optional[bool] = False
    export_planned: Optional[bool] = False

class SendCaseToExpertRequest(BaseModel):
    case_id: str
    expert_id: str
    case_title: Optional[str] = None
    domain: Optional[str] = None
    jurisdiction: Optional[str] = "India"
    shared_notes: Optional[str] = None

class ExpertCaseRequestRecord(BaseModel):
    id: str
    case_id: str
    expert_id: str
    user_id: Optional[str] = "anon_user"
    case_title: Optional[str] = None
    domain: str
    jurisdiction: Optional[str] = "India"
    priority: str = "Normal"
    status: str = "Pending Expert Review"  # "Pending Expert Review", "Accepted", "Under Review", "Response Available", "Closed", "Declined"
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    review_response: Optional[Dict[str, Any]] = None
    additional_information: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ExpertAcceptCaseRequest(BaseModel):
    notes: Optional[str] = None

class ExpertDeclineCaseRequest(BaseModel):
    reason: str

class ExpertGuidanceSubmitRequest(BaseModel):
    review_guidance: str
    recommended_next_step: str
    additional_info_required: Optional[str] = None
    supporting_sources: Optional[List[str]] = Field(default_factory=list)
    action: Optional[str] = "MODIFY_OPINION"


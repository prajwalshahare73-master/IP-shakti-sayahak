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
    action: str  # "ENDORSE" or "MODIFY_OPINION"
    expert_opinion: str
    legal_basis: Optional[str] = None
    recommended_actions: Optional[List[str]] = Field(default_factory=list)
    revised_citations: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class ExpertRequestInfoRequest(BaseModel):
    question: str
    required_documents: Optional[List[str]] = Field(default_factory=list)

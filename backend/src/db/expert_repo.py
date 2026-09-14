import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from ..models.expert import ExpertProfile, ExpertReviewSubmitRequest
from .supabase_client import get_supabase_client

# Seed mock experts for development/demo
_in_memory_experts: Dict[str, Dict[str, Any]] = {
    "exp-001": {
        "id": "exp-001",
        "email": "dr.patel@ipsakti.gov.in",
        "password": "password123",
        "name": "Dr. R. K. Patel",
        "role": "SENIOR_EXPERT",
        "domain_specializations": ["TRADITIONAL_KNOWLEDGE", "PATENT", "ABS"],
        "active_cases_count": 2,
        "max_cases_capacity": 10
    },
    "exp-002": {
        "id": "exp-002",
        "email": "adv.verma@ipsakti.gov.in",
        "password": "password123",
        "name": "Adv. Sunita Verma",
        "role": "EXPERT",
        "domain_specializations": ["PATENT", "TRADEMARK"],
        "active_cases_count": 1,
        "max_cases_capacity": 8
    },
    "exp-003": {
        "id": "exp-003",
        "email": "dr.sharma@ipsakti.gov.in",
        "password": "password123",
        "name": "Dr. Ananya Sharma",
        "role": "EXPERT",
        "domain_specializations": ["ABS", "BIODIVERSITY"],
        "active_cases_count": 0,
        "max_cases_capacity": 8
    }
}

_in_memory_reviews: Dict[str, Dict[str, Any]] = {}
_in_memory_review_requests: Dict[str, Dict[str, Any]] = {}

class ExpertRepository:
    def __init__(self):
        self.sb = get_supabase_client()

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        for expert in _in_memory_experts.values():
            if expert["email"].lower() == email.lower():
                return expert
        return None

    async def get_by_id(self, expert_id: str) -> Optional[Dict[str, Any]]:
        return _in_memory_experts.get(expert_id)

    async def list_experts(self) -> List[Dict[str, Any]]:
        return list(_in_memory_experts.values())

    async def route_case_to_expert(self, case_id: str, domain: Optional[str] = None) -> Optional[Dict[str, Any]]:
        # Domain matching logic
        # TK/TKDL -> Dr. Patel (Senior Expert)
        # ABS -> Dr. Sharma
        # Patent/TM -> Adv. Verma
        domain_str = (domain or "").upper()
        if "TK" in domain_str or "TRADITIONAL" in domain_str:
            return _in_memory_experts.get("exp-001")
        elif "ABS" in domain_str or "BIO" in domain_str:
            return _in_memory_experts.get("exp-003") or _in_memory_experts.get("exp-001")
        else:
            return _in_memory_experts.get("exp-002") or _in_memory_experts.get("exp-001")

    async def create_review_request(self, case_id: str, reason: str, user_id: Optional[str] = None, domain: Optional[str] = None, notes: Optional[str] = None) -> Dict[str, Any]:
        req_id = str(uuid.uuid4())
        req = {
            "id": req_id,
            "case_id": case_id,
            "user_id": user_id,
            "domain": domain,
            "reason": reason,
            "notes": notes,
            "status": "PENDING",
            "created_at": datetime.utcnow()
        }
        _in_memory_review_requests[req_id] = req
        return req

    async def submit_review(self, case_id: str, expert_id: str, review_data: ExpertReviewSubmitRequest) -> Dict[str, Any]:
        review_id = str(uuid.uuid4())
        review = {
            "id": review_id,
            "case_id": case_id,
            "expert_id": expert_id,
            "action": review_data.action,
            "expert_opinion": review_data.expert_opinion,
            "legal_basis": review_data.legal_basis,
            "recommended_actions": review_data.recommended_actions,
            "revised_citations": review_data.revised_citations,
            "created_at": datetime.utcnow()
        }
        _in_memory_reviews[case_id] = review
        return review

    async def get_case_review(self, case_id: str) -> Optional[Dict[str, Any]]:
        return _in_memory_reviews.get(case_id)

expert_repo = ExpertRepository()

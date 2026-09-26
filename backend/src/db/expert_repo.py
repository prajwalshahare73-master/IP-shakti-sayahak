import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from ..models.expert import (
    EmpanelledExpertRecord,
    ExpertMatchingRequest,
    SendCaseToExpertRequest,
    ExpertCaseRequestRecord,
    ExpertReviewSubmitRequest
)
from .supabase_client import get_supabase_client
from .sqlite_db import get_connection

# Comprehensive verified empanelled specialists covering all 8 statutory domains (Section 1)
EMPANELLED_EXPERTS: List[Dict[str, Any]] = [
    {
        "id": "exp-tkdl-1",
        "name": "Dr. Vandana Sharma",
        "email": "dr.v.sharma@ipsakti.gov.in",
        "password": "password123",
        "role": "SENIOR_EXPERT",
        "role_title": "Senior Traditional Knowledge & Patent Facilitator",
        "domain": "TRADITIONAL_KNOWLEDGE",
        "domain_label": "Traditional Knowledge / TKDL",
        "specialization": ["Traditional Knowledge", "TKDL", "Prior Art"],
        "experience_years": 18,
        "cases_resolved": 142,
        "expertise": ["Patent Research", "Traditional Knowledge", "Prior Art", "AYUSH IP"],
        "jurisdiction": "India / International",
        "status": "Available",
        "organization": "AYUSH IP Facilitation Cell / Regd. IPO Agent (IN/PA/2418)",
        "qualification": "BAMS, LL.M. (IPR), Registered Patent Agent",
        "verification_status": "Verified Senior Specialist"
    },
    {
        "id": "exp-pat-1",
        "name": "Adv. Rajeshwar Kulkarni",
        "email": "adv.kulkarni@ipsakti.gov.in",
        "password": "password123",
        "role": "EXPERT",
        "role_title": "Principal AYUSH Patent Attorney & Section 3(p) Litigator",
        "domain": "PATENT",
        "domain_label": "Intellectual Property / Patent",
        "specialization": ["Section 3(p) Screening", "Synergism Claims", "Patent Drafting"],
        "experience_years": 20,
        "cases_resolved": 210,
        "expertise": ["Patent Litigation", "Section 3(e) Synergistic Assay", "Drafting"],
        "jurisdiction": "India",
        "status": "Available",
        "organization": "National AYUSH Patent Attorneys Guild",
        "qualification": "B.Pharm, LL.B., Advocate (High Court & IPO), Regd. Patent Agent",
        "verification_status": "Verified Expert"
    },
    {
        "id": "exp-abs-1",
        "name": "Adv. Meenakshi Sundaram",
        "email": "adv.sundaram@ipsakti.gov.in",
        "password": "password123",
        "role": "EXPERT",
        "role_title": "National Biodiversity Authority (NBA) Regulatory Counsel",
        "domain": "ABS",
        "domain_label": "Biodiversity / ABS / NBA",
        "specialization": ["National Biodiversity Authority", "SBB Form I & III", "Nagoya Protocol"],
        "experience_years": 16,
        "cases_resolved": 124,
        "expertise": ["ABS Approvals", "Biological Diversity Act 2002", "Access Agreements"],
        "jurisdiction": "India / International",
        "status": "Available",
        "organization": "Centre for Bio-Legal Studies & NBA Statutory Advisory",
        "qualification": "M.Sc. (Ecology), LL.M. (Environmental & Bio-Law), Advocate",
        "verification_status": "Verified Expert"
    },
    {
        "id": "exp-reg-1",
        "name": "Dr. Suniti Deshmukh",
        "email": "dr.deshmukh@ipsakti.gov.in",
        "password": "password123",
        "role": "EXPERT",
        "role_title": "AYUSH Drugs & Cosmetics Act Licensing Specialist",
        "domain": "REGULATORY",
        "domain_label": "AYUSH Regulatory",
        "specialization": ["Drugs & Cosmetics Act 1940", "GMP Schedule T", "Ayush Manufacturing License"],
        "experience_years": 19,
        "cases_resolved": 178,
        "expertise": ["Drug Licensing", "Schedule T GMP", "State Licensing Authority (SLA)"],
        "jurisdiction": "India",
        "status": "Available",
        "organization": "AYUSH Regulatory Compliance Bureau",
        "qualification": "BAMS, M.D. (Rasashastra & Bhaishajya Kalpana), Former Drug Inspector",
        "verification_status": "Verified Expert"
    },
    {
        "id": "exp-food-1",
        "name": "Dr. Arvind R. Namboodiri",
        "email": "dr.namboodiri@ipsakti.gov.in",
        "password": "password123",
        "role": "EXPERT",
        "role_title": "Ayurveda Aahara & FSSAI Nutraceutical Specialist",
        "domain": "FOOD_AAHARA",
        "domain_label": "Food / Ayurveda Aahara",
        "specialization": ["FSSAI Ayurveda Aahara Regulations 2022", "Nutraceutical Labeling", "Safety Dossiers"],
        "experience_years": 15,
        "cases_resolved": 86,
        "expertise": ["Ayurveda Aahara Formulations", "Food Safety Standards", "Safety Dossiers"],
        "jurisdiction": "India",
        "status": "Available",
        "organization": "Ayurveda Aahara Technical Advisory Group",
        "qualification": "BAMS, M.Sc. (Food Science & Nutrition), FSSAI Certified Technical Advisor",
        "verification_status": "Verified Expert"
    },
    {
        "id": "exp-intl-1",
        "name": "Adv. Priya Venkataraman",
        "email": "adv.priya@ipsakti.gov.in",
        "password": "password123",
        "role": "EXPERT",
        "role_title": "International IP & Global Regulatory Counsel (WIPO / PCT / US FDA)",
        "domain": "INTL_IP",
        "domain_label": "International IP / Regulatory",
        "specialization": ["PCT International Applications", "US FDA Botanical Guidance", "EU Herbal Monograph"],
        "experience_years": 17,
        "cases_resolved": 135,
        "expertise": ["PCT Chapter I & II", "Cross-Border IP", "Foreign Filing Licenses (Sec 39)"],
        "jurisdiction": "India / International",
        "status": "Available",
        "organization": "Global Life Sciences IP Practice",
        "qualification": "B.Sc. (Chemistry), LL.M. (International IP - London), Regd. Patent Agent",
        "verification_status": "Verified Expert"
    },
    {
        "id": "exp-tm-1",
        "name": "Adv. Vikramaditya Sen",
        "email": "adv.sen@ipsakti.gov.in",
        "password": "password123",
        "role": "EXPERT",
        "role_title": "Trademark, Geographical Indications & Design Law Specialist",
        "domain": "TRADEMARK",
        "domain_label": "Trademark / GI / Design",
        "specialization": ["Nice Class 5 & 30", "Geographical Indications of Goods", "Shape of Goods / Design"],
        "experience_years": 14,
        "cases_resolved": 112,
        "expertise": ["AYUSH Brand Protection", "GI Registry Chennai", "Opposition & Infringement"],
        "jurisdiction": "India",
        "status": "Available",
        "organization": "Intellectual Property Litigation Chambers",
        "qualification": "B.A. LL.B. (Hons), Advocate (IPAB & High Court)",
        "verification_status": "Verified Expert"
    },
    {
        "id": "exp-pa-1",
        "name": "Dr. Hemant Joshi",
        "email": "dr.joshi@ipsakti.gov.in",
        "password": "password123",
        "role": "EXPERT",
        "role_title": "Prior Art, Patent Landscaping & TKDL Search Specialist",
        "domain": "PRIOR_ART",
        "domain_label": "Prior Art / Patent Research",
        "specialization": ["TKDL Database Search", "Freedom to Operate (FTO)", "Patentability Assessment"],
        "experience_years": 14,
        "cases_resolved": 95,
        "expertise": ["Prior Art Search", "Invalidity Contention", "Polyherbal Formularies"],
        "jurisdiction": "India / International",
        "status": "Available",
        "organization": "Phytopharmaceutical Patent Research Centre",
        "qualification": "M.Pharm (Pharmacognosy), Ph.D. (Phytochemistry), Certified Patent Analyst",
        "verification_status": "Verified Expert"
    }
]

_experts_by_id = {e["id"]: e for e in EMPANELLED_EXPERTS}
_in_memory_reviews: Dict[str, Dict[str, Any]] = {}
_in_memory_requests: Dict[str, Dict[str, Any]] = {}

def _init_sqlite_requests():
    """Ensure SQLite requests table exists and load memory cache."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM expert_case_requests")
        rows = cursor.fetchall()
        for r in rows:
            req_data = dict(r)
            if req_data.get("review_response"):
                try:
                    req_data["review_response"] = json.loads(req_data["review_response"])
                except Exception:
                    pass
            _in_memory_requests[req_data["case_id"]] = req_data
        conn.close()
    except Exception as e:
        # Table might be initializing
        pass

_init_sqlite_requests()

class ExpertRepository:
    def __init__(self):
        self.sb = get_supabase_client()

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        for expert in EMPANELLED_EXPERTS:
            if expert["email"].lower() == email.lower():
                return expert
        return None

    async def get_by_id(self, expert_id: str) -> Optional[Dict[str, Any]]:
        return _experts_by_id.get(expert_id)

    async def list_experts(self) -> List[Dict[str, Any]]:
        return EMPANELLED_EXPERTS

    def identify_case_domain_and_issue(self, req: ExpertMatchingRequest) -> Dict[str, Any]:
        """
        Section 1: Identifies primary domain & legal issue from validated case attributes.
        Returns primary domain, identified issue label, and statutory jurisdiction.
        """
        title_lower = (req.title or "").lower()
        query_lower = (req.query or "").lower()
        prod_lower = (req.product_type or "").lower()
        dom_req = (req.domain or "").upper()

        primary_domain = "PATENT"
        issue_label = "Patentability & Section 3(e) Synergistic Assay Evaluation"

        if "FOOD" in dom_req or "AAHARA" in dom_req or "aahara" in prod_lower or "food" in prod_lower or "supplement" in prod_lower:
            primary_domain = "FOOD_AAHARA"
            issue_label = "FSSAI Ayurveda Aahara Classification & Labeling Compliance"
        elif req.biological_material or "ABS" in dom_req or "bio" in query_lower or "wild" in query_lower:
            primary_domain = "ABS"
            issue_label = "Mandatory NBA Form I / III Intimation & Access Benefit Sharing (ABS)"
        elif req.tk_involved or "TK" in dom_req or "traditional" in query_lower or "samhita" in query_lower:
            primary_domain = "TRADITIONAL_KNOWLEDGE"
            issue_label = "Section 3(p) Traditional Knowledge Prior Art Screening & Samhita Benchmarking"
        elif "PRIOR" in dom_req or "prior art" in query_lower or "novelty" in query_lower:
            primary_domain = "PRIOR_ART"
            issue_label = "TKDL Prior Art Novelty Benchmarking & Freedom to Operate (FTO)"
        elif req.export_planned or "INTERNATIONAL" in dom_req or "INTL" in dom_req or "export" in query_lower:
            primary_domain = "INTL_IP"
            issue_label = "PCT Chapter I International Filing & Sec 39 Foreign Filing Clearance"
        elif "TRADEMARK" in dom_req or "brand" in query_lower or "logo" in query_lower:
            primary_domain = "TRADEMARK"
            issue_label = "Nice Class 5 Trademark Protection & Brand Defense"
        elif "REGULATORY" in dom_req or "gmp" in query_lower or "license" in query_lower or "sla" in query_lower:
            primary_domain = "REGULATORY"
            issue_label = "State Licensing Authority (SLA) Drug Manufacturing License & GMP"
        
        target_jur = "India / International" if (req.export_planned or "International" in (req.jurisdiction or "")) else "India"

        return {
            "primary_domain": primary_domain,
            "issue_label": issue_label,
            "target_jurisdiction": target_jur
        }

    async def match_experts_for_case(self, req: ExpertMatchingRequest) -> List[Dict[str, Any]]:
        """
        Section 1 & 2: Match the case with experts based on:
        • Domain expertise
        • Case issue
        • Relevant jurisdiction
        • Expert specialization
        • Availability/status
        • Experience level
        Generates realistic match scores and factual "Why this expert?" reasons.
        """
        identified = self.identify_case_domain_and_issue(req)
        primary_domain = identified["primary_domain"]
        issue_label = identified["issue_label"]
        case_jur = identified["target_jurisdiction"]

        scored_experts = []

        for exp in EMPANELLED_EXPERTS:
            score = 50  # Base score for verified empanelled facilitators
            reasons = []

            # 1. Domain Concordance (+25)
            if exp["domain"] == primary_domain:
                score += 25
                reasons.append(f"Direct match for {exp['domain_label']} regulatory domain")
            elif (primary_domain == "TRADITIONAL_KNOWLEDGE" and exp["domain"] in ["PATENT", "PRIOR_ART"]) or \
                 (primary_domain == "PATENT" and exp["domain"] in ["TRADITIONAL_KNOWLEDGE", "PRIOR_ART"]) or \
                 (primary_domain == "ABS" and exp["domain"] in ["TRADITIONAL_KNOWLEDGE", "REGULATORY"]):
                score += 15
                reasons.append(f"Inter-disciplinary crossover in {exp['domain_label']}")

            # 2. Issue Specificity (+12)
            if exp["specialization"]:
                reasons.append(f"Specialized in {exp['specialization'][0]}")
                score += 10

            # 3. Jurisdiction Match (+8)
            if "International" in case_jur and "International" in exp["jurisdiction"]:
                score += 8
                reasons.append("Empanelled for International & Cross-Border jurisdictions")
            elif "India" in case_jur and "India" in exp["jurisdiction"]:
                score += 5
                reasons.append("Relevant to Indian statutory jurisdiction")

            # 4. Experience & Track Record (+5)
            if exp["experience_years"] >= 15:
                score += 5
                reasons.append(f"Senior practitioner with {exp['experience_years']}+ years active AYUSH experience")

            # Availability
            if exp["status"] != "Available":
                score -= 15

            final_score = min(max(score, 60), 98)

            badge = f"{final_score}% Case Relevance"

            exp_copy = dict(exp)
            exp_copy["match_score"] = final_score
            exp_copy["match_badge"] = badge
            exp_copy["match_reasons"] = reasons[:3]
            exp_copy["identified_issue"] = issue_label
            scored_experts.append(exp_copy)

        # Sort descending by score
        scored_experts.sort(key=lambda x: x["match_score"], reverse=True)
        return scored_experts

    async def route_case_to_expert(self, case_id: str, domain: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Legacy helper for backward compatibility."""
        req = ExpertMatchingRequest(case_id=case_id, domain=domain)
        matched = await self.match_experts_for_case(req)
        return matched[0] if matched else EMPANELLED_EXPERTS[0]

    async def create_expert_case_request(self, send_req: SendCaseToExpertRequest, user_id: str = "anon_user") -> Dict[str, Any]:
        """
        Section 5: Creates an actionable case-routing request record.
        Persists to SQLite and returns tracking record.
        """
        now = datetime.utcnow()
        req_id = f"req-{uuid.uuid4().hex[:8]}"

        domain_val = send_req.domain or "Ayurveda Intellectual Property"
        title_val = send_req.case_title or f"Case {send_req.case_id} Review"

        request_record: Dict[str, Any] = {
            "id": req_id,
            "case_id": send_req.case_id,
            "expert_id": send_req.expert_id,
            "user_id": user_id,
            "case_title": title_val,
            "domain": domain_val,
            "jurisdiction": send_req.jurisdiction or "India",
            "priority": "Normal",
            "status": "Pending Expert Review",
            "submitted_at": now.isoformat(),
            "accepted_at": None,
            "completed_at": None,
            "review_response": None,
            "additional_information": send_req.shared_notes,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }

        # Cache in memory
        _in_memory_requests[send_req.case_id] = request_record

        # Persist to SQLite
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO expert_case_requests 
                (id, case_id, expert_id, user_id, case_title, domain, jurisdiction, priority, status, submitted_at, additional_information, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    status=excluded.status,
                    updated_at=excluded.updated_at
            """, (
                req_id,
                send_req.case_id,
                send_req.expert_id,
                user_id,
                title_val,
                domain_val,
                send_req.jurisdiction or "India",
                "Normal",
                "Pending Expert Review",
                now.isoformat(),
                send_req.shared_notes,
                now.isoformat(),
                now.isoformat()
            ))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[ExpertRepo] SQLite insert error: {e}")

        # Supabase sync if enabled
        if self.sb:
            try:
                self.sb.table("expert_case_requests").insert(request_record).execute()
            except Exception as e:
                print(f"[ExpertRepo] Supabase insert error: {e}")

        return request_record

    async def get_case_request_status(self, case_id: str) -> Optional[Dict[str, Any]]:
        """Section 6 & 7: Check current case routing status."""
        if case_id in _in_memory_requests:
            return _in_memory_requests[case_id]

        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM expert_case_requests WHERE case_id = ? ORDER BY created_at DESC LIMIT 1", (case_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                data = dict(row)
                if data.get("review_response"):
                    try:
                        data["review_response"] = json.loads(data["review_response"])
                    except Exception:
                        pass
                return data
        except Exception:
            pass

        return None

    async def list_incoming_requests_for_expert(self, expert_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Section 8: Expert Portal Case Requests queue."""
        results = []
        try:
            conn = get_connection()
            cursor = conn.cursor()
            if expert_id:
                cursor.execute("SELECT * FROM expert_case_requests WHERE expert_id = ? ORDER BY created_at DESC", (expert_id,))
            else:
                cursor.execute("SELECT * FROM expert_case_requests ORDER BY created_at DESC")
            rows = cursor.fetchall()
            conn.close()
            for r in rows:
                data = dict(r)
                if data.get("review_response"):
                    try:
                        data["review_response"] = json.loads(data["review_response"])
                    except Exception:
                        pass
                results.append(data)
        except Exception:
            # Fallback to in-memory
            for req in _in_memory_requests.values():
                if not expert_id or req.get("expert_id") == expert_id:
                    results.append(req)

        return results

    async def accept_case_request(self, case_id: str, expert_id: str, notes: Optional[str] = None) -> Dict[str, Any]:
        """Section 8: Expert accepts case -> transitions to 'Under Review'"""
        now = datetime.utcnow().isoformat()
        req = await self.get_case_request_status(case_id) or {}
        req["status"] = "Under Review"
        req["accepted_at"] = now
        req["updated_at"] = now
        _in_memory_requests[case_id] = req

        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE expert_case_requests 
                SET status = 'Under Review', accepted_at = ?, updated_at = ?
                WHERE case_id = ?
            """, (now, now, case_id))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[ExpertRepo] Accept error: {e}")

        return req

    async def decline_case_request(self, case_id: str, expert_id: str, reason: str) -> Dict[str, Any]:
        """Section 8: Expert declines case."""
        now = datetime.utcnow().isoformat()
        req = await self.get_case_request_status(case_id) or {}
        req["status"] = "Declined"
        req["additional_information"] = f"Declined reason: {reason}"
        req["updated_at"] = now
        _in_memory_requests[case_id] = req

        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE expert_case_requests 
                SET status = 'Declined', additional_information = ?, updated_at = ?
                WHERE case_id = ?
            """, (f"Declined: {reason}", now, case_id))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[ExpertRepo] Decline error: {e}")

        return req

    async def submit_review(self, case_id: str, expert_id: str, review_data: ExpertReviewSubmitRequest) -> Dict[str, Any]:
        """Section 9: Expert submits review guidance."""
        now = datetime.utcnow()
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
            "created_at": now
        }
        _in_memory_reviews[case_id] = review

        # Update case request status to "Response Available"
        req = await self.get_case_request_status(case_id) or {}
        req["status"] = "Response Available"
        req["completed_at"] = now.isoformat()
        req["review_response"] = {
            "summary": review_data.expert_opinion,
            "recommended_action": review_data.recommended_actions[0] if review_data.recommended_actions else "",
            "legal_basis": review_data.legal_basis,
            "observations": review_data.recommended_actions or []
        }
        req["updated_at"] = now.isoformat()
        _in_memory_requests[case_id] = req

        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE expert_case_requests 
                SET status = 'Response Available', completed_at = ?, review_response = ?, updated_at = ?
                WHERE case_id = ?
            """, (now.isoformat(), json.dumps(req["review_response"]), now.isoformat(), case_id))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[ExpertRepo] Submit review request update error: {e}")

        return review

    async def get_case_review(self, case_id: str) -> Optional[Dict[str, Any]]:
        return _in_memory_reviews.get(case_id)

    async def has_case_access(self, expert_id: str, case_id: str) -> bool:
        """Verifies if an expert has legitimate authorized access to review or view this case."""
        if case_id in _in_memory_requests:
            if _in_memory_requests[case_id].get("expert_id") == expert_id:
                return True

        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM expert_case_requests WHERE case_id = ? AND expert_id = ?", (case_id, expert_id))
            row = cursor.fetchone()
            conn.close()
            if row:
                return True
        except Exception:
            pass

        return False

expert_repo = ExpertRepository()

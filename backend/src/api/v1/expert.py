from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional

from ...models.expert import (
    ExpertLoginRequest, ExpertLoginResponse, ExpertProfile, 
    ExpertReviewSubmitRequest, ExpertRequestInfoRequest,
    EmpanelledExpertRecord, ExpertMatchingRequest,
    SendCaseToExpertRequest, ExpertCaseRequestRecord,
    ExpertAcceptCaseRequest, ExpertDeclineCaseRequest
)
from ...models.case import CaseRecord, CaseStatus
from ...auth.jwt import create_access_token, get_current_user_payload
from ...auth.roles import require_expert
from ...db.expert_repo import expert_repo, EMPANELLED_EXPERTS
from ...db.cases_repo import cases_repo
from ...db.notifications_repo import notifications_repo

router = APIRouter(prefix="/v1/expert", tags=["Expert Portal & Case Routing"])

@router.post("/login", response_model=ExpertLoginResponse)
async def expert_login(request: ExpertLoginRequest):
    expert = await expert_repo.get_by_email(request.email)
    if not expert or expert.get("password") != request.password:
        raise HTTPException(
            status_code=401,
            detail={"code": "INVALID_CREDENTIALS", "message": "Invalid expert email or password"}
        )

    token = create_access_token({
        "sub": expert["id"],
        "email": expert["email"],
        "name": expert["name"],
        "role": expert["role"],
        "domain_specializations": expert.get("specialization", [])
    })

    return ExpertLoginResponse(
        access_token=token,
        token_type="bearer",
        expert_id=expert["id"],
        name=expert["name"],
        email=expert["email"],
        role=expert["role"],
        domain_specializations=expert.get("specialization", [])
    )

@router.get("/directory", response_model=List[Dict[str, Any]])
async def get_empanelled_directory():
    """Returns all verified empanelled specialists across all 8 domains with stored credentials."""
    return await expert_repo.list_experts()

@router.post("/match", response_model=List[Dict[str, Any]])
async def match_experts(req: ExpertMatchingRequest):
    """
    Section 1: Expert Matching Logic.
    Analyzes case attributes (domain, issue, jurisdiction, bio material, tk)
    and returns ranked recommended experts with genuine reasons.
    """
    matches = await expert_repo.match_experts_for_case(req)
    return matches

@router.get("/recommended", response_model=List[Dict[str, Any]])
async def get_recommended_experts(
    case_id: Optional[str] = None,
    domain: Optional[str] = None,
    jurisdiction: Optional[str] = "India",
    biological_material: Optional[bool] = False,
    tk_involved: Optional[bool] = False,
    export_planned: Optional[bool] = False
):
    """
    Section 1: GET recommended experts for a case.
    """
    req = ExpertMatchingRequest(
        case_id=case_id,
        domain=domain,
        jurisdiction=jurisdiction,
        biological_material=biological_material,
        tk_involved=tk_involved,
        export_planned=export_planned
    )
    return await expert_repo.match_experts_for_case(req)

@router.post("/cases/{case_id}/send", response_model=Dict[str, Any])
async def send_case_to_expert(
    case_id: str,
    request: SendCaseToExpertRequest,
    auth_user = Depends(get_current_user_payload)
):
    """
    Section 3, 4, 5: Primary Action - SEND CASE TO EXPERT.
    Links user case to selected expert, updates status to ASSIGNED / Pending Review,
    creates request in expert queue, and logs timeline event.
    """
    user_id = auth_user.get("sub", "anon_user") if auth_user else "anon_user"

    case = await cases_repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})

    expert = await expert_repo.get_by_id(request.expert_id)
    if not expert:
        raise HTTPException(status_code=404, detail={"code": "EXPERT_NOT_FOUND", "message": f"Expert {request.expert_id} not found."})

    # Check if expert is available
    if expert.get("status") == "Offline":
        raise HTTPException(
            status_code=400,
            detail={"code": "EXPERT_UNAVAILABLE", "message": f"{expert['name']} is currently offline. Please choose another available specialist."}
        )

    # 1. Update Case Record
    case.expert_id = expert["id"]
    case.expert_name = expert["name"]
    case.expert_domain = request.domain or expert["domain_label"]

    updated_case = await cases_repo.update_status(
        case_id=case_id,
        new_status=CaseStatus.ASSIGNED,
        actor_id=user_id,
        actor_role="user",
        note=f"Case routed to {expert['name']} ({expert['role_title']}). Status: Pending Expert Review.",
        expert_id=expert["id"],
        expert_name=expert["name"],
        expert_domain=request.domain or expert["domain_label"]
    )

    # 2. Add Timeline Event
    await cases_repo.add_event(
        case_id=case_id,
        event_type="CASE_ROUTED_TO_EXPERT",
        title="Case Transmitted to Empanelled Specialist",
        description=f"Citizen requested formal expert review from {expert['name']} ({expert['qualification']}).",
        actor_id=user_id,
        actor_role="user"
    )

    # 3. Create Actionable Expert Case Request
    req_record = await expert_repo.create_expert_case_request(request, user_id=user_id)

    # 4. Notify Expert & User
    await notifications_repo.create_notification(
        user_id=expert["id"],
        case_id=case_id,
        title="New Case Routing Request Received",
        message=f"Dossier {case_id} ({case.title}) has been assigned to you for legal & statutory review.",
        type="info"
    )

    return {
        "success": True,
        "message": f"Case {case_id} successfully sent to {expert['name']}.",
        "request_record": req_record,
        "case": updated_case
    }

@router.get("/cases/{case_id}/review-status", response_model=Dict[str, Any])
async def get_case_review_status(case_id: str):
    """
    Section 6 & 7: Check real-time case review status.
    Returns status progress: REQUEST SENT -> EXPERT REVIEW -> RESPONSE / GUIDANCE -> CASE CLOSED.
    """
    req_status = await expert_repo.get_case_request_status(case_id)
    case = await cases_repo.get_case(case_id)

    if not case and not req_status:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})

    status_val = req_status.get("status") if req_status else (case.status.value if case else "Pending Expert Review")
    
    # Map to standardized display statuses
    # 'Pending Expert Review' | 'Accepted' | 'Under Review' | 'Response Available' | 'Closed'
    if status_val in ["ASSIGNED", "SUBMITTED"]:
        display_status = "Pending Expert Review"
    elif status_val == "IN_REVIEW":
        display_status = "Under Review"
    elif status_val in ["REVIEW_COMPLETED", "RESOLVED"]:
        display_status = "Response Available"
    else:
        display_status = status_val

    exp_id = (case.expert_id if case and case.expert_id else None) or (req_status.get("expert_id") if req_status else None)
    exp_name = (case.expert_name if case and case.expert_name else None)
    if not exp_name and exp_id:
        exp_record = await expert_repo.get_by_id(exp_id)
        if exp_record:
            exp_name = exp_record["name"]

    return {
        "case_id": case_id,
        "status": display_status,
        "assigned_expert_id": exp_id,
        "assigned_expert_name": exp_name,
        "request_record": req_status,
        "expert_review": case.ai_answer if case and status_val == "REVIEW_COMPLETED" else None
    }

@router.get("/requests", response_model=List[Dict[str, Any]])
async def list_case_requests(expert_payload: Dict[str, Any] = Depends(require_expert)):
    """
    Section 8: CASE REQUESTS Queue inside Expert Portal.
    Lists incoming cases awaiting review by the logged-in expert.
    """
    expert_id = expert_payload.get("sub")
    return await expert_repo.list_incoming_requests_for_expert(expert_id)

@router.post("/cases/{case_id}/accept", response_model=Dict[str, Any])
async def accept_case(
    case_id: str,
    req_body: Optional[ExpertAcceptCaseRequest] = None,
    expert_payload: Dict[str, Any] = Depends(require_expert)
):
    """
    Section 8: Expert accepts case -> Status transitions to "Under Review" (IN_REVIEW).
    """
    expert_id = expert_payload.get("sub")
    expert_name = expert_payload.get("name", "Empanelled Expert")

    case = await cases_repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})

    # Transition case status to IN_REVIEW
    await cases_repo.update_status(
        case_id=case_id,
        new_status=CaseStatus.IN_REVIEW,
        actor_id=expert_id,
        actor_role="expert",
        note=f"{expert_name} accepted the case. Active examination in progress."
    )

    # Update expert case request table
    req = await expert_repo.accept_case_request(case_id, expert_id, notes=req_body.notes if req_body else None)

    # Timeline event
    await cases_repo.add_event(
        case_id=case_id,
        event_type="EXPERT_ACCEPTED_CASE",
        title="Expert Accepted Dossier for Review",
        description=f"{expert_name} accepted the dossier. Case status updated to Under Review.",
        actor_id=expert_id,
        actor_role="expert"
    )

    # Notify applicant
    if case.user_id:
        await notifications_repo.create_notification(
            user_id=case.user_id,
            case_id=case_id,
            title="Expert Accepted Your Case",
            message=f"{expert_name} has accepted your case {case_id} and commenced formal legal examination.",
            type="info"
        )

    return {
        "success": True,
        "status": "Under Review",
        "case_id": case_id,
        "message": f"Case {case_id} is now Under Review by {expert_name}."
    }

@router.post("/cases/{case_id}/decline", response_model=Dict[str, Any])
async def decline_case(
    case_id: str,
    req_body: ExpertDeclineCaseRequest,
    expert_payload: Dict[str, Any] = Depends(require_expert)
):
    """
    Section 8: Expert declines case with explanation.
    """
    expert_id = expert_payload.get("sub")
    expert_name = expert_payload.get("name", "Empanelled Expert")

    case = await cases_repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})

    req = await expert_repo.decline_case_request(case_id, expert_id, reason=req_body.reason)

    await cases_repo.add_event(
        case_id=case_id,
        event_type="EXPERT_DECLINED_CASE",
        title="Specialist Re-allocation Requested",
        description=f"{expert_name} declined review: {req_body.reason}. Re-routing to expert pool.",
        actor_id=expert_id,
        actor_role="expert"
    )

    return {
        "success": True,
        "status": "Declined",
        "case_id": case_id,
        "message": f"Case {case_id} declined and returned to pool."
    }

@router.get("/dashboard", response_model=List[CaseRecord])
async def get_expert_dashboard(expert_payload: Dict[str, Any] = Depends(require_expert)):
    expert_id = expert_payload.get("sub")
    cases = await cases_repo.list_cases_for_expert(expert_id=expert_id)
    return cases

@router.get("/cases/{case_id}", response_model=CaseRecord)
async def get_case_for_expert(case_id: str, expert_payload: Dict[str, Any] = Depends(require_expert)):
    case = await cases_repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})
    expert_id = expert_payload.get("sub")
    role = expert_payload.get("role", "expert")
    if role != "admin" and case.expert_id != expert_id and not (await expert_repo.has_case_access(expert_id, case_id)):
        raise HTTPException(
            status_code=403,
            detail={"code": "FORBIDDEN_EXPERT_CASE_ACCESS", "message": f"Case dossier {case_id} is not assigned to expert {expert_id}."}
        )
    return case

@router.post("/cases/{case_id}/review", response_model=CaseRecord)
async def submit_expert_review(
    case_id: str, 
    request: ExpertReviewSubmitRequest,
    expert_payload: Dict[str, Any] = Depends(require_expert)
):
    expert_id = expert_payload.get("sub")
    expert_name = expert_payload.get("name", "Empaneled Expert")

    case = await cases_repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})

    # Save review
    await expert_repo.submit_review(case_id=case_id, expert_id=expert_id, review_data=request)

    # Add timeline event
    action_label = "Endorsed AI Assessment" if request.action == "ENDORSE" else "Delivered Formal Legal Opinion & Guidance"
    await cases_repo.add_event(
        case_id=case_id,
        event_type="EXPERT_REVIEW_COMPLETED",
        title=f"Expert Review: {action_label}",
        description=f"{expert_name} submitted review: {request.expert_opinion[:120]}...",
        actor_id=expert_id,
        actor_role="expert"
    )

    # Transition case to REVIEW_COMPLETED
    updated_case = await cases_repo.update_status(
        case_id=case_id,
        new_status=CaseStatus.REVIEW_COMPLETED,
        actor_id=expert_id,
        actor_role="expert",
        note=f"Expert review finalized by {expert_name}."
    )

    # Notify applicant
    if case.user_id:
        await notifications_repo.create_notification(
            user_id=case.user_id,
            case_id=case_id,
            title="Expert Review Completed",
            message=f"Expert {expert_name} has finalized the legal opinion for case {case_id}.",
            type="review_completed"
        )

    return updated_case

@router.post("/cases/{case_id}/request-info", response_model=CaseRecord)
async def request_more_information(
    case_id: str,
    request: ExpertRequestInfoRequest,
    expert_payload: Dict[str, Any] = Depends(require_expert)
):
    expert_id = expert_payload.get("sub")
    expert_name = expert_payload.get("name", "Empaneled Expert")

    case = await cases_repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})

    if case.status in [CaseStatus.SUBMITTED, CaseStatus.ASSIGNED]:
        await cases_repo.update_status(case_id, CaseStatus.IN_REVIEW, actor_id=expert_id, actor_role="expert")

    updated_case = await cases_repo.update_status(
        case_id=case_id,
        new_status=CaseStatus.NEED_MORE_INFORMATION,
        actor_id=expert_id,
        actor_role="expert",
        note=f"Clarification requested: {request.question}"
    )

    await cases_repo.add_event(
        case_id=case_id,
        event_type="INFO_REQUESTED_BY_EXPERT",
        title="Clarification Requested by Expert",
        description=request.question,
        actor_id=expert_id,
        actor_role="expert"
    )

    if case.user_id:
        await notifications_repo.create_notification(
            user_id=case.user_id,
            case_id=case_id,
            title="Action Required: Clarification Requested",
            message=f"Expert {expert_name} requested additional information on case {case_id}: {request.question}",
            type="action_required"
        )

    return updated_case

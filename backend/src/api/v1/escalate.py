from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ...models.case import CaseRecord, CaseStatus, CaseEvent, CaseEscalateRequest, CaseAdditionalInfoRequest
from ...db.cases_repo import cases_repo
from ...db.expert_repo import expert_repo
from ...db.notifications_repo import notifications_repo
from ...auth.jwt import get_current_user_payload

router = APIRouter(prefix="/v1", tags=["Escalation & Timeline"])

@router.post("/cases/{case_id}/escalate", response_model=CaseRecord)
async def escalate_case_for_human_review(case_id: str, request: CaseEscalateRequest, auth_user = Depends(get_current_user_payload)):
    user_id = auth_user.get("sub", "anon_user") if auth_user else "anon_user"
    
    case = await cases_repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})

    # Route to appropriate domain specialist
    domain = request.domain
    if not domain and case.profile:
        if case.profile.tk_involved and case.profile.biological_material:
            domain = "TRADITIONAL_KNOWLEDGE_AND_ABS"
        elif case.profile.tk_involved:
            domain = "TRADITIONAL_KNOWLEDGE"
        elif case.profile.biological_material:
            domain = "ABS_BIODIVERSITY"
        else:
            domain = "PATENT"

    assigned_expert = await expert_repo.route_case_to_expert(case_id, domain=domain)
    
    # Update case expert assignment
    if assigned_expert:
        case.expert_id = assigned_expert["id"]
        case.expert_name = assigned_expert["name"]
        case.expert_domain = domain

    # Update case status to ASSIGNED
    updated_case = await cases_repo.update_status(
        case_id=case_id,
        new_status=CaseStatus.ASSIGNED,
        actor_id=user_id,
        actor_role="user",
        note=f"Escalated for human review: {request.reason}. Assigned to {case.expert_name or 'Domain Specialist Queue'}."
    )

    # Create review request in expert queue
    await expert_repo.create_review_request(
        case_id=case_id,
        reason=request.reason,
        user_id=user_id,
        domain=domain,
        notes=request.additional_notes
    )

    # Send notifications
    await notifications_repo.create_notification(
        user_id=user_id,
        case_id=case_id,
        title="Case Escalated for Expert Review",
        message=f"Your case {case_id} has been escalated and assigned to {case.expert_name or 'an IP Specialist'}.",
        type="info"
    )

    return updated_case

@router.get("/cases/{case_id}/timeline", response_model=List[CaseEvent])
async def get_case_timeline(case_id: str):
    case = await cases_repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})
    return case.events

@router.post("/cases/{case_id}/additional-info", response_model=CaseRecord)
async def submit_additional_info(case_id: str, request: CaseAdditionalInfoRequest, auth_user = Depends(get_current_user_payload)):
    user_id = auth_user.get("sub", "anon_user") if auth_user else "anon_user"
    case = await cases_repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})

    # Add event
    await cases_repo.add_event(
        case_id=case_id,
        event_type="ADDITIONAL_INFO_PROVIDED",
        title="Additional Information Submitted",
        description=request.response_text[:150] + ("..." if len(request.response_text) > 150 else ""),
        actor_id=user_id,
        actor_role="user"
    )

    # Transition status back to IN_REVIEW if waiting for info
    if case.status == CaseStatus.NEED_MORE_INFORMATION:
        await cases_repo.update_status(
            case_id=case_id,
            new_status=CaseStatus.IN_REVIEW,
            actor_id=user_id,
            actor_role="user",
            note="User supplied requested documents/information. Returned to In-Review queue."
        )

    # Notify assigned expert
    if case.expert_id:
        await notifications_repo.create_notification(
            user_id=case.expert_id,
            case_id=case_id,
            title="Additional Info Received",
            message=f"Applicant has submitted additional info for case {case_id}.",
            type="info"
        )

    return await cases_repo.get_case(case_id)

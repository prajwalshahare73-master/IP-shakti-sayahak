from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any

from ...models.expert import (
    ExpertLoginRequest, ExpertLoginResponse, ExpertProfile, 
    ExpertReviewSubmitRequest, ExpertRequestInfoRequest
)
from ...models.case import CaseRecord, CaseStatus
from ...auth.jwt import create_access_token
from ...auth.roles import require_expert
from ...db.expert_repo import expert_repo
from ...db.cases_repo import cases_repo
from ...db.notifications_repo import notifications_repo

router = APIRouter(prefix="/v1/expert", tags=["Expert Portal"])

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
        "domain_specializations": expert["domain_specializations"]
    })

    return ExpertLoginResponse(
        access_token=token,
        token_type="bearer",
        expert_id=expert["id"],
        name=expert["name"],
        email=expert["email"],
        role=expert["role"],
        domain_specializations=expert["domain_specializations"]
    )

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
    action_label = "Endorsed AI Assessment" if request.action == "ENDORSE" else "Provided Modified Expert Legal Opinion"
    await cases_repo.add_event(
        case_id=case_id,
        event_type="EXPERT_REVIEW_COMPLETED",
        title=f"Expert Review: {action_label}",
        description=f"{expert_name} submitted review: {request.expert_opinion[:120]}...",
        actor_id=expert_id,
        actor_role="expert"
    )

    # Transition case to REVIEW_COMPLETED
    # Handle state transition: if SUBMITTED or ASSIGNED, move through IN_REVIEW if needed
    if case.status in [CaseStatus.SUBMITTED, CaseStatus.ASSIGNED]:
        await cases_repo.update_status(case_id, CaseStatus.IN_REVIEW, actor_id=expert_id, actor_role="expert")
    
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

    # If ASSIGNED or SUBMITTED, transition to IN_REVIEW first
    if case.status in [CaseStatus.SUBMITTED, CaseStatus.ASSIGNED]:
        await cases_repo.update_status(case_id, CaseStatus.IN_REVIEW, actor_id=expert_id, actor_role="expert")

    # Transition to NEED_MORE_INFORMATION
    updated_case = await cases_repo.update_status(
        case_id=case_id,
        new_status=CaseStatus.NEED_MORE_INFORMATION,
        actor_id=expert_id,
        actor_role="expert",
        note=f"Clarification requested: {request.question}"
    )

    # Add event
    await cases_repo.add_event(
        case_id=case_id,
        event_type="INFO_REQUESTED_BY_EXPERT",
        title="Clarification Requested by Expert",
        description=request.question,
        actor_id=expert_id,
        actor_role="expert"
    )

    # Notify applicant
    if case.user_id:
        await notifications_repo.create_notification(
            user_id=case.user_id,
            case_id=case_id,
            title="Action Required: Clarification Requested",
            message=f"Expert {expert_name} requested additional information on case {case_id}: {request.question}",
            type="action_required"
        )

    return updated_case

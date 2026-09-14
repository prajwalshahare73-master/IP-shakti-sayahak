from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from ...models.case import CaseRecord, CaseEvent
from ...models.notification import NotificationItem
from ...db.cases_repo import cases_repo
from ...db.expert_repo import expert_repo
from ...db.notifications_repo import notifications_repo
from ...auth.jwt import get_current_user_payload

router = APIRouter(prefix="/v1/me", tags=["User Portal"])

@router.get("/cases", response_model=List[CaseRecord])
async def get_my_cases(auth_user = Depends(get_current_user_payload)):
    user_id = auth_user.get("sub", "anon_user") if auth_user else "anon_user"
    return await cases_repo.list_cases_for_user(user_id)

@router.get("/cases/{case_id}", response_model=Dict[str, Any])
async def get_my_case_detail(case_id: str, auth_user = Depends(get_current_user_payload)):
    case = await cases_repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})
    
    review = await expert_repo.get_case_review(case_id)
    case_dict = case.model_dump()
    case_dict["expert_review"] = review
    return case_dict

@router.get("/cases/{case_id}/timeline", response_model=List[CaseEvent])
async def get_my_case_timeline(case_id: str):
    case = await cases_repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail={"code": "CASE_NOT_FOUND", "message": f"Case {case_id} not found."})
    return case.events

@router.get("/notifications", response_model=List[NotificationItem])
async def get_my_notifications(auth_user = Depends(get_current_user_payload)):
    user_id = auth_user.get("sub", "anon_user") if auth_user else "anon_user"
    return await notifications_repo.get_notifications_for_user(user_id)

@router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    await notifications_repo.mark_as_read(notification_id)
    return {"status": "ok", "message": "Notification marked as read"}

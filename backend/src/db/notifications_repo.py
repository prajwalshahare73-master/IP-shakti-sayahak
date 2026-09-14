import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from ..models.notification import NotificationItem
from .supabase_client import get_supabase_client

_in_memory_notifications: List[NotificationItem] = []

class NotificationsRepository:
    def __init__(self):
        self.sb = get_supabase_client()

    async def create_notification(self, user_id: str, title: str, message: str, type: str = "info", case_id: Optional[str] = None, data: Optional[Dict[str, Any]] = None) -> NotificationItem:
        notif = NotificationItem(
            id=str(uuid.uuid4()),
            user_id=user_id,
            case_id=case_id,
            title=title,
            message=message,
            type=type,
            read=False,
            created_at=datetime.utcnow(),
            data=data
        )
        _in_memory_notifications.insert(0, notif)
        return notif

    async def get_notifications_for_user(self, user_id: str) -> List[NotificationItem]:
        if user_id == "anon_user":
            return _in_memory_notifications
        return [n for n in _in_memory_notifications if n.user_id == user_id]

    async def mark_as_read(self, notification_id: str):
        for n in _in_memory_notifications:
            if n.id == notification_id:
                n.read = True
                break

notifications_repo = NotificationsRepository()

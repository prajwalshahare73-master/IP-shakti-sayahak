from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class NotificationItem(BaseModel):
    id: str
    user_id: str
    case_id: Optional[str] = None
    title: str
    message: str
    type: str = "info"  # "info", "action_required", "review_completed", "system"
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    data: Optional[Dict[str, Any]] = None

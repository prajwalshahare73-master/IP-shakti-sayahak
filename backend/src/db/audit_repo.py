import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from .supabase_client import get_supabase_client

_in_memory_audit_logs: List[Dict[str, Any]] = []

class AuditRepository:
    def __init__(self):
        self.sb = get_supabase_client()

    async def log_event(self, action: str, resource_type: str, resource_id: str, actor_id: Optional[str] = None, actor_role: Optional[str] = None, details: Optional[Dict[str, Any]] = None, ip_address: Optional[str] = None) -> Dict[str, Any]:
        entry = {
            "id": str(uuid.uuid4()),
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "actor_id": actor_id,
            "actor_role": actor_role,
            "details": details or {},
            "ip_address": ip_address,
            "created_at": datetime.utcnow()
        }
        _in_memory_audit_logs.append(entry)
        
        if self.sb:
            try:
                self.sb.table("audit_logs").insert({
                    "action": action,
                    "resource_type": resource_type,
                    "resource_id": resource_id,
                    "actor_role": actor_role,
                    "details": details or {},
                    "ip_address": ip_address
                }).execute()
            except Exception as e:
                print(f"[Supabase AuditRepo] Log error: {e}")

        return entry

    async def get_logs_for_resource(self, resource_id: str) -> List[Dict[str, Any]]:
        return [log for log in _in_memory_audit_logs if log["resource_id"] == resource_id]

audit_repo = AuditRepository()

import hashlib
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from .sqlite_db import get_connection

def hash_password(password: str) -> str:
    # Deterministic SHA256 hashing for development/test environment
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

class UsersRepository:
    def __init__(self):
        self._seed_default_users()

    def _seed_default_users(self):
        defaults = [
            {
                "id": "usr_vaidya_1",
                "email": "vaidya@ipsakti.in",
                "password": "Password@123",
                "full_name": "Dr. Vaidya Ananya Deshmukh",
                "role": "user",
                "organization": "Arogya Ayurvedic Pharmaceuticals Ltd."
            },
            {
                "id": "usr_innovator_a",
                "email": "user_a@ipsakti.in",
                "password": "Password@123",
                "full_name": "Rohan Deshpande (Innovator A)",
                "role": "user",
                "organization": "AyurBio Tech Startup Pvt Ltd"
            },
            {
                "id": "usr_innovator_b",
                "email": "user_b@ipsakti.in",
                "password": "Password@123",
                "full_name": "Vaidya Suresh Patil (Innovator B)",
                "role": "user",
                "organization": "Patil Classical Ayurvedic Pharmacy"
            },
            {
                "id": "usr_admin_1",
                "email": "admin@ipsakti.in",
                "password": "Admin@123",
                "full_name": "System Administrator",
                "role": "admin",
                "organization": "IP-SAKTI Sahayak National Governance Cell"
            }
        ]
        conn = get_connection()
        cursor = conn.cursor()
        for u in defaults:
            p_hash = hash_password(u["password"])
            now = datetime.utcnow().isoformat()
            cursor.execute("""
                INSERT OR IGNORE INTO users (id, email, password_hash, full_name, role, organization, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (u["id"], u["email"].lower().strip(), p_hash, u["full_name"], u["role"], u["organization"], now))
        conn.commit()
        conn.close()

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        normalized = email.lower().strip()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (normalized,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return dict(row)
        return None

    async def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return dict(row)
        return None

    async def create_user(self, email: str, password: str, full_name: str, role: str = "user", organization: Optional[str] = None) -> Dict[str, Any]:
        user_id = f"usr_{uuid.uuid4().hex[:10]}"
        normalized = email.lower().strip()
        p_hash = hash_password(password)
        now = datetime.utcnow().isoformat()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (id, email, password_hash, full_name, role, organization, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_id, normalized, p_hash, full_name, role, organization, now))
        conn.commit()
        conn.close()
        return {
            "id": user_id,
            "email": normalized,
            "full_name": full_name,
            "role": role,
            "organization": organization,
            "created_at": now
        }

    async def verify_password(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        user = await self.get_by_email(email)
        if not user:
            return None
        p_hash = hash_password(password)
        if user["password_hash"] == p_hash:
            return user
        return None

users_repo = UsersRepository()

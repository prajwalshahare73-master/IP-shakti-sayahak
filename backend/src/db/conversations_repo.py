import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from .supabase_client import get_supabase_client
from .sqlite_db import get_connection

class ConversationsRepository:
    def __init__(self):
        self.sb = get_supabase_client()

    async def create_conversation(self, session_id: Optional[str] = None, user_id: Optional[str] = None, title: Optional[str] = None) -> str:
        conv_id = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO conversations (id, session_id, user_id, title, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (conv_id, session_id, user_id, title or "New Conversation", created_at))
        conn.commit()
        conn.close()
        return conv_id

    async def add_message(self, conversation_id: str, sender_type: str, content: str, sender_id: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        msg_id = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat()
        metadata_json = json.dumps(metadata or {}, default=str)
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (msg_id, conversation_id, sender_type, sender_id, content, metadata_json, created_at))
        conn.commit()
        conn.close()

        return {
            "id": msg_id,
            "conversation_id": conversation_id,
            "sender_type": sender_type,
            "sender_id": sender_id,
            "content": content,
            "metadata": metadata or {},
            "created_at": created_at
        }

    async def save_ai_answer(self, query_id: str, case_id: Optional[str], question: str, answer_data: Dict[str, Any]):
        created_at = datetime.utcnow().isoformat()
        answer_json = json.dumps(answer_data, default=str)
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO ai_answers (query_id, case_id, question, answer_data, created_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(query_id) DO UPDATE SET
                case_id=excluded.case_id,
                question=excluded.question,
                answer_data=excluded.answer_data
        """, (query_id, case_id, question, answer_json, created_at))
        conn.commit()
        conn.close()

    async def get_ai_answer(self, query_id: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM ai_answers WHERE query_id = ?", (query_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return {
                "query_id": row["query_id"],
                "case_id": row["case_id"],
                "question": row["question"],
                "data": json.loads(row["answer_data"]),
                "created_at": row["created_at"]
            }
        return None

conversations_repo = ConversationsRepository()

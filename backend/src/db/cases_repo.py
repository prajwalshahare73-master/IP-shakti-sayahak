import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any

from ..models.case import CaseRecord, CaseStatus, CaseEvent, ALLOWED_TRANSITIONS, CaseProfile, AIAnswerData
from ..models.query import CaseBuilderInput, Citation, ConfidenceInfo
from .supabase_client import get_supabase_client
from .sqlite_db import get_connection

def _record_to_sqlite(record: CaseRecord):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO cases (id, user_id, title, status, profile_data, builder_data, events_data, ai_answer_data, expert_id, expert_domain, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            user_id=excluded.user_id,
            title=excluded.title,
            status=excluded.status,
            profile_data=excluded.profile_data,
            builder_data=excluded.builder_data,
            events_data=excluded.events_data,
            ai_answer_data=excluded.ai_answer_data,
            expert_id=excluded.expert_id,
            expert_domain=excluded.expert_domain,
            updated_at=excluded.updated_at
    """, (
        record.id,
        record.user_id,
        record.title,
        record.status.value,
        json.dumps(record.profile.model_dump(), default=str) if record.profile else None,
        json.dumps(record.builder_data.model_dump(), default=str) if record.builder_data else None,
        json.dumps([e.model_dump() for e in record.events], default=str) if record.events else json.dumps([]),
        json.dumps(record.ai_answer.model_dump(), default=str) if record.ai_answer else None,
        record.expert_id,
        record.expert_domain,
        record.created_at.isoformat() if record.created_at else datetime.utcnow().isoformat(),
        record.updated_at.isoformat() if record.updated_at else datetime.utcnow().isoformat()
    ))
    conn.commit()
    conn.close()

def _row_to_case_record(row) -> CaseRecord:
    profile_dict = json.loads(row['profile_data']) if row['profile_data'] else None
    builder_dict = json.loads(row['builder_data']) if row['builder_data'] else None
    events_list = json.loads(row['events_data']) if row['events_data'] else []
    ai_answer_dict = json.loads(row['ai_answer_data']) if row['ai_answer_data'] else None

    profile = CaseProfile(**profile_dict) if profile_dict else None
    builder_data = CaseBuilderInput(**builder_dict) if builder_dict else None
    events = [CaseEvent(**e) for e in events_list] if events_list else []
    ai_answer = AIAnswerData(**ai_answer_dict) if ai_answer_dict else None

    created_at = datetime.fromisoformat(row['created_at']) if row['created_at'] else datetime.utcnow()
    updated_at = datetime.fromisoformat(row['updated_at']) if row['updated_at'] else datetime.utcnow()

    return CaseRecord(
        id=row['id'],
        user_id=row['user_id'] or "anon_user",
        title=row['title'],
        status=CaseStatus(row['status']),
        profile=profile,
        builder_data=builder_data,
        events=events,
        ai_answer=ai_answer,
        expert_id=row['expert_id'],
        expert_domain=row['expert_domain'],
        created_at=created_at,
        updated_at=updated_at
    )

class CasesRepository:
    def __init__(self):
        self.sb = get_supabase_client()

    async def create_case(self, user_id: str, title: str, builder_data: Optional[CaseBuilderInput] = None, initial_question: Optional[str] = None, language: str = "en", jurisdiction: str = "india") -> CaseRecord:
        case_id = f"CASE-{int(datetime.utcnow().timestamp()) % 100000:05d}"
        now = datetime.utcnow()
        
        ip_categories = [builder_data.ip_category] if builder_data and builder_data.ip_category else ["PATENT"]
        profile = CaseProfile(
            case_id=case_id,
            user_id=user_id,
            title=title,
            product_name=builder_data.product_name if builder_data else None,
            applicant_type=builder_data.applicant_type if builder_data else None,
            ip_categories=ip_categories,
            biological_material=builder_data.biological_material if builder_data else False,
            tk_involved=builder_data.tk_involved if builder_data else False,
            export_planned=builder_data.export_planned if builder_data else False,
            key_questions=[initial_question] if initial_question else [],
            ingredients=builder_data.ingredients if builder_data else [],
            language=language,
            jurisdiction=jurisdiction,
            created_at=now
        )

        initial_event = CaseEvent(
            id=str(uuid.uuid4()),
            case_id=case_id,
            event_type="CASE_SUBMITTED",
            title="Case Created",
            description=f"Case '{title}' created via Case Builder / Query.",
            actor_id=user_id,
            actor_role="user",
            created_at=now
        )

        record = CaseRecord(
            id=case_id,
            user_id=user_id,
            title=title,
            status=CaseStatus.SUBMITTED,
            profile=profile,
            builder_data=builder_data,
            events=[initial_event],
            created_at=now,
            updated_at=now
        )

        # 1. Write to local persistent SQLite DB
        _record_to_sqlite(record)

        # 2. Sync to Supabase if client is configured
        if self.sb:
            try:
                self.sb.table("cases").insert({
                    "id": case_id,
                    "user_id": user_id if user_id != "anon_user" else None,
                    "title": title,
                    "status": record.status.value,
                    "created_at": now.isoformat(),
                    "updated_at": now.isoformat()
                }).execute()

                if builder_data:
                    self.sb.table("case_builder_data").insert({
                        "case_id": case_id,
                        "product_name": builder_data.product_name,
                        "applicant_type": builder_data.applicant_type,
                        "ip_category": builder_data.ip_category,
                        "biological_material": builder_data.biological_material,
                        "tk_involved": builder_data.tk_involved,
                        "export_planned": builder_data.export_planned,
                        "ingredients": builder_data.ingredients,
                        "formulation_details": builder_data.formulation_details,
                        "process_description": builder_data.process_description,
                        "target_countries": builder_data.target_countries
                    }).execute()
                
                self.sb.table("case_events").insert({
                    "case_id": case_id,
                    "event_type": initial_event.event_type,
                    "title": initial_event.title,
                    "description": initial_event.description,
                    "actor_role": initial_event.actor_role
                }).execute()
            except Exception as e:
                print(f"[Supabase CasesRepo] Sync notice: {e}")

        return record

    async def get_case(self, case_id: str) -> Optional[CaseRecord]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cases WHERE id = ?", (case_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return _row_to_case_record(row)
        return None

    async def list_cases_for_user(self, user_id: str) -> List[CaseRecord]:
        conn = get_connection()
        cursor = conn.cursor()
        if user_id == "anon_user":
            cursor.execute("SELECT * FROM cases ORDER BY created_at DESC")
        else:
            cursor.execute("SELECT * FROM cases WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return [_row_to_case_record(row) for row in rows]

    async def list_cases_for_expert(self, expert_id: Optional[str] = None, domain: Optional[str] = None) -> List[CaseRecord]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cases ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        
        all_cases = [_row_to_case_record(row) for row in rows]
        results = []
        for case in all_cases:
            if expert_id and case.expert_id == expert_id:
                results.append(case)
            elif case.status in [CaseStatus.SUBMITTED, CaseStatus.ASSIGNED, CaseStatus.IN_REVIEW]:
                if not domain or (case.expert_domain and case.expert_domain.lower() == domain.lower()):
                    results.append(case)
        return results

    async def update_status(self, case_id: str, new_status: CaseStatus, actor_id: Optional[str] = None, actor_role: str = "system", note: Optional[str] = None) -> CaseRecord:
        case = await self.get_case(case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")

        allowed = ALLOWED_TRANSITIONS.get(case.status, [])
        if new_status not in allowed and new_status != case.status:
            raise ValueError(f"Invalid transition from {case.status} to {new_status}. Allowed: {allowed}")

        case.status = new_status
        case.updated_at = datetime.utcnow()

        event = CaseEvent(
            id=str(uuid.uuid4()),
            case_id=case_id,
            event_type=f"STATUS_CHANGED_TO_{new_status.value}",
            title=f"Status: {new_status.value.replace('_', ' ').title()}",
            description=note or f"Case transitioned to {new_status.value}",
            actor_id=actor_id,
            actor_role=actor_role,
            created_at=case.updated_at
        )
        case.events.append(event)
        _record_to_sqlite(case)

        if self.sb:
            try:
                self.sb.table("cases").update({
                    "status": new_status.value,
                    "updated_at": case.updated_at.isoformat()
                }).eq("id", case_id).execute()

                self.sb.table("case_events").insert({
                    "case_id": case_id,
                    "event_type": event.event_type,
                    "title": event.title,
                    "description": event.description,
                    "actor_role": event.actor_role
                }).execute()
            except Exception as e:
                print(f"[Supabase CasesRepo] Update notice: {e}")

        return case

    async def attach_ai_answer(self, case_id: str, ai_answer: AIAnswerData):
        case = await self.get_case(case_id)
        if case:
            case.ai_answer = ai_answer
            case.updated_at = datetime.utcnow()
            event = CaseEvent(
                id=str(uuid.uuid4()),
                case_id=case_id,
                event_type="AI_GUIDANCE_GENERATED",
                title="AI Legal Analysis Generated",
                description="Comprehensive RAG analysis with legal citations generated.",
                actor_role="system",
                created_at=case.updated_at
            )
            case.events.append(event)
            _record_to_sqlite(case)

    async def add_event(self, case_id: str, event_type: str, title: str, description: str, actor_id: Optional[str] = None, actor_role: str = "user") -> CaseEvent:
        case = await self.get_case(case_id)
        event = CaseEvent(
            id=str(uuid.uuid4()),
            case_id=case_id,
            event_type=event_type,
            title=title,
            description=description,
            actor_id=actor_id,
            actor_role=actor_role,
            created_at=datetime.utcnow()
        )
        if case:
            case.events.append(event)
            case.updated_at = datetime.utcnow()
            _record_to_sqlite(case)
        return event

cases_repo = CasesRepository()

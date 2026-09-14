from typing import Generator
from .config import settings
from .rag.retriever import retriever, HybridRetriever
from .core.llm_client import llm_client, OllamaClient
from .db.cases_repo import cases_repo, CasesRepository
from .db.conversations_repo import conversations_repo, ConversationsRepository
from .db.expert_repo import expert_repo, ExpertRepository
from .db.notifications_repo import notifications_repo, NotificationsRepository

def get_retriever() -> HybridRetriever:
    return retriever

def get_llm_client() -> OllamaClient:
    return llm_client

def get_cases_repo() -> CasesRepository:
    return cases_repo

def get_conversations_repo() -> ConversationsRepository:
    return conversations_repo

def get_expert_repo() -> ExpertRepository:
    return expert_repo

def get_notifications_repo() -> NotificationsRepository:
    return notifications_repo

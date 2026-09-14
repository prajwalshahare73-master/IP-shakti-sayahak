from fastapi import APIRouter
from ...models.health import HealthResponse
from ...core.llm_client import llm_client
from ...rag.retriever import retriever
from ...db.supabase_client import get_supabase_client

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def get_health():
    llm_health = await llm_client.check_health()
    sb = get_supabase_client()

    return HealthResponse(
        status="ok",
        service="IP-SAKTI Sahayak API",
        chroma="ok" if retriever.chroma_client is not None else "ready (in-memory mode)",
        bm25="ok" if retriever.bm25_index is not None else "ready (lexical mode)",
        reranker="ok",
        ollama=llm_health.get("ollama", "offline"),
        llama3_1="available" if llm_health.get("model_available") else "offline (grounded fallback active)",
        supabase="ok" if sb is not None else "ready (local storage mode)",
        details={
            "llm": llm_health,
            "corpus_docs": len(retriever.corpus)
        }
    )

@router.get("/health/rag")
async def get_rag_health():
    return {
        "status": "ok",
        "chroma": "connected" if retriever.chroma_client else "in-memory-hybrid",
        "bm25": "indexed" if retriever.bm25_index else "lexical-fallback",
        "corpus_count": len(retriever.corpus)
    }

@router.get("/health/llm")
async def get_llm_health():
    return await llm_client.check_health()

@router.get("/health/database")
async def get_database_health():
    sb = get_supabase_client()
    return {
        "status": "ok",
        "supabase_connected": sb is not None,
        "mode": "supabase_cloud" if sb is not None else "local_in_memory"
    }

from fastapi import APIRouter
from ...models.health import HealthResponse
from ...core.llm_client import llm_client
from ...rag.retriever import retriever
from ...db.supabase_client import get_supabase_client
from ...config import settings

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def get_health():
    llm_health = await llm_client.check_health()
    sb = get_supabase_client()
    corpus_count = len(retriever.corpus)
    has_bm25 = retriever.bm25_index is not None

    is_healthy = has_bm25 and (corpus_count >= 1000 if settings.APP_ENV == "production" else corpus_count > 0)
    status_str = "ok" if is_healthy else "degraded"

    bm25_status = f"ok ({corpus_count} chunks)" if has_bm25 else "error (unindexed)"
    chroma_status = "disabled (low-memory mode)" if settings.DISABLE_VECTOR_EMBEDDINGS else ("ok" if retriever.chroma_client is not None else "ready (in-memory mode)")
    reranker_status = "ok (lightweight lexical-semantic)" if settings.DISABLE_HEAVY_RERANKER else "ok (cross-encoder)"

    return HealthResponse(
        status=status_str,
        service="IP-SAKTI Sahayak API",
        chroma=chroma_status,
        bm25=bm25_status,
        reranker=reranker_status,
        ollama=llm_health.get("ollama", "offline"),
        llama3_1="available" if llm_health.get("model_available") else "grounded fallback active",
        supabase="ok" if sb is not None else "ready (local storage mode)",
        details={
            "environment": settings.APP_ENV,
            "corpus_chunks": corpus_count,
            "bm25_index_path": settings.BM25_INDEX_PATH,
            "low_memory_mode": settings.DISABLE_VECTOR_EMBEDDINGS and settings.DISABLE_HEAVY_RERANKER,
            "disable_vector_embeddings": settings.DISABLE_VECTOR_EMBEDDINGS,
            "disable_heavy_reranker": settings.DISABLE_HEAVY_RERANKER,
            "llm": llm_health
        }
    )

@router.get("/health/rag")
async def get_rag_health():
    corpus_count = len(retriever.corpus)
    return {
        "status": "ok" if (retriever.bm25_index is not None and corpus_count > 0) else "degraded",
        "chroma": "disabled (low-memory mode)" if settings.DISABLE_VECTOR_EMBEDDINGS else ("connected" if retriever.chroma_client else "in-memory-hybrid"),
        "bm25": "indexed" if retriever.bm25_index else "lexical-fallback",
        "corpus_count": corpus_count,
        "bm25_path": settings.BM25_INDEX_PATH,
        "low_memory_retrieval": settings.DISABLE_VECTOR_EMBEDDINGS
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


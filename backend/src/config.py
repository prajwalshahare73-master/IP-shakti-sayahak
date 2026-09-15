import os
from pathlib import Path
from dotenv import load_dotenv

# Find and load .env file with override=False to respect Render / system environment variables
backend_dir = Path(__file__).resolve().parent.parent
project_root = backend_dir.parent
env_path = backend_dir / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=False)
else:
    load_dotenv(override=False)

def _resolve_bm25_path() -> str:
    env_val = os.getenv("BM25_INDEX_PATH")
    if env_val:
        return env_val
    container_path = Path("/app/data/index/bm25.pkl")
    if container_path.exists():
        return str(container_path)
    root_path = project_root / "data" / "index" / "bm25.pkl"
    if root_path.exists():
        return str(root_path.resolve())
    backend_data_path = backend_dir / "data" / "index" / "bm25.pkl"
    if backend_data_path.exists():
        return str(backend_data_path.resolve())
    return str((project_root / "data" / "index" / "bm25.pkl").resolve())

def _resolve_chroma_path() -> str:
    env_val = os.getenv("CHROMA_PATH")
    if env_val:
        return env_val
    container_path = Path("/app/data/index/chroma")
    if container_path.exists():
        return str(container_path)
    root_path = project_root / "data" / "index" / "chroma"
    if root_path.exists():
        return str(root_path.resolve())
    return str((project_root / "data" / "index" / "chroma").resolve())

class Settings:
    APP_NAME: str = "IP-SAKTI Sahayak Backend"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("PORT") or os.getenv("API_PORT") or "8000")

    # Storage & Data Paths
    # Priority: environment variable (e.g. Render Docker env) > detected container/project path
    CHROMA_PATH: str = _resolve_chroma_path()
    BM25_INDEX_PATH: str = _resolve_bm25_path()
    RERANKER_MODEL: str = os.getenv("RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")

    # ── Low-memory mode flags ────────────────────────────────────────────────
    # For memory-constrained deployment environments such as Render Free (512 MB).
    # When APP_ENV=production, low-memory mode is active by default unless explicitly disabled.
    _default_low_mem = "true" if os.getenv("APP_ENV") == "production" else "false"
    DISABLE_HEAVY_RERANKER: bool = os.getenv("DISABLE_HEAVY_RERANKER", _default_low_mem).strip().lower() in ("true", "1", "yes")
    DISABLE_VECTOR_EMBEDDINGS: bool = os.getenv("DISABLE_VECTOR_EMBEDDINGS", _default_low_mem).strip().lower() in ("true", "1", "yes")

    # LLM (Ollama & External Providers)
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.1")
    LLM_CONCURRENCY_LIMIT: int = int(os.getenv("LLM_CONCURRENCY_LIMIT", "2"))
    LLM_TIMEOUT_SECONDS: int = int(os.getenv("LLM_TIMEOUT_SECONDS", "180"))
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", os.getenv("OPENAI_API_KEY", os.getenv("GROQ_API_KEY", "")))

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "ip-sakhti-dev-secret-jwt-key-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # CORS
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "*")

    # Integrations
    N8N_WEBHOOK_URL: str = os.getenv("N8N_WEBHOOK_URL", "")

settings = Settings()


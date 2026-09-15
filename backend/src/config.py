import os
from pathlib import Path
from dotenv import load_dotenv

# Find and load .env file
backend_dir = Path(__file__).resolve().parent.parent
project_root = backend_dir.parent
env_path = backend_dir / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    APP_NAME: str = "IP-SAKTI Sahayak Backend"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("PORT") or os.getenv("API_PORT") or "8000")

    # Storage & Data Paths (Resolves to project root / data)
    CHROMA_PATH: str = str((project_root / "data" / "index" / "chroma").resolve())
    BM25_INDEX_PATH: str = str((project_root / "data" / "index" / "bm25.pkl").resolve())
    RERANKER_MODEL: str = os.getenv("RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")
    # ── Low-memory mode flags ────────────────────────────────────────────────
    # Intended for memory-constrained deployment environments such as Render Free (512 MB).
    # Local/high-memory environments can keep both flags unset (default: false) to use
    # the full vector-embedding + CrossEncoder reranker pipeline.
    #
    # DISABLE_HEAVY_RERANKER=true  → skip CrossEncoder; use built-in lexical-semantic scorer.
    # DISABLE_VECTOR_EMBEDDINGS=true → skip SentenceTransformer + Chroma vector query;
    #                                  use BM25 as sole retrieval source.
    DISABLE_HEAVY_RERANKER: bool = os.getenv("DISABLE_HEAVY_RERANKER", "false").strip().lower() in ("true", "1", "yes")
    DISABLE_VECTOR_EMBEDDINGS: bool = os.getenv("DISABLE_VECTOR_EMBEDDINGS", "false").strip().lower() in ("true", "1", "yes")


    # LLM (Ollama)
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.1")
    LLM_CONCURRENCY_LIMIT: int = int(os.getenv("LLM_CONCURRENCY_LIMIT", "2"))
    LLM_TIMEOUT_SECONDS: int = int(os.getenv("LLM_TIMEOUT_SECONDS", "180"))

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "ip-sakhti-dev-secret-jwt-key-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # CORS
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    # Integrations
    N8N_WEBHOOK_URL: str = os.getenv("N8N_WEBHOOK_URL", "")

settings = Settings()

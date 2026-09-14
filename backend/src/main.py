from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .api.v1.health import router as health_router
from .api.v1.query import router as query_router
from .api.v1.cases import router as cases_router
from .api.v1.escalate import router as escalate_router
from .api.v1.expert import router as expert_router
from .api.v1.me import router as me_router

from .rag.retriever import retriever
from .core.llm_client import llm_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("==================================================================")
    print(f"Starting {settings.APP_NAME} in {settings.APP_ENV} mode...")
    print(f"Chroma Storage Path: {settings.CHROMA_PATH}")
    print(f"Ollama Target URL:   {settings.OLLAMA_BASE_URL} (Model: {settings.OLLAMA_MODEL})")
    print(f"Frontend Origin:     {settings.FRONTEND_ORIGIN}")
    print("==================================================================")
    
    # Check LLM connectivity at startup
    llm_check = await llm_client.check_health()
    if llm_check.get("status") == "ok":
        print(f"[Startup] Ollama server reachable. Available models: {llm_check.get('available_models')}")
    else:
        print("[Startup] Notice: Ollama daemon not currently detected on localhost:11434. Grounded legal synthesis fallback active.")

    yield
    print(f"[Shutdown] Stopping {settings.APP_NAME}...")

app = FastAPI(
    title=settings.APP_NAME,
    description="FastAPI Backend for IP-SAKTI Sahayak: Indian IP, TKDL & ABS Legal AI System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development & multi-device local network access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structured JSON Error Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail
    if isinstance(detail, dict):
        code = detail.get("code", "HTTP_ERROR")
        message = detail.get("message", "An error occurred")
        details = detail.get("details")
    else:
        code = f"HTTP_{exc.status_code}"
        message = str(detail)
        details = None

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": code,
                "message": message,
                "details": details
            }
        }
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    print(f"[Unhandled Exception] {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal error occurred.",
                "details": str(exc) if settings.APP_ENV == "development" else None
            }
        }
    )

# Include Routers (Supports both direct /v1 and /api/v1 paths)
app.include_router(health_router)
app.include_router(query_router)
app.include_router(cases_router)
app.include_router(escalate_router)
app.include_router(expert_router)
app.include_router(me_router)

# Mount /api aliases for full client interoperability
app.include_router(health_router, prefix="/api")
app.include_router(query_router, prefix="/api")
app.include_router(cases_router, prefix="/api")
app.include_router(escalate_router, prefix="/api")
app.include_router(expert_router, prefix="/api")
app.include_router(me_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "status": "operational",
        "docs": "/docs",
        "health": "/health"
    }

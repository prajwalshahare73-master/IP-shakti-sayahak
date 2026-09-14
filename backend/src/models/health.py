from typing import Optional, Dict, Any
from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    service: str
    chroma: str
    bm25: str
    reranker: str
    ollama: str
    llama3_1: str
    supabase: str
    details: Optional[Dict[str, Any]] = None

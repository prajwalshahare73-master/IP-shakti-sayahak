import sys
import os
from pathlib import Path

# Add project root and backend directory to sys.path for Vercel Serverless runtime
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent
backend_dir = root_dir / "backend"

if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Enable fast, lightweight retrieval defaults for serverless execution
os.environ.setdefault("APP_ENV", "production")
os.environ.setdefault("DISABLE_VECTOR_EMBEDDINGS", "true")
os.environ.setdefault("DISABLE_HEAVY_RERANKER", "true")

from backend.src.main import app

# Vercel serverless entry point
handler = app

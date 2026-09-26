import sys
from pathlib import Path

# Add project root and backend directories to sys.path for Vercel Serverless Function runtime
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "backend"))
sys.path.insert(0, str(ROOT_DIR / "backend" / "src"))

from backend.src.main import app

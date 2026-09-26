import os
import sys

# Ensure project root, backend, and src directories are in Python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
SRC_DIR = os.path.join(BACKEND_DIR, "src")

for path in [ROOT_DIR, BACKEND_DIR, SRC_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

from backend.src.main import app

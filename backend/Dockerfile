FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
# Build context: repository root (docker build -f backend/Dockerfile .)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend/src/ ./src/

# Copy repository-root data directory (contains data/index/bm25.pkl — 4,016 legal chunks)
# NOTE: backend/data/ is intentionally excluded; only repository-root data/ is canonical.
COPY data/ ./data/

# Copy schema and env template
COPY backend/schema/ ./schema/
COPY backend/.env.example ./.env

EXPOSE 8000

CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

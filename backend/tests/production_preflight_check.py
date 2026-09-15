"""
production_preflight_check.py
=============================
Standalone production preflight verification for Render Free (512 MB).
"""
import os
import sys

from pathlib import Path

# Add project root and backend dir to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
backend_dir = root_dir / "backend"
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(backend_dir))

# Enforce production low-memory flags
os.environ["APP_ENV"] = "production"
os.environ["DISABLE_VECTOR_EMBEDDINGS"] = "true"
os.environ["DISABLE_HEAVY_RERANKER"] = "true"

def run_preflight():
    print("=" * 60)
    print("RUNNING IP-SAKTI PRODUCTION PREFLIGHT VERIFICATION")
    print("=" * 60)

    # 1. Config Check
    from src.config import settings
    print(f"[1/6] Config Check:")
    print(f"      APP_ENV: {settings.APP_ENV}")
    print(f"      BM25_INDEX_PATH: {settings.BM25_INDEX_PATH}")
    print(f"      DISABLE_VECTOR_EMBEDDINGS: {settings.DISABLE_VECTOR_EMBEDDINGS}")
    print(f"      DISABLE_HEAVY_RERANKER: {settings.DISABLE_HEAVY_RERANKER}")
    assert settings.DISABLE_VECTOR_EMBEDDINGS is True
    assert settings.DISABLE_HEAVY_RERANKER is True

    # 2. BM25 Index Check
    from src.rag.retriever import retriever
    corpus_count = len(retriever.corpus)
    print(f"[2/6] BM25 Corpus Check: {corpus_count} chunks loaded.")
    assert corpus_count >= 3500, f"Expected ~4,016 chunks, got {corpus_count}"
    assert retriever.bm25_index is not None, "BM25 index must be initialized."

    # 3. Model Memory Check
    from src.rag.reranker import reranker
    print(f"[3/6] Low-Memory Guarantee Check:")
    print(f"      Embedding function: {retriever._embedding_function}")
    print(f"      Chroma client: {retriever.chroma_client}")
    print(f"      CrossEncoder model: {reranker.model}")
    assert retriever._embedding_function is None, "SentenceTransformer must not be loaded"
    assert retriever.chroma_client is None, "Chroma client must not be initialized in low-mem mode"
    assert reranker.model is None, "CrossEncoder must not be loaded in low-mem mode"

    # 4. Health Check
    from fastapi.testclient import TestClient
    from src.main import app
    client = TestClient(app)

    h_res = client.get("/health")
    assert h_res.status_code == 200, f"/health returned {h_res.status_code}"
    h_data = h_res.json()
    print(f"[4/6] /health Check: status={h_data.get('status')}, bm25={h_data.get('bm25')}")
    assert h_data.get("status") == "ok"
    assert "4016" in h_data.get("bm25")

    # 5. Query Check: What is a patent?
    p1 = {
        "question": "What is a patent?",
        "session_id": "preflight-1",
        "language": "en",
        "jurisdiction": "india"
    }
    q1_res = client.post("/api/v1/query", json=p1)
    assert q1_res.status_code == 200
    q1_data = q1_res.json()
    print(f"[5/6] Query 'What is a patent?' -> 200 OK | Answer len: {len(q1_data['answer'])}, Citations: {len(q1_data['citations'])}, Confidence: {q1_data['confidence']}")
    assert q1_data["question"] == "What is a patent?"
    assert len(q1_data["answer"]) > 50
    assert q1_data["answer"] != "string"

    # 6. Query Check: Section 3(p) Ayurvedic formulation
    p2 = {
        "question": "Can I patent a traditional Ayurvedic Ashwagandha and Turmeric formulation under Section 3(p) of the Indian Patents Act?",
        "session_id": "preflight-2",
        "language": "en",
        "jurisdiction": "india"
    }
    q2_res = client.post("/api/v1/query", json=p2)
    assert q2_res.status_code == 200
    q2_data = q2_res.json()
    print(f"[6/6] Query 'Section 3(p)' -> 200 OK | Answer len: {len(q2_data['answer'])}, Citations: {len(q2_data['citations'])}, Confidence: {q2_data['confidence']}")
    assert "Section 3(p)" in q2_data["answer"] or len(q2_data["citations"]) > 0
    assert q2_data["human_review"]["recommended"] is True

    print("=" * 60)
    print("ALL PRODUCTION PREFLIGHT CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_preflight()

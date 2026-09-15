"""
test_low_memory_pipeline.py
===========================
Validates that DISABLE_VECTOR_EMBEDDINGS=true + DISABLE_HEAVY_RERANKER=true
low-memory production mode works without loading any heavy transformer models.

Run from backend/ directory:
    DISABLE_VECTOR_EMBEDDINGS=true DISABLE_HEAVY_RERANKER=true pytest tests/test_low_memory_pipeline.py -v
"""
import os
import pytest

# Force low-memory mode before any imports
os.environ["DISABLE_VECTOR_EMBEDDINGS"] = "true"
os.environ["DISABLE_HEAVY_RERANKER"] = "true"

from httpx import AsyncClient, ASGITransport


# ==============================================================================
# 1. Import integrity
# ==============================================================================

def test_config_imports():
    from src.config import settings
    assert settings is not None

def test_retriever_imports():
    from src.rag.retriever import retriever
    assert retriever is not None

def test_reranker_imports():
    from src.rag.reranker import reranker
    assert reranker is not None

def test_rrf_imports():
    from src.rag.rrf import reciprocal_rank_fusion
    assert callable(reciprocal_rank_fusion)

def test_authority_filter_imports():
    from src.rag.authority_filter import filter_by_authority_and_jurisdiction
    assert callable(filter_by_authority_and_jurisdiction)

def test_llm_client_imports():
    from src.core.llm_client import llm_client
    assert llm_client is not None


# ==============================================================================
# 2. Config flags
# ==============================================================================

def test_disable_vector_embeddings_flag():
    from src.config import settings
    assert settings.DISABLE_VECTOR_EMBEDDINGS is True

def test_disable_heavy_reranker_flag():
    from src.config import settings
    assert settings.DISABLE_HEAVY_RERANKER is True


# ==============================================================================
# 3. No heavy models loaded
# ==============================================================================

def test_no_sentence_transformer_loaded():
    from src.rag.retriever import retriever
    assert retriever._embedding_function is None, \
        "SentenceTransformer must not be loaded in low-memory mode"

def test_no_crossencoder_loaded():
    from src.rag.reranker import reranker
    assert reranker.model is None, \
        "CrossEncoder must not be loaded when DISABLE_HEAVY_RERANKER=true"

def test_chroma_client_not_initialized():
    from src.rag.retriever import retriever
    assert retriever.chroma_client is None, \
        "Chroma client must not be initialized when DISABLE_VECTOR_EMBEDDINGS=true"


# ==============================================================================
# 4. BM25 retrieval
# ==============================================================================

def test_bm25_index_loaded():
    from src.rag.retriever import retriever
    assert retriever.bm25_index is not None, "BM25 index must be loaded"
    assert len(retriever.corpus) >= 9

def test_bm25_patent_query():
    from src.rag.retriever import retriever
    results = retriever.search_bm25("What is a patent?", jurisdiction="india", top_k=5)
    assert len(results) >= 1
    for r in results:
        assert "content" in r and len(r["content"]) > 10

def test_bm25_tk_query():
    from src.rag.retriever import retriever
    results = retriever.search_bm25(
        "traditional knowledge ashwagandha section 3p biodiversity",
        jurisdiction="india", top_k=5
    )
    assert len(results) >= 1
    combined = " ".join(r.get("content","") + r.get("title","") for r in results).lower()
    assert any(kw in combined for kw in ["patent","traditional","knowledge","biological","section"])

def test_bm25_jurisdiction_filter():
    from src.rag.retriever import retriever
    results = retriever.search_bm25("patent", jurisdiction="india", top_k=20)
    for r in results:
        assert r.get("jurisdiction","india").lower() in ("india","global")


# ==============================================================================
# 5. search_vector returns empty in low-memory mode
# ==============================================================================

def test_search_vector_returns_empty():
    from src.rag.retriever import retriever
    results = retriever.search_vector("patent", jurisdiction="india", top_k=5)
    assert results == [], f"Expected [], got {len(results)} results"


# ==============================================================================
# 6. RRF with single BM25 list
# ==============================================================================

def test_rrf_with_empty_vector_list():
    from src.rag.rrf import reciprocal_rank_fusion
    bm25 = [{"id": f"d{i}", "title": f"Doc {i}", "content": f"text {i}"} for i in range(5)]
    fused = reciprocal_rank_fusion([], bm25, k=60, top_n=5)
    assert len(fused) == 5
    for doc in fused:
        assert "rrf_score" in doc and doc["rrf_score"] > 0

def test_rrf_preserves_ordering():
    from src.rag.rrf import reciprocal_rank_fusion
    bm25 = [
        {"id": "a", "title": "High", "content": "very relevant"},
        {"id": "b", "title": "Low",  "content": "less relevant"},
    ]
    fused = reciprocal_rank_fusion([], bm25, k=60, top_n=2)
    assert fused[0]["id"] == "a"


# ==============================================================================
# 7. Lightweight reranker
# ==============================================================================

def test_reranker_no_crossencoder_after_rerank():
    from src.rag.reranker import reranker
    docs = [
        {"id":"d1","title":"Patents Act 1970","content":"A patent protects inventions.","rrf_score":0.02,"authority_level":1},
        {"id":"d2","title":"Trade Marks Act","content":"Trademark protects brand names.","rrf_score":0.015,"authority_level":1},
    ]
    results = reranker.rerank("What is a patent?", docs, top_k=2)
    assert len(results) >= 1
    for r in results:
        assert "rerank_score" in r
    assert reranker.model is None, "CrossEncoder must not be loaded after rerank()"

def test_reranker_orders_correctly():
    from src.rag.reranker import reranker
    docs = [
        {"id":"patent","title":"Patents Act Section 3","content":"A patent is an exclusive right for an invention.","rrf_score":0.01,"authority_level":1},
        {"id":"unrelated","title":"Cricket Schedule","content":"Cricket match 2024 schedule.","rrf_score":0.005,"authority_level":3},
    ]
    results = reranker.rerank("What is a patent invention?", docs, top_k=2)
    assert results[0]["id"] == "patent"


# ==============================================================================
# 8. Authority & jurisdiction filter
# ==============================================================================

def test_authority_filter_excludes_high_level():
    from src.rag.authority_filter import filter_by_authority_and_jurisdiction
    docs = [
        {"id":"stat","title":"Patents Act","content":"...","authority_level":1,"jurisdiction":"india"},
        {"id":"blog","title":"Blog","content":"...","authority_level":5,"jurisdiction":"india"},
    ]
    filtered = filter_by_authority_and_jurisdiction(docs, target_jurisdiction="india", max_authority_level=4)
    ids = [d["id"] for d in filtered]
    assert "stat" in ids
    assert "blog" not in ids

def test_authority_filter_jurisdiction():
    from src.rag.authority_filter import filter_by_authority_and_jurisdiction
    docs = [
        {"id":"india","title":"Indian Patents Act","content":"...","authority_level":1,"jurisdiction":"india"},
        {"id":"us","title":"US Patent Law","content":"...","authority_level":1,"jurisdiction":"us"},
    ]
    filtered = filter_by_authority_and_jurisdiction(docs, target_jurisdiction="india")
    ids = [d["id"] for d in filtered]
    assert "india" in ids
    assert "us" not in ids


# ==============================================================================
# 9. Full hybrid_retrieve
# ==============================================================================

def test_hybrid_retrieve_patent():
    from src.rag.retriever import retriever
    results = retriever.hybrid_retrieve("What is a patent?", jurisdiction="india", top_k=5)
    assert len(results) >= 1
    for r in results:
        assert "content" in r and len(r["content"]) > 10
        assert r.get("authority_level") in (1,2,3,4)

def test_hybrid_retrieve_tk():
    from src.rag.retriever import retriever
    results = retriever.hybrid_retrieve(
        "Can I patent a traditional Ayurvedic herbal formulation?",
        jurisdiction="india", top_k=5
    )
    assert len(results) >= 1


# ==============================================================================
# 10. Citation verification
# ==============================================================================

def test_citations_from_docs():
    from src.core.claim_verifier import extract_and_verify_citations
    docs = [{
        "id":"STAT-PAT-SEC3P","title":"The Patents Act, 1970 - Section 3(p)",
        "act":"The Patents Act, 1970","section":"Section 3(p)","authority_level":1,
        "content":"Traditional knowledge cannot be patented under Section 3(p).",
        "snippet":"Traditional knowledge cannot be patented.","url":"https://ipindia.gov.in/",
        "year":1970,"rerank_score":0.85
    }]
    answer = "Under Section 3(p) of the Patents Act, 1970, traditional knowledge cannot be patented."
    citations, score = extract_and_verify_citations(answer, docs)
    assert len(citations) >= 1
    assert score > 0.0

def test_fallback_citations_when_no_match():
    from src.core.claim_verifier import extract_and_verify_citations
    docs = [{
        "id":"DOC-1","title":"Patents Act 1970","act":"Patents Act 1970","section":"",
        "authority_level":1,"content":"Patentability criteria are outlined in the Act.",
        "snippet":"Patentability criteria.","url":"","year":1970,"rerank_score":0.7
    }]
    citations, _ = extract_and_verify_citations("Completely unrelated text.", docs)
    assert len(citations) >= 1


# ==============================================================================
# 11. Confidence scoring
# ==============================================================================

def test_confidence_high_when_grounded():
    from src.core.confidence import calculate_confidence_and_abstention
    from src.models.query import QueryAnalysis, Citation
    analysis = QueryAnalysis(query_type="legal_query",intent=["PATENT_QUERY"],language="en",jurisdiction="india")
    citations = [
        Citation(id="c1",title="Patents Act",act="Patents Act 1970",section="Section 2",authority_level=1,url=None,snippet="...",year=1970,relevance_score=0.9),
        Citation(id="c2",title="Section 3p",act="Patents Act 1970",section="Section 3(p)",authority_level=1,url=None,snippet="...",year=1970,relevance_score=0.85),
    ]
    conf, abstained, reason, _ = calculate_confidence_and_abstention(0.8, citations, analysis, 5)
    assert conf.score >= 0.75
    assert conf.level == "high"
    assert abstained is False

def test_confidence_low_abstains_no_docs():
    from src.core.confidence import calculate_confidence_and_abstention
    from src.models.query import QueryAnalysis
    analysis = QueryAnalysis(query_type="legal_query",intent=["PATENT_QUERY"],language="en",jurisdiction="india")
    conf, abstained, reason, _ = calculate_confidence_and_abstention(0.0, [], analysis, 0)
    assert conf.score < 0.3
    assert abstained is True
    assert reason is not None


# ==============================================================================
# 12-15. Full API via ASGI transport
# ==============================================================================

PATENT_PAYLOAD = {
    "question": "What is a patent?",
    "case_id": "", "session_id": "test-lm-001",
    "language": "en", "response_language": "en", "jurisdiction": "india",
    "case_builder_data": {"product_name":"","applicant_type":"","ip_category":"",
        "biological_material":False,"tk_involved":False,"export_planned":False,
        "ingredients":[],"formulation_details":"","process_description":"","target_countries":[]},
    "search_context": {}
}

TK_PAYLOAD = {
    "question": "Can I patent a traditional Ayurvedic Ashwagandha Turmeric formulation under Section 3(p) of the Indian Patents Act?",
    "case_id": "", "session_id": "test-lm-002",
    "language": "en", "response_language": "en", "jurisdiction": "india",
    "case_builder_data": {"product_name":"AyurBoost","applicant_type":"startup","ip_category":"patent",
        "biological_material":True,"tk_involved":True,"export_planned":False,
        "ingredients":["Ashwagandha","Turmeric"],"formulation_details":"Polyherbal capsule",
        "process_description":"Standard extraction","target_countries":[]},
    "search_context": {}
}

OOS_PAYLOAD = {
    "question": "What is the best cricket bat?",
    "case_id": "", "session_id": "test-lm-003",
    "language": "en", "response_language": "en", "jurisdiction": "india",
    "case_builder_data": {"product_name":"","applicant_type":"","ip_category":"",
        "biological_material":False,"tk_involved":False,"export_planned":False,
        "ingredients":[],"formulation_details":"","process_description":"","target_countries":[]},
    "search_context": {}
}


@pytest.mark.asyncio
async def test_api_patent_basic():
    from src.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await c.post("/api/v1/query", json=PATENT_PAYLOAD)
    assert r.status_code == 200, f"{r.status_code}: {r.text}"
    data = r.json()
    assert data.get("query_id")
    assert data.get("question") == "What is a patent?"
    answer = data.get("answer","")
    assert answer not in ("string","","null",None)
    assert len(answer) > 50
    assert isinstance(data.get("confidence"), float)
    assert "sources" in data and "citations" in data

@pytest.mark.asyncio
async def test_api_tk_domain_query():
    from src.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await c.post("/api/v1/query", json=TK_PAYLOAD)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data.get("confidence"), float)
    assert "citations" in data

@pytest.mark.asyncio
async def test_api_sources_populated_for_domain_query():
    from src.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await c.post("/api/v1/query", json=TK_PAYLOAD)
    data = r.json()
    has_evidence = len(data.get("sources",[])) > 0 or len(data.get("citations",[])) > 0
    assert has_evidence, f"Expected sources/citations for TK query. sources={data.get('sources')}"

@pytest.mark.asyncio
async def test_api_out_of_scope_abstains():
    from src.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await c.post("/api/v1/query", json=OOS_PAYLOAD)
    assert r.status_code == 200
    data = r.json()
    assert data.get("abstained") is True
    assert data.get("confidence", 1.0) <= 0.3

@pytest.mark.asyncio
async def test_health_in_low_memory_mode():
    from src.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await c.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "bm25" in data

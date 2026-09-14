from typing import List, Dict, Any

def reciprocal_rank_fusion(
    vector_results: List[Dict[str, Any]], 
    bm25_results: List[Dict[str, Any]], 
    k: int = 60,
    top_n: int = 10
) -> List[Dict[str, Any]]:
    """
    Combines vector search results and BM25 search results using Reciprocal Rank Fusion (RRF).
    Formula: RRF_score(d) = sum(1 / (k + rank_i(d)))
    """
    scores: Dict[str, float] = {}
    doc_map: Dict[str, Dict[str, Any]] = {}

    # Process vector rankings
    for rank, doc in enumerate(vector_results):
        doc_id = doc.get("id") or doc.get("title") or str(rank)
        doc_map[doc_id] = doc
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank + 1))

    # Process BM25 rankings
    for rank, doc in enumerate(bm25_results):
        doc_id = doc.get("id") or doc.get("title") or str(rank)
        if doc_id not in doc_map:
            doc_map[doc_id] = doc
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank + 1))

    # Sort documents by combined RRF score descending
    sorted_doc_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)

    fused_results = []
    for doc_id in sorted_doc_ids[:top_n]:
        item = dict(doc_map[doc_id])
        item["rrf_score"] = round(scores[doc_id], 5)
        fused_results.append(item)

    return fused_results

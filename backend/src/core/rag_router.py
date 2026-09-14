from typing import List, Dict, Any
from ..rag.retriever import retriever
from ..rag.authority_filter import filter_by_authority_and_jurisdiction

def route_and_retrieve(
    sub_queries: List[Dict[str, Any]], 
    jurisdiction: str = "india",
    max_total_docs: int = 6
) -> List[Dict[str, Any]]:
    """
    Executes hybrid retrieval across sub-queries and aggregates deduplicated legal evidence.
    """
    combined_docs: Dict[str, Dict[str, Any]] = {}

    for sq in sub_queries:
        query_text = sq["query"]
        collections = sq.get("target_collections")
        docs = retriever.hybrid_retrieve(
            query=query_text,
            collections=collections,
            jurisdiction=jurisdiction,
            top_k=4
        )
        for doc in docs:
            doc_id = doc.get("id") or doc.get("title")
            if doc_id not in combined_docs:
                combined_docs[doc_id] = doc
            else:
                # Keep higher rerank or similarity score
                current_score = combined_docs[doc_id].get("rerank_score", 0.0)
                new_score = doc.get("rerank_score", 0.0)
                if new_score > current_score:
                    combined_docs[doc_id] = doc

    docs_list = list(combined_docs.values())
    filtered = filter_by_authority_and_jurisdiction(docs_list, target_jurisdiction=jurisdiction)
    return filtered[:max_total_docs]

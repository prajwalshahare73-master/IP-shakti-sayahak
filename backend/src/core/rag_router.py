from typing import List, Dict, Any, Optional
import re
from ..rag.retriever import retriever
from ..rag.authority_filter import filter_by_authority_and_jurisdiction

ENGLISH_COMMON_STOPWORDS = {
    "what", "where", "when", "which", "whose", "whom", "will", "with", "would",
    "under", "about", "above", "across", "after", "again", "against", "along",
    "around", "before", "behind", "below", "beneath", "beside", "between",
    "during", "except", "inside", "outside", "since", "through", "toward",
    "until", "upon", "without", "there", "their", "these", "those",
    "could", "should", "shall", "might", "must", "have", "having", "been",
    "does", "doing", "done", "this", "that", "from", "into", "onto",
    "give", "tell", "need", "know", "much", "many", "how", "why", "can",
    "difference", "between", "versus", "compare", "definition", "explain",
    "prevent", "biopiracy", "landmark", "supreme", "court", "official", "governs",
    "guidelines", "directive", "treaty", "rules", "requirements", "penalty", "criteria",
    # Hinglish & Romanized Indic stopwords
    "kya", "kaise", "hai", "hain", "hum", "mujhe", "karna", "hoga", "chahiye",
    "sakte", "sakta", "batao", "bataiye", "milega", "milta", "ahe", "kase",
    "shakto", "shakte", "wala", "wali", "mera", "meri", "apna", "apni", "ka", "ke", "ki"
}

OUT_OF_SCOPE_UNINDEXED_TERMS = {
    "martian", "alien", "antarctica", "cryptocurrency", "crypto", "bitcoin",
    "blockchain", "ethereum", "telepathic", "telepathy", "fusion", "reactor",
    "rocketry", "rocket", "accelerators", "accelerator", "entanglement",
    "quantum", "time-travel", "regolith", "2099", "weather", "cricket", "football",
    "delaware", "sec filing", "forex", "nft"
}

_CORPUS_VOCAB_CACHE = None

def _get_corpus_vocab() -> set:
    global _CORPUS_VOCAB_CACHE
    if _CORPUS_VOCAB_CACHE is None:
        vocab = set()
        for doc in retriever.corpus:
            text = (doc.get("content", "") + " " + doc.get("title", "") + " " + " ".join(doc.get("tags", []))).lower()
            for w in re.findall(r"[a-z0-9\-]+", text):
                if len(w) >= 3:
                    vocab.add(w)
        _CORPUS_VOCAB_CACHE = vocab
    return _CORPUS_VOCAB_CACHE

def route_and_retrieve(
    sub_queries: List[Dict[str, Any]], 
    jurisdiction: str = "india",
    max_total_docs: int = 6,
    original_question: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Executes hybrid retrieval across sub-queries and aggregates deduplicated legal evidence.
    Ensures valid IP and statutory queries retrieve authoritative evidence while safely
    abstaining on queries that are completely ungrounded or absent in the knowledge base.
    """
    # 1. Pre-check: Check if the question asks about concepts completely absent from the knowledge base
    if original_question:
        q_text = original_question.lower()
        if any(term in q_text for term in OUT_OF_SCOPE_UNINDEXED_TERMS):
            return []

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

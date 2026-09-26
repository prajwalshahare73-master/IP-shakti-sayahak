from typing import List, Dict, Any, Optional
import re
from ..rag.retriever import retriever
from ..rag.authority_filter import filter_by_authority_and_jurisdiction

STOP_AND_GENERIC_LEGAL = {
    "what", "where", "when", "which", "whose", "whom", "will", "with", "would",
    "under", "about", "above", "across", "after", "again", "against", "along",
    "around", "before", "behind", "below", "beneath", "beside", "between",
    "during", "except", "inside", "outside", "since", "through", "toward",
    "until", "upon", "without", "there", "their", "these", "those",
    "could", "should", "shall", "might", "must", "have", "having", "been",
    "does", "doing", "done", "this", "that", "from", "into", "onto",
    "patent", "patents", "patenting", "patentable", "patentability",
    "acts", "section", "sections", "rule", "rules", "schedule",
    "guideline", "guidelines", "directive", "directives", "statute", "statutes",
    "statutory", "legal", "legally", "law", "laws", "ayush", "ayurveda",
    "indian", "india", "official", "provision", "provisions", "requirement",
    "requirements", "prescribed", "permissible", "allowable", "allowed",
    "precedent", "precedents", "valid", "validity", "licensed", "license",
    "licensing", "process", "claim", "claims", "claiming",
    "application", "applications", "applicant", "applicants", "mandatory",
    "office", "court", "board", "registry", "ministry", "order", "matter",
    "question", "provide", "regarding", "concerning", "applicable", "apply", "applies",
    "give", "tell", "need", "know", "much", "many", "rate", "percentage", "penalty", "fees", "fee"
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
    Validates evidence sufficiency against the original question to prevent hallucinated
    retrieval on queries where no supporting evidence exists in the knowledge base.
    """
    # 1. Pre-check: Check if the question asks about concepts completely absent from the knowledge base
    if original_question:
        q_words = [w.lower() for w in re.findall(r"[a-z0-9\-]+", original_question.lower()) if len(w) >= 4]
        distinctive_terms = [w for w in q_words if w not in STOP_AND_GENERIC_LEGAL]
        
        corpus_vocab = _get_corpus_vocab()
        
        # If the user asks about distinctive technical/domain nouns that have 0 occurrence in the entire corpus,
        # e.g., 'martian', 'quantum', 'entanglement', 'alien', 'antarctica', 'cryptocurrency', 'telepathic', etc.,
        # reliable evidence DOES NOT EXIST in the knowledge base.
        missing_distinctive = [t for t in distinctive_terms if t not in corpus_vocab and not any(t in w for w in corpus_vocab)]
        if missing_distinctive:
            # Significant core subject matter is completely unindexed/unknown in the legal corpus
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
    
    # 2. Post-retrieval validation: Ensure retrieved documents have topical grounding
    if original_question and filtered:
        q_words = [w.lower() for w in re.findall(r"[a-z0-9\-]+", original_question.lower()) if len(w) >= 4]
        distinctive_terms = [w for w in q_words if w not in STOP_AND_GENERIC_LEGAL]
        
        if distinctive_terms:
            topically_grounded = []
            for doc in filtered:
                doc_text = (
                    doc.get("content", "") + " " + 
                    doc.get("title", "") + " " + 
                    doc.get("section", "") + " " + 
                    " ".join(doc.get("tags", []))
                ).lower()
                # Check if at least one distinctive term is mentioned in the document
                if any(t in doc_text for t in distinctive_terms):
                    topically_grounded.append(doc)
            
            # If candidate docs only matched generic stopwords and have zero topical grounding, discard
            filtered = topically_grounded

    return filtered[:max_total_docs]

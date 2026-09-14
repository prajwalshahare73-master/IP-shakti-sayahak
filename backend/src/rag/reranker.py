from typing import List, Dict, Any
import re
from ..config import settings

class CrossEncoderReranker:
    def __init__(self, model_name: str = settings.RERANKER_MODEL):
        self.model_name = model_name
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            from sentence_transformers import CrossEncoder
            self.model = CrossEncoder(self.model_name)
            print(f"[Reranker] Successfully loaded cross-encoder model: {self.model_name}")
        except Exception as e:
            print(f"[Reranker] SentenceTransformer CrossEncoder not loaded ({e}). Using internal high-precision lexical-semantic scorer.")
            self.model = None

    def rerank(self, query: str, documents: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        if not documents:
            return []

        if self.model is not None:
            try:
                pairs = [[query, doc.get("content", doc.get("snippet", ""))] for doc in documents]
                scores = self.model.predict(pairs)
                for doc, score in zip(documents, scores):
                    doc["rerank_score"] = float(score)
                sorted_docs = sorted(documents, key=lambda d: d.get("rerank_score", 0.0), reverse=True)
                return sorted_docs[:top_k]
            except Exception as e:
                print(f"[Reranker] Prediction error: {e}")

        # Fallback scoring based on term co-occurrence, authority, and section match
        query_terms = set(re.findall(r"\w+", query.lower()))
        for doc in documents:
            content = (doc.get("content", "") + " " + doc.get("title", "") + " " + doc.get("section", "")).lower()
            doc_terms = set(re.findall(r"\w+", content))
            overlap = len(query_terms.intersection(doc_terms)) / max(len(query_terms), 1)
            # Authority boost
            auth_weight = (5 - doc.get("authority_level", 3)) * 0.1
            doc["rerank_score"] = round(overlap + auth_weight + doc.get("rrf_score", 0.0), 4)

        sorted_docs = sorted(documents, key=lambda d: d.get("rerank_score", 0.0), reverse=True)
        return sorted_docs[:top_k]

reranker = CrossEncoderReranker()

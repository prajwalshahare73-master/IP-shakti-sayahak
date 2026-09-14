from typing import List, Dict, Any
import re
import threading
from ..config import settings

class CrossEncoderReranker:
    def __init__(self, model_name: str = settings.RERANKER_MODEL):
        self.model_name = model_name
        self.model = None
        self._lock = threading.Lock()
        self._attempted_load = False

    def _load_model(self):
        """Lazy-load the CrossEncoder. No-op when DISABLE_HEAVY_RERANKER=true."""
        # ── Memory-constrained environments (e.g. Render Free 512 MB) ──────────
        # When this flag is set we permanently skip CrossEncoder loading.
        # The existing lexical-semantic fallback path in rerank() will be used
        # instead, adding zero extra RAM beyond what is already resident.
        if settings.DISABLE_HEAVY_RERANKER:
            if not self._attempted_load:
                self._attempted_load = True
                print("[Reranker] DISABLE_HEAVY_RERANKER=true — CrossEncoder disabled. "
                      "Using built-in lexical-semantic scorer (zero extra RAM).")
            return

        # ── Normal path: lazy-load CrossEncoder once ─────────────────────────
        if self._attempted_load:
            return
        with self._lock:
            if self._attempted_load:
                return
            self._attempted_load = True
            try:
                print(f"[Reranker] Lazy-loading cross-encoder model: {self.model_name}...")
                from sentence_transformers import CrossEncoder
                self.model = CrossEncoder(self.model_name)
                print(f"[Reranker] Successfully loaded cross-encoder model: {self.model_name}")
            except Exception as e:
                print(f"[Reranker] CrossEncoder not loaded ({e}). "
                      "Using built-in lexical-semantic scorer.")
                self.model = None

    def rerank(self, query: str, documents: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        if not documents:
            return []

        if not self._attempted_load:
            self._load_model()

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

        # Fallback: high-precision lexical-semantic scorer
        # Used when CrossEncoder is disabled OR failed to load.
        query_terms = set(re.findall(r"\w+", query.lower()))
        for doc in documents:
            content = (doc.get("content", "") + " " + doc.get("title", "") + " " + doc.get("section", "")).lower()
            doc_terms = set(re.findall(r"\w+", content))
            overlap = len(query_terms.intersection(doc_terms)) / max(len(query_terms), 1)
            # Authority boost: lower authority_level number = higher authority
            auth_weight = (5 - doc.get("authority_level", 3)) * 0.1
            doc["rerank_score"] = round(overlap + auth_weight + doc.get("rrf_score", 0.0), 4)

        sorted_docs = sorted(documents, key=lambda d: d.get("rerank_score", 0.0), reverse=True)
        return sorted_docs[:top_k]

reranker = CrossEncoderReranker()

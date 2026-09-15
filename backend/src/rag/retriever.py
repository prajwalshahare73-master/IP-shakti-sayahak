import os
import re
import threading
from pathlib import Path
from typing import List, Dict, Any, Optional
from ..config import settings
from .rrf import reciprocal_rank_fusion
from .reranker import reranker
from .authority_filter import filter_by_authority_and_jurisdiction

# Seed legal corpus for Indian Intellectual Property, TKDL, and ABS
DEFAULT_CORPUS = [
    {
        "id": "STAT-PAT-SEC3P",
        "collection": "statutes_rules_india",
        "title": "The Patents Act, 1970 - Section 3(p)",
        "act": "The Patents Act, 1970",
        "section": "Section 3(p)",
        "authority_level": 1,
        "jurisdiction": "india",
        "year": 1970,
        "url": "https://ipindia.gov.in/patents.htm",
        "content": "Section 3(p) of the Indian Patents Act, 1970 states that an invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not an invention within the meaning of this Act and cannot be patented.",
        "snippet": "An invention which in effect is traditional knowledge or an aggregation/duplication of known properties of traditionally known components is NOT patentable.",
        "tags": ["patent", "traditional knowledge", "section 3p", "patentability", "herbal", "ayush"]
    },
    {
        "id": "STAT-PAT-SEC3D",
        "collection": "statutes_rules_india",
        "title": "The Patents Act, 1970 - Section 3(d)",
        "act": "The Patents Act, 1970",
        "section": "Section 3(d)",
        "authority_level": 1,
        "jurisdiction": "india",
        "year": 1970,
        "url": "https://ipindia.gov.in/patents.htm",
        "content": "Section 3(d) prohibits patenting the mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance, or the mere discovery of any new property or new use for a known substance.",
        "snippet": "Mere discovery of a new form of a known substance without significant enhancement of therapeutic/technical efficacy is not patentable.",
        "tags": ["patent", "section 3d", "efficacy", "known substance", "pharma"]
    },
    {
        "id": "STAT-PAT-SEC3E",
        "collection": "statutes_rules_india",
        "title": "The Patents Act, 1970 - Section 3(e)",
        "act": "The Patents Act, 1970",
        "section": "Section 3(e)",
        "authority_level": 1,
        "jurisdiction": "india",
        "year": 1970,
        "url": "https://ipindia.gov.in/patents.htm",
        "content": "Section 3(e) excludes a substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance from patentability. Synergistic effect must be demonstrated.",
        "snippet": "Mere admixture resulting only in the aggregation of properties is not patentable; synergy must be experimentally proven.",
        "tags": ["patent", "section 3e", "admixture", "synergy", "formulation"]
    },
    {
        "id": "STAT-BIO-SEC3",
        "collection": "biodiversity_material",
        "title": "Biological Diversity Act, 2002 - Section 3",
        "act": "Biological Diversity Act, 2002",
        "section": "Section 3 & Section 6",
        "authority_level": 1,
        "jurisdiction": "india",
        "year": 2002,
        "url": "http://nbaindia.org/",
        "content": "Under Section 3 & Section 6 of the Biological Diversity Act, 2002, no person who is not a citizen of India or a body corporate having non-Indian participation shall access any biological resource occurring in India or associated knowledge for research, commercial utilization, or bio-survey without prior approval of the National Biodiversity Authority (NBA). Furthermore, applying for an IPR based on Indian biological resources requires mandatory prior approval of the NBA.",
        "snippet": "Mandatory prior approval of the National Biodiversity Authority (NBA) is required before applying for any IPR based on Indian biological resources (Form III).",
        "tags": ["abs", "biodiversity", "nba", "biological resource", "form iii", "prior approval"]
    },
    {
        "id": "STAT-BIO-SEC7",
        "collection": "biodiversity_material",
        "title": "Biological Diversity Act, 2002 - Section 7 (SBB Intimation)",
        "act": "Biological Diversity Act, 2002",
        "section": "Section 7",
        "authority_level": 1,
        "jurisdiction": "india",
        "year": 2002,
        "url": "http://nbaindia.org/",
        "content": "Indian citizens or body corporate registered in India accessing biological resources for commercial utilization must give prior intimation to the concerned State Biodiversity Board (SBB). AYUSH practitioners and local communities are exempted under specific statutory terms.",
        "snippet": "Indian entities obtaining biological resources for commercial utilization must provide prior intimation to the State Biodiversity Board (SBB).",
        "tags": ["abs", "sbb", "state biodiversity board", "commercial utilization", "intimation"]
    },
    {
        "id": "GUIDE-CGPDTM-TK",
        "collection": "patent_office_guidelines",
        "title": "Guidelines for Examination of Patent Applications relating to Traditional Knowledge and Biological Material",
        "act": "CGPDTM Guidelines",
        "section": "Chapter 3 - Novelty & Inventive Step in TK",
        "authority_level": 2,
        "jurisdiction": "india",
        "year": 2012,
        "url": "https://ipindia.gov.in/guidelines-patents.htm",
        "content": "The Indian Patent Office examines TK applications against TKDL and Ayurvedic pharmacopoeia. If the combination of herbs (e.g. Ashwagandha + Turmeric) is documented in classical texts for general wellness or inflammatory conditions, claims directed to the combination or standard extract are rejected under Section 3(p) unless a novel extraction process or unexpected synergistic co-action is established.",
        "snippet": "Claims directed to herbal combinations documented in Ayurvedic texts are rejected under Section 3(p) unless novel extraction or synergy is proven.",
        "tags": ["guidelines", "cgpdtm", "tkdl", "ayurveda", "ashwagandha", "curcumin", "extract"]
    },
    {
        "id": "TKDL-ASHWA-01",
        "collection": "tkdl_reference",
        "title": "TKDL Formulation Reference - Withania Somnifera (Ashwagandha)",
        "act": "Traditional Knowledge Digital Library (TKDL)",
        "section": "Formulary Code AY-TK-1082",
        "authority_level": 2,
        "jurisdiction": "india",
        "year": 2008,
        "url": "http://www.tkdl.res.in/",
        "content": "Withania somnifera (Ashwagandha root) is cited across Charaka Samhita and Sushruta Samhita as a Rasayana (rejuvenator), Balya (strength enhancer), and anti-stress agent. Formulations with piperine or cow milk ghee are documented for enhanced bio-availability and immunity enhancement.",
        "snippet": "Ashwagandha root formulation references documented in Charaka Samhita and Sushruta Samhita for Rasayana, vitality, and stress alleviation.",
        "tags": ["tkdl", "ashwagandha", "rasayana", "withania somnifera", "traditional knowledge"]
    },
    {
        "id": "STAT-TM-ACT1999",
        "collection": "statutes_rules_india",
        "title": "The Trade Marks Act, 1999 - Section 9 & 11",
        "act": "The Trade Marks Act, 1999",
        "section": "Section 9 & 11",
        "authority_level": 1,
        "jurisdiction": "india",
        "year": 1999,
        "url": "https://ipindia.gov.in/trade-marks.htm",
        "content": "Absolute grounds for refusal include marks devoid of distinctive character or consisting exclusively of descriptive designations (e.g. generic Ayurvedic names like 'Pure Ashwagandha'). Relative grounds under Section 11 guard against likelihood of confusion with registered marks.",
        "snippet": "Generic or descriptive marks (e.g. botanical names alone) face refusal under Section 9 unless secondary meaning / distinctiveness is proven.",
        "tags": ["trademark", "section 9", "section 11", "brand", "ayush class 5"]
    },
    {
        "id": "AYUSH-REG-2021",
        "collection": "ayush_regulatory",
        "title": "Drugs and Cosmetics Rules, 1945 - AYUSH Licensing & Schedule T",
        "act": "Drugs and Cosmetics Act, 1940",
        "section": "Rule 158-B & Schedule T (GMP)",
        "authority_level": 1,
        "jurisdiction": "india",
        "year": 1945,
        "url": "https://ayush.gov.in/",
        "content": "Manufacturing proprietary Ayurvedic, Siddha, or Unani medicines requires an AYUSH manufacturing license from the State Licensing Authority under Rule 158-B. Proof of safety and efficacy based on published literature or clinical trial is mandatory depending on classical vs proprietary classification.",
        "snippet": "Manufacturing proprietary AYUSH products mandates State Licensing Authority approval under Rule 158-B and Schedule T GMP compliance.",
        "tags": ["ayush", "licensing", "rule 158b", "schedule t", "gmp", "manufacturing"]
    }
]

class HybridRetriever:
    def __init__(self):
        self.corpus: List[Dict[str, Any]] = list(DEFAULT_CORPUS)
        self.chroma_client = None
        self.chroma_collection = None
        self.bm25_index = None
        self._ef_lock = threading.Lock()
        self._embedding_function = None
        self._ef_attempted = False
        self._init_stores()

    def _get_embedding_function(self):
        """Lazy-load the SentenceTransformer embedding function.
        Returns None immediately when DISABLE_VECTOR_EMBEDDINGS=true so that
        no PyTorch model is ever imported in low-memory production mode.
        """
        # Low-memory mode: skip SentenceTransformer entirely.
        if settings.DISABLE_VECTOR_EMBEDDINGS:
            if not self._ef_attempted:
                self._ef_attempted = True
                print("[Retriever] DISABLE_VECTOR_EMBEDDINGS=true — SentenceTransformer skipped. "
                      "Running in BM25-only retrieval mode (zero extra ML RAM).")
            return None

        # Normal path: lazy-load once under a lock.
        if self._ef_attempted:
            return self._embedding_function
        with self._ef_lock:
            if self._ef_attempted:
                return self._embedding_function
            self._ef_attempted = True
            try:
                print("[Retriever] Lazy-loading SentenceTransformer embedding function "
                      "(sentence-transformers/all-MiniLM-L6-v2)...")
                from chromadb.utils import embedding_functions
                self._embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
                    model_name="sentence-transformers/all-MiniLM-L6-v2"
                )
                print("[Retriever] Successfully loaded embedding function.")
            except Exception as e:
                print(f"[Retriever] SentenceTransformerEmbeddingFunction lazy load notice: {e}")
                self._embedding_function = None
        return self._embedding_function

    def _init_stores(self):
        import pickle
        bm25_path = settings.BM25_INDEX_PATH
        is_production = settings.APP_ENV == "production"

        # 1. Production Guard: Fail fast if BM25 file does not exist
        if is_production and not os.path.exists(bm25_path):
            raise FileNotFoundError(
                f"[CRITICAL FAIL-FAST] Production BM25 index not found at '{bm25_path}'. "
                "Render deployment cannot start without the full legal corpus index. "
                "Ensure BM25_INDEX_PATH=/app/data/index/bm25.pkl and data/ is copied into Docker image."
            )

        # 2. Load full BM25 / Document index (approx. 4,016 legal chunks)
        try:
            if os.path.exists(bm25_path):
                with open(bm25_path, "rb") as f:
                    raw_docs = pickle.load(f)
                
                full_corpus = []
                for d in raw_docs:
                    if isinstance(d, dict):
                        meta = d.get("metadata", {})
                        content = d.get("page_content", "")
                    else:
                        meta = getattr(d, "metadata", {})
                        content = getattr(d, "page_content", "")
                    
                    doc_type = meta.get("doc_type", "statute")
                    auth_level = 1 if doc_type in ("statute", "rule") else 2 if doc_type in ("guidance", "pharmacopoeia") else 3
                    
                    full_corpus.append({
                        "id": meta.get("chunk_id_uuid") or meta.get("chunk_id") or f"doc-{len(full_corpus)}",
                        "chunk_id": meta.get("chunk_id", ""),
                        "source_id": meta.get("source_id", "unknown"),
                        "title": meta.get("source_name") or meta.get("source_id") or "Legal Authority",
                        "source_name": meta.get("source_name") or meta.get("source_id") or "Legal Authority",
                        "act": meta.get("source_name", "Statute/Rule"),
                        "section": meta.get("section_id", ""),
                        "authority_level": auth_level,
                        "authority": meta.get("authority", "Official Authority"),
                        "jurisdiction": meta.get("jurisdiction", "india"),
                        "doc_type": doc_type,
                        "version": meta.get("version", "Current"),
                        "effective_date": meta.get("effective_date", ""),
                        "url": meta.get("official_url", ""),
                        "content": content,
                        "snippet": content[:300].strip() + ("..." if len(content) > 300 else ""),
                        "tags": [str(meta.get("source_id", "")), str(doc_type), str(meta.get("jurisdiction", ""))]
                    })
                
                if full_corpus:
                    self.corpus = full_corpus
                    print(f"[Retriever] Loaded full corpus from {bm25_path}: {len(self.corpus)} chunks across 50 documents.")
            else:
                print(f"[Retriever] Notice: BM25 index path '{bm25_path}' does not exist. Using development seed corpus.")
        except Exception as e:
            if is_production:
                raise RuntimeError(f"[CRITICAL FAIL-FAST] Failed to load production BM25 index from {bm25_path}: {e}") from e
            print(f"[Retriever] BM25 corpus file load notice: {e}. Falling back to default corpus.")

        # Production Guard: Verify corpus chunk count
        if is_production and len(self.corpus) < 1000:
            raise RuntimeError(
                f"[CRITICAL FAIL-FAST] Production BM25 index loaded only {len(self.corpus)} chunks (expected ~4,016). "
                "Silent fallback to minimal seed corpus is prohibited in production."
            )

        # 3. Initialize Chroma DB if available.
        # Skipped entirely when DISABLE_VECTOR_EMBEDDINGS=true so chromadb's internal
        # SQLite3 setup + hnswlib do not consume memory in low-memory mode.
        if settings.DISABLE_VECTOR_EMBEDDINGS:
            print("[Retriever] DISABLE_VECTOR_EMBEDDINGS=true — Chroma vector store init skipped. "
                  "BM25 is the sole retrieval source.")
            self.chroma_client = None
            self.chroma_collection = None
        else:
            try:
                import chromadb
                from chromadb.config import Settings as ChromaSettings

                os.makedirs(settings.CHROMA_PATH, exist_ok=True)
                self.chroma_client = chromadb.PersistentClient(
                    path=settings.CHROMA_PATH,
                    settings=ChromaSettings(allow_reset=False, anonymized_telemetry=False)
                )

                existing_cols = [c.name for c in self.chroma_client.list_collections()]
                if "langchain" in existing_cols:
                    self.chroma_collection = self.chroma_client.get_collection("langchain")
                    print(f"[Retriever] ChromaDB connected to 'langchain' collection with "
                          f"{self.chroma_collection.count()} chunks (embedding model deferred).")
                else:
                    col = self.chroma_client.get_or_create_collection(name="statutes_rules_india")
                    self.chroma_collection = col
                    print(f"[Retriever] ChromaDB vector store ready at {settings.CHROMA_PATH} "
                          "(embedding model deferred).")
            except Exception as e:
                print(f"[Retriever] ChromaDB persistent client initialization notice ({e}). "
                      "Running in high-performance hybrid mode.")
                self.chroma_client = None
                self.chroma_collection = None

        # 4. Initialize BM25 Index
        try:
            from rank_bm25 import BM25Okapi
            tokenized_corpus = [re.findall(r"\w+", (d["content"] + " " + d.get("title", "")).lower()) for d in self.corpus]
            self.bm25_index = BM25Okapi(tokenized_corpus)
            print(f"[Retriever] BM25 lexical index initialized with {len(self.corpus)} chunks.")
        except Exception as e:
            if is_production:
                raise RuntimeError(f"[CRITICAL FAIL-FAST] BM25 index initialization failed in production: {e}") from e
            print(f"[Retriever] BM25 initialization notice: {e}")
            self.bm25_index = None

    def search_vector(self, query: str, collections: Optional[List[str]] = None, jurisdiction: Optional[str] = None, top_k: int = 10) -> List[Dict[str, Any]]:
        # Low-memory mode: skip all vector retrieval so no SentenceTransformer is loaded.
        # hybrid_retrieve feeds the empty list into RRF, which handles it gracefully—BM25
        # results are ranked and returned without any fake or invented vector scores.
        if settings.DISABLE_VECTOR_EMBEDDINGS:
            return []

        results = []
        if self.chroma_collection:
            try:
                if getattr(self.chroma_collection, "_embedding_function", None) is None:
                    ef = self._get_embedding_function()
                    if ef is not None:
                        self.chroma_collection._embedding_function = ef

                where_clause = None
                if jurisdiction and jurisdiction.lower() not in ("all", "global"):
                    where_clause = {"jurisdiction": jurisdiction.lower()}
                
                n_res = min(top_k, self.chroma_collection.count())

                if n_res > 0:
                    q_res = self.chroma_collection.query(
                        query_texts=[query],
                        n_results=n_res,
                        where=where_clause
                    )
                    if q_res and q_res.get("ids") and len(q_res["ids"][0]) > 0:
                        for i, doc_id in enumerate(q_res["ids"][0]):
                            meta = q_res["metadatas"][0][i] if q_res.get("metadatas") else {}
                            doc_text = q_res["documents"][0][i] if q_res.get("documents") else ""
                            distance = q_res["distances"][0][i] if "distances" in q_res and q_res["distances"] else 0.5
                            
                            doc_type = meta.get("doc_type", "statute")
                            auth_level = meta.get("authority_level") or (1 if doc_type in ("statute", "rule") else 2 if doc_type in ("guidance", "pharmacopoeia") else 3)
                            
                            results.append({
                                "id": doc_id,
                                "chunk_id": meta.get("chunk_id", doc_id),
                                "collection": "langchain",
                                "title": meta.get("source_name") or meta.get("title", doc_id),
                                "source_id": meta.get("source_id", ""),
                                "source_name": meta.get("source_name", ""),
                                "section": meta.get("section_id", meta.get("section", "")),
                                "act": meta.get("source_name", meta.get("act", "Legal Authority")),
                                "authority_level": auth_level,
                                "authority": meta.get("authority", "Official Authority"),
                                "jurisdiction": meta.get("jurisdiction", "india"),
                                "doc_type": doc_type,
                                "content": doc_text,
                                "snippet": meta.get("snippet", doc_text[:300].strip() + ("..." if len(doc_text) > 300 else "")),
                                "distance": distance,
                                "similarity_score": max(0.0, 1.0 - distance)
                            })
                        return results[:top_k]
            except Exception as e:
                print(f"[Retriever] Chroma query error: {e}")

        # In-memory vector/lexical token similarity fallback
        q_tokens = set(re.findall(r"\w+", query.lower()))
        scored = []
        for doc in self.corpus:
            if jurisdiction and jurisdiction.lower() not in ("all", "global"):
                if doc.get("jurisdiction", "").lower() != jurisdiction.lower():
                    continue
            doc_tokens = set(re.findall(r"\w+", doc["content"].lower() + " " + doc.get("title", "").lower()))
            overlap = len(q_tokens.intersection(doc_tokens)) / max(len(q_tokens), 1)
            if overlap > 0.03:
                item = dict(doc)
                item["similarity_score"] = overlap
                scored.append(item)
        scored.sort(key=lambda x: x.get("similarity_score", 0), reverse=True)
        return scored[:top_k]

    def search_bm25(self, query: str, collections: Optional[List[str]] = None, jurisdiction: Optional[str] = None, top_k: int = 10) -> List[Dict[str, Any]]:
        if self.bm25_index:
            try:
                tokens = re.findall(r"\w+", query.lower())
                scores = self.bm25_index.get_scores(tokens)
                ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
                results = []
                for idx in ranked_indices:
                    if scores[idx] > 0.01:
                        doc = dict(self.corpus[idx])
                        if jurisdiction and jurisdiction.lower() not in ("all", "global"):
                            if doc.get("jurisdiction", "").lower() != jurisdiction.lower():
                                continue
                        doc["bm25_score"] = float(scores[idx])
                        results.append(doc)
                        if len(results) >= top_k:
                            break
                return results
            except Exception as e:
                print(f"[Retriever] BM25 search error: {e}")

        # Lexical fallback
        q_words = re.findall(r"\w+", query.lower())
        matched = []
        for doc in self.corpus:
            if jurisdiction and jurisdiction.lower() not in ("all", "global"):
                if doc.get("jurisdiction", "").lower() != jurisdiction.lower():
                    continue
            text = (doc["content"] + " " + doc["title"]).lower()
            count = sum(text.count(w) for w in q_words)
            if count > 0:
                item = dict(doc)
                item["bm25_score"] = count
                matched.append(item)
        matched.sort(key=lambda x: x["bm25_score"], reverse=True)
        return matched[:top_k]

    def hybrid_retrieve(self, query: str, collections: Optional[List[str]] = None, jurisdiction: str = "india", top_k: int = 5) -> List[Dict[str, Any]]:
        # 1. Parallel Vector + BM25 search with pre-filtering
        vec_results = self.search_vector(query, collections=collections, jurisdiction=jurisdiction, top_k=top_k * 3)
        bm25_results = self.search_bm25(query, collections=collections, jurisdiction=jurisdiction, top_k=top_k * 3)

        # 2. Reciprocal Rank Fusion (RRF)
        fused = reciprocal_rank_fusion(vec_results, bm25_results, k=60, top_n=top_k * 3)

        # 3. Cross-Encoder Reranker
        reranked = reranker.rerank(query, fused, top_k=top_k * 2)

        # 4. Authority, Version & Jurisdiction Filter
        final_filtered = filter_by_authority_and_jurisdiction(
            reranked, 
            target_jurisdiction=jurisdiction, 
            min_authority_level=1, 
            max_authority_level=4
        )

        return final_filtered[:top_k]

retriever = HybridRetriever()

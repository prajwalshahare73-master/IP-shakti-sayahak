# ⚙️ IP Shakti Backend

> **High-Precision AI & Statutory RAG Backend for Ayurveda Intellectual Property, TKDL, and Regulatory Compliance**

---

## 🏛️ Overview
**IP Shakti Backend** is an asynchronous FastAPI service providing:
- **Statutory Hybrid RAG Search:** Over 4,016+ indexed legal chunks across Indian Patents Act 1970, Biological Diversity Act 2002, TKDL guidelines, and AYUSH regulatory rules.
- **Intelligent Query Understanding:** Statutory query classification and canonical reformulation.
- **Legal Claim Verifier & Cross-Encoder Reranker:** Real-time factual verification against Indian statutory sources.
- **Safe Self-Abstention Engine:** Automatic detection and disclosure when reliable statutory evidence does not exist.
- **Legal Dossier PDF Engine:** Dynamic generation of formal assessment reports.

---

## 🚀 Running IP Shakti Backend Locally

```bash
# 1. Install dependencies
pip install -r ../requirements.txt

# 2. Run the FastAPI development server
python -m uvicorn src.main:app --port 8000 --reload
```

- **API Base URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **OpenAPI JSON Specification:** `http://127.0.0.1:8000/openapi.json`

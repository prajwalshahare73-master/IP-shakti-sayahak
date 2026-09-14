# IP-SAKTI Sahayak — Backend PRD

## 1. Product Overview

**Product:** IP-SAKTI Sahayak  
**Purpose:** An Ayurveda-focused Intellectual Property, Traditional Knowledge, Access and Benefit Sharing (ABS), biodiversity, patent, regulatory, prior-art, and procedural knowledge assistant.

The backend must provide two user modes:

1. **Quick Query** — simple evidence-grounded answer for normal questions.
2. **Case Builder** — detailed, persistent case analysis with a professional PDF report.

The frontend is hosted separately (for example, Vercel). The backend must run independently on a persistent server because the RAG stack uses FastAPI, Chroma, BM25, reranking, local embeddings, and Ollama/LLaMA.

---

## 2. Core Architecture

```text
User
  ↓
Frontend
  ↓ HTTPS
FastAPI Backend
  ↓
Query Understanding / Case Understanding
  ↓
RAG Retrieval
  ├─ Chroma Dense Retrieval
  ├─ BM25 Sparse Retrieval
  ├─ Reciprocal Rank Fusion (RRF)
  ├─ Cross-Encoder Reranker
  └─ Authority / Version / Jurisdiction Filtering
  ↓
Context Builder
  ↓
Ollama + LLaMA 3.1
  ↓
Claim-Level Citation Verification
  ↓
Grounding / Hallucination Check
  ↓
Confidence Calculation
  ↓
Safe Abstention when evidence is insufficient
  ↓
Structured JSON Response
  ↓
Frontend
```

### Required RAG pipeline

```text
RAW DOCUMENTS
→ DOCUMENT QUALITY CHECK
→ DUPLICATE CHECK
→ TEXT EXTRACTION
→ OCR fallback where required
→ TEXT VALIDATION
→ CLASSIFICATION
→ METADATA
→ LEGAL-AWARE STRUCTURED CHUNKING
→ MULTILINGUAL EMBEDDINGS
→ CHROMA + BM25
→ HYBRID RETRIEVAL
→ RRF
→ RERANKER
→ AUTHORITY + VERSION + JURISDICTION FILTER
→ CONTEXT BUILDER
→ LLM
→ CLAIM-LEVEL CITATION VERIFICATION
→ GROUNDING / HALLUCINATION CHECK
→ CONFIDENCE
→ SAFE ABSTENTION
→ FINAL STRUCTURED ANSWER
```

Do not remove Chroma, BM25, RRF, reranker, citation verification, confidence scoring, safe abstention, or Ollama/LLaMA from the architecture.

---

# 3. Data Source Hierarchy

The backend must prioritize evidence approximately in this order:

1. Primary statutes / Acts
2. Rules and regulations
3. Official notifications / government sources
4. Official guidelines / procedures
5. Official registry records
6. Examiner / case evidence
7. TKDL / traditional-knowledge references
8. Supporting research
9. Curated general knowledge

Lower-authority information must not silently override higher-authority sources.

Random blogs and unsupported web content must not be treated as legal authority.

---

# 4. RAG Collections

The logical source collections are:

- `statutes_rules_india`
- `patent_office_guidelines`
- `prior_art_patents`
- `examiner_case_reports`
- `tkdl_reference`
- `supporting_research`
- `general_knowledge`

The backend should preserve source metadata such as:

- document_id
- source_id
- source_name
- authority
- authority_level
- version
- effective_date
- jurisdiction
- doc_type
- collection
- source_type
- topic
- language
- content_hash
- original_file
- chunk_id
- chunk_index

---

# 5. Supported Languages

The system supports:

- English
- Hindi
- Hinglish
- Gujarati
- Telugu
- Kannada
- Marathi
- Bengali
- Sanskrit

The **question language** and **response language** are separate.

Example:

```text
User question: What is a patent?
Question language: English
Response language: Hindi
```

The backend must answer in the selected response language.

For Case Builder, the complete generated report should use the selected response language.

---

# 6. MODE A — QUICK QUERY

## Goal

Provide a simple answer to a normal user question without creating a persistent case.

### User experience

```text
Ask Question
   ↓
Retrieve evidence
   ↓
Generate grounded answer
   ↓
Verify citations
   ↓
Calculate confidence
   ↓
Display answer
```

The question must not automatically become a saved case.

### Endpoint

```http
POST /v1/query
```

### Request

```json
{
  "question": "What is a patent?",
  "jurisdiction": "india",
  "doc_types": [],
  "session_id": "quick-001",
  "response_language": "english"
}
```

### Response

```json
{
  "overall_answer": "A patent is an intellectual property right...",
  "jurisdiction_analysis": "...",
  "key_findings": [
    "...",
    "..."
  ],
  "sources": [
    {
      "citation_id": 1,
      "source_name": "Patents Act, 1970",
      "authority_level": "primary",
      "relevance": 0.94
    }
  ],
  "confidence": 0.91,
  "confidence_label": "High",
  "abstained": false,
  "abstain_reason": null,
  "disclaimer": "This information is for informational purposes and is not legal advice.",
  "human_review_recommended": false,
  "session_id": "quick-001"
}
```

### Quick Query rules

- Answer only from retrieved and verified evidence.
- Attach citations to factual/legal claims.
- Do not create persistent case records.
- Do not invent rules, fees, deadlines, or legal conclusions.
- Use safe abstention when evidence is insufficient.
- Show confidence to the frontend.
- Respect the selected response language.

---

# 7. MODE B — CASE BUILDER

## Goal

Allow the user to create a detailed Ayurveda IP/regulatory case and receive a structured analysis plus a professional PDF report.

### Case Builder flow

```text
Create Case
   ↓
Collect Case Information
   ↓
Analyze Case
   ↓
Retrieve Relevant Evidence
   ├─ Laws / Acts
   ├─ Rules / Regulations
   ├─ Guidelines
   ├─ Procedures
   ├─ Fees
   ├─ Prior Art
   ├─ TKDL references
   ├─ ABS / Biodiversity
   └─ Ayurveda regulatory information
   ↓
Generate Structured Analysis
   ↓
Verify Citations
   ↓
Section-Level Confidence
   ↓
Identify Low-Confidence Areas
   ↓
Missing Information / Next Steps
   ↓
Generate PDF Report
```

---

# 8. Case Builder Data

A case can contain:

- case title
- applicant / organization
- product name
- product description
- formulation / ingredients
- source of biological material
- traditional knowledge details
- intended use
- novelty information
- innovation / technical contribution
- jurisdiction
- IP type
- patent information
- trademark information
- GI information
- copyright information
- design information
- trade-secret considerations
- plant-variety considerations
- ABS / biodiversity information
- regulatory category
- known prior art
- additional notes
- uploaded supporting documents
- response language

The backend should allow missing fields. Missing information must be reported rather than invented.

---

# 9. Case Endpoints

## Create Case

```http
POST /v1/cases
```

Example:

```json
{
  "case_title": "Ayurvedic Herbal Formulation",
  "ip_type": "patent",
  "jurisdiction": "india",
  "response_language": "english",
  "product_name": "Example Formulation",
  "description": "...",
  "ingredients": ["A", "B", "C"]
}
```

Response:

```json
{
  "case_id": "CASE-001",
  "status": "created"
}
```

The case is persisted.

---

## Analyze Case

```http
POST /v1/cases/{case_id}/analyze
```

The endpoint must:

1. Load the stored case.
2. Understand the case.
3. Decompose the case into research questions.
4. Retrieve evidence.
5. Rerank evidence.
6. Apply authority/version/jurisdiction filtering.
7. Generate analysis.
8. Verify citations.
9. Calculate section-level confidence.
10. Identify low-confidence information.
11. Identify missing information.
12. Produce recommended next steps.
13. Save the analysis.

---

## Get Case Report

```http
GET /v1/cases/{case_id}/report
```

The report endpoint generates or returns the Case Report PDF.

---

# 10. Case Analysis Structure

The backend should return a structured case analysis such as:

```json
{
  "case_id": "CASE-001",
  "case_title": "Ayurvedic Herbal Formulation",
  "response_language": "english",
  "summary": {
    "content": "...",
    "confidence": 0.91
  },
  "applicable_laws": {
    "content": "...",
    "confidence": 0.95,
    "sources": []
  },
  "rules_and_regulations": {
    "content": "...",
    "confidence": 0.88,
    "sources": []
  },
  "guidelines": {
    "content": "...",
    "confidence": 0.84,
    "sources": []
  },
  "procedures": {
    "content": "...",
    "confidence": 0.79,
    "sources": []
  },
  "fees": {
    "content": "...",
    "confidence": 0.73,
    "sources": []
  },
  "prior_art": {
    "content": "...",
    "confidence": 0.68,
    "sources": []
  },
  "tkdl": {
    "content": "...",
    "confidence": 0.81,
    "sources": []
  },
  "abs_biodiversity": {
    "content": "...",
    "confidence": 0.87,
    "sources": []
  },
  "ayurveda_regulatory": {
    "content": "...",
    "confidence": 0.9,
    "sources": []
  },
  "missing_information": [],
  "next_steps": [],
  "overall_confidence": 0.84,
  "human_review_recommended": false
}
```

---

# 11. Confidence System

Confidence must exist at both:

- overall case level
- individual section level

Example thresholds:

```text
0.80–1.00 → High confidence
0.60–0.79 → Medium confidence
0.00–0.59 → Low confidence
```

These thresholds are product-level presentation rules and should not be interpreted as legal certainty.

### Low-confidence behavior

The backend must explicitly mark low-confidence sections.

Example:

```json
{
  "confidence": 0.54,
  "confidence_label": "Low",
  "low_confidence": true
}
```

The frontend uses this information to visually highlight those sections.

The backend must not hide uncertainty.

---

# 12. Safe Abstention

The system must abstain when:

- evidence is insufficient,
- retrieved evidence conflicts materially,
- citations do not support claims,
- the question is outside the trusted corpus,
- the legal position cannot be established from available sources,
- confidence is too low for a strong conclusion.

Example:

```json
{
  "abstained": true,
  "abstain_reason": "The available evidence does not sufficiently establish the requested legal position.",
  "confidence": 0.42
}
```

The answer should explain what evidence is missing where practical.

---

# 13. Citation Verification

Every important factual/legal claim should be associated with source evidence.

The verification pipeline should:

1. Identify answer claims.
2. Detect attached citations.
3. Compare claims with cited evidence.
4. Use an entailment/grounding check.
5. Remove or weaken unsupported claims.
6. Recalculate confidence.
7. Recommend human review where necessary.

Claims without adequate support must not be presented as verified facts.

---

# 14. PDF Report Requirements

The Case Builder PDF should contain:

## Cover

- IP-SAKTI Sahayak logo
- case title
- case ID
- date
- selected response language

## Case Summary

- product
- applicant/organization
- IP type
- jurisdiction
- case description

## Legal / IP Analysis

- applicable laws
- rules
- regulations
- guidelines
- procedures
- relevant IP categories

## Fees

- relevant official fee information
- source citations
- version/date where available

## Prior Art

- relevant retrieved prior-art records
- relevance
- citations
- confidence

## TKDL / Traditional Knowledge

- relevant references
- applicable context
- citations
- confidence

## ABS / Biodiversity

- applicable obligations
- relevant biological-resource considerations
- citations
- confidence

## Ayurveda Regulatory Information

- relevant regulatory classification
- guidelines
- procedures
- citations
- confidence

## Confidence

Every major section should display:

- confidence score
- confidence label
- low-confidence warning where applicable

## Missing Information

List information required for stronger analysis.

## Next Steps

Provide evidence-grounded practical next steps.

## Disclaimer

The report must clearly state that it is informational assistance and not a substitute for professional legal advice.

---

# 15. Frontend Integration Contract

The frontend should not reconstruct legal logic.

The frontend receives structured JSON and renders:

- answer
- citations
- confidence
- confidence labels
- low-confidence warnings
- missing information
- next steps
- PDF download

### Quick Query UI

```text
Question
↓
Answer
↓
Sources
↓
Confidence
```

### Case Builder UI

```text
Case Form
↓
Case Analysis
↓
Section cards
↓
Low-confidence highlighting
↓
Missing Information
↓
Next Steps
↓
Generate / View PDF
```

---

# 16. Persistence Rules

### Quick Query

Do not persist as a permanent case.

Session-level metadata may be used for request tracking.

### Case Builder

Persist:

- case metadata
- user-provided case information
- analysis
- citations
- confidence
- low-confidence sections
- timestamps
- report status

Recommended identifiers:

```text
case_id
session_id
analysis_id
report_id
```

---

# 17. API Design

Primary APIs:

```text
POST /v1/query
POST /v1/cases
POST /v1/cases/{case_id}/analyze
GET  /v1/cases/{case_id}
GET  /v1/cases/{case_id}/report
```

Health endpoint:

```text
GET /health
```

The API should return predictable JSON structures suitable for a web and mobile frontend.

---

# 18. Error Handling

Return clear machine-readable errors.

Example:

```json
{
  "error": {
    "code": "INSUFFICIENT_EVIDENCE",
    "message": "The available sources do not sufficiently support this answer.",
    "request_id": "REQ-001"
  }
}
```

Do not expose internal stack traces, API secrets, model credentials, or server paths.

---

# 19. Security

Required:

- HTTPS in production
- CORS restricted to the deployed frontend domain
- API secrets stored in environment variables
- no secrets committed to GitHub
- input validation
- file-upload validation
- size limits
- safe PDF handling
- request logging without sensitive content where possible
- rate limiting
- authentication/authorization for persistent case records
- server-side validation of case IDs and user ownership

---

# 20. Production Deployment

The production architecture is:

```text
Mobile / Browser
      ↓
Vercel Frontend
      ↓ HTTPS
RAG Backend Server
      ↓
FastAPI
      ↓
Chroma + BM25 + RRF + Reranker
      ↓
Ollama
      ↓
LLaMA 3.1
```

The user's personal laptop must **not** be required for production operation.

Therefore:

- frontend can be deployed on Vercel,
- backend must run on a persistent server,
- Chroma data must persist,
- BM25 index must persist,
- embedding/reranker models must be available on the backend,
- Ollama/LLaMA must run on the backend server,
- production storage must survive restarts.

A local FastAPI process such as:

```bash
python -m uvicorn src.API:app --host 0.0.0.0 --port 8000
```

is suitable for development/LAN testing, not for production.

---

# 21. Environment Configuration

Recommended environment variables:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL_NAME=llama3.1
EMBEDDING_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
RERANKER_MODEL_NAME=cross-encoder/ms-marco-MiniLM-L-6-v2
CHROMA_DIR=data/index/chroma
BM25_INDEX_PATH=data/index/bm25.pkl
```

Production values should be environment-specific.

---

# 22. Acceptance Criteria

## Quick Query

- [ ] User can ask a normal question.
- [ ] Backend retrieves evidence using the frozen hybrid RAG pipeline.
- [ ] Response includes citations.
- [ ] Unsupported claims are filtered or weakened.
- [ ] Confidence is returned.
- [ ] Low-confidence answers are clearly marked.
- [ ] Safe abstention works.
- [ ] No persistent case is created.
- [ ] Selected response language is respected.

## Case Builder

- [ ] User can create a persistent case.
- [ ] Case information is stored.
- [ ] Case can be analyzed.
- [ ] Relevant laws/rules/guidelines/procedures/fees can be retrieved.
- [ ] Prior-art/TKDL/ABS/regulatory evidence can be included when supported.
- [ ] Each major section has confidence.
- [ ] Low-confidence areas are returned to the frontend.
- [ ] Missing information is identified.
- [ ] Next steps are returned.
- [ ] Citations are verified.
- [ ] PDF report is generated.
- [ ] Report uses selected response language.
- [ ] Legal disclaimer is included.

## Production

- [ ] Frontend works when user's laptop is offline.
- [ ] Backend remains available independently.
- [ ] Chroma and BM25 data persist.
- [ ] Ollama/LLaMA runs on the backend server.
- [ ] Secrets are protected.
- [ ] CORS is restricted.
- [ ] API errors are structured.
- [ ] Health endpoint works.

---

# 23. Non-Goals

The MVP should not:

- act as a lawyer,
- guarantee legal outcomes,
- invent legal rules,
- replace patent attorneys or other professionals,
- provide unsupported certainty,
- automatically create a case from every normal question,
- replace the frozen RAG pipeline with a simpler chatbot-only architecture.

---

# 24. Final Product Principle

**Quick Query = simple grounded answer.**

**Case Builder = persistent detailed analysis + confidence + evidence + PDF report.**

The backend is the source of truth for:

- retrieval
- evidence
- citations
- confidence
- abstention
- case analysis
- report generation

The frontend is responsible primarily for:

- user input
- language selection
- responsive presentation
- confidence highlighting
- source display
- case navigation
- PDF access

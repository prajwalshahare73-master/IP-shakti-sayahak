# IP-SAKTI Sahayak — Backend PRD
## ML + RAG + FastAPI + Case Builder + Search Context + Supabase + Human Review

**Version:** 3.0  
**Document Type:** Backend Product Requirements Document  
**Status:** ML-integrated backend architecture  
**Primary API:** FastAPI  
**RAG:** Existing frozen IP-SAKTI RAG pipeline  
**ML:** Supporting intelligence/classification layer  
**LLM Runtime:** Ollama + LLaMA 3.1  
**Application Database:** Supabase / PostgreSQL  
**Workflow Integration:** Existing n8n workflow where applicable

---

# 1. Purpose

This PRD defines the backend architecture for connecting the complete IP-SAKTI Sahayak product into one coherent flow.

The backend must connect:

- User Question
- Case Builder
- Previous conversation context
- Search context
- Language
- Jurisdiction
- ML intelligence
- Intent classification
- IP/domain classification
- Query complexity
- RAG routing
- Evidence retrieval
- Citation verification
- Confidence
- Safe abstention
- Human review
- Expert routing
- Supabase persistence
- User Dashboard
- Expert Dashboard

The backend must not treat these as isolated features.

## Core Principle

> **ML understands and routes the request. RAG retrieves trusted evidence. LLaMA explains the retrieved evidence. FastAPI connects the system. Supabase stores application state. Human review handles cases where AI should not be the final layer.**

---

# 2. End-to-End Backend Architecture

```text
USER
  ↓
QUESTION + CASE BUILDER + SEARCH CONTEXT
  ↓
FASTAPI
  ↓
REQUEST CONTEXT BUILDER
  ↓
ML INTELLIGENCE LAYER
  ├── Language Detection
  ├── Intent Classification
  ├── IP Type Classification
  ├── Domain Classification
  ├── Query Complexity
  └── Multi-Domain / Review Signal
  ↓
CASE PROFILE
  ↓
QUERY DECOMPOSITION
  ↓
RAG ROUTING
  ↓
HYBRID RETRIEVAL
  ├── Chroma Vector Search
  └── BM25 Keyword Search
  ↓
RRF
  ↓
RERANKER
  ↓
AUTHORITY + VERSION + JURISDICTION FILTER
  ↓
TOP EVIDENCE
  ↓
CONTEXT BUILDER
  ↓
OLLAMA / LLaMA 3.1
  ↓
CLAIM EXTRACTION
  ↓
CITATION VERIFICATION
  ↓
GROUNDING / HALLUCINATION CHECK
  ↓
CONFIDENCE
  ↓
SAFE ABSTENTION WHEN REQUIRED
  ↓
STRUCTURED FASTAPI RESPONSE
  ↓
SUPABASE PERSISTENCE
  ↓
OPTIONAL HUMAN REVIEW
  ↓
EXPERT ROUTING
  ↓
EXPERT REVIEW
  ↓
USER / EXPERT DASHBOARDS
```

---

# 3. Architecture Boundary

The following responsibilities must remain separate.

| Layer | Responsibility |
|---|---|
| FastAPI | API boundary, validation, orchestration and application control |
| ML | classification, detection and routing signals |
| RAG | evidence retrieval |
| Chroma | vector retrieval |
| BM25 | lexical retrieval |
| RRF | retrieval fusion |
| Reranker | evidence ranking |
| LLaMA 3.1 | evidence-based explanation/generation |
| Citation Verification | claim-to-source checking |
| Grounding Check | hallucination/grounding validation |
| Confidence | answer reliability signal |
| Safe Abstention | prevents unsupported confident answers |
| Supabase | application/case/review persistence |
| n8n | existing workflow orchestration where already used |

## Non-negotiable

ML must not become a replacement for the existing RAG pipeline.

---

# 4. Existing RAG Pipeline — Frozen

The backend must connect to the existing RAG workflow exactly as the current project architecture defines it.

```text
RAW DOCUMENTS
      ↓
DOCUMENT QUALITY CHECK
      ↓
DUPLICATE CHECK
      ↓
TEXT EXTRACTION
      ↓
OCR FALLBACK WHEN REQUIRED
      ↓
TEXT VALIDATION
      ↓
CLASSIFICATION
      ↓
METADATA
      ↓
LEGAL-AWARE STRUCTURED CHUNKING
      ↓
MULTILINGUAL EMBEDDINGS
      ↓
CHROMA + BM25
      ↓
HYBRID RETRIEVAL
      ↓
RRF
      ↓
RERANKER
      ↓
AUTHORITY + VERSION + JURISDICTION FILTER
      ↓
CONTEXT BUILDER
      ↓
OLLAMA / LLaMA 3.1
      ↓
CLAIM-LEVEL CITATION VERIFICATION
      ↓
GROUNDING / HALLUCINATION CHECK
      ↓
CONFIDENCE
      ↓
SAFE ABSTENTION
      ↓
STRUCTURED ANSWER
```

Do not remove or replace:

- Chroma
- BM25
- RRF
- Reranker
- Citation verification
- Grounding checks
- Confidence
- Safe abstention
- Ollama / LLaMA 3.1

Do not make the LLM the source of legal truth.

---

# 5. Unified Request Context

Every user request should be normalized into one backend context.

```text
Current Question
+
Case Builder
+
Conversation Context
+
Search Context
+
Language
+
Jurisdiction
+
Existing Case ID
+
Selected Result / Source Context
```

This unified context is passed to ML and then into the Case Profile used by retrieval.

---

# 6. FastAPI Responsibilities

FastAPI is the main runtime/API boundary.

It must:

1. Validate the incoming request.
2. Resolve authenticated user/session context.
3. Load existing case context when a case ID exists.
4. Merge Case Builder data.
5. Merge relevant search context.
6. Invoke the ML intelligence layer.
7. Build the normalized Case Profile.
8. Invoke the existing RAG pipeline.
9. Return structured evidence-backed output.
10. Persist required application data in Supabase.
11. Decide/record human-review state.
12. Route cases to experts when escalation occurs.
13. Expose user dashboard APIs.
14. Expose protected expert APIs.

FastAPI must not silently implement a second alternative RAG architecture.

---

# 7. Case Builder Integration

Case Builder is a first-class backend input.

## Required Flow

```text
USER
 ↓
CASE BUILDER
 ↓
STRUCTURED CASE DATA
 ↓
FASTAPI
 ↓
ML ANALYSIS
 ↓
CASE PROFILE
 ↓
RAG ROUTING
 ↓
RETRIEVAL
```

Case Builder fields may include:

- Product
- Ingredients
- Formulation type
- Manufacturing process
- Extraction process
- Biological resource
- Existing/traditional knowledge
- Desired IP protection
- Regulatory context
- Jurisdiction
- Language

## Critical Requirement

Case Builder data must influence:

- intent classification;
- domain classification;
- query decomposition;
- RAG collection routing;
- retrieval query construction;
- evidence interpretation;
- human-review routing.

It must not be stored only for frontend display.

---

# 8. Search Context Integration

Search activity must remain connected to the current session/case.

Possible search context:

- previous user queries;
- selected search result;
- selected source/document;
- selected prior-art record;
- current category;
- previous related question;
- selected document/result IDs.

Flow:

```text
Current Query
      +
Search Context
      +
Case Builder
      +
Conversation Context
      ↓
Unified Request Context
      ↓
ML
      ↓
Case Profile
      ↓
RAG
```

The backend should use selected search context when it is relevant, not blindly include unrelated history.

---

# 9. ML Intelligence Layer

ML is a **supporting intelligence layer** before/around retrieval.

It must not replace RAG.

## Primary ML Functions

```text
1. Language Detection
2. Intent Classification
3. IP Type Classification
4. Domain Classification
5. Query Type / Complexity Classification
6. Multi-Domain Detection
7. Human Review / Risk Signal
```

These outputs become routing signals.

---

# 10. Language Detection

The ML layer should distinguish supported input patterns, including:

```text
English
Hindi
Hinglish / Roman Hindi
Gujarati
Telugu
Kannada
Marathi
Bengali
Sanskrit
```

Examples:

```text
"Can I patent my Ayurvedic formulation?"
→ english

"क्या मैं अपनी Ayurvedic formulation का patent करा सकता हूँ?"
→ hindi

"Meri Ayurvedic formulation patentable hai kya?"
→ hinglish

"શું હું આ formulation માટે patent મેળવી શકું?"
→ gujarati
```

Language should be preserved in the Case Profile.

---

# 11. Intent Classification

ML must classify the likely user intent.

Initial supported intents:

```text
PATENTABILITY
PRIOR_ART_SEARCH
TRADEMARK
GI
COPYRIGHT
DESIGN
TRADITIONAL_KNOWLEDGE
TKDL
ABS_BIODIVERSITY
REGULATORY_CLASSIFICATION
COMPLIANCE
GENERAL_INFORMATION
MULTI_DOMAIN
```

The output may contain more than one intent.

Example:

```json
{
  "intent": [
    "PATENTABILITY",
    "TRADITIONAL_KNOWLEDGE",
    "ABS_BIODIVERSITY"
  ]
}
```

---

# 12. IP Type Classification

ML should identify the relevant IP types where possible.

```text
PATENT
TRADEMARK
GI
COPYRIGHT
DESIGN
TRADE_SECRET
PLANT_VARIETY
NOT_CLEAR
MULTIPLE
```

This output helps retrieval routing.

---

# 13. Domain Classification

ML should identify one or multiple domains:

```text
IP
TRADITIONAL_KNOWLEDGE
TKDL
ABS_BIODIVERSITY
AYUSH_REGULATORY
PRIOR_ART
MULTI_DOMAIN
GENERAL
```

Example:

```text
"Patent for a traditional herbal formulation using a biological resource"

→ IP
→ Traditional Knowledge
→ ABS/Biodiversity
→ Prior Art
```

---

# 14. Query Complexity Classification

ML should estimate whether the question can be answered as a simple query or requires richer routing.

Example:

```text
SIMPLE
MODERATE
COMPLEX
MULTI_DOMAIN
```

High complexity can influence:

- query decomposition;
- additional retrieval routes;
- clarification;
- human-review recommendation.

This is a routing signal, not a legal conclusion.

---

# 15. Multi-Domain Detection

ML should identify mixed cases.

Example:

```text
Patent + TKDL + ABS
```

Output:

```json
{
  "multi_domain": true,
  "domains": [
    "IP",
    "TRADITIONAL_KNOWLEDGE",
    "ABS_BIODIVERSITY"
  ]
}
```

This should activate multi-route retrieval and potentially human-review routing.

---

# 16. ML Output Contract

The ML layer should return structured output.

Example:

```json
{
  "language": "hinglish",
  "intent": [
    "PATENTABILITY"
  ],
  "ip_type": [
    "PATENT"
  ],
  "domain": [
    "IP",
    "AYURVEDA"
  ],
  "complexity": "moderate",
  "multi_domain": false,
  "human_review_signal": false
}
```

ML output must be treated as a classification/routing signal, not authoritative legal evidence.

---

# 17. Case Profile

FastAPI combines the original request and ML output into a normalized Case Profile.

```json
{
  "case_id": "CASE-1024",
  "question": "Can I patent my Ayurvedic formulation?",
  "language": "en",
  "jurisdiction": "india",
  "intent": [
    "PATENTABILITY"
  ],
  "ip_type": [
    "PATENT"
  ],
  "domain": [
    "IP",
    "AYURVEDA"
  ],
  "complexity": "moderate",
  "multi_domain": false,
  "case_builder": {},
  "search_context": {},
  "conversation_context": {}
}
```

The Case Profile is the primary context object for downstream retrieval.

---

# 18. Query Decomposition

Complex/multi-intent queries should be decomposed.

Example:

```text
"Can I patent my traditional herbal formulation made from a
biological resource using a new extraction process and do I need ABS compliance?"
```

Possible sub-queries:

```text
1. Patentability
2. Traditional Knowledge / prior art
3. Novel extraction process
4. ABS / biodiversity compliance
```

Each sub-query may use an appropriate retrieval route.

---

# 19. Intent → RAG Routing

The backend should route according to the Case Profile.

```text
PATENTABILITY
 → statutes_rules_india
 → patent_office_guidelines
 → prior_art_patents
 → examiner_case_reports

PRIOR_ART
 → prior_art_patents
 → examiner_case_reports
 → supporting evidence

TRADITIONAL_KNOWLEDGE / TKDL
 → tkdl_reference
 → prior_art_patents
 → relevant statutes/rules

ABS / BIODIVERSITY
 → relevant statutes/rules
 → approved biodiversity evidence

REGULATORY
 → relevant official AYUSH/regulatory sources
```

For multi-domain cases, retrieve from multiple relevant routes.

---

# 20. Retrieval Input Contract

The RAG retrieval layer should receive:

```text
Original Question
+
Decomposed Sub-Query
+
Case Profile
+
Intent
+
Domain
+
IP Type
+
Jurisdiction
+
Language
+
Relevant Search Context
```

The retrieval layer should not rely on the raw question alone when structured context is available.

---

# 21. Hybrid Retrieval

```text
CASE PROFILE + QUERY
        ↓
  ┌─────┴─────┐
  ↓           ↓
Chroma       BM25
Vector       Keyword
Search       Search
  ↓           ↓
  └─────┬─────┘
        ↓
       RRF
        ↓
    Reranker
        ↓
Authority / Version /
Jurisdiction Filter
        ↓
   Top Evidence
```

---

# 22. Evidence Package

The RAG layer must return structured evidence.

```json
{
  "documents": [],
  "citations": [],
  "evidence_passages": [],
  "authority_levels": [],
  "document_versions": [],
  "jurisdiction": "india"
}
```

The backend must preserve this data through the generation and final response stages.

---

# 23. LLaMA 3.1 Generation

Use:

```text
Ollama
 ↓
LLaMA 3.1
```

Prompt context must include:

- user question;
- Case Profile;
- relevant conversation context;
- selected language;
- retrieved evidence;
- citation metadata;
- safety instructions.

The model must explain the retrieved evidence rather than invent unsupported legal content.

---

# 24. Claim Verification and Grounding

After generation:

```text
Generated Answer
      ↓
Claim Extraction
      ↓
Claim-Level Citation Verification
      ↓
Grounding / Hallucination Check
      ↓
Confidence
      ↓
Safe Abstention
```

The final response must retain verification information.

---

# 25. Confidence

Confidence should reflect system evidence signals such as:

- retrieval relevance;
- authority;
- jurisdiction match;
- version validity;
- evidence agreement;
- claim support;
- case completeness.

ML confidence must not automatically become legal correctness.

---

# 26. Safe Abstention

When evidence is insufficient or conflicting:

```text
Low / insufficient evidence
        ↓
Do not produce confident legal conclusion
        ↓
Explain limitation
        ↓
Suggest next step
        ↓
Recommend human review where appropriate
```

---

# 27. Human Review Integration

Human review occurs around the final AI result.

Possible triggers:

- low confidence;
- insufficient evidence;
- safe abstention;
- complex legal interpretation;
- Traditional Knowledge/TKDL complexity;
- ABS/biodiversity implications;
- multi-domain case;
- explicit user request;
- incomplete facts.

Flow:

```text
RAG
 ↓
AI Answer
 ↓
Verification + Confidence
 ↓
Human Review Decision
 ↓
CREATE CASE (when required)
 ↓
EXPERT ROUTING
 ↓
EXPERT REVIEW
 ↓
USER DASHBOARD
```

---

# 28. Expert Routing

Routing uses the structured Case Profile.

```text
TK / TKDL
→ Traditional Knowledge Expert

Patent / TM / GI / Copyright / Design
→ IP Expert

ABS / Biodiversity
→ ABS Expert

Patent + TK + ABS
→ Senior / Multi-domain Expert
```

The routing result must be stored in Supabase.

---

# 29. Supabase Responsibilities

Supabase stores application state and operational data.

Store:

```text
profiles
sessions
conversations
messages

cases
case_builder_data
case_context
case_events

ai_answers
answer_sources
answer_citations

review_requests
case_assignments
expert_profiles
expert_reviews

notifications
audit_logs
attachments
```

---

# 30. RAG Knowledge vs Supabase Data

## RAG Knowledge

```text
Authoritative statutes
Official rules
Official notifications
Official guidelines
Official registry records
Prior-art corpus
TKDL reference corpus
Approved supporting evidence
```

## Supabase

```text
User data
Questions
Conversation history
Case Builder context
AI response snapshot
Citation snapshot
Confidence
Cases
Expert assignments
Expert reviews
Notifications
Audit logs
```

User conversations and ordinary AI answers must not automatically become trusted RAG knowledge.

A future knowledge-ingestion route requires explicit validation/approval.

---

# 31. User Dashboard APIs

```text
GET /v1/me/cases
GET /v1/me/cases/:caseId
GET /v1/me/cases/:caseId/timeline
GET /v1/me/notifications
```

User data must be restricted to the authenticated user.

---

# 32. Expert APIs

```text
POST /v1/expert/login
GET  /v1/expert/dashboard
GET  /v1/expert/cases/:caseId
POST /v1/expert/cases/:caseId/assign
POST /v1/expert/cases/:caseId/review
POST /v1/expert/cases/:caseId/request-info
```

Expert endpoints must be protected by server-side authorization.

---

# 33. Core Query API

```text
POST /v1/query
GET  /v1/query/:queryId
```

Suggested request:

```json
{
  "question": "...",
  "session_id": "session_123",
  "case_id": "CASE-1024",
  "language": "auto",
  "jurisdiction": "india",
  "case_builder": {},
  "search_context": {}
}
```

---

# 34. Structured Query Response

```json
{
  "case_id": "CASE-1024",
  "question": "...",
  "answer": "...",
  "language": "hinglish",

  "query_analysis": {
    "intent": ["PATENTABILITY"],
    "ip_type": ["PATENT"],
    "domain": ["IP"],
    "complexity": "moderate"
  },

  "sources": [],
  "citations": [],
  "confidence": 0.78,
  "confidence_label": "medium",
  "abstained": false,

  "human_review": {
    "recommended": false,
    "reason": null
  }
}
```

The frontend must not infer critical state by parsing natural-language text.

---

# 35. Case State Machine

```text
SUBMITTED
   ↓
ASSIGNED
   ↓
IN_REVIEW
   ↓
NEED_MORE_INFORMATION
   ↓
IN_REVIEW
   ↓
REVIEW_COMPLETED
   ↓
CLOSED
```

Reassignment:

```text
IN_REVIEW
   ↓
REASSIGNED
   ↓
ASSIGNED
```

The backend must validate all status transitions server-side.

---

# 36. Expert Review Data

The expert review should store:

- decision;
- expert summary;
- observations;
- user-facing guidance;
- recommended next step;
- additional source/reference;
- risk notes;
- clarification questions;
- internal-only notes;
- submission timestamp.

Internal notes must never be exposed through user APIs.

---

# 37. Two-Device Demo Flow

```text
DEVICE 1 — USER
User Question
   ↓
Case Builder
   ↓
FastAPI
   ↓
ML
   ↓
RAG
   ↓
AI Answer
   ↓
Human Review
   ↓
Case ID


DEVICE 2 — EXPERT
Expert Login
   ↓
FastAPI
   ↓
Expert Dashboard
   ↓
Same Case ID
   ↓
Review
   ↓
Submit
   ↓
Supabase


DEVICE 1 — USER
   ↓
Case Status Updated
   ↓
Expert Review Visible
```

The same backend and case ID connect both devices.

---

# 38. Authentication and Authorization

## User

Can access only their own cases, conversations and notifications.

## Expert Roles

```text
EXPERT
SENIOR_EXPERT
ADMIN
```

Server-side authorization is mandatory.

Frontend route guards alone are insufficient.

---

# 39. Audit Events

Record important events:

```text
QUERY_SUBMITTED
CASE_CREATED
ML_CLASSIFICATION_COMPLETED
RAG_COMPLETED
ANSWER_STORED
ESCALATION_TRIGGERED
CASE_ASSIGNED
EXPERT_VIEWED_CASE
MORE_INFO_REQUESTED
USER_RESPONDED
REVIEW_SUBMITTED
CASE_REASSIGNED
CASE_COMPLETED
CASE_CLOSED
```

Audit records should be append-oriented and access-controlled.

---

# 40. Notifications

## User

```text
Human review requested
Expert assigned
More information needed
Expert review completed
Case status changed
```

## Expert

```text
New case assigned
User responded
Case reassigned
```

Notifications should respect the user's selected language where supported.

---

# 41. Privacy and Security

Backend requirements:

- minimize stored personal data;
- share only relevant case data with experts;
- separate internal and user-facing notes;
- protect expert-only data;
- avoid sensitive information in public URLs;
- secure attachments;
- enforce API/database authorization;
- keep secrets out of frontend code;
- log important access/actions;
- apply consent/data-control mechanisms where required.

---

# 42. Error Handling

Errors must be structured.

Example:

```json
{
  "error": {
    "code": "RAG_EVIDENCE_INSUFFICIENT",
    "message": "Reliable supporting evidence was not sufficient for a confident answer."
  }
}
```

Important error codes:

```text
INVALID_REQUEST
UNAUTHORIZED
FORBIDDEN
SESSION_NOT_FOUND
CASE_NOT_FOUND
ML_CLASSIFICATION_FAILED
RAG_TIMEOUT
RAG_EVIDENCE_INSUFFICIENT
MODEL_ERROR
DATABASE_ERROR
LANGUAGE_NOT_SUPPORTED
INVALID_CASE_STATUS_TRANSITION
```

---

# 43. Observability

Track operational signals such as:

```text
request_id
case_id
session_id
ML latency
retrieval latency
reranking latency
generation latency
confidence
abstention
human-review decision
expert assignment
API errors
```

Do not log unnecessary sensitive user information.

---

# 44. ML Model Integration Requirements

ML models should be replaceable behind a stable service/interface.

Example:

```text
FastAPI
   ↓
ML Service Interface
   ↓
Language / Intent / Domain / Complexity
```

The rest of the backend should consume a stable structured ML output rather than depend on a specific training implementation.

The current MVP does not require a separate ML training platform.

---

# 45. ML Failure Handling

If ML is unavailable:

```text
ML failure
   ↓
Do not silently invent classification
   ↓
Use safe fallback rules where already supported
   OR
ask for clarification / return a controlled error
```

ML failure must not cause the backend to produce unsupported legal certainty.

---

# 46. Frontend Integration Contract

Frontend receives:

```text
Answer
Query Analysis
Language
Sources
Citations
Confidence
Abstention
Next Step
Human Review State
Case ID
```

The frontend renders these fields directly.

---

# 47. Backend Sequence — Normal Question

```text
1. Receive question
2. Validate request
3. Load user/session/case context
4. Merge Case Builder
5. Merge relevant search context
6. Detect/resolve language
7. Run ML intelligence
8. Build Case Profile
9. Decompose query if required
10. Route retrieval
11. Chroma + BM25
12. RRF
13. Reranker
14. Authority/version/jurisdiction filter
15. Build evidence context
16. Generate with LLaMA 3.1
17. Extract claims
18. Verify citations
19. Grounding check
20. Calculate confidence
21. Safe abstention if required
22. Determine human-review signal
23. Persist application state
24. Return structured FastAPI response
```

---

# 48. Backend Sequence — Case Builder

```text
Case Builder
     ↓
Save structured case data
     ↓
User asks question
     ↓
FastAPI loads Case Builder
     ↓
ML classification
     ↓
Case Profile
     ↓
Intent / Domain routing
     ↓
RAG
     ↓
Evidence-backed answer
     ↓
Store result
```

---

# 49. Backend Sequence — Human Review

```text
AI/RAG Answer
      ↓
Verification + Confidence
      ↓
Review Trigger?
      ↓
NO → Return structured answer

YES
 ↓
Create Case / Review Request
 ↓
Expert Routing
 ↓
Assignment
 ↓
Expert Notification
 ↓
Expert Review
 ↓
Save Review
 ↓
Update Case
 ↓
Notify User
 ↓
User Dashboard
```

---

# 50. Acceptance Criteria

## ML

- Language can be detected.
- Intent classification is returned as structured data.
- IP type can be classified.
- Domain can be classified.
- Multi-domain cases can be detected.
- Complexity can be returned.
- ML outputs become routing signals.
- ML does not replace RAG evidence.

## Case Builder

- Case Builder fields reach FastAPI.
- Case Builder context reaches ML and Case Profile.
- Case Builder context affects retrieval/routing.
- Case Builder data is persisted.

## RAG

- Chroma is used.
- BM25 is used.
- RRF is used.
- Reranking is used.
- Authority/version/jurisdiction logic is preserved.
- Evidence is returned.
- Citations are returned.
- Claim verification is returned.
- Confidence is returned.
- Safe abstention is returned.

## FastAPI

- Structured request validation.
- Structured response.
- Stable case/session IDs.
- Clear error codes.
- Proper authentication/authorization.

## Supabase

- Conversations persist.
- Case Builder data persists.
- AI answer snapshots persist.
- Citation/source snapshots persist.
- Human-review state persists.
- Expert assignment persists.
- Expert review persists.
- Audit events persist.

## Human Review

- Escalation creates a case.
- Domain-based expert routing works.
- Expert access is protected.
- Expert review updates case state.
- User sees status changes.
- Two-device demo uses the same backend/case ID.

---

# 51. Non-Goals

This PRD does **not** include:

- annotation;
- annotation workflow;
- model-training annotation pipeline;
- replacing Chroma;
- replacing BM25;
- replacing RRF;
- replacing the reranker;
- replacing the frozen RAG architecture;
- making ML the legal knowledge source;
- making LLaMA the legal source of truth;
- automatically converting user chats into trusted RAG knowledge;
- a disconnected second orchestration system.

---

# 52. Final Backend Architecture Statement

```text
                         USER
                           │
            ┌──────────────┴──────────────┐
            │                             │
      NORMAL QUESTION                CASE BUILDER
            │                             │
            └──────────────┬──────────────┘
                           ↓
                    SEARCH CONTEXT
                           ↓
                        FASTAPI
                           ↓
                REQUEST CONTEXT BUILDER
                           ↓
                  ML INTELLIGENCE LAYER
          ┌────────┬────────┬────────┬────────┐
          ↓        ↓        ↓        ↓        ↓
      Language   Intent   IP Type  Domain  Complexity
                           ↓
                 MULTI-DOMAIN / REVIEW SIGNAL
                           ↓
                     CASE PROFILE
                           ↓
                 QUERY DECOMPOSITION
                           ↓
                    RAG ROUTING
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
          CHROMA VECTOR                 BM25
              ↓                         ↓
              └────────────┬────────────┘
                           ↓
                          RRF
                           ↓
                       RERANKER
                           ↓
              AUTHORITY / VERSION /
              JURISDICTION FILTER
                           ↓
                     TOP EVIDENCE
                           ↓
                   CONTEXT BUILDER
                           ↓
                  OLLAMA / LLaMA 3.1
                           ↓
                 CLAIM EXTRACTION
                           ↓
                CITATION VERIFICATION
                           ↓
              GROUNDING / HALLUCINATION
                           ↓
                      CONFIDENCE
                           ↓
                   SAFE ABSTENTION
                           ↓
                 STRUCTURED RESPONSE
                           ↓
                       SUPABASE
                    ↙           ↘
               USER DATA      HUMAN REVIEW
                                  ↓
                           EXPERT ROUTING
                                  ↓
                           EXPERT REVIEW
                                  ↓
                              SUPABASE
                                  ↓
                           USER DASHBOARD
```

---

# 53. Final Product Principle

> **ML understands the user's request. Case Builder supplies real-world case context. Intent and domain determine where the system should look. RAG retrieves trusted evidence. Reranking selects the strongest evidence. LLaMA explains the evidence. Citation and grounding checks verify the answer. Confidence and safe abstention control uncertainty. FastAPI connects every component. Supabase stores application and review state. Human experts handle cases where AI should not be the final layer.**

# END OF PRD

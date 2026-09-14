# IP-SAKTI Sahayak — Backend PRD
## RAG + FastAPI + Case Builder + Search Context + Supabase + Human Review

**Version:** 2.0  
**Document Type:** Backend Product Requirements Document  
**Status:** Backend Integration PRD  
**Primary API:** FastAPI  
**RAG:** Existing frozen IP-SAKTI RAG pipeline  
**Application Database:** Supabase / PostgreSQL  
**LLM Runtime:** Ollama + LLaMA 3.1  
**Workflow Integration:** Existing n8n workflow where already used

---

# 1. Purpose

This PRD defines how the IP-SAKTI backend must connect the complete product flow so that the user's:

- normal question,
- Case Builder context,
- search/query context,
- selected language,
- jurisdiction,
- detected intent,
- IP/domain classification,
- RAG retrieval,
- evidence,
- citations,
- confidence,
- safe-abstention result,
- human-review decision,
- case status,
- expert review,

all work as **one connected backend system**.

The backend must not treat the chatbot, Case Builder, search, RAG, and human review as separate disconnected features.

The required principle is:

```text
USER
  ↓
CASE BUILDER + USER QUESTION + SEARCH CONTEXT
  ↓
FASTAPI REQUEST CONTEXT
  ↓
QUERY UNDERSTANDING
  ↓
INTENT + IP TYPE + DOMAIN + JURISDICTION + LANGUAGE
  ↓
CASE PROFILE
  ↓
QUERY DECOMPOSITION
  ↓
RAG ROUTING
  ↓
HYBRID RETRIEVAL
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
SAFE ABSTENTION / ANSWER
  ↓
STRUCTURED FASTAPI RESPONSE
  ↓
SUPABASE PERSISTENCE
  ↓
OPTIONAL HUMAN REVIEW
  ↓
EXPERT WORKFLOW
  ↓
USER / EXPERT DASHBOARD
```

---

# 2. Core Backend Principle

## One request, one connected context

Every question sent to the backend must carry all relevant context available at that point.

The backend should combine:

```text
Question
+
Case Builder
+
Previous conversation context
+
Search context
+
Language
+
Jurisdiction
+
Detected / selected domain
```

into a structured **Request Context / Case Profile** before retrieval.

The RAG must use that context to decide **what to search, where to search, and how to interpret the evidence**.

---

# 3. Backend Responsibilities

FastAPI is the main application/API boundary.

It must coordinate:

1. Request validation.
2. Authentication/session context where applicable.
3. Case Builder data.
4. Conversation history.
5. Search context.
6. Language and jurisdiction.
7. Query understanding.
8. RAG invocation.
9. Structured answer generation.
10. Citation/evidence output.
11. Confidence and abstention output.
12. Case persistence.
13. Human-review escalation.
14. Expert routing.
15. User dashboard data.
16. Expert dashboard data.
17. Notifications.
18. Audit events.

FastAPI must not duplicate the responsibilities of the RAG components.

---

# 4. Existing RAG Must Remain Frozen

The backend must connect to the existing RAG pipeline rather than redesign it.

The required RAG flow is:

```text
RAW / TRUSTED DOCUMENTS
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

Do not:

- replace Chroma;
- remove BM25;
- remove RRF;
- remove reranking;
- remove citation verification;
- remove grounding checks;
- remove confidence;
- remove safe abstention;
- make Supabase the legal knowledge base;
- make the LLM the source of legal truth.

---

# 5. End-to-End Request Context

## 5.1 Request payload

FastAPI should accept a structured request similar to:

```json
{
  "question": "Can I patent my Ayurvedic formulation?",
  "session_id": "session_123",
  "case_id": "case_123",
  "language": "en",
  "jurisdiction": "india",
  "case_builder": {
    "product": "Herbal formulation",
    "ingredients": ["Ashwagandha", "Tulsi"],
    "formulation_type": "new formulation",
    "manufacturing_process": "new extraction process",
    "biological_resource": true,
    "existing_knowledge": "unknown",
    "protection_required": ["patent"]
  },
  "search_context": {
    "previous_queries": [
      "Ayurvedic formulation patent",
      "traditional knowledge prior art"
    ],
    "selected_result_ids": []
  }
}
```

Fields should be optional when not applicable, but the backend must preserve them when provided.

---

# 6. Case Builder Integration

Case Builder is not a separate data island.

Its output must become structured retrieval context.

## Required flow

```text
USER STARTS CASE
      ↓
CASE BUILDER
      ↓
STRUCTURED CASE PROFILE
      ↓
FASTAPI
      ↓
QUERY UNDERSTANDING
      ↓
QUERY + CASE CONTEXT
      ↓
RAG
```

## Case Builder information

The backend should support fields such as:

- product;
- ingredients;
- formulation type;
- manufacturing/extraction process;
- biological resource;
- existing knowledge;
- traditional knowledge indication;
- desired protection;
- regulatory/product context;
- jurisdiction;
- language.

## Important rule

Case Builder answers must **influence retrieval and routing**, not simply be stored for display.

Example:

```text
User question:
"Can I patent this?"

Case Builder:
- Ayurvedic formulation
- uses biological resource
- traditional knowledge possible
- new extraction process
- India

      ↓

Backend understands:
Patent + Traditional Knowledge + ABS/Biodiversity + Regulatory context

      ↓

RAG routes retrieval accordingly.
```

---

# 7. Search Context Integration

The user's search activity must be connectable to the current case/session.

The backend should support:

```text
Current Question
      +
Previous Queries
      +
Selected Search Context
      +
Case Builder
      ↓
Unified Request Context
```

Search context can include:

- previous query text;
- selected source/document;
- selected prior-art result;
- selected search result ID;
- current topic/category;
- recent relevant questions.

The purpose is to prevent the RAG from forgetting what the user was researching before the current question.

---

# 8. Intent-Driven Backend Routing

Intent is a central routing input.

The backend must first understand the user's intent before selecting retrieval routes.

Example intent categories:

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

The backend may detect more than one intent/domain when required.

Example:

```text
"Can I patent my traditional herbal formulation and do I need ABS approval?"

        ↓

INTENT:
- Patentability
- Traditional Knowledge
- ABS/Biodiversity

        ↓

MULTI-DOMAIN RAG ROUTING
```

---

# 9. Query Understanding Contract

The query-understanding layer must return structured information such as:

```json
{
  "language": "hinglish",
  "intent": [
    "PATENTABILITY",
    "TRADITIONAL_KNOWLEDGE"
  ],
  "ip_type": [
    "PATENT"
  ],
  "domain": [
    "IP",
    "TK"
  ],
  "jurisdiction": "india",
  "query_type": "case_specific",
  "requires_case_context": true
}
```

This object becomes an input to downstream retrieval.

---

# 10. Case Profile

FastAPI should create a normalized Case Profile before RAG retrieval.

```json
{
  "case_id": "CASE-1024",
  "question": "...",
  "language": "hinglish",
  "jurisdiction": "india",
  "intent": ["PATENTABILITY"],
  "ip_type": ["PATENT"],
  "domain": ["IP", "AYURVEDA"],
  "case_builder": {},
  "search_context": {},
  "conversation_context": {}
}
```

The Case Profile must be passed consistently to the retrieval and answer-generation layers.

---

# 11. Query Decomposition

Complex questions should be decomposed before retrieval.

Example:

```text
"Can I patent my Ayurvedic herbal formulation made from a traditional herb,
using a new extraction method, and do I need ABS compliance?"

        ↓

Sub-query 1 → Patentability
Sub-query 2 → Traditional Knowledge / prior art
Sub-query 3 → New extraction process
Sub-query 4 → ABS / biodiversity
```

Each sub-query may use the appropriate knowledge collection.

---

# 12. Knowledge Collection Routing

The backend should route searches toward the correct existing RAG collections.

```text
Intent / Domain
       ↓
┌───────────────────────────────────────────┐
│ statutes_rules_india                      │
│ patent_office_guidelines                  │
│ prior_art_patents                         │
│ examiner_case_reports                     │
│ tkdl_reference                            │
│ supporting_research                       │
└───────────────────────────────────────────┘
```

Examples:

```text
Patentability
→ statutes_rules_india
→ patent_office_guidelines
→ prior_art_patents
→ examiner_case_reports

Traditional Knowledge / TKDL
→ tkdl_reference
→ prior_art_patents
→ relevant statutes/rules

ABS / Biodiversity
→ statutes_rules_india
→ relevant biodiversity material
→ supporting approved evidence

Regulatory classification
→ relevant AYUSH/regulatory collection
→ official rules/guidelines
```

The exact collection selection should be driven by the existing retrieval/routing implementation.

---

# 13. Retrieval Context

The retrieval layer should receive:

```text
Query
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
Optional selected search context
```

Retrieval must not operate using the raw question alone when richer context is available.

---

# 14. Hybrid Retrieval

The existing retrieval strategy remains:

```text
                 QUERY
                   ↓
          ┌────────┴────────┐
          ↓                 ↓
   VECTOR / CHROMA       BM25
          ↓                 ↓
          └────────┬────────┘
                   ↓
                  RRF
                   ↓
               RERANKER
                   ↓
        AUTHORITY / VERSION /
        JURISDICTION FILTER
                   ↓
             TOP EVIDENCE
```

The backend is responsible for passing the correct query/context into this pipeline and receiving its structured results.

---

# 15. Evidence Package

Before generation, FastAPI/RAG should have an evidence object such as:

```json
{
  "documents": [],
  "citations": [],
  "evidence_passages": [],
  "authority_levels": [],
  "versions": [],
  "jurisdiction": "india"
}
```

The LLM must explain this evidence rather than invent a new knowledge base.

---

# 16. LLM Generation

Use:

```text
Ollama
   ↓
LLaMA 3.1
```

The LLM receives:

- user question;
- normalized case context;
- intent;
- jurisdiction;
- selected language;
- retrieved evidence;
- citation metadata;
- system safety instructions.

The LLM is the **explanation/generation layer**, not the source of legal truth.

---

# 17. Claim and Citation Verification

After generation:

```text
LLM Answer
    ↓
Claim Extraction
    ↓
Claim-Level Citation Verification
    ↓
Grounding / Hallucination Check
    ↓
Confidence
    ↓
Safe Abstention when required
```

The backend response must preserve:

- claim;
- citation;
- support state;
- confidence;
- uncertainty;
- abstention status.

---

# 18. Response Language

The backend must support automatic language matching.

Required behavior:

```text
English question
→ English answer

Hindi question
→ Hindi answer

Roman Hindi / Hinglish
→ Hinglish answer

Gujarati question
→ Gujarati answer

Telugu question
→ Telugu answer

Kannada question
→ Kannada answer

Marathi question
→ Marathi answer

Bengali question
→ Bengali answer

Sanskrit selected/requested
→ Sanskrit answer where generation support is available
```

Language selection should be included in the API response.

UI language and response language must remain logically separable.

---

# 19. Structured FastAPI Response

The frontend must receive structured JSON, not parse free-form answer text for critical UI states.

Example:

```json
{
  "case_id": "CASE-1024",
  "question": "...",
  "answer": "...",
  "language": "hinglish",
  "query_analysis": {
    "intent": ["PATENTABILITY"],
    "ip_type": ["PATENT"],
    "domain": ["IP"]
  },
  "sources": [],
  "citations": [],
  "confidence": 0.78,
  "confidence_label": "medium",
  "abstained": false,
  "next_step": "...",
  "human_review": {
    "recommended": true,
    "reason": "..."
  }
}
```

---

# 20. Supabase Role

Supabase is the **application data store**.

It should persist:

```text
Users
Profiles
Sessions
Conversations
Messages
Case Builder data
Cases
AI answers
Sources/citation snapshots
Confidence
Review requests
Expert assignments
Expert reviews
Case events
Notifications
Audit logs
Attachments
```

Supabase must not replace the frozen RAG knowledge architecture.

---

# 21. RAG Data vs Application Data

## Trusted RAG Knowledge

```text
Official statutes
Official rules
Official notifications
Official guidelines
Official registry records
Prior-art corpus
TKDL references
Approved supporting evidence
```

## Supabase Application Data

```text
User questions
Conversation history
Case Builder answers
AI responses
Case status
Expert review
Audit events
Notifications
```

A normal user conversation or AI answer must not automatically become trusted RAG knowledge.

---

# 22. Human Review Integration

Human review should happen **after the AI/RAG answer** when required.

Trigger conditions can include:

- low confidence;
- insufficient evidence;
- abstention;
- high-risk interpretation;
- complex TK/TKDL case;
- ABS/biodiversity implications;
- multi-domain case;
- explicit user review request.

Flow:

```text
RAG ANSWER
    ↓
HUMAN REVIEW DECISION
    ↓
NOT REQUIRED → Return answer
        OR
RECOMMENDED / REQUESTED
        ↓
CREATE CASE
        ↓
ROUTE EXPERT
        ↓
EXPERT REVIEW
        ↓
SAVE REVIEW
        ↓
USER DASHBOARD
```

---

# 23. Expert Routing

Routing must be based on the structured case profile.

```text
Traditional Knowledge / TKDL
→ TK / Traditional Knowledge Expert

Patent / Trademark / GI / Copyright / Design
→ IP Expert

ABS / Biodiversity
→ ABS Expert

Patent + TK + ABS
→ Senior / Multi-domain Expert
```

The routing result must be persisted.

---

# 24. Human Review Case Package

When escalating, create a structured case package containing only relevant information:

```text
Case ID
Original question
Relevant context
Language
Jurisdiction
Intent
IP type
Domain
Case Builder data
AI answer
Confidence
Abstention reason
Sources
Citations
Evidence passages
Claim verification
Expert questions
Permitted attachments
```

Do not send:

- unrelated conversations;
- unnecessary personal data;
- hidden system prompts;
- internal implementation details;
- internal expert notes.

---

# 25. Case State Machine

The backend must enforce valid status transitions.

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

Alternative route:

```text
IN_REVIEW
   ↓
REASSIGNED
   ↓
ASSIGNED
```

Status transitions must be server-side controlled.

---

# 26. User ↔ Expert Two-Device Flow

The same case must be accessible from two separate devices through the backend.

```text
DEVICE 1 — USER

User
 ↓
Question
 ↓
FastAPI
 ↓
RAG
 ↓
Human Review
 ↓
Case ID
 ↓
Supabase


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
FastAPI
 ↓
Supabase
 ↓
User Dashboard Updated
```

This is a key demo requirement.

---

# 27. Backend APIs

The backend should expose structured endpoints approximately as follows:

## AI / RAG

```text
POST /v1/query
GET  /v1/query/:queryId
```

## Case Builder

```text
POST /v1/cases
GET  /v1/cases/:caseId
PATCH /v1/cases/:caseId
```

## Human Review

```text
POST /v1/cases/:caseId/escalate
GET  /v1/cases/:caseId/timeline
POST /v1/cases/:caseId/additional-info
```

## Expert

```text
POST /v1/expert/login
GET  /v1/expert/dashboard
GET  /v1/expert/cases/:caseId
POST /v1/expert/cases/:caseId/assign
POST /v1/expert/cases/:caseId/review
POST /v1/expert/cases/:caseId/request-info
```

## User Dashboard

```text
GET /v1/me/cases
GET /v1/me/cases/:caseId
GET /v1/me/cases/:caseId/timeline
GET /v1/me/notifications
```

Exact endpoint names may follow the existing FastAPI implementation.

---

# 28. Authentication and Authorization

## User

Authenticated users may access their own:

- conversations;
- cases;
- review status;
- notifications.

## Expert

Protected roles:

```text
EXPERT
SENIOR_EXPERT
ADMIN
```

Expert APIs must enforce authorization on the server.

Frontend route guards are not sufficient.

An expert may access only cases permitted by their role/assignment.

---

# 29. Supabase Suggested Schema

```text
profiles
sessions
conversations
messages

cases
case_builder_data
case_context
case_events

review_requests
case_assignments
expert_profiles
expert_reviews

ai_answers
answer_sources
answer_citations

notifications
audit_logs
attachments
```

Recommended relationships:

```text
User
 └── Sessions
      └── Conversations
           └── Messages

User
 └── Cases
      ├── Case Builder
      ├── AI Answers
      ├── Sources/Citations
      ├── Case Events
      ├── Assignments
      └── Expert Reviews
```

---

# 30. Audit Logging

Record important backend events:

```text
CASE_CREATED
QUERY_SUBMITTED
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

# 31. Notifications

## User

```text
Review requested
Expert assigned
More information needed
Review completed
Case status changed
```

## Expert

```text
New case assigned
User responded
Case reassigned
```

Notification language should follow supported localization.

---

# 32. Privacy and Data Minimization

Backend requirements:

- Store only required case/application data.
- Share only relevant information with experts.
- Keep internal notes separate.
- Do not expose expert-only data to users.
- Do not place sensitive data in public URLs.
- Protect attachments.
- Enforce authorization at API/database level.
- Record important access and case events.
- Apply consent/data-control requirements where applicable.

---

# 33. Error Handling

The backend must return structured errors.

Examples:

```json
{
  "error": {
    "code": "RAG_EVIDENCE_INSUFFICIENT",
    "message": "Reliable supporting evidence was not sufficient for a confident answer."
  }
}
```

Other important error states:

```text
INVALID_REQUEST
SESSION_NOT_FOUND
CASE_NOT_FOUND
UNAUTHORIZED
FORBIDDEN
RAG_TIMEOUT
RAG_EVIDENCE_INSUFFICIENT
MODEL_ERROR
DATABASE_ERROR
LANGUAGE_NOT_SUPPORTED
INVALID_CASE_STATUS_TRANSITION
```

The frontend must never need to infer critical status from an error message string.

---

# 34. Observability

The backend should log:

- request ID;
- case ID;
- session ID;
- query latency;
- retrieval latency;
- generation latency;
- confidence;
- abstention;
- escalation decision;
- expert assignment;
- API errors.

Do not log unnecessary sensitive user information.

---

# 35. Performance Requirements

The backend should prioritize:

```text
FastAPI
   ↓
Fast request validation
   ↓
Efficient RAG invocation
   ↓
Structured response
   ↓
Asynchronous/non-blocking persistence where appropriate
```

Long-running expert and notification operations should not unnecessarily block the core answer response.

Project-specific prototype targets must be treated as targets, not official service-level guarantees.

---

# 36. Security Requirements

Minimum backend security:

- server-side authorization;
- protected expert endpoints;
- input validation;
- secure session handling;
- database row-level access controls where appropriate;
- protected attachments;
- secrets in environment variables;
- no API keys in frontend code;
- audit logging for sensitive actions;
- no hidden prompt leakage;
- no direct public access to expert data.

---

# 37. n8n Integration

Where the existing product already uses n8n, FastAPI should integrate with that workflow without creating a disconnected second orchestration path.

Possible responsibilities may include:

```text
Frontend
   ↓
FastAPI / existing webhook
   ↓
n8n workflow where applicable
   ↓
RAG / processing
   ↓
Structured result
   ↓
FastAPI
   ↓
Frontend
```

Human-review workflow should reuse the existing human facilitator/escalation concepts already present in the project.

---

# 38. Backend Sequence — Normal Question

```text
1. User submits question
2. FastAPI validates request
3. Load session/case context
4. Merge Case Builder + search context
5. Detect language / accept selected language
6. Query Understanding
7. Detect intent/IP type/domain/jurisdiction
8. Build Case Profile
9. Decompose query when required
10. Route retrieval
11. Chroma + BM25
12. RRF
13. Reranker
14. Authority/version/jurisdiction filtering
15. Build evidence context
16. Generate with LLaMA 3.1
17. Verify claims/citations
18. Grounding check
19. Calculate confidence
20. Abstain when required
21. Build structured response
22. Persist application data in Supabase
23. Return FastAPI response
```

---

# 39. Backend Sequence — Case Builder

```text
User
 ↓
Case Builder
 ↓
Save structured case fields
 ↓
User asks question
 ↓
FastAPI loads Case Builder
 ↓
Combine with question
 ↓
Intent + Domain + Jurisdiction
 ↓
Case Profile
 ↓
RAG
 ↓
Evidence-backed answer
```

The Case Builder must therefore improve contextual retrieval.

---

# 40. Backend Sequence — Human Review

```text
AI/RAG Answer
      ↓
Confidence / Evidence Evaluation
      ↓
Review Recommended?
      ↓
No → Return Answer

Yes
 ↓
Create Case
 ↓
Create Review Request
 ↓
Determine Expert Domain
 ↓
Assign Expert
 ↓
Notify Expert
 ↓
Expert Opens Case
 ↓
Expert Reviews Evidence + AI Guidance
 ↓
Expert submits review
 ↓
Store Review
 ↓
Update Case Status
 ↓
Notify User
 ↓
User Dashboard shows final review
```

---

# 41. Backend Acceptance Criteria

The backend is considered correctly integrated when:

### RAG

- Case Builder context reaches retrieval.
- User question reaches retrieval.
- Search context can be included.
- Intent affects routing.
- Domain/IP type affect routing.
- Jurisdiction is preserved.
- Existing Chroma + BM25 + RRF + reranker pipeline is used.
- Evidence and citations survive to the API response.
- Confidence survives to the API response.
- Safe abstention survives to the API response.

### API

- FastAPI validates requests.
- FastAPI returns structured JSON.
- Frontend does not parse free-form text for status.
- Case IDs remain consistent.

### Supabase

- Cases persist.
- Conversations persist.
- AI answer snapshots persist.
- Citations/source snapshots persist.
- Review state persists.
- Expert review persists.
- Audit events persist.

### Human Review

- Escalation creates a case.
- Correct expert routing occurs.
- Expert cannot access unauthorized cases.
- Expert review updates case status.
- User sees the updated status.
- Same case works on a second device.

### Language

- Selected/requested response language is preserved.
- UI language and response language remain logically separable.

---

# 42. Non-Goals

This backend PRD does **not** include:

- annotation;
- annotation workflow;
- model-training annotation pipeline;
- replacing the RAG architecture;
- replacing Chroma;
- replacing BM25;
- replacing RRF;
- replacing the reranker;
- automatic conversion of user chats into trusted legal knowledge;
- a new disconnected orchestration architecture.

---

# 43. Final Backend Architecture

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
                  QUERY UNDERSTANDING
                           ↓
              INTENT / IP / DOMAIN /
              JURISDICTION / LANGUAGE
                           ↓
                     CASE PROFILE
                           ↓
                 QUERY DECOMPOSITION
                           ↓
                  RAG ROUTING LAYER
                           ↓
             ┌─────────────┴─────────────┐
             ↓                           ↓
        CHROMA VECTOR                  BM25
             ↓                           ↓
             └─────────────┬─────────────┘
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
                 STRUCTURED ANSWER
                           ↓
                       FASTAPI
                           ↓
                      SUPABASE
                   ↙            ↘
              USER CASE       HUMAN REVIEW
              DASHBOARD            ↓
                              EXPERT ROUTING
                                   ↓
                              EXPERT REVIEW
                                   ↓
                                SUPABASE
                                   ↓
                              USER DASHBOARD
```

---

# 44. Final Product Principle

> **Case Builder gives the backend context. Intent decides where to look. RAG retrieves the evidence. Reranking selects the strongest evidence. LLaMA explains it. Citation and grounding checks verify it. Confidence controls the strength of the answer. FastAPI connects the entire system. Supabase stores the application and case state. Human review provides escalation when AI should not be the final layer.**

---

# END OF PRD

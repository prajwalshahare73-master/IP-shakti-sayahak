# IP-SAKTI Sahayak — RAG Deployment PRD
## Portable, Self-Hosted RAG with Local LLM for Multi-Device Access

**Version:** 1.0  
**Document Type:** RAG Deployment / Infrastructure PRD  
**Primary Goal:** Deploy the existing IP-SAKTI RAG as a reusable backend service that can be accessed from any laptop/browser while using a free, self-hosted local LLM.  
**LLM Runtime:** Ollama  
**LLM Model:** LLaMA 3.1  
**Backend:** FastAPI  
**RAG:** Existing frozen IP-SAKTI RAG pipeline  
**Application Database:** Supabase  
**Containerization:** Docker / Docker Compose  
**Frontend:** Existing IP-SAKTI frontend  
**Cloud LLM APIs:** NOT ALLOWED  
**Annotation:** NOT INCLUDED

---

# 1. Objective

The deployment must make the IP-SAKTI RAG system portable and accessible from multiple devices without requiring the user of those devices to install the RAG stack or LLM locally.

The target experience is:

```text
ANY LAPTOP / MOBILE
        ↓
Browser
        ↓
IP-SAKTI Frontend
        ↓
HTTPS
        ↓
FastAPI Server
        ↓
Existing RAG
        ↓
Ollama + LLaMA 3.1
        ↓
Structured Answer
```

A second laptop must not need:

- Python
- Chroma
- BM25
- Reranker
- Ollama
- LLaMA 3.1
- RAG source files
- local index-building tools

The second device should only need a supported browser and network access to the deployed application.

---

# 2. Critical Architecture Principle

> **Centralize the RAG runtime and local LLM on the host/server machine. Keep the client device lightweight.**

The user device is a client, not an RAG runtime.

```text
CLIENT DEVICES
 ├── Laptop A
 ├── Laptop B
 └── Mobile
        │
        ▼
   Browser / HTTPS
        │
        ▼
┌─────────────────────────────────────┐
│        IP-SAKTI SERVER              │
│                                     │
│  Frontend/API access                │
│          ↓                          │
│       FastAPI                       │
│          ↓                          │
│   Existing RAG Pipeline             │
│    ├─ Chroma                        │
│    ├─ BM25                          │
│    ├─ RRF                           │
│    ├─ Reranker                      │
│    ├─ Evidence                      │
│    ├─ Citation Verification         │
│    ├─ Grounding Check               │
│    ├─ Confidence                    │
│    └─ Safe Abstention               │
│          ↓                          │
│     Ollama                          │
│          ↓                          │
│      LLaMA 3.1                      │
└─────────────────────────────────────┘
        │
        ▼
     Supabase
```

---

# 3. Existing RAG Architecture Must Not Change

Deployment work must package and expose the current RAG. It must not redesign the RAG.

The frozen flow remains:

```text
RAW DOCUMENTS
      ↓
DOCUMENT QUALITY CHECK
      ↓
DUPLICATE CHECK
      ↓
TEXT EXTRACTION
      ↓
OCR FALLBACK
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

Deployment must not:

- replace Chroma;
- remove BM25;
- remove RRF;
- remove reranking;
- remove citation verification;
- remove grounding checks;
- remove confidence;
- remove safe abstention;
- replace Ollama with a cloud LLM;
- replace the LLM with another provider;
- make Supabase the legal knowledge base;
- introduce an unrelated second RAG pipeline.

---

# 4. Deployment Modes

## 4.1 Development Mode

Development may run on one local machine:

```text
Developer Laptop
 ├── FastAPI
 ├── RAG
 ├── Chroma
 ├── BM25
 ├── Reranker
 ├── Ollama
 └── LLaMA 3.1
```

This mode is for development and debugging.

## 4.2 Shared / Deployed Mode

The shared system runs centrally:

```text
Server / Host Machine
 ├── FastAPI
 ├── RAG runtime
 ├── Chroma
 ├── BM25
 ├── Reranker
 ├── Ollama
 └── LLaMA 3.1
```

Clients:

```text
Laptop / Mobile
 → Browser
 → HTTPS
 → Central server
```

This is the required deployment mode for multi-device use.

---

# 5. Local LLM Requirement

The project must use:

```text
Ollama
  ↓
LLaMA 3.1
```

No cloud LLM API may be used.

Prohibited production dependencies:

```text
OpenAI API
Gemini API
Anthropic API
Other paid/cloud LLM APIs
```

The system must not call a cloud LLM as a fallback.

---

# 6. LLM Service Boundary

FastAPI must communicate with Ollama through an internal service boundary.

```text
FastAPI
   ↓
Ollama HTTP API
   ↓
LLaMA 3.1
```

Use environment-based configuration:

```env
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.1
```

The hostname must be configurable so local and deployed environments can use the same application code.

---

# 7. Containerization Requirement

The deployment must be reproducible.

The agent must create or update:

```text
Dockerfile
docker-compose.yml
.dockerignore
.env.example
```

The project should be able to start from a clean environment with documented commands.

Target service layout:

```text
services:
  api
  ollama
```

Where the existing RAG dependencies are required by `api`, they must be packaged into the API runtime.

Do not create an unnecessary microservice architecture merely for complexity.

---

# 8. Persistent Storage Requirement

RAG indexes and model data must survive container restarts.

Required persistent storage:

```text
/data/chroma/
/data/bm25/
/models or Ollama persistent storage/
```

Docker named volumes or host-mounted persistent directories may be used.

The system must not rebuild the full RAG index or redownload the model on every container restart.

---

# 9. Chroma Deployment

Chroma is part of the deployed RAG runtime.

Requirements:

- use a persistent storage path;
- load the existing index when present;
- do not rebuild the index for every API request;
- protect the storage from accidental deletion;
- make the path configurable;
- preserve collection names and metadata expected by the current RAG.

Default configuration example:

```env
CHROMA_PATH=/data/chroma
```

---

# 10. BM25 Deployment

BM25 must remain part of hybrid retrieval.

Requirements:

- persist the BM25 index;
- load it during application startup;
- do not rebuild it for every user query;
- make the storage path configurable.

Example:

```env
BM25_INDEX_PATH=/data/bm25
```

---

# 11. Reranker Deployment

The existing reranker must be available in the deployment environment.

Requirements:

- package required dependencies;
- cache/persist model weights;
- load the model during service startup where practical;
- do not redownload the model for every request;
- keep the reranker implementation unchanged unless a separate change request exists.

---

# 12. RAG Initialization

RAG initialization must happen at application startup or controlled initialization time.

Required behavior:

```text
Container Start
     ↓
Environment Validation
     ↓
Load Chroma
     ↓
Load BM25
     ↓
Load Reranker
     ↓
Check Ollama
     ↓
Check LLaMA 3.1
     ↓
RAG READY
```

The system must fail clearly when a required dependency is missing.

It must not silently fall back to an unrelated retrieval or generation implementation.

---

# 13. Knowledge Build vs Runtime Query

Separate ingestion/build-time processing from runtime querying.

## Build / Ingestion

```text
Trusted Documents
      ↓
Quality
      ↓
Extraction / OCR
      ↓
Classification
      ↓
Metadata
      ↓
Chunking
      ↓
Embeddings
      ↓
Chroma
      ↓
BM25
```

This should happen during corpus preparation or controlled re-indexing.

## Runtime

```text
User Request
      ↓
FastAPI
      ↓
ML / Case Profile
      ↓
RAG Retrieval
      ↓
LLaMA 3.1
      ↓
Verification
      ↓
Response
```

A user query must not trigger a complete corpus rebuild.

---

# 14. Portable Configuration

No hardcoded machine-specific paths are allowed.

Bad:

```python
CHROMA_PATH = r"C:\Users\HP\Desktop\IP-SAKTI\chroma_db"
```

Required pattern:

```python
CHROMA_PATH = os.getenv("CHROMA_PATH", "./data/chroma")
```

Configuration should cover at least:

```env
APP_ENV=
API_HOST=
API_PORT=

CHROMA_PATH=
BM25_INDEX_PATH=
RERANKER_MODEL=
OLLAMA_BASE_URL=
OLLAMA_MODEL=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Secrets must not be committed to source control.

---

# 15. Network Architecture

The server should expose only the application/API entry point required by clients.

Recommended:

```text
Internet / Local Network
        ↓
HTTPS / Reverse Proxy
        ↓
FastAPI
        ↓
Internal Services
   ├── Chroma
   ├── BM25
   ├── Reranker
   └── Ollama
```

Ollama should not be exposed directly to public clients.

Chroma/BM25 internal storage should not be exposed directly to public clients.

---

# 16. Reverse Proxy / HTTPS

For a publicly reachable deployment, the deployment should use a reverse proxy or equivalent secure ingress.

Target:

```text
https://<domain>/api
```

or an equivalent documented API route.

Requirements:

- HTTPS;
- secure headers where appropriate;
- request forwarding to FastAPI;
- no direct public access to internal ports.

For a hackathon LAN-only demo, a controlled local-network URL may be used, but public internet deployment should use HTTPS.

---

# 17. CORS

FastAPI must allow only configured frontend origins.

Example:

```env
FRONTEND_ORIGIN=https://your-frontend-domain.example
```

Do not use unrestricted wildcard CORS in production.

Development may use a localhost origin.

---

# 18. FastAPI Deployment Boundary

FastAPI remains the public application/API boundary.

It must:

- validate incoming requests;
- assemble Case Builder and search context;
- call the ML layer;
- build the Case Profile;
- call the existing RAG;
- call Ollama through the configured service;
- return structured responses;
- persist application state in Supabase;
- handle human-review workflows.

The API contract must remain compatible with the existing frontend.

---

# 19. Case Builder in Deployment

The deployed system must preserve:

```text
Case Builder
   ↓
FastAPI
   ↓
ML
   ↓
Case Profile
   ↓
RAG
```

Case Builder data must influence retrieval.

Example:

```text
Product:
Herbal formulation

Ingredients:
Ashwagandha, Tulsi

Formulation:
New

Manufacturing:
New extraction process

Biological resource:
Yes

Existing knowledge:
Possible

Protection:
Patent
```

This structured context must travel with the query to the runtime RAG.

---

# 20. Search Context in Deployment

The deployed API must support relevant search context.

```text
Current Query
+
Previous Relevant Query
+
Selected Search Result
+
Case Builder
+
Conversation Context
```

Only relevant context should be passed.

Very large or unrelated conversation history must not be sent blindly to the model.

---

# 21. ML + RAG Deployment Flow

ML is a supporting intelligence layer.

```text
Question
   ↓
ML
 ├─ Language
 ├─ Intent
 ├─ IP Type
 ├─ Domain
 ├─ Complexity
 └─ Multi-domain signal
   ↓
Case Profile
   ↓
RAG Routing
```

ML does not replace retrieval and does not provide legal evidence.

---

# 22. Runtime RAG Flow

The deployed request must follow:

```text
Client
  ↓
FastAPI
  ↓
Case Builder + Search Context
  ↓
ML
  ↓
Intent / IP / Domain / Jurisdiction / Language
  ↓
Case Profile
  ↓
Query Decomposition
  ↓
Hybrid Retrieval
  ├─ Chroma
  └─ BM25
  ↓
RRF
  ↓
Reranker
  ↓
Authority + Version + Jurisdiction Filter
  ↓
Top Evidence
  ↓
Context Builder
  ↓
Ollama / LLaMA 3.1
  ↓
Claim-Level Citation Verification
  ↓
Grounding Check
  ↓
Confidence
  ↓
Safe Abstention when required
  ↓
Structured Response
```

---

# 23. Multi-User Runtime

The system should support multiple requests without sharing one user's private case context with another.

Each request must preserve:

```text
user/session ID
case ID
request ID
language
jurisdiction
query context
```

Case-specific context must remain isolated.

Conversation history from one user must never be accidentally included in another user's request.

---

# 24. Concurrency and Local LLM Queue

Local LLM inference is CPU/GPU/RAM intensive.

The deployment must protect Ollama from uncontrolled concurrent generation.

Requirements:

- limit concurrent generation where needed;
- queue requests when the host is saturated;
- return controlled timeout/busy responses;
- avoid spawning multiple duplicate model servers;
- do not crash the API when one generation request fails.

The exact concurrency limit should be configurable based on the host hardware.

---

# 25. Resource Requirements

The deployment documentation must explicitly state that local inference requires server-side compute.

The client laptop does not need the model.

The host/server must have enough:

- RAM;
- CPU;
- storage;
- GPU/VRAM where used.

The system must record and document the minimum tested hardware configuration rather than claim universal hardware compatibility.

---

# 26. Startup Health Checks

Implement:

```text
GET /health
GET /health/rag
GET /health/llm
GET /health/database
```

Example:

```json
{
  "status": "ok",
  "service": "IP-SAKTI Sahayak API",
  "rag": "ok",
  "llm": "ok",
  "database": "ok"
}
```

Detailed health output may include:

```text
chroma: ok
bm25: ok
reranker: ok
ollama: ok
llama3.1: available
supabase: ok
```

Do not expose secrets.

---

# 27. Readiness Conditions

The service is considered ready only when:

```text
FastAPI → OK
Chroma → OK
BM25 → OK
Reranker → OK
Ollama → OK
LLaMA 3.1 → AVAILABLE
Supabase → OK
```

If a critical runtime dependency is unavailable, readiness should indicate failure.

---

# 28. Deployment Tests

Before calling deployment complete, test from a second device.

## Test A — API

```text
Browser / client
  ↓
Deployed URL
  ↓
GET /health
```

Must return success.

## Test B — RAG

Ask:

```text
Can I patent my Ayurvedic formulation with a new extraction process?
```

Verify:

- response is generated;
- retrieved sources are present;
- citations are present;
- confidence is present;
- safe-abstention state is valid when required.

## Test C — Case Builder

Populate Case Builder and verify that the response changes appropriately when case context changes.

## Test D — Second Device

Open the same deployed frontend on another laptop/mobile.

Verify:

- page loads;
- query submission works;
- RAG responds;
- no local Python setup is required;
- no local Ollama is required;
- no local Chroma setup is required.

---

# 29. Deployment Test Matrix

| Test | Device | Expected |
|---|---|---|
| Health check | Server | PASS |
| RAG query | Server | PASS |
| RAG query | Laptop A | PASS |
| RAG query | Laptop B | PASS |
| RAG query | Mobile | PASS where UI supports it |
| Case Builder query | Laptop B | PASS |
| Citation display | Laptop B | PASS |
| Confidence | Laptop B | PASS |
| Human review request | Laptop B | PASS |
| Expert dashboard | Second device | PASS |
| No local Ollama required | Laptop B | PASS |
| No local Chroma required | Laptop B | PASS |

---

# 30. Persistence and Backup

Persistent data should be separated into:

```text
Application data
→ Supabase

RAG indexes
→ persistent Chroma/BM25 storage

Model data
→ persistent Ollama/model storage
```

The deployment process must document how to preserve these volumes during updates.

---

# 31. Update Strategy

RAG corpus updates must not require rebuilding the entire application unnecessarily.

Preferred separation:

```text
Application image
       +
Persistent RAG data
       +
Persistent model data
       +
Supabase
```

When the application is updated:

- preserve Chroma;
- preserve BM25;
- preserve model cache;
- preserve Supabase data.

When the trusted corpus changes, run a controlled ingestion/re-indexing process.

---

# 32. Logging

The deployment should log:

```text
request_id
case_id
session_id
request timestamp
retrieval latency
generation latency
confidence
abstention
errors
health status
```

Logs must avoid unnecessary sensitive user content.

---

# 33. Error Handling

Expected deployment/runtime errors:

```text
RAG_NOT_READY
CHROMA_UNAVAILABLE
BM25_UNAVAILABLE
RERANKER_UNAVAILABLE
OLLAMA_UNAVAILABLE
MODEL_NOT_FOUND
MODEL_BUSY
MODEL_TIMEOUT
DATABASE_UNAVAILABLE
INVALID_REQUEST
UNAUTHORIZED
FORBIDDEN
```

Errors must be returned in structured API format.

---

# 34. Failure Behavior

The system must fail safely.

Examples:

### Ollama unavailable

```text
FastAPI receives request
 ↓
RAG may retrieve evidence
 ↓
LLM unavailable
 ↓
No fake generated answer
 ↓
Controlled error / safe response
```

### Evidence insufficient

```text
RAG
 ↓
Insufficient evidence
 ↓
Safe Abstention
 ↓
Human Review recommendation where appropriate
```

Never replace missing evidence with invented model knowledge.

---

# 35. Security Requirements

Minimum:

- HTTPS for public deployment;
- environment-based secrets;
- no API keys in frontend;
- protected Supabase access;
- server-side authorization;
- internal services not publicly exposed;
- restricted CORS;
- secure authentication for expert portal;
- protected user/case data;
- no sensitive information in public URLs;
- audit logging for important actions.

---

# 36. Supabase Boundary

Supabase remains the application/case database.

Store:

```text
users / profiles
sessions
conversations
messages
cases
case_builder_data
AI answer snapshots
source/citation snapshots
confidence
human review requests
expert assignments
expert reviews
notifications
audit logs
attachments
```

Do not use Supabase as a replacement for the deployed Chroma + BM25 RAG runtime.

Do not automatically treat user conversations as trusted legal knowledge.

---

# 37. Human Review Deployment Flow

```text
User
 ↓
FastAPI
 ↓
ML + RAG
 ↓
AI Answer
 ↓
Confidence / Verification
 ↓
Human Review Trigger
 ↓
Create Case
 ↓
Expert Routing
 ↓
Supabase
 ↓
Expert Device
 ↓
Review
 ↓
Supabase
 ↓
User Device
```

The same backend case ID must connect both devices.

---

# 38. Frontend Deployment Contract

The frontend should only need to know the deployed API URL.

Example:

```env
VITE_API_BASE_URL=https://api.example.com
```

The frontend must not:

- connect directly to Ollama;
- connect directly to Chroma;
- contain RAG indexes;
- contain the LLaMA model;
- contain backend secrets.

---

# 39. No Client-Side RAG

The deployed product must not send the complete corpus to the browser.

The browser receives only the structured data required to render:

- answer;
- citations;
- evidence metadata;
- confidence;
- case status;
- human review status.

---

# 40. Deployment Directory Structure

Recommended:

```text
IP-SAKTI/
│
├── frontend/
│
├── backend/
│   ├── src/
│   │   ├── API.py
│   │   ├── chain.py
│   │   ├── query_understanding.py
│   │   ├── hybrid_retriever.py
│   │   ├── rerank.py
│   │   ├── citation_verification.py
│   │   └── ...
│
├── data/
│   ├── chroma/
│   └── bm25/
│
├── docker/
│
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── .dockerignore
```

The exact source layout should adapt to the current repository rather than duplicate files.

---

# 41. Docker Compose Target

The deployment should provide a reproducible composition similar to:

```yaml
services:
  api:
    build: .
    environment:
      CHROMA_PATH: /data/chroma
      BM25_INDEX_PATH: /data/bm25
      OLLAMA_BASE_URL: http://ollama:11434
      OLLAMA_MODEL: llama3.1
    volumes:
      - chroma_data:/data/chroma
      - bm25_data:/data/bm25
    depends_on:
      - ollama

  ollama:
    image: ollama/ollama
    volumes:
      - ollama_data:/root/.ollama

volumes:
  chroma_data:
  bm25_data:
  ollama_data:
```

The coding agent must adapt image versions, ports, dependencies and model initialization to the actual project and validate the compose file rather than blindly copying this example.

---

# 42. Model Initialization

The deployment must ensure the required model is present.

Target state:

```text
Ollama starts
   ↓
Check model
   ↓
LLaMA 3.1 available
   ↓
API becomes ready
```

The system must document the model provisioning step.

It must not redownload the model on every API startup if the persistent model volume already contains it.

---

# 43. Deployment Script / Commands

The project should document:

```text
Build
Start
Stop
Restart
View logs
Check health
Check model
Re-index RAG
Backup persistent data
```

Example targets:

```text
docker compose build
docker compose up -d
docker compose ps
docker compose logs
```

Exact commands must be verified against the generated deployment files.

---

# 44. Acceptance Criteria — Deployment

Deployment is complete only when all of the following are true:

### Portability

- RAG runs from the deployed environment.
- The same application works from a second laptop.
- Client devices do not install the RAG stack.

### Local LLM

- Ollama runs on the host/server.
- LLaMA 3.1 is available.
- No cloud LLM API is required.

### RAG

- Chroma works.
- BM25 works.
- RRF works.
- Reranker works.
- Citation verification works.
- Grounding works.
- Confidence works.
- Safe abstention works.

### Context

- Case Builder reaches RAG.
- Relevant search context reaches RAG.
- Intent affects routing.
- Jurisdiction is preserved.
- Language is preserved.

### Persistence

- Chroma survives restart.
- BM25 survives restart.
- Ollama model storage survives restart.
- Supabase data remains intact.

### Multi-device

- Laptop A works.
- Laptop B works.
- Mobile/browser access works where supported.
- Same case can be tracked across devices.

### Security

- Internal RAG and Ollama endpoints are not public.
- Secrets are not shipped to the frontend.
- CORS is restricted.
- Expert endpoints are protected.

---

# 45. Non-Goals

This deployment PRD does not include:

- cloud LLM APIs;
- paid LLM providers;
- annotation;
- annotation pipelines;
- model-training annotation workflows;
- replacement of the frozen RAG architecture;
- replacement of Chroma;
- replacement of BM25;
- replacement of RRF;
- replacement of the reranker;
- automatic conversion of user chats into trusted RAG knowledge;
- unnecessary microservices.

---

# 46. Final Deployment Architecture

```text
                         ANY DEVICE
                     Laptop / Mobile
                           │
                         Browser
                           │
                         HTTPS
                           │
                           ▼
                ┌────────────────────┐
                │ IP-SAKTI FRONTEND  │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │      FASTAPI       │
                └─────────┬──────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
        Case Builder             Search Context
              │                       │
              └───────────┬───────────┘
                          ▼
                    ML INTELLIGENCE
              ┌───────────┼───────────┐
              ▼           ▼           ▼
          Language      Intent     Domain/IP
                          │
                          ▼
                     CASE PROFILE
                          │
                          ▼
                    QUERY DECOMPOSE
                          │
                          ▼
                     RAG ROUTING
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
             CHROMA               BM25
                └─────────┬─────────┘
                          ▼
                         RRF
                          ▼
                      RERANKER
                          ▼
              AUTHORITY / VERSION /
              JURISDICTION FILTER
                          ▼
                     TOP EVIDENCE
                          ▼
                   CONTEXT BUILDER
                          ▼
                OLLAMA + LLaMA 3.1
                          ▼
               CLAIM/CITATION CHECK
                          ▼
                  GROUNDING CHECK
                          ▼
                     CONFIDENCE
                          ▼
                  SAFE ABSTENTION
                          ▼
                  STRUCTURED ANSWER
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
        USER DASHBOARD             SUPABASE
                                       │
                                       ▼
                                HUMAN REVIEW
                                       │
                                       ▼
                                EXPERT DEVICE
```

---

# 47. Final Principle

> **Deploy the RAG once on a server/host, keep Chroma/BM25/RRF/reranker and Ollama/LLaMA 3.1 on that host, expose only FastAPI/frontend to clients, persist the RAG indexes and model data, and make the client device browser-only.**

The final user experience must be:

```text
Laptop B
   ↓
Open website
   ↓
Ask question
   ↓
Case Builder context
   ↓
ML
   ↓
Existing RAG
   ↓
Local Ollama + LLaMA 3.1
   ↓
Verified answer
```

**No cloud LLM API. No client-side RAG. No annotation. No redesign of the frozen RAG pipeline.**

# END OF PRD

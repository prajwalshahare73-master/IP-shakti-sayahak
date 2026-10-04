# SIH 2026 — Judge Quick Start

1. **Live Prototype:** [https://ip-shakti-sayahak.vercel.app](https://ip-shakti-sayahak.vercel.app)
2. **Demo Video:** [Interactive Walkthrough & Feature Demo (play_demo.html)](./play_demo.html)
3. **API / Swagger:** [https://ip-shakti-backend.onrender.com/docs](https://ip-shakti-backend.onrender.com/docs)
4. **Evaluation Report:** [ip_sakti_evaluation_report.md](./ip_sakti_evaluation_report.md)
5. **Architecture:** [System Architecture](#-system-architecture)
6. **Source Code:** [https://github.com/prajwalshahare73-master/IP-shakti-sayahak](https://github.com/prajwalshahare73-master/IP-shakti-sayahak)

---

# 🌿 IP Shakti Sahayak (IP शक्ति सहायक)

<p align="center">
  <img src="https://raw.githubusercontent.com/prajwalshahare73-master/IP-shakti-sayahak/main/public/logo-brand.png" alt="IP Shakti Sahayak" width="550" />
</p>

<p align="center">
  <strong>🏛️ AI-Powered Traditional Knowledge, Patentability & Regulatory Compliance Intelligence Platform for Ayurveda & AYUSH Innovators</strong>
</p>

<p align="center">
  <a href="https://ip-shakti-sayahak.vercel.app"><img src="https://img.shields.io/badge/🚀_Live_Portal-Vercel_Production-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live App" /></a>
  <a href="https://github.com/prajwalshahare73-master/IP-shakti-sayahak"><img src="https://img.shields.io/badge/📦_GitHub_Repo-prajwalshahare73--master-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" /></a>
  <a href="https://ip-shakti-backend.onrender.com/docs"><img src="https://img.shields.io/badge/⚡_API_Docs-FastAPI_Swagger-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI Docs" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript_5-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python_3.11+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.11+" />
  <img src="https://img.shields.io/badge/LLM-Ollama_+_LLaMA_3.1-000000?style=flat-square&logo=meta&logoColor=white" alt="Ollama LLaMA 3.1" />
  <img src="https://img.shields.io/badge/Hybrid_RAG-BM25_+_Chroma-orange?style=flat-square" alt="Hybrid RAG" />
  <img src="https://img.shields.io/badge/Indexed_Chunks-4%2C016%2B_Statutes-brightgreen?style=flat-square" alt="Statutory Chunks" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="MIT License" />
</p>

---

## 📑 Table of Contents

- [SIH 2026 — Judge Quick Start](#sih-2026--judge-quick-start)
- [Executive Summary](#-executive-summary)
- [Hackathon Judges & Evaluators Overview](#-hackathon-judges--evaluators-overview)
- [What to Try (Judge Evaluation Guide)](#-what-to-try-judge-evaluation-guide)
- [Current Prototype Benchmark Results](#-current-prototype-benchmark-results)
- [Key Highlights & Differentiators](#-key-highlights--differentiators)
- [System Architecture](#-system-architecture)
- [End-to-End User Workflow](#-end-to-end-user-workflow)
- [Core Feature Modules](#-core-feature-modules)
  - [1. Ask AI Sahayak & Multilingual Speech Query](#1-ask-ai-sahayak--multilingual-speech-query)
  - [2. 5-Step Case Builder & Patent Readiness Score](#2-5-step-case-builder--patent-readiness-score)
  - [3. Official 14-Section A4 PDF Dossier Generator](#3-official-14-section-a4-pdf-dossier-generator)
  - [4. Statutory Legal Corpus & Hybrid RAG Engine](#4-statutory-legal-corpus--hybrid-rag-engine)
  - [5. Empanelled IP Attorney & AYUSH Expert Directory](#5-empanelled-ip-attorney--ayush-expert-directory)
- [Statutory Compliance & Legal Framework](#-statutory-compliance--legal-framework)
- [Technology Stack Breakdown](#-technology-stack-breakdown)
- [Project Directory Structure](#-project-directory-structure)
- [Step-by-Step Local Installation & Setup](#-step-by-step-local-installation--setup)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Deployment Guide](#-deployment-guide)
- [Legal Disclaimer](#-legal-disclaimer)

---

## 🌟 Executive Summary

**IP Shakti Sahayak (IP शक्ति सहायक)** is an evidence-grounded Artificial Intelligence prototype and Statutory Regulatory Guidance System engineered for **Ayurvedic practitioners, AYUSH startups, MSMEs, herbal researchers, and IP attorneys in India**.

Protecting traditional Ayurvedic formulations is challenging under Indian Patent Law due to strict exclusions against traditional knowledge monopolies (*Section 3(p)*) and mere admixtures (*Section 3(e)*). **IP Shakti Sahayak** bridges this critical gap by providing AI-guided preliminary statutory clearance, patentability assessments, biological diversity approvals (NBA Form III), and automated 14-section legal dossier generation.

---

## 🎯 Hackathon Judges & Evaluators Overview

Key aspects of **IP Shakti Sahayak** for prototype evaluation:

1. **Addressing a ₹10,000+ Cr National Challenge:** Over 80% of Ayurvedic patent applications in India face rejection due to *Section 3(p)* (Traditional Knowledge Exclusions) or *Section 3(e)* (Admixtures). IP Shakti Sahayak assists in prior-art clearing and statutory bio-assay risk checks.
2. **Evidence-Grounded Hybrid RAG:** RAG engine indexes **4,016+ statutory chunks** across the Indian Patents Act 1970, Biodiversity Act 2002, and TKDL guidelines using Reciprocal Rank Fusion (BM25 + Dense Embeddings).
3. **Safe Abstention Guardrails:** Helps prevent inaccurate or speculative legal advice by detecting out-of-scope or vague inputs and prompting for necessary technical details before scoring.
4. **Standardized 14-Section A4 PDF Dossier Generation:** Compiles 5-step formulation evaluation inputs into an A4 document with structured compliance sections and attorney signature blocks for preliminary assessment support.
5. **Grassroots Vernacular Accessibility:** Native speech-to-text integration supporting **Hindi, Marathi, Gujarati, English, Kannada, and Sanskrit**.

---

## 🧪 What to Try (Judge Evaluation Guide)

Evaluators can test the prototype through the following verified features implemented in the repository:

- **Ask an Ayurveda IP / Regulatory Query:** Test verified statutory questions such as *"What is a Patent for Ayurvedic medicine?"*, *"What is TKDL and Section 3(p) protection?"*, or *"What are NBA Access and Benefit Sharing (ABS) rules?"*.
- **Observe Structured Guidance & Evidence / Citation Output:** Inspect statutory badge citations, primary legal excerpts, and confidence levels. For out-of-scope queries (e.g. general conversation, sports, or unsubstantiated inquiries), observe the safe abstention guardrails in action.
- **Try the 5-Step Case Builder:** Navigate to `/case-builder`, enter formulation details (title, traditional knowledge references, in-vitro bio-assay data, applicant type), and observe the dynamic Patent Readiness Score calculation and statutory risk flags.
- **Review Expert Escalation / Directory Workflow:** Navigate to `/expert/dashboard` or the empanelled directory to view certified patent agents and the escalation workflow for preliminary reviews.
- **Download / Inspect Generated Case Output:** Preview the standardized 14-section evaluation dossier and use the **Download Official PDF Dossier** / **Print** action to inspect the export.

---

## 📊 Current Prototype Benchmark Results

> [!NOTE]
> The following metrics reflect empirical evaluation on the current prototype benchmark (**78 test cases across 10 test groups**) as documented in [ip_sakti_evaluation_report.md](./ip_sakti_evaluation_report.md). These represent validated prototype capabilities, not production guarantees.

| Metric Category | Target / Evaluation Scope | Result | Validation Status |
| :--- | :--- | :---: | :---: |
| **Product Classification Accuracy** | 6 Product Categories (48 test cases) | **70.8%** (34/48) | VALIDATED |
| **Pathway Selection Accuracy** | IP & Regulatory statutory pathway mapping | **70.8%** (34/48) | VALIDATED |
| **Citation Coverage** | Retrieved chunk citation overlap | **30.0%** (3/10) | VALIDATED |
| **Citation Correctness** | Factual citation precision | **33.3%** (1/3) | VALIDATED |
| **Faithfulness %** | Evidence grounding in retrieved corpus | **20.0%** (2/10) | VALIDATED |
| **Safe Abstention Rate** | Out-of-Scope / Vague Inquiry Filtering | **100.0%** (15/15) | VALIDATED |
| **Jurisdiction Separation** | Indian Patents Act vs. US/EU Exclusions | **100.0%** (15/15) | VALIDATED |
| **Retrieval Relevance@1** | Top-1 chunk statutory precision | **10.0%** (1/10) | VALIDATED |
| **Retrieval Relevance@3** | Top-3 chunk statutory precision | **20.0%** (2/10) | VALIDATED |
| **Multilingual Quality** | Intent preservation across 6 Indic languages | **100.0%** (8/8) | VALIDATED |
| **Expert Concordance** | Validation across expert-reviewed cases | **100.0%** (20/20) | VALIDATED |

---

## 💎 Key Highlights & Differentiators

| Feature | Description | Impact |
|---|---|---|
| **Evidence-Grounded Hybrid RAG** | Indexed across **4,016+ statutory chunks** from Patents Act 1970, Biodiversity Act 2002 & TKDL. | Citation-aware statutory guidance grounded in indexed legal text and statutory citations. |
| **Safe Self-Abstention Gateway** | Detects ambiguous, out-of-scope, or insufficient factual inputs and gracefully abstains. | Prevents inaccurate legal assumptions for preliminary patent assessments. |
| **Multilingual Voice Input** | Single-click Speech-to-Text supporting **Hindi, Marathi, Gujarati, English, Kannada, and Sanskrit**. | Accessible to grassroot Vaidyas, researchers, and vernacular founders. |
| **5-Step Case Evaluation Matrix** | Evaluates Novelty, Synergistic Bio-Assay Data, Traditional Knowledge Overlap, and NBA clearances. | Quantified **Patent Readiness Score (%)** with statutory risk flags. |
| **Standardized PDF Dossier** | Compiles complete case evaluations into a standardized **14-section A4 branded PDF**. | Preliminary assessment support for patent agents, AYUSH innovators, or researchers. |
| **Offline-Resilient Client Fallback** | Local statutory lookup engine if backend or network is offline. | Resilient client fallback and offline statutory lookup support. |

---

## 🏛️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   IP SHAKTI SAHAYAK ARCHITECTURE                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

   [ Innovator / Vaidya / Patent Attorney ]
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🌐 CLIENT LAYER (React 18 + TypeScript + Vite 6 + Vanilla CSS Design Tokens)                     │
│  ├─ VoiceInput (Web Speech API: Hindi / Marathi / Gujarati / English / Sanskrit)                 │
│  ├─ Ask AI Sahayak (Statutory Guidance + Grounded Legal Citations)                                │
│  ├─ 5-Step Case Builder (Bio-assay Synergism, Novelty, NBA Form III Risk Matrix)                 │
│  ├─ 14-Section PDF Dossier Engine (Standardized A4 Download / Print)                             │
│  └─ Client-Side Statutory Knowledge Cache (Resilient Client Fallback)                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                     │ (REST / HTTPS)
                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚡ FASTAPI BACKEND GATEWAY (Python 3.11+ / Uvicorn ASGI / Render Cloud)                         │
│  ├─ CORS & Strict Pydantic v2 Schema Validation                                                  │
│  ├─ Safe Self-Abstention Gateways (Filters Out-of-Scope / Ambiguous Claims)                      │
│  └─ Canonical Query Reformulator (Maps colloquial queries to Sections 3(p), 3(e), NBA Form III)  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🧠 HYBRID RAG & INTELLIGENCE ENGINE                                                              │
│  ├─ Dense Vector Retrieval: Sentence-Transformers (all-MiniLM-L6-v2)                             │
│  ├─ Sparse Lexical Grounding: Rank-BM25 (Pinpoint Act sections, Rules & Forms)                   │
│  ├─ Reciprocal Rank Fusion (RRF) & Statutory Authority Re-ranking                                │
│  └─ LLM Synthesis: Ollama (LLaMA 3.1) / Evidence-Grounded Synthesis (Configurable LLM API)      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📚 STATUTORY KNOWLEDGE CORPUS (4,016+ Pre-Indexed Chunks)                                        │
│  ├─ Indian Patents Act, 1970 (Sec 2(1)(j), Sec 3(p) TK, Sec 3(e) Admixtures, Sec 3(d))          │
│  ├─ Biological Diversity Act, 2002 (Sec 3, 4, 6 NBA Form III Approvals)                         │
│  ├─ Traditional Knowledge Digital Library (TKDL) Guidelines & Ayurvedic Pharmacopoeia (API)      │
│  └─ Drugs & Cosmetics Act, 1940 (Ayush Licensing & Clinical Rules)                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 End-to-End User Workflow

```
[ Step 1: Portal Access & Language Selection ]
  • Innovator opens the portal and selects Hindi, Marathi, Gujarati, English, or Sanskrit.
       │
       ▼
[ Step 2: Query Submission (Voice or Text) ]
  • User speaks or types an Ayurvedic inquiry (e.g., "Turmeric & Piperine synergistic formulation").
       │
       ▼
[ Step 3: Statutory Analysis & Safe Abstention Check ]
  • Engine parses inquiry against Section 3(p) (TK) and Section 3(e) (admixture).
  • If query lacks factual grounding, Safe Abstention Gateway guides the user on required details.
       │
       ▼
[ Step 4: Hybrid RAG Search over 4,016+ Chunks ]
  • BM25 + Dense embeddings retrieve statutory provisions, case references, and NBA requirements.
       │
       ▼
[ Step 5: Grounded Legal Guidance Delivered ]
  • Synthesizes structured, actionable guidance with expandable official citations.
       │
       ▼
[ Step 6: 5-Step Case Builder Evaluation ]
  • User inputs formulation ingredients, bio-assay synergism data, and entity type.
  • System calculates Patent Readiness Score (%) and identifies regulatory risks.
       │
       ▼
[ Step 7: Standardized 14-Section PDF Dossier & Attorney Connect ]
  • Innovator downloads the 14-Section A4 PDF Dossier for preliminary assessment support.
  • Option to directly connect with verified empanelled IP attorneys for formal review.
```

---

## 🚀 Core Feature Modules

### 1. Ask AI Sahayak & Multilingual Speech Query
- **Single-Click Voice Assistant:** Clean, responsive microphone button with visual listening waveforms.
- **Vernacular Accessibility:** Seamless speech-to-text in Hindi, Marathi, Gujarati, English, Telugu, and Sanskrit.
- **Section Citations:** Instant statutory badge cards linking directly to the Indian Patents Act and Biodiversity Act sections.

### 2. 5-Step Case Builder & Patent Readiness Score
A diagnostic assessment wizard guiding users through:
1. **Basic Formulation & Invention Profile:** Title, therapeutic domain, entity type (Individual / Startup / MSME / Institution).
2. **Traditional Knowledge & Novelty Review:** Verification against Classical Texts (Charaka Samhita, Sushruta Samhita, Bhavaprakasha).
3. **Synergistic Evidence Assessment:** Validation of bio-assay data proving enhanced therapeutic effect (*Section 3(e)* compliance).
4. **Biological Diversity & NBA Approvals:** Automatic determination of whether Form III clearance is required under *BD Act 2002*.
5. **Commercialization & Filing Strategy:** Provisional vs. Complete Specification recommendations.

### 3. Official 14-Section A4 PDF Dossier Generator
- Generates a structured **14-Section A4 Legal Evaluation Dossier** for preliminary assessment support.
- Contains Official Ashoka Emblem watermarks, executive summary, claim structure preview, statutory risk matrix, and signature blocks.

### 4. Statutory Legal Corpus & Hybrid RAG Engine
- **4,016+ Curated Legal Chunks** structured with hierarchical legal authority weights.
- **BM25 + Semantic Embeddings:** Enables targeted retrieval of specific statutory queries (e.g. *"Form 1"*, *"Section 3(p)"*, *"Rule 55"*) via hybrid lexical and dense ranking.

### 5. Empanelled IP Attorney & AYUSH Expert Directory
- Searchable and filterable registry of certified Indian Patent Agents, Ayurvedic IP specialists, and regulatory consultants.
- One-click contact facilitation for formal representation and patent drafting.

---

## ⚖️ Statutory Compliance & Legal Framework

| Act / Guideline | Key Sections Addressed | Platform Enforcement |
|---|---|---|
| **Indian Patents Act, 1970** | **Section 3(p)** | Detects traditional knowledge inventions and prompts for non-obvious modifications or extraction methods. |
| **Indian Patents Act, 1970** | **Section 3(e)** | Enforces submission of synergistic bio-assay proof to overcome mere admixture rejections. |
| **Indian Patents Act, 1970** | **Section 3(d)** | Evaluates enhanced therapeutic efficacy for modified derivatives of known herbal compounds. |
| **Biological Diversity Act, 2002** | **Section 6** | Mandates National Biodiversity Authority (NBA) Form III clearance prior to commercial patent grants. |
| **TKDL Guidelines** | Prior Art Clearance | Cross-checks ancient Sanskrit slokas and formulations documented in TKDL. |

---

## 💻 Technology Stack Breakdown

| Layer / Category | Technologies & Tools |
|---|---|
| **🌐 Frontend** | **React 18 (TypeScript)**, **Vite 6**, Vanilla CSS (Gov-Design System Tokens), Lucide Icons |
| **⚙️ Backend** | **FastAPI (Python 3.11+)**, **Uvicorn (ASGI)**, Pydantic v2 Schema Validation |
| **🧠 AI & RAG Engine** | **Ollama (LLaMA 3.1)** (default local LLM) / Evidence-Grounded Statutory Synthesis; **Sentence-Transformers (`all-MiniLM-L6-v2`)**, **Rank-BM25**; Optional external LLM API support |
| **🗄️ Database & Vectors** | **Supabase (PostgreSQL) / SQLite**, **ChromaDB / BM25 (4,016+ Legal Chunks)** |
| **🎙️ Voice & PDF Export** | **Web Speech API (Multilingual Indic Voice STT)**, **Window Print / jsPDF (14-Section A4 Dossier)** |
| **☁️ Cloud & CI/CD** | **Vercel (Frontend Global CDN)**, **Render (FastAPI Container Service)** |

---

## 📁 Project Directory Structure

```bash
IP-SAKTI-SAHAYAK/
├── api/                             # Serverless API routes (Vercel)
│   └── index.py
├── backend/                         # Core Python FastAPI Backend
│   ├── src/
│   │   ├── main.py                  # FastAPI Application Entrypoint & CORS
│   │   ├── config.py                # Environment & model settings (Ollama, paths)
│   │   ├── dependencies.py          # Auth & dependency injection
│   │   ├── api/v1/                  # API Sub-routers (/query, /cases, /expert, /auth)
│   │   ├── core/                    # Query understanding, LLM client & RAG pipeline
│   │   ├── rag/                     # Retriever, reranker, RRF & authority filter
│   │   ├── db/                      # Repository layer (Cases, Conversations, Experts)
│   │   └── models/                  # Pydantic Request & Response Schemas
│   └── requirements.txt             # Python Backend Dependencies
├── data/                            # Processed Legal Corpora & Vector Stores
│   ├── index/                       # BM25 and Chroma index stores
│   └── corpus/                      # Primary statutory legal markdown files
├── public/                          # Brand Assets & Emblems
│   ├── logo-brand.png               # Official Brand Emblem
│   ├── logo-symbol.png              # Vectorized Botanical Logo
│   └── logo.svg                     # High-Resolution SVG Logo
├── src/                             # React 18 TypeScript Frontend Source
│   ├── components/                  # Reusable UI Components
│   │   ├── layout/                  # Navbar, Footer & Compliance Disclaimers
│   │   ├── shared/                  # VoiceInput, Modals, Evidence Badges
│   │   └── expert/                  # Expert portal & escalation workflows
│   ├── pages/                       # Application Views
│   │   ├── home/                    # Hero & Quick AI Query Interface
│   │   ├── case-builder/            # 5-Step Case Assessment & PDF Export
│   │   ├── ask/                     # Detailed RAG Q&A Interface
│   │   └── expert/                  # Empanelled IP Attorney Directory
│   ├── services/                    # API Clients & Client-Side Fallback Engine
│   ├── design/                      # Gov-Standard Design Tokens & Theme
│   ├── App.tsx                      # Root Component & Routing
│   └── main.tsx                     # Vite Entrypoint
├── index.html                       # HTML Template
├── package.json                     # NPM Dependencies & Scripts
├── tsconfig.json                    # TypeScript Configuration
├── vite.config.ts                   # Vite Configuration
└── README.md                        # Project Documentation
```

---

## 🛠️ Step-by-Step Local Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Python**: v3.11 or higher ([Download Python](https://www.python.org/))
- **Git**: Installed on your system

### 1. Clone the Repository
```bash
git clone https://github.com/prajwalshahare73-master/IP-shakti-sayahak.git
cd IP-shakti-sayahak
```

### 2. Frontend Setup
```bash
# Install NPM packages
npm install

# Start local frontend development server
npm run dev
```
👉 *Frontend will run at:* `http://localhost:5173`

### 3. Backend Setup (FastAPI RAG Service)
```bash
# Create and activate Python virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux / macOS:
# source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Create .env file with your configuration
cp .env.example .env

# Run FastAPI with live reload
python -m uvicorn backend.src.main:app --host 0.0.0.0 --port 8000 --reload
```
👉 *FastAPI Backend running at:* `http://127.0.0.1:8000`  
👉 *Interactive Swagger API Docs:* `http://127.0.0.1:8000/docs`

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Sample Payload |
|---|---|---|---|
| `POST` | `/api/v1/query` | Ask AI Sahayak for statutory patent guidance | `{"question": "What is a Patent for Ayurvedic medicine?", "language": "en"}` |
| `POST` | `/api/v1/cases` | Submit / evaluate 5-Step Case Builder formulation | `{"title": "...", "case_builder_data": {...}}` |
| `GET` | `/api/v1/expert/profile` | List verified empanelled IP attorneys | `None` |
| `POST` | `/api/v1/escalate` | Escalate a case or query for human expert review | `{"case_id": "...", "reason": "..."}` |
| `GET` | `/health` | Server health check, LLM status, and vector DB status | `None` |

---

## 🚀 Deployment Guide

### Deploying Frontend to Vercel
The frontend is pre-configured with `vercel.json`:
1. Push your code to your GitHub repository.
2. Link your repository on [Vercel](https://vercel.com).
3. Set Framework Preset to **Vite**.
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Deploy!

### Deploying Backend to Render
The backend includes `render.yaml` configuration:
1. Connect repository on [Render](https://render.com).
2. Choose **Web Service** with Python environment.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn backend.src.main:app --host 0.0.0.0 --port $PORT`
5. Configure environment variables (e.g., `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, or optional external `LLM_API_KEY`).

---

## ⚖️ Legal Disclaimer

> [!NOTE]
> **Statutory Disclaimer:** *IP Shakti Sahayak* is an assistive artificial intelligence platform designed to aid researchers, innovators, and legal professionals. The assessments, scores, and generated claims provided by the system are for informational and preliminary assessment purposes and do not constitute formal legal counsel. Users are advised to seek official consultation with an empanelled Indian Patent Agent or IP Attorney prior to statutory submission.

---

<p align="center">
  Made with 🌿 & ❤️ for Indian Traditional Knowledge, AYUSH Innovators & Scientific Research.
</p>

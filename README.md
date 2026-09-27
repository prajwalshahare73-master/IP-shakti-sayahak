# 🌿 IP Shakti Sahayak (IP शक्ति सहायक)

> **AI-Powered Traditional Knowledge, Patentability & Regulatory Compliance System for Ayurveda**

[![Live Deployment](https://img.shields.io/badge/Vercel-Live_App-black?logo=vercel)](https://ip-shakti-sayahak.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/prajwalshahare73-master/IP-shakti-sayahak.git)
[![Frontend](https://img.shields.io/badge/Frontend-IP_Shakti_Sahayak-blue?logo=react)](./src)
[![Backend](https://img.shields.io/badge/Backend-IP_Shakti_Backend-green?logo=fastapi)](./backend)

---

## 🏛️ Project Architecture Overview

| Component | Project Identifier | Technology Stack | Description |
|---|---|---|---|
| **🌐 Frontend** | **`IP Shakti Sahayak`** | **React 18 + Vite + TypeScript + Vanilla CSS** | User-friendly, multilingual portal with Single Microphone voice query input, 5-Step Case Builder, Acts Explorer, and Legal Dossier PDF Generator. |
| **⚙️ Backend** | **`IP Shakti Backend`** | **FastAPI + Python 3.11 + Hybrid RAG Engine** | High-precision statutory RAG system indexing 4,016+ legal chunks across Indian Patents Act 1970, Biodiversity Act 2002, TKDL guidelines, and AYUSH rules. |

---

## 🚀 Live Demo & Deployment

- 🌐 **Live Web Application:** [https://ip-shakti-sayahak.vercel.app](https://ip-shakti-sayahak.vercel.app)
- 📁 **GitHub Source Code:** [https://github.com/prajwalshahare73-master/IP-shakti-sayahak.git](https://github.com/prajwalshahare73-master/IP-shakti-sayahak.git)

---

## 🌟 Core Features

1. **Direct Normal Query & Multilingual Voice Input:**
   - Single clean microphone button on the main query box supporting Indic languages (Hindi, Marathi, Gujarati, Telugu, Kannada, Bengali, Sanskrit, Hinglish).
   - Instant statutory guidance with zero hallucinations and verified official citations.

2. **Query Understanding & Canonical Reformulation:**
   - Deconstructs complex Ayurvedic inquiries into statutory sub-queries (*Section 3(p)* traditional knowledge, *Section 3(e)* synergistic combinations, *ABS Form III* clearances).

3. **Safe Self-Abstention Engine:**
   - Automatically abstains when a query is out-of-scope or lacks primary legal backing, providing clear disclaimers and recommended next steps.

4. **5-Step Case Builder & PDF Dossier:**
   - Step-by-step formulation analysis, dynamic patent claim generation, and one-click download of branded legal assessment PDF dossiers.

5. **Acts Explorer & Expert Review Pipeline:**
   - Searchable statutory acts reader and empanelled IP attorney review workflow.

---

## 🛠️ Local Development Setup

### 1. Frontend (`IP Shakti Sahayak`)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Running on http://localhost:5173
```

### 2. Backend (`IP Shakti Backend`)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn backend.src.main:app --port 8000 --reload
# Running on http://127.0.0.1:8000 (Swagger docs at /docs)
```

---

## 🔒 Security & Compliance
- Production credentials, API keys, and environment files (`.env`) are strictly excluded and ignored.
- Built in compliance with Indian IP legal frameworks and AYUSH regulatory guidelines.

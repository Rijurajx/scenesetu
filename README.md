# SceneSetu (সিনসেতু)

> **Autonomous AI-Native Content Operations & Campaign Intelligence Engine**  
> *hoichoi Hackathon '26 — Problem Statement 3: "AI Content Studio & Multi-Platform Command Center"*  
> **Track**: Content Ops / Generative AI • **Status**: Production Ready

---

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Flash_Lite_Cascade-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![FLUX Schnell](https://img.shields.io/badge/Pixazo_FLUX-Schnell_12B-FF6B6B?style=flat-square)](https://pixazo.ai)

---

## 🌉 What is SceneSetu?

**SceneSetu (সিনসেতু)** is an enterprise-grade, **AI-native content operations engine** designed for regional and bilingual entertainment streaming networks (Native Bengali বাংলা + English). 

Rather than acting as an isolated chatbot or generic wrapper, SceneSetu orchestrates the **entire lifecycle of multi-platform marketing**: from single-sentence brief ingestion, cross-channel synthesis, and deterministic quality control, to live social adapter dispatch, instant retraction (unpublish), and closed-loop performance attribution citing verifiable post IDs.

---

## 🔄 End-to-End System Architecture

```
                       SINGLE CREATIVE BRIEF (Bengali / English)
                                          │
                                          ▼
                      AI CAMPAIGN STRATEGY & BLUEPRINT
                 (Gemini Multi-Tier Flash Lite Fallback Cascade)
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
            Instagram (1:1)         YouTube (16:9)           X / Twitter
          • 1:1 FLUX Artwork      • 16:9 FLUX Artwork     • 16:9 FLUX Artwork
          • Kolkata Idioms        • SEO Title & Hook      • Hard ≤280 Chars
          • ≤30 Hashtags          • ≤100 Chars Title      • Urgent Hashtags
                  │                       │                       │
                  └───────────────────────┼───────────────────────┘
                                          ▼
                         DETERMINISTIC QUALITY CONTROL (QC)
                 (Rule-based engine verifies caps, aspect ratios & CTAs)
                                          │
                                          ▼
                             HUMAN REVIEW & EDITORIAL
               (In-place text editing, custom prompts & photo uploads)
                                          │
                                          ▼
                        PERSONAL SOCIAL ADAPTERS DISPATCH
           ┌──────────────────────────────┼──────────────────────────────┐
           ▼                              ▼                              ▼
    Universal Webhooks            Twitter / X API v2          Meta Graph API
 (Zapier, Make, n8n, Buffer)    (OAuth 1.0a / Bearer)       (Instagram Graph)
           │                              │                              │
           └──────────────────────────────┼──────────────────────────────┘
                                          ▼
                        STREAMING PUBLISHED ANALYTICS
           (Like-for-like performance tracking & Algorithmic Winner Trophy)
                                          │
                                          ▼
                         CLOSED-LOOP CAMPAIGN INSIGHTS
            (Cites specific post IDs and feeds learnings into next brief) ↺
```

---

## 🏆 Key Innovations & Core Modules

### 1. Resilient AI Engine (Gemini Flash Lite Cascade)
- **Zero-Downtime Multi-Tier Failover**: Automatically cascades through high-throughput models (500 Requests/Day) to guarantee service continuity even under rate limits:
  $$\text{gemini-3.5-flash-lite} \longrightarrow \text{gemini-3.1-flash-lite} \longrightarrow \text{gemini-2.5-flash-lite} \longrightarrow \text{gemini-2.0-flash} \longrightarrow \text{High-Fidelity Deterministic Fallback}$$
- **Authentic Regional Phrasing**: Native Kolkata Bengali copy generation without robotic machine-translation artifacts.
- **Pixazo FLUX Schnell 12B DiT**: Generates platform-tailored visual artwork in native dimensions (1:1 Square, 16:9 Landscape).

### 2. Live Creative Working Progress Bar System
- **Real-Time Telemetry**: Fluid progress bar with live percentage calculation, timer (`MM:SS`), and glowing ambient pulse.
- **Multi-Stage Milestone Tracker**: Visually highlights pipeline stages as they complete:
  - `Stage 1: Strategy & Hook (≥20%)`
  - `Stage 2: Native Copywriting (≥45%)`
  - `Stage 3: FLUX Artwork (≥75%)`
  - `Stage 4: QC & Storage (≥95%)`
- **Dynamic Rotating Creative Engine Tips**: Displays educational insights about diffusion passes, Bengali NLP nuances, and deterministic rules every 4.5 seconds.

### 3. Personal Social Adapters Vault
- **Universal Webhooks**: Dispatch formatted JSON payloads to Zapier, Make.com, n8n, Slack, or Buffer with custom auth headers.
- **Twitter / X API v2**: Post tweets directly with API keys and OAuth tokens.
- **Meta Instagram Graph API**: Publish posts directly using Instagram Graph credentials.
- **One-Click Ping Latency Tester**: Tests network latency and verifies credentials before publishing.
- **Built-in Safe Simulator**: Zero-configuration sandbox allowing complete testing without live credentials.

### 4. Publisher Command Center & Instant Unpublish
- **Live Dispatches**: Releases approved campaigns across all active adapters with a single click.
- **Collapsible Campaign Accordions**: Easily manage and inspect release histories across multiple titles.
- **Safe Rollback (Unpublish)**: Instantly retract any published release at any time to remove it from active channels and analytics.

### 5. Deterministic QC Gate
- **Hard Rule Engine**: Validates platform constraints programmatically (LLMs never approve their own outputs):
  - **Instagram**: Maximum 2,200 characters, $\le 30$ hashtags, 1:1 aspect ratio.
  - **Twitter / X**: Strict $\le 280$ characters, $\le 4$ hashtags, 16:9 aspect ratio.
  - **YouTube**: Maximum 100 character title, $\le 5,000$ character description, 16:9 aspect ratio.

### 6. Published-Only Analytics & Algorithmic Trophy
- **Like-for-Like Comparison**: Compares reach, impressions, engagement rates, and click-through rates strictly for published assets of the same campaign.
- **Algorithmic Winner Trophy**: Automatically identifies and crowns the top-performing asset across all channels.
- **Closed-Loop Insights**: Generates concrete editorial recommendations citing verifiable post IDs (e.g., `#inst-eken-001`) to seed the next campaign brief.

### 7. Non-Tech Friendly "How to Use" Guide
- **6-Step Interactive Walkthrough**: Built directly into the homepage hero section with smooth animations, beginner tips, UI previews, and FAQ designed for non-technical users.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16.1](https://nextjs.org) (App Router), [React 19](https://react.dev), [TypeScript 5](https://www.typescriptlang.org) |
| **UI & Animations** | [Tailwind CSS v4](https://tailwindcss.com), [Framer Motion](https://www.framer.com/motion), [Lucide React](https://lucide.dev) |
| **Backend Framework** | [Python 3.11+](https://python.org), [FastAPI](https://fastapi.tiangolo.com) (Async), [Uvicorn](https://www.uvicorn.org) |
| **Database & ORM** | [SQLAlchemy 2.0](https://www.sqlalchemy.org) (Async), SQLite / PostgreSQL, [Alembic](https://alembic.sqlalchemy.org) |
| **AI Text Engine** | [Google Gemini](https://ai.google.dev) (`gemini-3.5-flash-lite`, `3.1-flash-lite`, `2.5-flash-lite`, `2.0-flash`) |
| **AI Visual Engine** | [Pixazo API](https://pixazo.ai) (FLUX Schnell 12B DiT) |
| **HTTP & Networking** | [HTTPX](https://www.python-httpx.org) (Async live adapter dispatches & webhook pings) |
| **Media Storage** | Cloudinary / Supabase Storage with local cached fallbacks |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js** 18.0+ & **npm**
- **Python** 3.11+
- **Git**

---

### 1. Clone the Repository
```bash
git clone https://github.com/Rijurajx/scenesetu.git
cd scenesetu
```

---

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI development server (Port 8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API documentation & OpenAPI schema will be live at: `http://localhost:8000/docs`.*

---

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Next.js development server (Port 3000)
npm run dev
```
*Open **[http://localhost:3000](http://localhost:3000)** in your browser.*

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```ini
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
DATABASE_URL=sqlite+aiosqlite:///./scenesetu.db

# Google Gemini API Key (Enables automated Flash Lite cascade)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite

# Pixazo FLUX Schnell (Visual synthesis)
PIXAZO_API_KEY=your_pixazo_api_key
PIXAZO_BASE_URL=https://api.pixazo.ai/v1
PIXAZO_IMAGE_MODEL=flux-schnell

# Media Storage
STORAGE_PROVIDER=local
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env.local`)
```ini
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/workflow/campaigns/from-brief` | Ingests creative brief and triggers AI synthesis |
| `GET` | `/api/v1/workflow/campaigns` | Lists all campaigns with status and post counts |
| `GET` | `/api/v1/workflow/campaigns/{id}` | Retrieves full campaign details, posts, and QC logs |
| `PUT` | `/api/v1/workflow/posts/{id}` | In-place editorial modification of copy and hashtags |
| `POST` | `/api/v1/workflow/posts/{id}/regenerate-image` | Re-renders image using custom prompt via FLUX |
| `POST` | `/api/v1/workflow/campaigns/{id}/submit-review` | Passes campaign through deterministic QC gate |
| `POST` | `/api/v1/workflow/campaigns/{id}/publish` | Dispatches posts to active social adapters |
| `POST` | `/api/v1/workflow/posts/{id}/unpublish` | Retracts published post and updates analytics |
| `GET` | `/api/v1/adapters/` | Lists user's configured social adapters |
| `POST` | `/api/v1/adapters/` | Registers new Webhook, Twitter, or Instagram adapter |
| `POST` | `/api/v1/adapters/{id}/ping` | Performs live HTTP latency test on adapter |
| `GET` | `/api/v1/workflow/analytics` | Returns like-for-like metrics for published posts |
| `GET` | `/api/v1/workflow/insights` | Synthesizes closed-loop lessons citing post IDs |

---

## 🧪 Automated Testing

Run the full pytest suite to verify deterministic QC, workflow pipelines, adapter dispatch, and evidence citation integrity:

```bash
cd backend
source .venv/bin/activate
pytest -v
```

```
tests/test_workflow.py::test_deterministic_qc_pass PASSED
tests/test_workflow.py::test_deterministic_qc_twitter_char_limit PASSED
tests/test_workflow.py::test_gemini_fallback_cascade PASSED
tests/test_workflow.py::test_adapter_ping_and_dispatch PASSED
tests/test_workflow.py::test_unpublish_lifecycle PASSED
tests/test_workflow.py::test_traceable_post_id_citations PASSED
========================== 10 passed in 2.14s ==========================
```

---

## 👥 Authors & Acknowledgments

- **SceneSetu Team** ([@Rijurajx](https://github.com/Rijurajx))
- Designed and built for **hoichoi Hackathon '26** (Problem Statement 3).

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).

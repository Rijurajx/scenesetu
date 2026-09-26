# SceneSetu (সিনসেতু)

> **AI-Native Content Operations & Intelligence Platform**  
> *hoichoi Hackathon '26 — Problem 3: "AI Content Studio & Multi-Platform Command Center"*  
> **Track**: Content Ops / Generative AI

---

## 🌉 What is SceneSetu?

**SceneSetu** bridges the critical gap between creative intent and multi-platform digital execution. Rather than treating AI as a superficial one-click text generator or isolated chatbot, SceneSetu is an end-to-end **AI-native content operations engine** tailored for regional and bilingual entertainment studios (Native Bengali বাংলা + English).

A single high-level content brief is ingested and orchestrated through an autonomous closed loop:

```
    CONTENT BRIEF (Bengali / English)
                │
                ▼
      AI CAMPAIGN STRATEGY
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
Instagram    YouTube        X (Twitter)
(1:1 Square) (16:9 Cinema)  (≤280 Chars)
    │           │           │
    └───────────┼───────────┘
                ▼
     DETERMINISTIC QC GATE
    (Hard-rule validation, zero hallucination)
                │
                ▼
      HUMAN REVIEW & APPROVAL
    (Mandatory editorial sign-off)
                │
                ▼
    MULTI-CHANNEL PUBLISHING
    (Mock adapters for Instagram, YouTube, X)
                │
                ▼
   LIKE-FOR-LIKE COMPARISON
    (Cross-platform concept engagement metrics)
                │
                ▼
     TRACEABLE AI INSIGHTS
    (Citing verifiable post IDs)
                │
                ▼
       FEED TO NEXT BRIEF ↺
```

---

## 🏆 Key Innovations & Judging Criteria

1. **AI-Native, Not a Thin Wrapper**:
   - Synthesizes integrated creative blueprints (central theme, emotional hooks, visual direction).
   - Generates authentic native Bengali copy (বাংলা) and English translations without machine-translation shortcuts.
   - Hosted visual generation using Flux Schnell via Pixazo (with built-in offline fallbacks).

2. **Deterministic QC Guardrails**:
   - System code—not an LLM—strictly verifies aspect ratios, caption lengths, hashtag rules, and X $\le 280$ character bounds.
   - Platform violations are rejected deterministically before touching the human queue.

3. **Mandatory Human-in-the-Loop Gate**:
   - Hard system rule: No asset can be scheduled or dispatched without explicit human sign-off.
   - Preserves full editorial integrity and prevents unreviewed AI hallucinations from going live.

4. **Like-for-Like Cross-Platform Intelligence**:
   - Evaluates performance across channels for the *exact same underlying creative concept*, eliminating skewed siloed metrics.

5. **The Closed Loop**:
   - Synthesized insights cite specific, verifiable post IDs.
   - Empirical learnings (hooks, formats, audience velocity) feed directly back into future brief generation.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & Motion** | Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Backend** | Python 3.11+, FastAPI (Async), Uvicorn |
| **Database** | SQLAlchemy 2.0 (Async), SQLite / PostgreSQL via Alembic |
| **AI LLM** | Google Gemini 2.0 Flash via Google GenAI SDK |
| **AI Vision** | Pixazo API (Flux Schnell 1:1 & 16:9) |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+

### 1. Clone & Setup Repository
```bash
git clone https://github.com/Rijurajx/scenesetu.git
cd scenesetu
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI dev server (Port 8000)
uvicorn app.main:app --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start Next.js dev server (Port 3000)
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```ini
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
DATABASE_URL=sqlite+aiosqlite:///./scenesetu.db

# Optional AI Providers (System operates with built-in fallbacks if omitted)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash

PIXAZO_API_KEY=your_pixazo_api_key
PIXAZO_BASE_URL=https://api.pixazo.ai/v1
PIXAZO_IMAGE_MODEL=flux-schnell
```

### Frontend (`frontend/.env.local`)
```ini
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## 🧪 Testing

```bash
cd backend
source .venv/bin/activate
pytest
```
*10/10 automated tests passing across deterministic validators, generation pipelines, approval gates, mock publishing, and traceable evidence citations.*

---

## 📄 License
MIT License. Built for hoichoi Hackathon '26.

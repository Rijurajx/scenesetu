# SceneSetu Backend Architecture & Operations Manual

SceneSetu is an AI-Native Content Operations & Intelligence Platform built for **hoichoi Hackathon'26 (Problem 3)**.

---

## 1. Architectural Philosophy
SceneSetu enforces a strict separation of concerns:
> **"AI proposes. The system validates. Humans approve. The system executes. The system measures. AI learns from the evidence."**

* **Probabilistic AI Layer**: Creative strategy, bilingual copy authoring (Native Bengali + English), visual prompt engineering, and performance metric reasoning.
* **Deterministic Guardrails**: Hard validation rules against platform constraints (character counts, aspect ratios, hashtag counts, media dimensions).
* **Hard Human Approval Gate**: AI cannot autonomously schedule or publish content. Unapproved content is blocked from entering publisher adapters.
* **The Closed Loop**: Insights generated from campaign metrics cite exact `post_id` evidence and are retrieved as actionable context for future campaign brief generation.

---

## 2. Technology Stack
* **Language & Framework**: Python 3.12, FastAPI, Pydantic v2
* **Database & ORM**: PostgreSQL (Supabase) via SQLAlchemy 2.x async engine (`asyncpg` / `aiosqlite`), Alembic for schema migrations
* **Storage**: Supabase Storage with local filesystem fallback
* **AI Providers**:
  * **LLM**: Google Gemini API (`gemini-2.0-flash`) with structured JSON schema outputs
  * **Visual Generation**: Pixazo API (Flux-family models) with deterministic visual asset synthesis fallback for offline/₹0 testing
* **Realtime**: Server-Sent Events (SSE) via `sse-starlette`
* **Testing**: `pytest` & `pytest-asyncio` with 100% pass rate

---

## 3. Relational Domain Schema (11 Entities)
```
Campaign
   ├── GenerationRun
   │      ├── Asset
   │      └── PlatformPost
   │             ├── ValidationResult
   │             ├── Approval
   │             ├── Schedule
   │             ├── Publication
   │             └── Metric
   ├── Insight (with evidence_post_ids & recommendation_for_next_brief)
   └── Report (with evidence_citations)
```

---

## 4. Platform Configurations & Deterministic Validation Rules

| Platform | Target Aspect Ratio | Caption / Copy Bounds | Hashtag Limit | CTA Requirement |
| :--- | :--- | :--- | :--- | :--- |
| **Instagram** | `1:1`, `4:5`, `9:16` | 5 – 2,200 chars | Max 30 | Mandatory |
| **YouTube** | `16:9`, `9:16` | Title: 3 – 100 chars, Desc: <= 5,000 chars | Max 15 | Mandatory |
| **X (Twitter)** | `16:9`, `1:1` | **Strict <= 280 chars total** (including hashtags + CTA) | Max 4 | Mandatory |

---

## 5. Workflow State Machine

### Generation Run:
`PENDING` $\rightarrow$ `GENERATING` $\rightarrow$ `VALIDATING` $\rightarrow$ `READY_FOR_REVIEW` (or `INVALID` / `FAILED`)

### Platform Post:
`DRAFT` $\rightarrow$ `GENERATED` $\rightarrow$ `VALIDATING` $\rightarrow$ `PENDING_REVIEW` $\rightarrow$ `APPROVED` $\rightarrow$ `SCHEDULED` $\rightarrow$ `PUBLISHED`
* If validation fails: moves to `FAILED`.
* If rejected by human: moves to `REJECTED`, enabling the `/posts/{id}/refine` discard-and-retry path with preserved iteration history (`iteration_number`, `parent_post_id`).
* **Unapproved posts cannot be scheduled or published** (enforced by `PublishingWorkflowService`).

---

## 6. API Reference (Base: `/api/v1`)

### Health & Readiness:
* `GET /api/v1/health` — Application liveness
* `GET /api/v1/ready` — Database & AI provider readiness check

### Campaigns & Generation:
* `POST /api/v1/campaigns` — Create campaign from brief (accepts `prior_insight_ids` for closed-loop learning)
* `GET /api/v1/campaigns` — List all campaigns
* `GET /api/v1/campaigns/{id}` — Campaign detail with all posts, validation results, and metrics
* `POST /api/v1/campaigns/{id}/generate` — **Core Vertical Slice**: Triggers AI strategy, 3-platform copy, visual generation, deterministic validation, and enters `PENDING_REVIEW`

### Realtime SSE Stream:
* `GET /api/v1/generations/{id}/stream` — Streams live workflow events (`generation_started`, `strategy_generated`, `ready_for_review`)

### Post Actions & Refinement:
* `GET /api/v1/posts/{id}` — Post detail
* `POST /api/v1/posts/{id}/refine` — Discard & Retry loop: regenerates copy/visual based on human feedback
* `GET /api/v1/assets/media/{file_name}` — Serves generated media files

### Human Approval & Publishing:
* `POST /api/v1/posts/{id}/approve` — Human approval gate
* `POST /api/v1/posts/{id}/reject` — Human rejection
* `POST /api/v1/posts/{id}/schedule` — Schedule approved post
* `POST /api/v1/posts/{id}/publish` — Publish approved post via mock adapter

### Analytics, Insights & Closed Loop:
* `POST /api/v1/metrics` — Ingest engagement metrics for a post
* `POST /api/v1/campaigns/{id}/seed-mock-metrics` — Helper to populate realistic metrics for testing
* `GET /api/v1/campaigns/{id}/comparison` — **Like-for-Like Comparison** comparing identical concept adaptations side-by-side
* `POST /api/v1/campaigns/{id}/insights` — AI synthesis of evidence-backed insights citing post IDs
* `GET /api/v1/campaigns/{id}/insights` — List campaign insights
* `GET /api/v1/insights/next-brief-context` — **The Closed Loop**: Fetches past recommendations to seed the next brief
* `POST /api/v1/reports/weekly` — Generate weekly performance report citing post IDs
* `GET /api/v1/reports` — List weekly reports

---

## 7. Running Locally

```bash
cd backend
source .venv/bin/activate
# Run tests
pytest -v

# Start development server
uvicorn app.main:app --reload --port 8000
```
OpenAPI interactive documentation is available at `http://localhost:8000/docs`.

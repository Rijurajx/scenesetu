# SceneSetu Backend

AI-Native Content Operations & Intelligence Platform (hoichoi Hackathon'26 - Problem 3)

## Quick Start

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Run database migrations
alembic upgrade head

# Run automated tests
pytest -v

# Start development server
uvicorn app.main:app --reload --port 8000
```

- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`
- Readiness check: `http://localhost:8000/api/v1/ready`

Detailed architectural docs are available at `docs/backend_architecture.md`.

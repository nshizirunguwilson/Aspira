# Aspira — Public Service Feedback Platform

A civic feedback platform. Citizens report public-service issues — broken roads, water outages, healthcare gaps — and administrators triage, respond, and resolve them.

The repo is a full-stack rewrite of an earlier Python CLI prototype (preserved under [`legacy/`](./legacy)). The web platform is built per the spec in `ASPIRA_BUILD_INSTRUCTIONS.md`.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 · TypeScript · Tailwind CSS v3 · Framer Motion · Recharts · Zustand · React Hook Form + Zod |
| Backend  | FastAPI · async SQLAlchemy 2.0 · Alembic · python-jose (JWT) · passlib (bcrypt) |
| Database | MySQL 8.0 (Aiven) |
| Files    | Cloudinary (direct browser upload) |
| Email    | Brevo (transactional) |
| Infra    | Vercel (frontend) · AWS EC2 + Docker Compose + Nginx (backend) |

## Repository layout

```
aspira/
├── frontend/    Next.js 15 app
├── backend/     FastAPI app + Alembic migrations
├── legacy/      Original Python CLI prototype (reference only)
└── README.md
```

Each app has its own README with setup steps and its own `.env.example`.

## Getting started

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in DATABASE_URL, JWT_SECRET_KEY, …
uvicorn app.main:app --reload         # http://localhost:8000

# Frontend (in a second terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev                           # http://localhost:3000
```

## Build phases

The rewrite is shipped in five phases, each ending in something verifiable:

1. **Foundation** — repo restructure, FastAPI + Next.js scaffolds, design tokens, env config _(current)_
2. **Database + auth** — Alembic migrations from the legacy schema, JWT auth, citizen + admin login/register end-to-end
3. **Citizen pages** — landing/public board, register, login, dashboard, submit, feedback detail
4. **Admin pages** — dashboard with analytics, feedback management, respond
5. **Integrations + deploy** — Cloudinary uploads, Brevo emails, Docker Compose, Nginx, deploy

## License

Proprietary — internal project.

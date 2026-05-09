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
python3.12 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill DATABASE_URL, JWT_SECRET_KEY, Cloudinary, Brevo
alembic upgrade head                  # apply migrations
python -m scripts.create_admin        # seed an initial admin user
uvicorn app.main:app --reload         # http://localhost:8000

# Frontend (in a second terminal)
cd frontend
npm install
cp .env.example .env.local            # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                           # http://localhost:3000
```

## Pages

| Route | Auth | Purpose |
|---|---|---|
| `/` | public | Landing + public feedback board with filters / sort |
| `/feedback/[id]` | public | Feedback detail with timeline and photo lightbox |
| `/login` · `/register` | public | Citizen sign-in and sign-up |
| `/dashboard` | citizen | Citizen's own submissions |
| `/submit` | citizen | Three-step submit flow with Cloudinary uploads |
| `/admin-login` | public | Admin sign-in |
| `/admin` | admin | Dashboard with stats and Recharts analytics |
| `/admin/feedback` | admin | Feedback management table + CSV export |
| `/admin/feedback/[id]` | admin | Respond — status updates and comments |

## API endpoints

24 endpoints under `/api/`. Interactive docs at `/api/docs` (Swagger UI). Key ones:

```
POST  /api/auth/citizen/{register,login}    POST /api/auth/admin/login
POST  /api/auth/{logout,refresh}            GET  /api/auth/me
GET   /api/feedback                         POST /api/feedback
GET   /api/feedback/{id}                    POST /api/feedback/{id}/upvote
GET   /api/feedback/citizen/mine            GET  /api/services
GET   /api/admin/{stats,activity,feedback}  GET  /api/admin/feedback/export
GET   /api/admin/feedback/{id}              PATCH /api/admin/feedback/{id}/status
POST  /api/admin/feedback/{id}/comment
```

## Build phases — all complete

1. **Foundation** — repo restructure, FastAPI + Next.js scaffolds, design tokens, env config
2. **Database + auth** — Alembic migrations, ORM models, JWT auth with HTTP-only cookies, bcrypt, SlowAPI rate-limits
3. **Citizen pages** — landing/board, register, login, dashboard, 3-step submit, feedback detail with timeline
4. **Admin pages** — sidebar layout, analytics dashboard with Recharts, feedback table, respond page with status updates
5. **Integrations + deploy** — Cloudinary direct uploads, Brevo emails (welcome / submit / status-change), Docker Compose, Nginx with TLS
6. **Polish** — admin seed CLI, 401 auto-redirect with `?redirect=` round-trip, photo lightbox, celebration empty state, 404 / error pages

## License

Proprietary — internal project.

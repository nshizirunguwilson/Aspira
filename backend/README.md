# Aspira Backend

FastAPI service for the Aspira public-service feedback platform.

## Stack

- **FastAPI** + Uvicorn
- **SQLAlchemy 2.0** (async) + **aiomysql**
- **Alembic** for schema migrations
- **passlib[bcrypt]** + **python-jose** for auth
- **Cloudinary** for file storage (direct browser upload)
- **Brevo** for transactional email

## Getting started

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET_KEY, Cloudinary, Brevo
uvicorn app.main:app --reload
```

The API is then available at `http://localhost:8000`. Interactive docs at `/api/docs`.

## Layout

```
app/
  main.py        FastAPI app + CORS + router mounts
  config.py      Pydantic settings loaded from .env
  database.py    Async engine + session + Base
  models/        SQLAlchemy ORM models
  schemas/       Pydantic request/response schemas
  routers/       Domain routers (auth, citizen, admin, feedback, services)
  services/      Business logic
  middleware/    Auth + rate-limiting middleware
  utils/         Email + upload helpers
alembic/         Schema migrations
```

## Deployment (EC2 + Docker Compose + Nginx)

The repo ships everything needed to run the backend behind Nginx with a Let's Encrypt certificate.

```bash
# On the EC2 host
cd /opt/aspira/backend
cp .env.example .env   # then fill in real values
docker compose up -d --build
```

Nginx terminates TLS at `api.aspira.wilsonn.tech` and proxies to the FastAPI container on `127.0.0.1:8000`. The certificate path follows Certbot's default layout under `/etc/letsencrypt/live/`. Renewal is handled by host-level certbot — Nginx reloads when the renewal hook fires.

`nginx.conf` disables proxy buffering so streaming responses (the `/api/admin/feedback/export` CSV) reach the client as they're generated.

## Migrations on the live database

```bash
# Inside the api container
docker compose exec aspira-api alembic upgrade head
```

Migrations live in `alembic/versions/`. See `alembic/README.md` for the standard create/apply/rollback cycle.

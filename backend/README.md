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

## Phase status

Currently **phase 1 (scaffold only)**. Routers return stubs; models, schemas, and business logic land in phase 2.

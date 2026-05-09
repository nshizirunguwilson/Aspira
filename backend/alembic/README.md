# Alembic Migrations

Schema migrations for the Aspira MySQL database. Models live in `app/models/`; revisions live in `alembic/versions/`.

## Common commands

```bash
# Generate a new revision from current model diff
alembic revision --autogenerate -m "describe the change"

# Apply migrations up to head
alembic upgrade head

# Roll back one revision
alembic downgrade -1
```

Run all commands from the `backend/` directory with the virtualenv active.

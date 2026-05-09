"""Create or update an Aspira admin account.

Usage (from backend/ with the venv active and .env populated):

    python -m scripts.create_admin

By default the script prompts for username, email, password, and role
('super_admin' or 'service_admin'). To run non-interactively for CI or
deployment scripts, pass values via env vars:

    ASPIRA_ADMIN_USERNAME=op \\
    ASPIRA_ADMIN_EMAIL=op@aspira.example \\
    ASPIRA_ADMIN_PASSWORD=correct-horse-battery-staple \\
    ASPIRA_ADMIN_ROLE=super_admin \\
    python -m scripts.create_admin

If a row with the chosen username or email already exists the script
updates the password (and role) on that row instead of inserting.
"""

from __future__ import annotations

import asyncio
import getpass
import os
import sys
from typing import Literal

from sqlalchemy import or_, select

from app.database import AsyncSessionLocal
from app.models.admin import Admin, AdminRole
from app.utils.security import hash_password

VALID_ROLES = {"super_admin", "service_admin"}


def _prompt(label: str, *, env: str, secret: bool = False) -> str:
    value = os.environ.get(env)
    if value:
        return value
    while True:
        raw = (getpass.getpass if secret else input)(f"{label}: ").strip()
        if raw:
            return raw
        print("Required. Try again.", file=sys.stderr)


async def main() -> int:
    username = _prompt("Admin username", env="ASPIRA_ADMIN_USERNAME")
    email = _prompt("Admin email", env="ASPIRA_ADMIN_EMAIL")
    password = _prompt(
        "Admin password (min 12 chars recommended)",
        env="ASPIRA_ADMIN_PASSWORD",
        secret=True,
    )
    role_raw = (
        os.environ.get("ASPIRA_ADMIN_ROLE")
        or input("Role [super_admin / service_admin] (default super_admin): ").strip()
        or "super_admin"
    ).lower()
    if role_raw not in VALID_ROLES:
        print(f"role must be one of {sorted(VALID_ROLES)}", file=sys.stderr)
        return 2

    role: Literal["super_admin", "service_admin"] = role_raw  # type: ignore[assignment]
    hashed = hash_password(password)

    async with AsyncSessionLocal() as session:
        existing = await session.execute(
            select(Admin).where(or_(Admin.username == username, Admin.email == email))
        )
        admin = existing.scalar_one_or_none()
        if admin is None:
            admin = Admin(
                username=username,
                email=email,
                password=hashed,
                role=AdminRole(role),
            )
            session.add(admin)
            await session.commit()
            await session.refresh(admin)
            print(f"Created admin id={admin.adminId} username={admin.username}")
        else:
            admin.password = hashed
            admin.username = username
            admin.email = email
            admin.role = AdminRole(role)
            await session.commit()
            print(f"Updated admin id={admin.adminId} username={admin.username}")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))

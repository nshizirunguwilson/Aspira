#!/usr/bin/env python3
"""
create_admin.py

Create or update an admin user in the `admin` table.
Usage:
    python3 create_admin.py

The script will insert an admin with username `wilson` and password `@Wilson.01`.
If the username already exists the script will update the password.
"""

import os
import sys
import hashlib
from mysql.connector import connect, Error

# Add src/app to sys.path so we can import config.py
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', 'src', 'app'))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

try:
    from config import DB_CONFIG
except Exception as e:
    print(f"Failed to import DB config: {e}")
    sys.exit(1)

USERNAME = 'wilson'
PASSWORD = '@Wilson.01'


def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def create_or_update_admin():
    hashed = hash_password(PASSWORD)
    try:
        conn = connect(**DB_CONFIG)
        cursor = conn.cursor(buffered=True)

        # Check if username exists
        cursor.execute("SELECT adminId FROM admin WHERE username = %s", (USERNAME,))
        row = cursor.fetchone()

        if row:
            admin_id = row[0]
            cursor.execute("UPDATE admin SET password = %s WHERE adminId = %s", (hashed, admin_id))
            conn.commit()
            print(f"Admin '{USERNAME}' already existed. Password updated (adminId={admin_id}).")
        else:
            cursor.execute("INSERT INTO admin (username, password) VALUES (%s, %s)", (USERNAME, hashed))
            conn.commit()
            print(f"Admin '{USERNAME}' created successfully. adminId={cursor.lastrowid}")

        try:
            cursor.close()
        except Exception:
            pass
        try:
            conn.close()
        except Exception:
            pass

    except Error as e:
        print(f"Database error: {e}")
        return 1
    except Exception as e:
        print(f"Unexpected error: {e}")
        return 2
    return 0


if __name__ == '__main__':
    exit(create_or_update_admin())

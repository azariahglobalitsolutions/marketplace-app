import os
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

import bcrypt
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv("DATABASE_PATH", str(Path(__file__).resolve().parents[2] / "data" / "events.db"))
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def query_get(sql, params=()):
    with get_connection() as conn:
        row = conn.execute(sql, params).fetchone()
        return dict(row) if row else None


def query_all(sql, params=()):
    with get_connection() as conn:
        rows = conn.execute(sql, params).fetchall()
        return [dict(row) for row in rows]


def query_run(sql, params=()):
    with get_connection() as conn:
        cursor = conn.execute(sql, params)
        conn.commit()
        return cursor.lastrowid


def init_schema():
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE,
              phone TEXT,
              password_hash TEXT NOT NULL,
              role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
              created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS events (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              description TEXT NOT NULL,
              state TEXT NOT NULL,
              city TEXT NOT NULL,
              venue TEXT,
              event_date TEXT NOT NULL,
              start_time TEXT,
              end_time TEXT,
              organizer_id INTEGER NOT NULL,
              contact_email TEXT,
              contact_phone TEXT,
              status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
              created_at TEXT NOT NULL DEFAULT (datetime('now')),
              FOREIGN KEY (organizer_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS ad_inquiries (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT NOT NULL,
              phone TEXT,
              tier TEXT NOT NULL,
              message TEXT,
              created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_events_state ON events(state);
            CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
            CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
            """
        )


def seed_admin():
    existing = query_get("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    if existing:
        return

    password_hash = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode()
    query_run(
        "INSERT INTO users (email, phone, password_hash, role) VALUES (?, ?, ?, 'admin')",
        ("admin@habeshaevents.com", None, password_hash),
    )


def seed_sample_events():
    count = query_get("SELECT COUNT(*) AS c FROM events")["c"]
    if count > 0:
        return

    admin = query_get("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    if not admin:
        return

    today = datetime.utcnow().date()
    day1 = today.isoformat()
    day2 = (today + timedelta(days=1)).isoformat()
    day3 = (today + timedelta(days=2)).isoformat()

    samples = [
        ("Habesha New Year Celebration", "Join us for traditional food, music, and dance celebrating Enkutatash.", "Virginia", "Arlington", "Community Center Hall", day1, "18:00"),
        ("Ethiopian Coffee Ceremony & Networking", "An afternoon of bunna, conversation, and community connections.", "Maryland", "Silver Spring", "Habesha Cafe", day1, "14:00"),
        ("Tigrinya Poetry Night", "Local poets share original works in Tigrinya and Amharic.", "Texas", "Dallas", "Cultural Arts Center", day2, "19:30"),
        ("Eritrean Independence Day Gala", "Annual gala with live bands, cultural performances, and dinner.", "Virginia", "Alexandria", "Grand Ballroom", day2, "17:00"),
        ("Habesha Sports Tournament", "Soccer and volleyball tournament open to all ages.", "Georgia", "Atlanta", "Piedmont Park", day3, "09:00"),
        ("Amharic Language Workshop", "Beginner-friendly Amharic language class for kids and adults.", "California", "Los Angeles", "LA Community Library", day3, "11:00"),
    ]

    for title, desc, state, city, venue, date, start in samples:
        query_run(
            """INSERT INTO events (
              title, description, state, city, venue, event_date, start_time,
              organizer_id, contact_email, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')""",
            (title, desc, state, city, venue, date, start, admin["id"], "events@habeshaevents.com"),
        )


init_schema()
seed_admin()
seed_sample_events()

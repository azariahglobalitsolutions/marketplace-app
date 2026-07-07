import os
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

import bcrypt
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv("DATABASE_PATH", str(Path(__file__).resolve().parents[2] / "data" / "events.db"))
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)

CATEGORIES = {
    "events": "Habesha Event & Activities",
    "restaurants": "Restaurants and Lounge",
    "health": "Health and Wellness",
    "education": "Education and Training",
    "communities": "Communities and Networking",
}


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

            CREATE TABLE IF NOT EXISTS listings (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              category TEXT NOT NULL CHECK(category IN (
                'events', 'restaurants', 'health', 'education', 'communities'
              )),
              title TEXT NOT NULL,
              description TEXT NOT NULL,
              state TEXT NOT NULL,
              city TEXT NOT NULL,
              venue TEXT,
              event_date TEXT,
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

            CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
            CREATE INDEX IF NOT EXISTS idx_listings_state ON listings(state);
            CREATE INDEX IF NOT EXISTS idx_listings_date ON listings(event_date);
            CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
            """
        )


def migrate_events_to_listings():
    with get_connection() as conn:
        tables = [r[0] for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='events'"
        ).fetchall()]
        if not tables:
            return

        count = conn.execute("SELECT COUNT(*) FROM listings").fetchone()[0]
        if count > 0:
            return

        conn.execute(
            """INSERT INTO listings (
              category, title, description, state, city, venue, event_date,
              start_time, end_time, organizer_id, contact_email, contact_phone,
              status, created_at
            )
            SELECT 'events', title, description, state, city, venue, event_date,
              start_time, end_time, organizer_id, contact_email, contact_phone,
              status, created_at
            FROM events"""
        )
        conn.commit()


def seed_admin():
    existing = query_get("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    if existing:
        return

    password_hash = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode()
    query_run(
        "INSERT INTO users (email, phone, password_hash, role) VALUES (?, ?, ?, 'admin')",
        ("admin@habeshaevents.com", None, password_hash),
    )


def seed_sample_listings():
    if query_get("SELECT COUNT(*) AS c FROM listings")["c"] > 0:
        return

    admin = query_get("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    if not admin:
        return

    today = datetime.utcnow().date()
    day1 = today.isoformat()
    day2 = (today + timedelta(days=1)).isoformat()
    day3 = (today + timedelta(days=2)).isoformat()
    oid = admin["id"]
    contact = "info@wubebereha.com"

    samples = [
        ("events", "Habesha New Year Celebration", "Traditional food, music, and dance celebrating Enkutatash.", "Virginia", "Arlington", "Community Center Hall", day1, "18:00"),
        ("events", "Ethiopian Coffee Ceremony", "An afternoon of bunna, conversation, and community connections.", "Maryland", "Silver Spring", "Habesha Cafe", day1, "14:00"),
        ("events", "Tigrinya Poetry Night", "Local poets share original works in Tigrinya and Amharic.", "Texas", "Dallas", "Cultural Arts Center", day2, "19:30"),
        ("events", "Eritrean Independence Day Gala", "Annual gala with live bands and cultural performances.", "Virginia", "Alexandria", "Grand Ballroom", day2, "17:00"),
        ("restaurants", "Habesha Kitchen & Lounge", "Authentic injera, tibs, kitfo, and weekend live music.", "Virginia", "Falls Church", "123 Columbia Pike", None, None),
        ("restaurants", "Addis Ababa Restaurant", "Family-owned Ethiopian restaurant with vegetarian platters.", "Georgia", "Atlanta", "Buford Highway", None, None),
        ("restaurants", "Bunna Cafe & Lounge", "Coffee ceremony, pastries, and cozy evening lounge.", "Maryland", "Silver Spring", "Georgia Ave", None, None),
        ("health", "Habesha Wellness Clinic", "Primary care and preventive health for the Habesha community.", "Virginia", "Arlington", "Wilson Blvd", None, None),
        ("health", "Selam Mental Health Services", "Counseling and therapy with culturally sensitive providers.", "California", "Los Angeles", "Westwood", None, None),
        ("education", "Amharic Language School", "Weekend classes for children and adults — all levels.", "Virginia", "Alexandria", "Community Library", day3, "11:00"),
        ("education", "Habesha Tech Training", "Coding bootcamps and digital skills for newcomers.", "Texas", "Dallas", "Innovation Hub", None, None),
        ("communities", "DMV Habesha Professionals", "Monthly networking for engineers, nurses, and entrepreneurs.", "Maryland", "Rockville", "Community Center", None, None),
        ("communities", "Atlanta Habesha Women Network", "Support circle, mentorship, and community service projects.", "Georgia", "Atlanta", "Midtown", None, None),
    ]

    for cat, title, desc, state, city, venue, date, start in samples:
        query_run(
            """INSERT INTO listings (
              category, title, description, state, city, venue, event_date,
              start_time, organizer_id, contact_email, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')""",
            (cat, title, desc, state, city, venue, date, start, oid, contact),
        )


init_schema()
migrate_events_to_listings()
seed_admin()
seed_sample_listings()

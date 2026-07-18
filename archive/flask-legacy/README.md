# Flask legacy application (archived)

This directory preserves the original **Python/Flask + static HTML** implementation that powered Wube Bereha before the architecture migration.

**Do not run or deploy from this folder.** It is kept for reference and rollback comparison only.

## Original stack

- Flask + Gunicorn (`app.py`, `wsgi.py`)
- SQLite (`data/events.db` — local dev only, gitignored)
- Static frontend in `public/` (HTML, CSS, vanilla JS)

## Replacement

| Legacy | Current |
|--------|---------|
| `src/`, `app.py` | `backend/` — Spring Boot (Java 21, PostgreSQL) |
| `public/` | `frontend/` — Next.js (TypeScript, Tailwind, App Router) |

## Git backup branch

The full pre-migration tree is also preserved on branch `flask-backup`.

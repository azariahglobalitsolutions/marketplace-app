# Legacy Python / Flask application (archived)

This directory preserves the original **Python/Flask + static HTML** implementation.

**Do not run or deploy from this folder.** It is kept for reference only.

## Contents

- `app.py`, `wsgi.py`, `your_application/` — Flask / Gunicorn entry points
- `src/` — Routes, middleware, configuration
- `public/` — Static HTML, CSS, and JavaScript
- `requirements.txt` — Python dependencies
- `.env.example` — Flask environment variable template

## Replacement stack

| Legacy | New location |
|--------|----------------|
| `src/`, `app.py` | `backend/` — Spring Boot (Java 21, PostgreSQL) |
| `public/` | `frontend/` — Next.js (TypeScript, Tailwind) |

## Git backup

The full pre-migration repository state is also preserved on branch `flask-backup`.

# Wube Bereha

Habesha community discovery platform — migrating from Flask to **Next.js** (frontend) and **Spring Boot** (backend).

## Repository layout

| Path | Description |
|------|-------------|
| [`legacy-python/`](legacy-python/) | Archived Flask application (preserved, not deleted) |
| [`frontend/`](frontend/) | Next.js scaffold (TypeScript, Tailwind, App Router) |
| [`backend/`](backend/) | Spring Boot scaffold (Java 21, Maven) |
| [`docs/`](docs/) | Project documentation |

## Quick start (scaffolds)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Legacy Flask (reference only)

```bash
cd legacy-python
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

## Migration status

- Flask code is archived under `legacy-python/`.
- `frontend/` and `backend/` contain project structure only — business features are not implemented yet.
- A full backup of the pre-migration tree exists on the `flask-backup` branch.

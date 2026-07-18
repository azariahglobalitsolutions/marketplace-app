# Wube Bereha ውቤ በረሃ — Habesha community discovery platform

Event and directory platform for Habesha cultural events, restaurants, and community listings across the United States.

## Tech stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, App Router |
| **Backend** | Spring Boot 4, Java 21, Maven |
| **Database** | PostgreSQL (Flyway migrations) |
| **Deploy** | Render Blueprint (`render.yaml`) |

## Quick start

### Backend (Spring Boot API)

```bash
cd backend
cp .env.example .env
./mvnw spring-boot:run
```

API runs at `http://localhost:8080` — health check at `/health`.

### Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

App runs at `http://localhost:3000`.

Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` and `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `frontend/.env.local`.

## Project structure

```
├── backend/          # Spring Boot REST API
├── frontend/         # Next.js App Router UI
├── docs/             # Deployment and integration guides
├── scripts/          # Deployment verification
├── archive/          # Archived legacy code (read-only)
│   └── flask-legacy/ # Original Flask application
└── render.yaml       # Render Blueprint (PostgreSQL + API + frontend)
```

## Key routes (frontend)

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/events` | Events directory |
| `/restaurants`, `/health-wellness`, etc. | Category directories |
| `/add-listing`, `/submit-event` | Authenticated submission forms |
| `/login`, `/register` | User authentication |
| `/advertise` | Advertising inquiry |

## Admin access

Production admin accounts are not seeded in the database. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (minimum 12 characters) on the backend when no admin exists. See `backend/.env.example`.

Admin API endpoints live under `/api/admin/**` (JWT + `admin` role required). A Next.js admin UI is planned.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full Render checklist.

```bash
./scripts/verify-deployment.sh "https://<api-url>" "https://<frontend-url>"
```

## Legacy Flask application

The previous Python/Flask implementation is archived under `archive/flask-legacy/` and on git branch `flask-backup`. It is not deployed.

# Wube Bereha ውቤ በረሃ — Habesha Events in USA & Yellow Pages

Eventbrite-style web application for listing Habesha cultural events across the United States.

## Tech Stack

- **Frontend:** HTML5, Tailwind CSS, JavaScript
- **Backend:** Python + Flask
- **Database:** SQLite (modular config for future PostgreSQL migration)
- **Analytics:** prometheus-client (metrics at `/metrics`)

## Quick Start

```bash
cp .env.example .env
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open `http://localhost:5000`

## Default Admin Account

- **Email:** `admin@habeshaevents.com`
- **Password:** `admin123`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Daily events portal with state filter |
| `/login.html` | Sign up / sign in |
| `/advertise.html` | Advertising pricing & inquiry form |
| `/admin/moderation` | Admin approval dashboard |

## Access Rules

- **Public:** Browse approved events, filter by state, view daily schedules
- **Authenticated:** Create event listings, view organizer contact details
- **Admin:** Approve/reject pending events, view ad inquiries

## API Endpoints

- `GET /api/events?state=Virginia` — List approved events (strict state filter)
- `POST /api/events` — Create event (auth required, status: pending)
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/admin/pending` — Pending events (admin)
- `POST /api/admin/:id/approve` — Approve event (admin)
- `GET /api/advertise/tiers` — Pricing tiers
- `POST /api/advertise/inquiry` — Submit ad inquiry
- `GET /metrics` — Prometheus metrics
- `GET /health` — Health check

## Environment Variables

| Name | Description |
|------|-------------|
| `PORT` | Server port (default: 5000) |
| `JWT_SECRET` | Secret for JWT tokens |
| `DATABASE_PATH` | SQLite file path |
| `FLASK_ENV` | `development` or `production` |

## Render Deployment (Python)

| Setting | Value |
|---------|--------|
| **Environment** | `Python` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn wsgi:app --bind 0.0.0.0:$PORT` |
| **Branch** | `main` |

### Environment Variables on Render

| Name of Variable | Value |
|------------------|-------|
| `JWT_SECRET` | A long random secret string |

## Project Structure

```
├── app.py
├── wsgi.py
├── requirements.txt
├── public/
│   ├── index.html
│   ├── login.html
│   ├── admin.html
│   ├── advertise.html
│   └── js/
├── src/
│   ├── config/db.py
│   ├── middleware/
│   └── routes/
└── data/          (SQLite DB, gitignored)
```

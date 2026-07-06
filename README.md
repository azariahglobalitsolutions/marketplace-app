# marketplace-app

Python Flask API for the marketplace application.

## Local setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

## Environment variables

| Name | Description |
|------|-------------|
| `SECRET_KEY` | Secret key for app security |
| `PORT` | Server port (Render sets this automatically) |

## Render deployment

- **Build command:** `pip install -r requirements.txt`
- **Start command:** `gunicorn app:app --bind 0.0.0.0:$PORT`

## API endpoints

- `GET /` — API status
- `GET /health` — Health check
- `POST /api/login` — Login endpoint

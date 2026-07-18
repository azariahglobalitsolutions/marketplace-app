# Wube Bereha — Render deployment guide

This checklist matches the production stack: **PostgreSQL → Spring Boot API → Next.js frontend**, with CORS and public URLs wired through environment variables (never hard-coded Render hostnames in Java/TypeScript source).

## Prerequisites

- Render account with Blueprint deploy access
- Repository connected to Render
- Optional: custom domains and DNS access

## 1. PostgreSQL

The [`render.yaml`](../render.yaml) blueprint provisions:

| Resource | Name |
|----------|------|
| Database | `wubebereha-db` |
| Database name | `wubebereha` |
| User | `wubebereha` |

Render injects `DATABASE_URL` (`postgresql://…`) into the backend service. The API converts this to a JDBC URL at startup via `RenderDatabaseEnvironmentPostProcessor`.

**Manual alternative:** create a PostgreSQL instance in Render and attach `DATABASE_URL` to the backend web service.

## 2. Spring Boot backend

| Setting | Value |
|---------|-------|
| Service name | `wubebereha-api` |
| Root directory | `backend` |
| Build | `./mvnw clean verify` |
| Start | `java -jar target/wube-bereha-api-0.0.1-SNAPSHOT.jar` |
| Health check | `/health` (includes database connectivity) |
| Profile | `SPRING_PROFILES_ACTIVE=prod` |

Required environment variables:

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Linked PostgreSQL (`connectionString`) — user/password parsed automatically |
| `JWT_SECRET` | Auto-generated on Render |
| `JWT_EXPIRATION_HOURS` | Optional (default `24`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Set manually for first admin bootstrap (min 12 chars) |
| `FRONTEND_ALLOWED_ORIGIN` | Frontend `RENDER_EXTERNAL_URL` (see step 5) |
| `UPLOAD_DIR` | `/var/data/uploads` (persistent disk mounted in blueprint) |

## 3. Test backend health endpoint

After the backend deploy finishes:

```bash
curl -sS "https://<your-api-host>/health"
```

Expected:

```json
{"status":"healthy","service":"wube-bereha-habesha-events"}
```

Or run locally against a deployed URL:

```bash
./scripts/verify-deployment.sh "https://wubebereha-api.onrender.com" "https://wubebereha-frontend.onrender.com"
```

## 4. Next.js frontend

| Setting | Value |
|---------|-------|
| Service name | `wubebereha-frontend` |
| Root directory | `frontend` |
| Build | `npm ci && npm run build` |
| Start | `npm start` |
| Node | `20` (`NODE_VERSION`) |

Required environment variables:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Public backend URL (no trailing slash) |
| `NEXT_PUBLIC_SITE_URL` | Public frontend URL for metadata/canonical links |

## 5. Add frontend URL to backend CORS

Set on the **backend** service:

```bash
FRONTEND_ALLOWED_ORIGIN=https://<your-frontend-host>
```

The blueprint wires this automatically from the frontend service’s `RENDER_EXTERNAL_URL`. **Do not use `*`** — credentials are enabled and only one origin is allowed.

Allowed CORS policy (see `CorsConfig.java`):

- Methods: `GET`, `POST`, `OPTIONS`
- Headers: `Authorization`, `Content-Type`, `Accept`
- Credentials: `true`

## 6. Redeploy backend

After changing `FRONTEND_ALLOWED_ORIGIN` or database settings:

1. Render Dashboard → `wubebereha-api` → **Manual Deploy** → **Deploy latest commit**
2. Wait for health check `/health` to pass

## 7. Test frontend-to-backend connection

```bash
export NEXT_PUBLIC_API_BASE_URL="https://<your-api-host>"
export NEXT_PUBLIC_SITE_URL="https://<your-frontend-host>"
./scripts/verify-deployment.sh
```

Checks:

1. `GET /health`
2. `GET /api/listings/categories`
3. CORS `OPTIONS` preflight from the frontend origin
4. Frontend homepage loads

## 8. Configure custom domains

In Render, for each web service:

| Service | Example custom domain |
|---------|----------------------|
| `wubebereha-frontend` | `https://www.yourdomain.com` |
| `wubebereha-api` | `https://api.yourdomain.com` |

Add DNS records Render provides (CNAME/A). Wait for certificate provisioning.

## 9. Update production API URL

After custom domains are active, update environment variables:

**Frontend (`wubebereha-frontend`):**

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com
```

**Backend (`wubebereha-api`):**

```bash
FRONTEND_ALLOWED_ORIGIN=https://www.yourdomain.com
```

Use `https` and no trailing slash. These override the blueprint’s `fromService` values when set manually in the Render dashboard.

## 10. Redeploy frontend

Frontend embeds `NEXT_PUBLIC_*` variables at **build time**:

1. Save env var changes on Render
2. Trigger **Clear build cache & deploy** on `wubebereha-frontend`
3. Re-run `./scripts/verify-deployment.sh` with the custom domain URLs

Then redeploy the backend if you changed `FRONTEND_ALLOWED_ORIGIN` (step 6).

## One-command Blueprint deploy

1. Push this repository to GitHub
2. Render Dashboard → **New** → **Blueprint**
3. Select the repo — Render reads [`render.yaml`](../render.yaml)
4. Review services and deploy
5. Run verification script with the assigned `*.onrender.com` URLs

## Local development defaults

| Variable | Local value |
|----------|-------------|
| `FRONTEND_ALLOWED_ORIGIN` | `http://localhost:3000` |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |

See `backend/.env.example` and `frontend/.env.example`.

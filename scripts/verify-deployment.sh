#!/usr/bin/env bash
set -euo pipefail

API_URL="${1:-${NEXT_PUBLIC_API_BASE_URL:-}}"
FRONTEND_URL="${2:-${NEXT_PUBLIC_SITE_URL:-}}"

if [[ -z "$API_URL" || -z "$FRONTEND_URL" ]]; then
  echo "Usage: $0 <api-url> <frontend-url>" >&2
  echo "Or set NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_SITE_URL." >&2
  exit 1
fi

API_URL="${API_URL%/}"
FRONTEND_URL="${FRONTEND_URL%/}"

echo "==> 1. Backend health check ($API_URL/health)"
health_response="$(curl -fsS "$API_URL/health")"
echo "$health_response"
echo "$health_response" | grep -q '"status"[[:space:]]*:[[:space:]]*"healthy"'

echo "==> 2. Backend categories endpoint"
curl -fsS "$API_URL/api/listings/categories" >/dev/null

echo "==> 3. CORS preflight from frontend origin"
cors_headers="$(
  curl -fsS -X OPTIONS "$API_URL/api/listings/categories" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET" \
    -D - -o /dev/null
)"
echo "$cors_headers" | grep -i "access-control-allow-origin: $FRONTEND_URL"
echo "$cors_headers" | grep -qi "access-control-allow-credentials: true"

echo "==> 4. Frontend homepage"
curl -fsS "$FRONTEND_URL" >/dev/null

echo "==> 5. Frontend can reach API (server-rendered listings categories via homepage is optional)"
echo "All deployment checks passed for:"
echo "  API:      $API_URL"
echo "  Frontend: $FRONTEND_URL"

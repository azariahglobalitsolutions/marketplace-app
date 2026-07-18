# Wube Bereha Spring Boot API

REST API for the Wube Bereha Habesha community discovery platform.

## Stack

- Java 21
- Spring Boot 4
- PostgreSQL
- Flyway migrations
- JWT authentication

## Environment variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `8080`) |
| `JWT_SECRET` | JWT signing secret |
| `DATABASE_URL` | PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | Database username |
| `DATABASE_PASSWORD` | Database password |
| `UPLOAD_DIR` | Upload storage directory (default `../public/uploads`) |
| `FRONTEND_ALLOWED_ORIGIN` | Allowed browser origin for CORS with credentials. Use `http://localhost:3000` in development and your deployed Render frontend URL in production. |

## CORS

Cross-origin requests from the Next.js frontend are allowed only from `FRONTEND_ALLOWED_ORIGIN`. Credentials (`Authorization` cookies/headers) are enabled, so wildcard origins are not used.

Allowed methods: `GET`, `POST`, `OPTIONS`.  
Allowed headers: `Authorization`, `Content-Type`, `Accept`.

## Commands

```bash
./mvnw test
./mvnw clean package
java -jar target/wube-bereha-api-0.0.1-SNAPSHOT.jar
```

## API

Preserves the existing Flask REST contracts under `/api/*`, plus `/health` and `/metrics`.

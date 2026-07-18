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

## Commands

```bash
./mvnw test
./mvnw clean package
java -jar target/wube-bereha-api-0.0.1-SNAPSHOT.jar
```

## API

Preserves the existing Flask REST contracts under `/api/*`, plus `/health` and `/metrics`.

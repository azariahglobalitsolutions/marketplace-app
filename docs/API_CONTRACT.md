# Wube Bereha API Contract

Frontend-facing REST API served by the Spring Boot application in `backend/`.

**Source of truth:** `backend/src/main/java/com/wubebereha/api/web/controller/` and `backend/src/main/java/com/wubebereha/api/web/dto/Dto.java`.

**Default base URL (local):** `http://localhost:8080`

**Content type:** JSON unless noted (`Content-Type: application/json`).

**Null fields:** Omitted from JSON responses (`@JsonInclude(NON_NULL)`).

---

## Table of contents

1. [Authentication](#authentication)
2. [Authorization roles](#authorization-roles)
3. [Error responses](#error-responses)
4. [Pagination](#pagination)
5. [Shared schemas](#shared-schemas)
6. [System endpoints](#system-endpoints)
7. [Auth endpoints](#auth-endpoints)
8. [Listing endpoints](#listing-endpoints)
9. [Event endpoints](#event-endpoints)
10. [Advertise endpoints](#advertise-endpoints)
11. [Admin endpoints](#admin-endpoints)
12. [Static uploads](#static-uploads)
13. [Missing endpoints](#missing-endpoints)

---

## Authentication

Protected endpoints expect a JWT in the `Authorization` header:

```http
Authorization: Bearer <token>
```

Tokens are returned by `POST /api/auth/register` and `POST /api/auth/login`.

JWT claims (HS256, secret from `JWT_SECRET` / `wubebereha.jwt-secret`):

| Claim   | Type   | Description              |
|---------|--------|--------------------------|
| `id`    | number | User ID                  |
| `email` | string | User email (may be null) |
| `phone` | string | Normalized phone         |
| `role`  | string | `user` or `admin`        |

**Notes:**

- Tokens are stateless; there is no server-side logout or refresh endpoint.
- Invalid or expired tokens are ignored by the filter; the request continues unauthenticated.
- Optional-auth endpoints work without a token; contact fields are included only when a valid token is present.

---

## Authorization roles

| Role    | Value in JWT / `user.role` | Description                          |
|---------|----------------------------|--------------------------------------|
| User    | `user`                     | Default role; can create listings    |
| Admin   | `admin`                    | Can access `/api/admin/**` endpoints |

Spring Security enforces `admin` as `ROLE_admin` for `/api/admin/**`.

---

## Error responses

### Application errors (`ResponseStatusException`)

Handled by `GlobalExceptionHandler`. Body:

```json
{
  "error": "Human-readable message"
}
```

| HTTP status | Typical `error` messages |
|-------------|--------------------------|
| `400`       | Validation failures (see per-endpoint tables) |
| `401`       | `Authentication required`, `Invalid credentials` |
| `403`       | Spring Security denial (no/invalid token on protected route, or non-admin on admin routes) |
| `404`       | `Listing not found`, `User not found` |
| `409`       | `Account already exists with this email or phone` |
| `500`       | `Failed to save upload` |

### Unhandled errors

Exceptions not mapped to `ResponseStatusException` use Spring Boot’s default error payload (not the `{ "error": "..." }` shape). Clients should treat non-2xx responses as failures.

### Validation style

There is no Bean Validation (`@Valid`) layer. Required fields and business rules are checked in service code and return `400` with a single `error` string.

---

## Pagination

**Not implemented.** List endpoints return full result sets. There are no `page`, `limit`, `offset`, or cursor query parameters.

---

## Shared schemas

### `UserResponse`

| Field            | Type   | Notes                          |
|------------------|--------|--------------------------------|
| `id`             | number |                                |
| `email`          | string |                                |
| `phone`          | string | Display-formatted when present |
| `phone_country`  | string | ISO country code, default `US` |
| `role`           | string | `user` or `admin`              |

### `ListingResponse`

| Field                   | Type   | Notes |
|-------------------------|--------|-------|
| `id`                    | number |       |
| `category`              | string | `events`, `restaurants`, `health`, `education`, `communities` |
| `title`                 | string |       |
| `description`           | string |       |
| `state`                 | string | Full US state name |
| `city`                  | string |       |
| `venue`                 | string |       |
| `event_date`            | string | `YYYY-MM-DD`; events only |
| `start_time`            | string | Opaque string (e.g. `18:00`) |
| `end_time`              | string |       |
| `image_url`             | string | Path under `/uploads/...` |
| `logo_url`              | string |       |
| `attachment_url`        | string |       |
| `attachment_name`       | string |       |
| `contact_phone_country` | string | Always present |
| `status`                | string | `pending`, `approved`, `rejected` |
| `created_at`            | string | ISO-8601 instant |
| `contact_email`         | string | **Only when caller is authenticated** |
| `contact_phone`         | string | Display format; auth only |
| `contact_phone_tel`     | string | `tel:` link; auth only |

### Valid listing categories

| `id`           | `label`                         |
|----------------|---------------------------------|
| `events`       | Habesha Event & Activities      |
| `restaurants`  | Restaurants and Lounge          |
| `health`       | Health and Wellness             |
| `education`    | Education and Training          |
| `communities`  | Communities and Networking      |

---

## System endpoints

### `GET /health`

| | |
|---|---|
| **Authentication** | None |
| **Authorization role** | Public |

**Query parameters:** none  
**Path parameters:** none  
**Request body:** none

**Response `200`:**

```json
{
  "status": "healthy",
  "service": "wube-bereha-habesha-events"
}
```

---

### `GET /metrics`

| | |
|---|---|
| **Authentication** | None |
| **Authorization role** | Public |
| **Response content type** | `text/plain` (Prometheus scrape format) |

**Query parameters:** none  
**Path parameters:** none  
**Request body:** none

**Response `200`:** Prometheus text metrics, or an empty body if the registry is unavailable.

**Example response:**

```text
# HELP jvm_memory_used_bytes The amount of used memory
# TYPE jvm_memory_used_bytes gauge
jvm_memory_used_bytes{area="heap",id="G1 Eden Space",} 1.2345678E7
```

---

## Auth endpoints

Base path: `/api/auth`

### `POST /api/auth/register`

| | |
|---|---|
| **Authentication** | None |
| **Authorization role** | Public |
| **Success status** | `201 Created` |

**Query parameters:** none  
**Path parameters:** none

**Request body (`AuthRequest`):**

| Field            | Type   | Required | Notes |
|------------------|--------|----------|-------|
| `email`          | string | One of email or phone | |
| `phone`          | string | One of email or phone | Normalized server-side |
| `phone_country`  | string | No | Default `US` |
| `password`       | string | Yes | Min length 6 |

**Response body (`AuthResponse`):**

| Field   | Type           |
|---------|----------------|
| `token` | string         |
| `user`  | `UserResponse` |

**Validation errors (`400`):**

- `Email or phone and password are required`
- `Password must be at least 6 characters`

**Other errors:**

- `409` — `Account already exists with this email or phone`

**Example response (`201`):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 2,
    "email": "tester@example.com",
    "phone": null,
    "phone_country": "US",
    "role": "user"
  }
}
```

---

### `POST /api/auth/login`

| | |
|---|---|
| **Authentication** | None |
| **Authorization role** | Public |
| **Success status** | `200 OK` |

**Query parameters:** none  
**Path parameters:** none

**Request body:** Same as [register](#post-apiauthregister).

**Response body:** Same `AuthResponse` as register.

**Validation errors (`400`):** Same as register.

**Other errors:**

- `401` — `Invalid credentials`

**Example response (`200`):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 2,
    "email": "tester@example.com",
    "phone": null,
    "phone_country": "US",
    "role": "user"
  }
}
```

---

### `GET /api/auth/me`

| | |
|---|---|
| **Authentication** | Required (`Bearer` JWT) |
| **Authorization role** | Any authenticated user (`user` or `admin`) |

**Query parameters:** none  
**Path parameters:** none  
**Request body:** none

**Response body (`MeResponse`):**

```json
{
  "user": { /* UserResponse */ }
}
```

**Errors:**

- `401` — `Authentication required` (no/invalid token)
- `404` — `User not found`

**Example response (`200`):**

```json
{
  "user": {
    "id": 2,
    "email": "tester@example.com",
    "phone": "+1 555-123-4567",
    "phone_country": "US",
    "role": "user"
  }
}
```

---

## Listing endpoints

Base path: `/api/listings`

### `GET /api/listings`

| | |
|---|---|
| **Authentication** | Optional (`Bearer` JWT) |
| **Authorization role** | Public (contact fields gated by auth) |

**Query parameters:**

| Name       | Required | Default   | Description |
|------------|----------|-----------|-------------|
| `category` | No       | `events`  | One of the [valid categories](#valid-listing-categories) |
| `state`    | No       | —         | Full US state name filter |

**Path parameters:** none  
**Request body:** none

**Response body (`ListingsResponse`):**

| Field       | Type                              | Description |
|-------------|-----------------------------------|-------------|
| `listings`  | `ListingResponse[]`               | Flat list (approved only) |
| `grouped`   | `Record<string, ListingResponse[]>` | Events: keyed by `event_date` or `"Unscheduled"`; other categories: `{ "all": [...] }` |
| `category`  | string                            | Echo of query param |
| `state`     | string                            | Echo of query param (may be null) |

**Validation errors (`400`):**

- `Invalid category`

**Example response (`200`) — events, unauthenticated:**

```json
{
  "listings": [
    {
      "id": 1,
      "category": "events",
      "title": "Ethiopian New Year Celebration",
      "description": "Community gathering with music and food.",
      "state": "Maryland",
      "city": "Silver Spring",
      "venue": "Community Center",
      "event_date": "2026-09-11",
      "start_time": "18:00",
      "end_time": "22:00",
      "image_url": "/uploads/picture_abc123_banner.jpg",
      "contact_phone_country": "US",
      "status": "approved",
      "created_at": "2026-07-01T12:00:00Z"
    }
  ],
  "grouped": {
    "2026-09-11": [
      { "id": 1, "category": "events", "title": "Ethiopian New Year Celebration" }
    ]
  },
  "category": "events",
  "state": null
}
```

---

### `GET /api/listings/categories`

| | |
|---|---|
| **Authentication** | None |
| **Authorization role** | Public |

**Query parameters:** none  
**Path parameters:** none  
**Request body:** none

**Response body (`CategoriesResponse`):**

```json
{
  "categories": [
    { "id": "events", "label": "Habesha Event & Activities" },
    { "id": "restaurants", "label": "Restaurants and Lounge" },
    { "id": "health", "label": "Health and Wellness" },
    { "id": "education", "label": "Education and Training" },
    { "id": "communities", "label": "Communities and Networking" }
  ]
}
```

---

### `GET /api/listings/states`

| | |
|---|---|
| **Authentication** | None |
| **Authorization role** | Public |

**Query parameters:** none  
**Path parameters:** none  
**Request body:** none

**Response body (`StatesResponse`):**

```json
{
  "states": [
    "Alabama",
    "Alaska",
    "Arizona",
    "Wyoming"
  ]
}
```

(Full list: all 50 US state names; see `CategoryCatalog.US_STATES` in the backend.)

---

### `GET /api/listings/my`

| | |
|---|---|
| **Authentication** | Required (`Bearer` JWT) |
| **Authorization role** | Any authenticated user |

**Query parameters:** none  
**Path parameters:** none  
**Request body:** none

**Response body:**

```json
{
  "listings": [ /* ListingResponse[] — all statuses, contact included */ ]
}
```

**Errors:**

- `401` — `Authentication required`

**Example response (`200`):**

```json
{
  "listings": [
    {
      "id": 5,
      "category": "restaurants",
      "title": "Habesha Kitchen",
      "description": "Traditional injera and wot.",
      "state": "Virginia",
      "city": "Arlington",
      "status": "pending",
      "contact_email": "owner@example.com",
      "contact_phone": "+1 703-555-0100",
      "contact_phone_tel": "+17035550100",
      "contact_phone_country": "US",
      "created_at": "2026-07-10T08:30:00Z"
    }
  ]
}
```

---

### `GET /api/listings/{listingId}`

| | |
|---|---|
| **Authentication** | Optional (`Bearer` JWT) |
| **Authorization role** | Public for approved listings; owner or `admin` for pending/rejected |

**Path parameters:**

| Name        | Type   | Description |
|-------------|--------|-------------|
| `listingId` | number | Listing ID |

**Query parameters:** none  
**Request body:** none

**Response body (`ListingDetailResponse`):**

```json
{
  "listing": { /* ListingResponse */ }
}
```

**Errors:**

- `404` — `Listing not found` (unknown ID, or non-approved listing without permission)

**Example response (`200`):**

```json
{
  "listing": {
    "id": 1,
    "category": "events",
    "title": "Ethiopian New Year Celebration",
    "description": "Community gathering with music and food.",
    "state": "Maryland",
    "city": "Silver Spring",
    "venue": "Community Center",
    "event_date": "2026-09-11",
    "start_time": "18:00",
    "end_time": "22:00",
    "status": "approved",
    "created_at": "2026-07-01T12:00:00Z",
    "contact_phone_country": "US"
  }
}
```

---

### `POST /api/listings`

| | |
|---|---|
| **Authentication** | Required (`Bearer` JWT) |
| **Authorization role** | Any authenticated user |
| **Success status** | `201 Created` |

Supports **two content types** (separate handler mappings):

#### JSON (`Content-Type: application/json`)

**Request body fields:**

| Field                   | Type   | Required | Notes |
|-------------------------|--------|----------|-------|
| `category`              | string | No | Default `events` |
| `title`                 | string | Yes | |
| `description`           | string | Yes | |
| `state`                 | string | Yes | Full US state name |
| `city`                  | string | Yes | |
| `venue`                 | string | No | |
| `event_date`            | string | Yes for `events` | `YYYY-MM-DD` |
| `start_time`            | string | No | |
| `end_time`              | string | No | |
| `contact_email`         | string | No | Defaults to organizer email |
| `contact_phone`         | string | No | Defaults to organizer phone |
| `contact_phone_country` | string | No | Defaults to organizer country |

File uploads are **not** supported in JSON mode (`image_url` / `logo_url` / `attachment_url` will be null).

#### Multipart (`Content-Type: multipart/form-data`)

Same fields as JSON, sent as form parts. File parts:

| Part name    | Type | Allowed extensions | Max size |
|--------------|------|--------------------|----------|
| `picture`    | file | jpg, jpeg, png, gif, webp | 5 MB |
| `logo`       | file | jpg, jpeg, png, gif, webp | 5 MB |
| `attachment` | file | jpg, jpeg, png, gif, webp, pdf, doc, docx | 5 MB |

**Response body (`CreateListingResponse`):**

```json
{
  "message": "Listing submitted for admin approval",
  "listing": { /* ListingResponse, status: pending */ }
}
```

**Validation errors (`400`):**

- `Invalid category`
- `Title, description, state, and city are required`
- `Invalid US state`
- `Event date is required for events`
- `File type .<ext> is not allowed`
- `File must be 5 MB or smaller`

**Other errors:**

- `401` — `Authentication required`

**Example response (`201`):**

```json
{
  "message": "Listing submitted for admin approval",
  "listing": {
    "id": 6,
    "category": "restaurants",
    "title": "Habesha Kitchen",
    "description": "Traditional injera and wot.",
    "state": "Virginia",
    "city": "Arlington",
    "status": "pending",
    "contact_email": "owner@example.com",
    "contact_phone": "+1 703-555-0100",
    "contact_phone_tel": "+17035550100",
    "contact_phone_country": "US",
    "created_at": "2026-07-10T08:30:00Z"
  }
}
```

---

## Event endpoints

Base path: `/api/events`  
Events are listings with `category: "events"`. `GET` and `POST` here are convenience aliases over listing behavior.

### `GET /api/events`

| | |
|---|---|
| **Authentication** | Optional (`Bearer` JWT) |
| **Authorization role** | Public |

**Query parameters:**

| Name    | Required | Description |
|---------|----------|-------------|
| `state` | No       | Full US state name filter |

**Path parameters:** none  
**Request body:** none

**Response body (`EventsResponse`):**

| Field     | Type                              |
|-----------|-----------------------------------|
| `events`  | `ListingResponse[]`               |
| `grouped` | `Record<string, ListingResponse[]>` |
| `state`   | string \| null                    |

**Example response (`200`):**

```json
{
  "events": [
    {
      "id": 1,
      "category": "events",
      "title": "Ethiopian New Year Celebration",
      "state": "Maryland",
      "city": "Silver Spring",
      "event_date": "2026-09-11",
      "status": "approved",
      "created_at": "2026-07-01T12:00:00Z",
      "contact_phone_country": "US"
    }
  ],
  "grouped": {
    "2026-09-11": [
      { "id": 1, "title": "Ethiopian New Year Celebration" }
    ]
  },
  "state": null
}
```

---

### `GET /api/events/states`

| | |
|---|---|
| **Authentication** | Required (`Bearer` JWT) per `SecurityConfig` |
| **Authorization role** | Any authenticated user |

> **Note:** This endpoint is **not** listed in the public `permitAll` matchers (unlike `GET /api/listings/states`). Unauthenticated callers receive `403 Forbidden` from Spring Security before reaching the controller.

**Query parameters:** none  
**Path parameters:** none  
**Request body:** none

**Response body:** Same `StatesResponse` as `GET /api/listings/states`.

---

### `POST /api/events`

| | |
|---|---|
| **Authentication** | Required (`Bearer` JWT) |
| **Authorization role** | Any authenticated user |
| **Success status** | `201 Created` |

**Query parameters:** none  
**Path parameters:** none

**Request body:** Same fields as [JSON `POST /api/listings`](#json-content-type-applicationjson), except `category` is forced to `events`. No file uploads.

**Response body (`CreateEventResponse`):**

```json
{
  "message": "Event submitted for admin approval",
  "event": { /* ListingResponse */ }
}
```

**Validation errors:** Same as `POST /api/listings` for events.

**Example response (`201`):**

```json
{
  "message": "Event submitted for admin approval",
  "event": {
    "id": 7,
    "category": "events",
    "title": "Coffee Ceremony Workshop",
    "description": "Learn traditional coffee ceremony.",
    "state": "Texas",
    "city": "Dallas",
    "event_date": "2026-08-15",
    "status": "pending",
    "created_at": "2026-07-10T09:00:00Z",
    "contact_phone_country": "US"
  }
}
```

---

## Advertise endpoints

Base path: `/api/advertise`

### `GET /api/advertise/tiers`

| | |
|---|---|
| **Authentication** | None |
| **Authorization role** | Public |

**Query parameters:** none  
**Path parameters:** none  
**Request body:** none

**Response body (`TiersResponse`):**

```json
{
  "tiers": [
    {
      "id": "starter",
      "name": "Starter Spotlight",
      "price": "$49",
      "period": "per event",
      "features": [
        "Homepage feature for 3 days",
        "State filter priority",
        "Social share badge"
      ]
    },
    {
      "id": "growth",
      "name": "Growth Boost",
      "price": "$129",
      "period": "per month",
      "popular": true,
      "features": [
        "Top of daily calendar",
        "Featured in newsletter",
        "Banner on advertise page",
        "Priority support"
      ]
    },
    {
      "id": "premium",
      "name": "Premium Partner",
      "price": "$299",
      "period": "per month",
      "features": [
        "Nationwide homepage hero",
        "Dedicated account manager",
        "Custom landing page",
        "Analytics dashboard"
      ]
    }
  ]
}
```

---

### `POST /api/advertise/inquiry`

| | |
|---|---|
| **Authentication** | None |
| **Authorization role** | Public |
| **Success status** | `201 Created` |

**Query parameters:** none  
**Path parameters:** none

**Request body (`AdvertiseInquiryRequest`):**

| Field     | Type   | Required |
|-----------|--------|----------|
| `name`    | string | Yes |
| `email`   | string | Yes |
| `phone`   | string | No |
| `tier`    | string | Yes — `starter`, `growth`, or `premium` |
| `message` | string | No |

**Response body (`AdvertiseInquiryResponse`):**

```json
{
  "message": "Your advertising inquiry has been received. We will contact you shortly.",
  "inquiryId": 1
}
```

**Validation errors (`400`):**

- `Name, email, and tier are required`
- `Invalid pricing tier`

**Example response (`201`):**

```json
{
  "message": "Your advertising inquiry has been received. We will contact you shortly.",
  "inquiryId": 3
}
```

---

## Admin endpoints

Base path: `/api/admin`  
All routes require `Authorization: Bearer <token>` with `role: "admin"`.

Non-admin or unauthenticated callers receive **`403 Forbidden`** from Spring Security.

### `GET /api/admin/pending`

| | |
|---|---|
| **Authentication** | Required |
| **Authorization role** | `admin` |

**Query parameters:** none  
**Path parameters:** none  
**Request body:** none

**Response body:**

| Field      | Type     | Description |
|------------|----------|-------------|
| `listings` | object[] | Pending listings (all categories) |
| `events`   | object[] | **Duplicate** of `listings` (backward compatibility) |

Each row in `listings` / `events`:

| Field                     | Type   |
|---------------------------|--------|
| `id`                      | number |
| `category`                | string |
| `category_label`          | string |
| `title`                   | string |
| `description`             | string |
| `state`                   | string |
| `city`                    | string |
| `venue`                   | string |
| `event_date`              | string |
| `start_time`              | string |
| `end_time`                | string |
| `status`                  | string |
| `created_at`              | string |
| `contact_email`           | string |
| `contact_phone`           | string |
| `contact_phone_country`   | string |
| `contact_phone_display`   | string |
| `organizer_email`         | string |
| `organizer_phone`         | string |
| `organizer_phone_country` | string |
| `organizer_phone_display` | string |

**Example response (`200`):**

```json
{
  "listings": [
    {
      "id": 5,
      "category": "events",
      "category_label": "Habesha Event & Activities",
      "title": "Coffee Ceremony Workshop",
      "description": "Learn traditional coffee ceremony.",
      "state": "Texas",
      "city": "Dallas",
      "venue": null,
      "event_date": "2026-08-15",
      "start_time": null,
      "end_time": null,
      "status": "pending",
      "created_at": "2026-07-10T09:00:00Z",
      "contact_email": "host@example.com",
      "contact_phone": "+17035550100",
      "contact_phone_country": "US",
      "contact_phone_display": "+1 703-555-0100",
      "organizer_email": "host@example.com",
      "organizer_phone": "+17035550100",
      "organizer_phone_country": "US",
      "organizer_phone_display": "+1 703-555-0100"
    }
  ],
  "events": [ /* same array as listings */ ]
}
```

---

### `POST /api/admin/{listingId}/approve`

| | |
|---|---|
| **Authentication** | Required |
| **Authorization role** | `admin` |

**Path parameters:**

| Name        | Type   |
|-------------|--------|
| `listingId` | number |

**Query parameters:** none  
**Request body:** none (empty body)

**Response body (`200`):**

```json
{
  "message": "Listing approved",
  "listing": { /* JPA Listing entity serialized */ },
  "event": { /* same Listing object */ }
}
```

**Errors:**

- `404` — `Listing not found`

---

### `POST /api/admin/{listingId}/reject`

| | |
|---|---|
| **Authentication** | Required |
| **Authorization role** | `admin` |

**Path parameters:**

| Name        | Type   |
|-------------|--------|
| `listingId` | number |

**Query parameters:** none  
**Request body:** none

**Response body (`200`):**

```json
{
  "message": "Listing rejected",
  "listing": { /* JPA Listing entity serialized */ },
  "event": { /* same Listing object */ }
}
```

**Errors:**

- `404` — `Listing not found`

---

### `GET /api/admin/ad-inquiries`

| | |
|---|---|
| **Authentication** | Required |
| **Authorization role** | `admin` |

**Query parameters:** none  
**Path parameters:** none  
**Request body:** none

**Response body (`200`):**

```json
{
  "inquiries": [
    {
      "id": 1,
      "name": "Abebe Kebede",
      "email": "abebe@example.com",
      "phone": "+12025550100",
      "tier": "growth",
      "message": "Interested in monthly promotion.",
      "createdAt": "2026-07-05T14:22:00Z"
    }
  ]
}
```

---

## Static uploads

### `GET /uploads/{filename}`

| | |
|---|---|
| **Authentication** | None |
| **Authorization role** | Public |

Serves files saved by listing creation (`UPLOAD_DIR`, default `../public/uploads`). URLs returned in listing fields (e.g. `image_url: "/uploads/picture_abc123_file.jpg"`).

---

## Missing endpoints

The following capabilities are **not** implemented in the Spring Boot backend. Do not call them; mark integrations as **MISSING** until added.

| Method | URL | Status |
|--------|-----|--------|
| `POST` | `/api/auth/logout` | **MISSING** — JWT is stateless; client discards token |
| `POST` | `/api/auth/refresh` | **MISSING** |
| `PATCH` / `PUT` | `/api/auth/me` | **MISSING** — no profile update |
| `POST` | `/api/auth/password-reset` | **MISSING** |
| `PATCH` / `PUT` | `/api/listings/{listingId}` | **MISSING** — no listing update |
| `DELETE` | `/api/listings/{listingId}` | **MISSING** — no listing delete |
| `GET` | `/api/events/{eventId}` | **MISSING** — use `GET /api/listings/{listingId}` instead |
| `PATCH` / `PUT` | `/api/events/{eventId}` | **MISSING** |
| `DELETE` | `/api/events/{eventId}` | **MISSING** |
| Any | Pagination query params on list endpoints | **MISSING** — see [Pagination](#pagination) |

---

## Endpoint index

| Method | URL | Auth | Role |
|--------|-----|------|------|
| `GET` | `/health` | No | Public |
| `GET` | `/metrics` | No | Public |
| `POST` | `/api/auth/register` | No | Public |
| `POST` | `/api/auth/login` | No | Public |
| `GET` | `/api/auth/me` | Yes | `user`, `admin` |
| `GET` | `/api/listings` | Optional | Public |
| `GET` | `/api/listings/categories` | No | Public |
| `GET` | `/api/listings/states` | No | Public |
| `GET` | `/api/listings/my` | Yes | `user`, `admin` |
| `GET` | `/api/listings/{listingId}` | Optional | Public / owner / admin |
| `POST` | `/api/listings` | Yes | `user`, `admin` |
| `GET` | `/api/events` | Optional | Public |
| `GET` | `/api/events/states` | Yes | `user`, `admin` |
| `POST` | `/api/events` | Yes | `user`, `admin` |
| `GET` | `/api/advertise/tiers` | No | Public |
| `POST` | `/api/advertise/inquiry` | No | Public |
| `GET` | `/api/admin/pending` | Yes | `admin` |
| `POST` | `/api/admin/{listingId}/approve` | Yes | `admin` |
| `POST` | `/api/admin/{listingId}/reject` | Yes | `admin` |
| `GET` | `/api/admin/ad-inquiries` | Yes | `admin` |
| `GET` | `/uploads/**` | No | Public |

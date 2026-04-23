# Profile App API

A Node.js + Express REST API that enriches a person name using public APIs, classifies the result, and stores profiles in PostgreSQL through Prisma.

## What It Does

- Creates a profile from a name using:
  - Genderize (`gender` + probability)
  - Agify (`age`)
  - Nationalize (`country` + probability)
- Assigns an age group (`child`, `teenager`, `adult`, `senior`)
- Stores/retrieves/deletes profiles from PostgreSQL
- Supports advanced filtering, sorting, pagination, and natural language search
- Seeds the database from `seed_profiles.json` without creating duplicates

## Tech Stack

- Node.js (CommonJS)
- Express 5
- Prisma 7
- PostgreSQL (Neon)
- Axios

## Project Structure

```text
.
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── app.js
│   ├── config/
│   │   └── prisma.js
│   ├── controllers/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── utils/
├── prisma.config.ts
├── server.js
└── package.json
```

## Prerequisites

- Node.js 20+ (or latest LTS)
- npm
- A PostgreSQL database (Neon recommended for this project)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=2504
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
DIRECT_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
```

Notes:
- `DATABASE_URL` is used by runtime and migrations in current config.
- If your password contains special characters (such as `+`, `@`, `#`), URL-encode them.

## Database Setup (Prisma)

Validate config:

```bash
npx prisma validate
```

Generate client:

```bash
npx prisma generate
```

Apply schema to the database (recommended when pooled migration networking is tricky):

```bash
npx prisma db push
```

Or run migrations:

```bash
npx prisma migrate dev --name init
```

Seed the database with the provided 2026 dataset:

```bash
npm run db:seed
```

The seed command is idempotent. It reads `seed_profiles.json`, uses `name` as the unique key, and can be re-run safely.

## Run the API

Development:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server default URL:

```text
http://localhost:2504
```

## API Endpoints

Base path: `/api`

### 1) Create Profile

- Method: `POST`
- Path: `/api/profiles`
- Body:

```json
{
  "name": "john"
}
```

Success (new record, 201):

```json
{
  "status": "success",
  "data": {
    "id": "019d9d66-8163-72ba-830b-ab53efee3dff",
    "name": "John Doe",
    "gender": "male",
    "gender_probability": 1,
    "age": 75,
    "age_group": "senior",
    "country_id": "NG",
    "country_name": "Nigeria",
    "country_probability": 0.076,
    "created_at": "2026-04-17T21:43:53.957Z"
  }
}
```

Success (already exists, 200):

```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": {
    "id": "...",
    "name": "john"
  }
}
```

### 2) Get Profile by ID

- Method: `GET`
- Path: `/api/profiles/:id`

Success (200):

```json
{
  "status": "success",
  "data": {
    "id": "...",
    "name": "john"
  }
}
```

Not found (404):

```json
{
  "status": "error",
  "message": "Profile not found"
}
```

### 3) List Profiles (with optional filters)

- Method: `GET`
- Path: `/api/profiles`
- Query params:
  - `gender`
  - `age_group`
  - `country_id`
  - `min_age`
  - `max_age`
  - `min_gender_probability`
  - `min_country_probability`
  - `sort_by` (`age`, `created_at`, `gender_probability`)
  - `order` (`asc`, `desc`)
  - `page` (default `1`)
  - `limit` (default `10`, values above `50` are capped at `50`)

Example:

```text
GET /api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc&page=1&limit=10
```

Success (200):

```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 2026,
  "data": []
}
```

### 4) Search Profiles

- Method: `GET`
- Path: `/api/profiles/search`
- Query params:
  - `q` for a rule-based natural language query
  - `page` and `limit` for pagination
  - `sort_by` and `order` for optional sorting

Example:

```text
GET /api/profiles/search?q=young males from nigeria&page=1&limit=10
```

Supported parsing examples:

- `young males` → `gender=male` + `min_age=16` + `max_age=24`
- `females above 30` → `gender=female` + `min_age=30`
- `people from angola` → `country_id=AO`
- `adult males from kenya` → `gender=male` + `age_group=adult` + `country_id=KE`
- `male and female teenagers above 17` → `age_group=teenager` + `min_age=17`

If the query cannot be interpreted, the API returns:

```json
{
  "status": "error",
  "message": "Unable to interpret query"
}
```

### 5) Delete Profile

- Method: `DELETE`
- Path: `/api/profiles/:id`

Success: `204 No Content`

## Error Responses

- `400 Name is required` for missing/empty `name`
- `400 Invalid JSON body` for malformed JSON
- `400 Invalid query parameters` for missing or empty query values
- `422 Invalid query parameters` for invalid parameter types or ranges
- `400 Unable to interpret query` when the natural-language search cannot be parsed
- `404 Profile not found`
- `409 Profile already exists` (unique constraint conflict path)
- `502 <External API> returned an invalid response`
- `500 Internal server error`

All error responses use the same shape:

```json
{
  "status": "error",
  "message": "<error message>"
}
```

## Postman Tips

- Set Body to `raw` + `JSON`
- Ensure header includes:
  - `Content-Type: application/json`
- Example request body:

```json
{
  "name": "john"
}
```

## Useful Commands

```bash
npm run dev
npm start
npx prisma validate
npx prisma generate
npx prisma db push
npx prisma migrate dev --name init
```

## Author

Israel Odunayo

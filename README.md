# Profile App API

A Node.js + Express REST API that enriches a person name using public APIs, classifies the result, and stores profiles in PostgreSQL through Prisma.

## What It Does

- Creates a profile from a name using:
  - Genderize (`gender` + probability)
  - Agify (`age`)
  - Nationalize (`country` + probability)
- Assigns an age group (`child`, `teenager`, `adult`, `senior`)
- Stores/retrieves/deletes profiles from PostgreSQL
- Supports idempotent create behavior by normalized name

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
    "name": "john",
    "gender": "male",
    "gender_probability": 1,
    "sample_size": 2692560,
    "age": 75,
    "age_group": "senior",
    "country_id": "NG",
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
  - `gender` (normalized to lowercase)
  - `country_id` (normalized to uppercase)
  - `age_group` (normalized to lowercase)

Example:

```text
GET /api/profiles?gender=male&country_id=NG&age_group=senior
```

Success (200):

```json
{
  "status": "success",
  "count": 1,
  "data": []
}
```

### 4) Delete Profile

- Method: `DELETE`
- Path: `/api/profiles/:id`

Success: `204 No Content`

## Error Responses

- `400 Name is required` for missing/empty/non-string `name`
- `400 Invalid JSON body` for malformed JSON
- `404 Profile not found`
- `409 Profile already exists` (unique constraint conflict path)
- `502 <External API> returned an invalid response`
- `500 Internal server error`

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

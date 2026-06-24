# Job Application Tracker

A full-stack app to track companies you've applied to — applications, interviews, offers, rejections — with a clean dashboard, filters, and per-status counts.

- **Frontend**: React (TanStack Start) + Tailwind + shadcn/ui
- **Backend**: Node.js + Express + `pg` (node-postgres)
- **Database**: PostgreSQL
- **Deployment**: Docker + Docker Compose (3 services)

---

## Project structure

```
.
├── src/                      # React frontend (routes, components)
├── backend/                  # Express + Postgres REST API
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js
│   │   ├── migrate.js
│   │   └── routes/applications.js
│   ├── schema.sql
│   ├── Dockerfile
│   └── package.json
├── frontend.Dockerfile       # Frontend image
├── docker-compose.yml        # postgres + backend + frontend
├── .env.example
└── README.md
```

---

## REST API

Base URL: `http://localhost:4000`

| Method | Route                  | Description              |
| ------ | ---------------------- | ------------------------ |
| GET    | `/applications`        | List all applications    |
| POST   | `/applications`        | Create a new application |
| PUT    | `/applications/:id`    | Update an application    |
| DELETE | `/applications/:id`    | Delete an application    |
| GET    | `/health`              | Health check             |

Request body (POST / PUT):

```json
{
  "company": "Acme Inc",
  "role": "Senior Engineer",
  "location": "Remote",
  "apply_date": "2025-01-15",
  "status": "Applied",
  "notes": "Referred by Jane"
}
```

`status` must be one of: `Applied`, `Interview`, `Offer`, `Rejected`.

---

## Run with Docker Compose (recommended)

```bash
cp .env.example .env
docker compose up --build
```

Then open:

- Frontend: http://localhost:3000
- API: http://localhost:4000
- Postgres: localhost:5432

The Postgres container auto-runs `backend/schema.sql` on first boot.

To reset the database, remove the volume:

```bash
docker compose down -v
```

---

## Run locally without Docker

### 1. Start Postgres

Either use a local Postgres install or run only the DB via Docker:

```bash
docker run --name jobtracker-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=jobtracker -p 5432:5432 -d postgres:16-alpine
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run migrate       # creates the applications table
npm run dev           # starts API on http://localhost:4000
```

### 3. Frontend

In the repo root:

```bash
npm install
echo "VITE_API_URL=http://localhost:4000" > .env.local
npm run dev
```

The frontend will fall back to `localStorage` if the API is unreachable, so you can demo the UI without the backend running.

---

## Environment variables

### Frontend (`.env.local` at repo root)

| Var            | Default                 | Notes                       |
| -------------- | ----------------------- | --------------------------- |
| `VITE_API_URL` | `http://localhost:4000` | Base URL of the Express API |

### Backend (`backend/.env`)

| Var            | Default                                                    |
| -------------- | ---------------------------------------------------------- |
| `PORT`         | `4000`                                                     |
| `CORS_ORIGIN`  | `*` (set to your frontend origin in prod)                  |
| `DATABASE_URL` | optional — overrides `PG*` vars                            |
| `PGHOST`       | `localhost`                                                |
| `PGPORT`       | `5432`                                                     |
| `PGUSER`       | `postgres`                                                 |
| `PGPASSWORD`   | `postgres`                                                 |
| `PGDATABASE`   | `jobtracker`                                               |

---

## Database schema

See [`backend/schema.sql`](backend/schema.sql).

```sql
CREATE TABLE applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company     TEXT NOT NULL,
  role        TEXT NOT NULL,
  location    TEXT NOT NULL DEFAULT '',
  apply_date  DATE NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('Applied', 'Interview', 'Offer', 'Rejected')),
  notes       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## License

MIT

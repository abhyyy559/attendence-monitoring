# Attendance Monitoring System (Full Stack)

This repo contains a **FastAPI + SQLAlchemy backend** and a **React (Vite) frontend** for managing courses, enrollment, attendance marking, dashboards, reports, and profiles.

---

## Project Structure

- `attendance-backend/` — FastAPI API server
- `attendance-frontend/` — React/Vite client app
- `database_setup/` — SQL schema + triggers/procedures (Postgres/Supabase)

---

## Features (High-Level)

- **Auth**: register/login, password reset (mock), profile, change password
- **Faculty**
  - Dashboard stats/charts
  - **Manage Courses** (create/edit/delete)
  - **Enroll Students into Courses** (enrollment bridge)
  - Mark attendance for enrolled students
- **Student**
  - Dashboard with real attendance stats
  - Enrolled courses list
  - Attendance timeline + export
- **Reports**
  - Student downloads (PDF/Excel endpoints depending on backend support)
  - Faculty shortage audit export (if supported by backend)

---

## Prerequisites

- **Node.js** 18+ (recommended)
- **Python** 3.10+ (recommended)
- A database:
  - **PostgreSQL/Supabase** (recommended for triggers/shortage logic)
  - SQLite is supported for basic CRUD but will not support Postgres triggers

---

## Backend Setup (FastAPI)

### 1) Create `.env`

Create `attendance-backend/.env`:

```env
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@HOST:PORT/DBNAME
SECRET_KEY=change_me_to_a_long_random_string
SUPABASE_URL=
SUPABASE_KEY=
```

Notes:
- If you use **Supabase**, `DATABASE_URL` should point to your Supabase Postgres connection string.
- `SUPABASE_URL` / `SUPABASE_KEY` are present in settings; leave blank if unused.

### 2) Install dependencies

```bash
cd attendance-backend
python -m venv venv
venv\Scripts\pip install -r requirements.txt
```

### 3) Run the API

```bash
cd attendance-backend
venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

API base URL: `http://localhost:8000`

---

## Frontend Setup (React/Vite)

### 1) Install dependencies

```bash
cd attendance-frontend
npm install
```

### 2) Configure API URL (optional)

Create `attendance-frontend/.env` (optional):

```env
VITE_API_URL=http://localhost:8000
```

### 3) Run the client

```bash
cd attendance-frontend
npm run dev
```

Frontend URL (default): `http://localhost:5173`

---

## Core Workflows

### Faculty: Create → Enroll → Attendance

1. Login as **faculty**
2. Go to **My Courses** (`/faculty/courses`)
3. Click **Create New Course**
4. On the course card, click **Enroll Students**
5. Select a student and click **Add to Course**
6. Go to **Mark Attendance** and select the course → submit

### Student: See enrolled courses immediately

1. Login as **student**
2. Student dashboard loads from **`/api/students/dashboard`**
3. Courses shown are those linked through **`course_enrollments`**

---

## Key API Endpoints (Common)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/change-password`
- `GET /api/auth/notifications`
- `PUT /api/auth/notifications`

### Faculty
- `GET /api/faculty/courses`
- `POST /api/faculty/courses`
- `PUT /api/faculty/courses/{course_id}`
- `DELETE /api/faculty/courses/{course_id}`
- `POST /api/faculty/courses/{course_id}/enroll`  ← **Enrollment Bridge**
- `POST /api/faculty/attendance/mark`

### Students
- `GET /api/students` (faculty/admin only — used for enrollment UI)
- `GET /api/students/dashboard`
- `GET /api/students/attendance`
- `GET /api/students/trends`

---

## Troubleshooting

### 500 on marking attendance (`/api/faculty/attendance/mark`)

If you see errors like:
`record "new" has no field "shortage_status"`

This is a **Postgres trigger function mismatch** (old trigger definition vs current schema).

Fix:
- Restart the backend so the startup patch in `attendance-backend/app/main.py` can run
- Ensure your DB triggers are aligned with `database_setup/02_triggers.sql`

### Reports download history 404

This build does not include `GET /api/reports/history`.
The frontend keeps “Recent Downloads” as a local-only list and does **not** call that endpoint.

---

## Development Notes

- Backend creates tables via `Base.metadata.create_all()` on startup.
- For Postgres/Supabase, the SQL in `database_setup/` is the source of truth for triggers and shortage logic.


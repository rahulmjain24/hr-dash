# HR & Applicant Tracking System (ATS)

## 📌 Overview

An HR and Applicant Tracking System for managing the hiring pipeline: departments, job postings, incoming applications, and the HR team itself. It's an npm-workspaces monorepo with a NestJS backend and two Next.js apps: a dashboard for HR staff and a public portal where candidates apply.

HR staff can review each application's documents, move it through the hiring stages with a full status history, and schedule interviews.

---

## 💻 Tech Stack

**Frontends** (`apps/frontend-hr`, `apps/frontend-application`)

*   **Framework:** ![Next JS](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
*   **Language:** ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
*   **Styling:** ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

**Backend** (`apps/backend`)

*   **Framework:** ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
*   **Language:** ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
*   **ORM & Migrations:** MikroORM
*   **Authentication:** ![JWT](https://img.shields.io/badge/JWT-black?style=flat-square&logo=JSON%20web%20tokens) stored in an HTTP-only cookie, with role-based access (`ADMIN`, `MEMBER`)
*   **Email:** Nodemailer over SMTP (used for password reset)

**Infrastructure & Data**

*   **Database:** ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
*   **File Storage:** ![MinIO](https://img.shields.io/badge/MinIO-C7202C?style=flat-square&logo=minio&logoColor=white) (S3-compatible object storage for resumes and documents)
*   **Containerization:** ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) Compose for Postgres, MinIO, the backend, and both frontends

---

## 🏗️ System Architecture

The system follows a client-server model with a monolithic backend.

![Backend Architecture](docs/images/hr-dash-architecture.svg)

### Components

*   **Client Interfaces:**
    *   **HR UI** (`apps/frontend-hr`): A secure internal dashboard where HR staff manage members, job postings, applications, documents, and interviews.
    *   **Application UI** (`apps/frontend-application`): A public frontend where candidates browse open job listings and submit applications with their documents.
*   **Backend (Monolithic):**
    *   **Auth Module:** Handles login, logout, and password reset, and secures access from the HR UI.
    *   **HR APIs:** Protected endpoints for administrative tasks such as managing users, departments, job listings, application statuses, documents, and interviews.
    *   **Application APIs:** Public endpoints under `/public` for the Application UI: fetching open jobs, uploading documents, and submitting applications.
*   **Infrastructure:**
    *   **Database:** PostgreSQL, storing all structured data.
    *   **File Storage:** MinIO, for applicant documents such as resumes, cover letters, and portfolios.

---

## 📁 Project Structure

```text
hr-dash/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── controllers/   # HTTP layer (extends BaseController)
│   │   │   ├── services/      # Business logic (extends BaseService)
│   │   │   ├── repositories/  # Data access (extends BaseRepository)
│   │   │   ├── entities/      # MikroORM entities (extends BaseUUIDEntity)
│   │   │   ├── dtos/          # Request validation (class-validator)
│   │   │   ├── guards/        # JWT and role guards
│   │   │   ├── modules/       # NestJS modules
│   │   │   └── migrations/    # MikroORM migrations
│   │   └── mikro-orm.config.ts
│   ├── frontend-hr/           # Next.js HR dashboard
│   └── frontend-application/  # Next.js public applicant portal
├── docs/images/          # Architecture, request flow, and DB diagrams
├── docker-compose.yml    # Postgres, MinIO, backend, and both frontends
└── .env.example
```

### Root scripts

| Script | What it does |
|---|---|
| `npm run dev:backend` | Start the backend in watch mode |
| `npm run dev:frontend-hr` | Start the HR dashboard dev server |
| `npm run dev:frontend-application` | Start the applicant portal dev server on port 3002 |
| `npm run db:migrate` | Apply pending migrations manually (the backend also does this on startup) |
| `npm run db:generate` | Generate a migration from entity changes |
| `npm run db:blank` | Create an empty migration |
| `npm run db:down` | Roll back the last migration |

---

## ⚙️ Backend Request Flow

The backend uses a layered architecture to keep concerns separated, as shown in the request flow diagram below.

![Design Pattern](docs/images/hr-dash-design-pattern.svg)

### Request Lifecycle

1.  **API Routing:** NestJS routes the incoming request to a controller endpoint.
2.  **Guards:** `JwtAuthGuard` authenticates the request from the auth cookie, and `RolesGuard` enforces the `@Roles(...)` requirement.
3.  **Request Validation:** DTOs validated with `class-validator` reject payloads that don't match the expected schema.
4.  **Controller:** Handles the HTTP request and response and delegates to the service layer. Extends `BaseController`.
5.  **Service:** Contains the business logic. Extends `BaseService`.
6.  **Repository:** Handles data access and abstracts database queries. Extends `BaseRepository`.
7.  **Entity:** MikroORM entity defining the table schema. Extends `BaseUUIDEntity` (UUID primary key, `created_at`, `updated_at`).

---

## 🗄️ Database Schema

The schema is designed to track the full lifecycle of an application, as shown in the entity-relationship diagram below.

![Database Design](docs/images/hr-dash-dbml.svg)

### Tables

*   **`tbl_users`**: System users (HR staff, admins) with a role (`ADMIN` or `MEMBER`) and a bcrypt-hashed password.
*   **`tbl_departments`**: Organizational departments.
*   **`tbl_job_listings`**: Job postings with active dates, department, and description.
*   **`tbl_application_forms`**: The central table linking candidates to jobs. Tracks the current status and stores custom form fields as JSONB.
*   **`tbl_password_reset_tokens`**: Single-use, expiring password reset tokens linked to a user.
*   **`tbl_application_status_history`**: An audit log of every status change, recording who made the change and when.
*   **`tbl_documents`**: Metadata and links to files in MinIO (such as resumes), tied to an `application_id`.
*   **`tbl_interviews`**: Scheduled interviews linking applications to interviewers, with duration and meeting link.

---

## 📊 Project Status

- [x] Monorepo workspace setup
- [x] Backend API architecture (layered controllers, services, repositories)
- [x] Authentication (JWT cookie, RBAC, password reset by email)
- [x] Database migrations
- [x] HR dashboard (Next.js): login, members, job listings, applications
- [x] Department & job listing management
- [x] Application tracking with status updates and filters
- [x] Docker images for the backend and frontends
- [x] Public applicant portal
- [x] Application status history (audit trail)
- [x] Document uploads to MinIO
- [x] Interview scheduling
- [ ] Automated tests

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 22+
- Docker and Docker Compose

### Setup

```bash
# 1. Install dependencies for all workspaces

npm install

# 2. Create your environment file, then fill in the values

cp .env.example .env

# 3. Start Postgres and MinIO

docker compose up -d postgres minio

# 4. Start the backend (http://localhost:3000); it applies pending migrations on startup

npm run dev:backend

# 5. In another terminal, start the HR dashboard (http://localhost:3001)

npm run dev:frontend-hr -- -p 3001

# 6. In a third terminal, start the applicant portal (http://localhost:3002)

npm run dev:frontend-application
```

### Running everything in Docker

Instead of steps 3 to 6, Compose can build and run everything:

```bash
docker compose up -d --build
```

| Service | URL |
|---|---|
| `backend` | <http://localhost:3000> |
| `frontend-hr` | <http://localhost:3001> |
| `frontend-application` | <http://localhost:3002> |

The backend applies pending migrations each time it starts. Migrations are compiled into the image, so pass `--build` after creating one.

The backend and Next.js both default to port 3000, so pass `-p 3001` to the HR dashboard. The applicant portal's dev script already uses port 3002.

The backend only accepts browser requests (CORS) from `http://localhost:3001`, so the HR dashboard must run on that address. `FRONTEND_URL`, the base of the links in password-reset emails, defaults to the same address. The applicant portal calls the backend from its server, so CORS doesn't apply to it.

MinIO's console is at <http://localhost:9001>. Log in with `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`.

### Creating the first admin user

There's no public sign-up, and only an `ADMIN` can create users through the API. To bootstrap the first admin, insert one directly into the database:

```bash
# Generate a bcrypt hash for your password

HASH=$(node -e "console.log(require('bcrypt').hashSync('ChangeMe123!', 10))")

# Insert the admin user (uses the values from your .env)

source .env
docker exec -i hr-dash-postgres psql -U "$DB_USER" -d "$DB_NAME" -c \
  "INSERT INTO tbl_users (email, password, name, role) VALUES ('admin@example.com', '$HASH', 'Admin', 'ADMIN');"
```

Then log in at <http://localhost:3001/login> and change the password.

---

## 🔐 Environment Variables

All variables live in a single `.env` file at the repo root. The backend validates them at startup ([env.validation.ts](apps/backend/src/config/env.validation.ts)) and refuses to start if a required one is missing.

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | `development`, `production`, or `test` |
| `PORT` | No | `3000` | Backend HTTP port |
| `DB_HOST` | Yes | | Postgres host (`localhost` when using Compose) |
| `DB_PORT` | No | `5432` | Postgres port |
| `DB_USER` | Yes | | Postgres user (Compose also uses this to create it) |
| `DB_PASSWORD` | Yes | | Postgres password |
| `DB_NAME` | Yes | | Postgres database name |
| `MINIO_ROOT_USER` | Yes | | MinIO root user |
| `MINIO_ROOT_PASSWORD` | Yes | | MinIO root password (at least 8 characters) |
| `MINIO_ENDPOINT` | No | `localhost` | MinIO host |
| `MINIO_PORT` | No | `9000` | MinIO API port |
| `MINIO_USE_SSL` | No | `false` | Connect to MinIO over HTTPS |
| `MINIO_BUCKET` | No | `hr-documents` | Bucket for application documents. Created on startup if missing. |
| `MINIO_TMP_BUCKET` | No | `hr-documents-tmp` | Bucket for files uploaded before an application is submitted. Its files expire after 1 day. |
| `JWT_SECRET` | Yes | | Secret used to sign access tokens. Use a long random string. |
| `AUTH_COOKIE_NAME` | Yes | | Name of the auth cookie |
| `FRONTEND_URL` | No | `http://localhost:3001` | HR dashboard URL, used as the base of password-reset links |
| `SMTP_HOST` | No | | SMTP server for outgoing mail |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_USER` | No | | SMTP username |
| `SMTP_PASSWORD` | No | | SMTP password |
| `MAIL_FROM` | No | `HR Portal <no-reply@localhost>` | Sender address for emails |

**Frontends** (`apps/frontend-hr`, `apps/frontend-application`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Backend base URL |
| `INTERNAL_API_URL` | value of `NEXT_PUBLIC_API_URL` | Backend URL for requests made from the Next.js server, when it differs from the browser's (`http://backend:3000` in Compose) |
| `NEXT_AUTH_COOKIE_NAME` | `access_token` | HR dashboard only. Must match `AUTH_COOKIE_NAME`. |

> **Note:** Next.js reads `.env` files from its own app directory, not the repo root. To override the frontend defaults, put these variables in `apps/frontend-hr/.env.local` or `apps/frontend-application/.env.local`.

---

## 🔌 API Overview

All routes except `/auth/*` and `/public/*` require a valid auth cookie. Routes marked **Admin** also require the `ADMIN` role.

| Resource | Routes |
|---|---|
| `/auth` | `POST /login`, `GET /logout`, `POST /forgot-password`, `GET /reset-password/:token`, `POST /reset-password` |
| `/user` | `GET /` (Admin), `GET /:id`, `POST /create` (Admin), `PATCH /:id` (Admin), `DELETE /:id` (Admin) |
| `/departments` | `GET /` |
| `/job-listings` | `GET /`, `GET /:id`, `POST /` (Admin), `PATCH /:id` (Admin), `PATCH /:id/set-inactive` (Admin) |
| `/application-forms` | `GET /`, `GET /:id`, `PATCH /:id/status` |
| `/application-status-history` | `GET /application/:applicationId` |
| `/documents` | `GET /application/:applicationId`, `GET /:id/download` |
| `/interviews` | `GET /application/:applicationId`, `POST /` (Admin) |
| `/public` | `GET /job-listings`, `GET /job-listings/:id`, `POST /documents`, `POST /applications` |

---

## 📸 Screenshots

### HR dashboard

**Applications:** search and filter every application by status, job, department, listing state, and submission date, with server-side pagination.

![Applications list with filters](docs/images/hr-dash-applications.png)

**Application detail:** one page per application with the candidate's details, uploaded documents, scheduled meetings, the current status, and the full status history with who changed it and when.

![Application detail page](docs/images/hr-dash-application-edit.png)

<table>
  <tr>
    <td width="50%" valign="top">
      <b>Job listings</b><br/>
      Filter by department and active state, and jump to each listing's applications.<br/><br/>
      <img src="docs/images/hr-dash-job-listings.png" alt="Job listings page" />
    </td>
    <td width="50%" valign="top">
      <b>New job listing</b><br/>
      Form validation, including end date after start date and a 10,000-character description limit.<br/><br/>
      <img src="docs/images/hr-dash-job-listings-new.png" alt="New job listing form" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <b>Members</b><br/>
      Admins manage who can sign in, with search and role filters.<br/><br/>
      <img src="docs/images/hr-dash-members.png" alt="Members page" />
    </td>
    <td width="50%" valign="top">
      <b>Create member</b><br/>
      Role-based access: Members review applications, and Admins manage listings and people.<br/><br/>
      <img src="docs/images/hr-dash-members-new.png" alt="Create member form" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <b>Edit member</b><br/>
      Update profile and role, reset a password, or delete a member, with safeguards like not being able to delete your own account.<br/><br/>
      <img src="docs/images/hr-dash-members-edit.png" alt="Edit member page" />
    </td>
    <td width="50%" valign="top">
      <b>Sign in</b><br/>
      JWT stored in an HTTP-only cookie, with a self-service password reset by email.<br/><br/>
      <img src="docs/images/hr-dash-login.png" alt="Sign in page" />
    </td>
  </tr>
</table>

### Applicant portal

<table>
  <tr>
    <td width="50%" valign="top">
      <b>Open positions</b><br/>
      Candidates browse active job listings grouped by department, without an account.<br/><br/>
      <img src="docs/images/hr-dash-job-list.png" alt="Open positions page" />
    </td>
    <td width="50%" valign="top">
      <b>Job posting</b><br/>
      The full description with department, posting date, and application deadline.<br/><br/>
      <img src="docs/images/hr-dash-job-post.png" alt="Job posting page" />
    </td>
  </tr>
</table>

**Apply:** the application form, with a required resume and up to 4 additional documents (PDF, DOC or DOCX, up to 5 MB each).

![Application form](docs/images/hr-dash-apply.png)

---

## 🚀 Key Features

*   **Role-Based Access:** `ADMIN` and `MEMBER` roles enforced on every protected endpoint.
*   **Secure Authentication:** JWT in an HTTP-only cookie, with password reset by email.
*   **Job & Department Management:** Create, edit, and deactivate job postings grouped by department.
*   **Application Tracking:** Review applications, filter them, and move them through `APPLIED` → `REVIEWING` → `HIRED` or `REJECTED`.
*   **Public Applicant Portal:** Candidates browse open listings and apply without an account.
*   **Dynamic Application Forms:** Custom per-application fields stored as JSONB.
*   **Full Audit Trail:** A record of every status change, with who made it, when, and optional remarks.
*   **Interview Scheduling:** Admins schedule future meetings between an applicant and an interviewer, with a duration and meeting link.
*   **Document Management:** Resumes and other documents (PDF, DOC, DOCX, up to 5 MB each and 5 per application) stored in MinIO and downloadable from the dashboard.

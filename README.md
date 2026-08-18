# HR & Applicant Tracking System (ATS)

## 📌 Overview
This project is a comprehensive Human Resources and Applicant Tracking System designed to manage the entire hiring pipeline. It provides dedicated interfaces for both job applicants and HR personnel, powered by a robust monolithic backend. The system handles job postings, application submissions, interview scheduling, document management, and status tracking.

---

## 💻 Tech Stack

**Frontend**
*   **Framework:** ![Next JS](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
*   **Language:** ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)

**Backend**
*   **Framework:** ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
*   **Language:** ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
*   **Authentication:** ![JWT](https://img.shields.io/badge/JWT-black?style=flat-square&logo=JSON%20web%20tokens) (Stateless Auth)

**Infrastructure & Data**
*   **Database:** ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
*   **File Storage:** ![MinIO](https://img.shields.io/badge/MinIO-C7202C?style=flat-square&logo=minio&logoColor=white) (S3-compatible object storage for resumes/documents)
*   **Containerization:** ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) (for local development and orchestration)

---

## Project Status

- [x] Monorepo workspace setup
- [x] Backend API architecture
- [x] Authentication logic (JWT & RBAC)
- [ ] Database migrations
- [ ] Frontend dashboard (Next.js)
- [ ] User authentication flow
- [ ] Job postings & department management
- [ ] Candidate tracking & applications
- [ ] Docker containerization
- [ ] Testing & deployment

---

## 🏗️ System Architecture

The high-level architecture follows a client-server model with a monolithic backend, as illustrated in the architecture diagram below.

![Backend Architecture](docs/images/hr-dash-architecture.svg)

### Components
*   **Client Interfaces:**
    *   **Application UI:** The public-facing frontend where candidates can browse job listings and submit their applications.
    *   **HR UI:** A secure, internal dashboard for HR staff to manage job postings, review applicants, and schedule interviews.
*   **Backend (Monolithic):**
    *   **Application APIs:** Handles requests from the public Application UI (e.g., fetching active jobs, submitting forms).
    *   **Auth Module:** Manages authentication and authorization, specifically securing access from the HR UI.
    *   **HR APIs:** Protected endpoints handling administrative tasks like updating application statuses and managing users.
*   **Infrastructure:**
    *   **Database:** A relational database storing all structured application data.
    *   **File Storage:** A dedicated storage system for handling applicant documents (e.g., resumes, cover letters, portfolios).

---

## ⚙️ Backend Request Flow

The backend is built using a strict layered architecture pattern to ensure separation of concerns, maintainability, and scalability, as shown in the request flow diagram below.

![Design Pattern](docs/images/hr-dash-design-pattern.svg)

### Request Lifecycle
1.  **API Routing:** Incoming requests are routed to specific endpoints.
2.  **Request Validator:** Ensures the incoming payload meets expected schemas and constraints before processing.
3.  **Controller:** Handles the HTTP request/response cycle and delegates business logic to the Service layer. Inherits common logic from a `BaseController`.
4.  **Service:** Contains the core business logic of the application. Inherits from a `BaseService`.
5.  **Repository:** Manages data access and abstracts database queries. Inherits from a `BaseRepository`.
6.  **Model:** Represents the data structure and schema. Inherits from a `BaseModel`.

---

## 🗄️ Database Schema

The system utilizes a relational database structure designed to track the full lifecycle of an application, detailed in the entity-relationship diagram below.

![Database Design](docs/images/hr-dash-dbml.svg)

### Core Tables:
*   **`tbl_users`**: Manages system users (HR staff, interviewers, admins) including role-based access control and encrypted credentials.
*   **`tbl_departments`**: A lookup table for organizational departments.
*   **`tbl_job_listings`**: Stores job postings with active dates, department links, and descriptions.
*   **`tbl_application_forms`**: The central table linking candidates to specific jobs, tracking their current application status and dynamic form properties (stored as JSONB).
*   **`tbl_application_status_history`**: An audit log tracking every status change an application undergoes, recording who made the change and when.
*   **`tbl_documents`**: Stores metadata and links to physical files in the File Storage (e.g., resumes tied to an `application_id`).
*   **`tbl_interviews`**: Manages scheduled interviews, linking applications to specific interviewer users, and storing meeting durations and links.

---

## 🚀 Key Features
*   **Role-Based Access:** Secure HR dashboard isolated from the public applicant portal.
*   **Full Audit Trail:** Detailed tracking of application status changes for transparency and compliance.
*   **Dynamic Application Forms:** Support for additional/custom properties via JSONB database fields.
*   **Integrated Interview Scheduling:** Connect applicants with interviewers and meeting links directly within the platform.
*   **Document Management:** Abstracted file storage for handling sensitive applicant documents.
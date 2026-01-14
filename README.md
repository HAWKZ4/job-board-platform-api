# 💼 Job Board Platform – Backend API

A **production-ready job application backend** built with **NestJS**, **PostgreSQL**, **TypeORM**, and **JWT (HTTP-only cookies)**.

This project is fully refactored with **centralized services**, **role-based security**, **soft delete support**, **enhanced logging**, and a **Dockerized, production-ready setup**.

---

## 🚀 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT (Access & Refresh tokens, HTTP-only cookies)
- **File Uploads**: Multer (PDF resumes)
- **API Docs**: Swagger (OpenAPI 3)
- **DevOps**: Docker & Docker Compose (multi-stage builds)
- **Utilities**: `ms` for human-readable durations
- **Testing & Tools**: Postman collections, database seed scripts

---

## ✅ Features

### 👤 Users (Job Seekers)

- Register, login, logout (secure cookies)
- Get current user info (`/me`)
- View & update profile
- Change password
- Upload resume (PDF only)
- Browse & search jobs (title, company, location)
- Apply for jobs (cover letter text + resume PDF)
- View or withdraw applications

---

### 🛠️ Admins

- **Users**
  - List users (with pagination)
  - Create users
  - Update users
  - Soft delete & restore users
- **Jobs**
  - Create, update, delete jobs
  - Publish / unpublish jobs
  - Restore deleted jobs
- **Applications**
  - View all applications
  - Filter by job or user
  - Update application status  
    (`pending → reviewed → accepted / rejected`)

---

### ⚙️ System & Infrastructure

- Role-based access control (`@Roles`)
- Auth & role guards
- JWT stored in **secure HTTP-only cookies**
- Centralized response DTOs
- Enhanced logging via `MyLoggerService`
- Soft delete support (`deletedAt`) with restore capability
- Resume uploads stored in `/uploads/resumes`
- Dockerized with multi-stage builds
- Migrations auto-run in production via `docker-entrypoint.sh`
- Swagger API documentation
- CSV export for admin reporting
- Pagination & filtering for listing endpoints
- Database seeding (random & JSON-based)

---

## 🧩 Improvements & Refactors

- Centralized user access logic by **actor & intent**
- Improved entity security using `select: false`
- Clear separation between **public**, **admin**, and **internal** queries
- Reduced data exposure across controllers
- Refined method naming for readability and maintainability
- Improved environment variable handling

---

## 🧱 Project Structure

```text
src/
├── admin/             # Admin-only controllers & services
├── applications/      # Job applications module
├── auth/              # Authentication, guards, roles
├── common/            # Global interceptors, decorators, filters
├── database/          # TypeORM config, migrations, seeding
├── jobs/              # Job entity & business logic
├── my-logger/         # Custom logging service
├── profiles/          # User profile & resume upload
├── users/             # User entity & user service
├── utils/             # Helper utilities
├── app.module.ts      # Root module
└── main.ts            # Application bootstrap

```

---

## 📦 Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/HAWKZ4/job-board-platform-api.git
cd job-board-platform-api

```

---

### 2️⃣ Configure environment variables

This repository **does not commit** environment-specific files.

Copy the example file and adjust values:

```bash
cp .env.example .env

```

Example `.env`:

```env
# App
PORT=3000
NODE_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=job_board_db

# JWT
JWT_ACCESS_TOKEN_SECRET=changemeaccess
JWT_ACCESS_TOKEN_EXPIRATION_MS=900000
JWT_REFRESH_TOKEN_SECRET=changemerefresh
JWT_REFRESH_TOKEN_EXPIRATION_MS=604800000

# Uploads
RESUME_UPLOAD_PATH=./uploads/resumes

```

> ℹ️ **Important**  
> Docker Compose reads environment variables from `.env` by default.  
> The `.env` file is the single source of truth for local development and Docker execution.

---

### 3️⃣ Run with Docker (development)

```bash
docker-compose -f docker-compose.dev.yml up --build

```

- API → `http://localhost:5000/api/v1`
- Swagger → `http://localhost:5000/api/v1/docs`
- PGAdmin → `http://localhost:8080` (`admin@admin.com` / `admin`)

---

### 4️⃣ Run with Docker (production)

```bash
docker-compose -f docker-compose.prod.yml up --build -d

```

- API → `http://localhost:3000/api/v1`
- Migrations are executed automatically on startup

---

### 5️⃣ Database Migrations

Generate a migration:

```bash
npm run typeorm -- migration:generate ./migrations/NameOfMigration -d ./typeorm.config.ts

```

Run migrations:

```bash
npm run typeorm:run-migrations

```

Revert the last migration:

```bash
npm run typeorm:revert-migrations

```

---

### 6️⃣ Seed Data

Random data:

```bash
npm run seed:random

```

Seed from JSON files:

```bash
npm run seed:json

```

---

## 📝 NPM Scripts

```json
"typeorm:create-migration": "npm run typeorm -- migration:create ./migrations/$npm_config_name",
"typeorm:run-migrations": "npm run typeorm migration:run -- -d ./typeorm.config.ts",
"typeorm:revert-migrations": "npm run typeorm migration:revert -- -d ./typeorm.config.ts",
"seed:random": "ts-node -r tsconfig-paths/register scripts/seed-random.ts",
"seed:json": "ts-node -r tsconfig-paths/register scripts/seed-from-json.ts",
"destroy": "ts-node -r tsconfig-paths/register scripts/destroy.ts"

```

---

## 📚 API Documentation

- **Swagger UI**: `http://localhost:3000/api/v1/docs`
- **Postman collections**: `/postman`

---

## 🧩 Key Design Decisions

- **Cover Letter**: Stored as plain text (`string`)
- **Resume**: Uploaded as PDF; only file path stored
- **File Storage**: `/uploads/resumes`
- **Relations**: Applications link Users ↔ Jobs
- **Soft Delete**: Enabled for core entities with restore support
- **Security**: Sensitive fields excluded by default via entity-level `select: false`
- **Access Control**: Admin-only access for applications & resumes
- **Responses**: Centralized and simplified DTOs

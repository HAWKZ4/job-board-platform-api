# 💼 Job Board Platform – Backend API

A **production-ready job application backend** built with **NestJS**, **PostgreSQL**, **TypeORM**, and **JWT (HTTP-only cookies)**.

This version is fully refactored with **centralized services**, **soft delete support**, **enhanced logging**, **simplified API responses**, and **Dockerized production-ready setup**.

----------

## 🚀 Tech Stack

-   **Framework**: [NestJS](https://nestjs.com/)
    
-   **Database**: PostgreSQL + TypeORM
    
-   **Authentication**: JWT (Access & Refresh, HTTP-only cookies)
    
-   **File Uploads**: Multer (resume PDFs)
    
-   **API Docs**: Swagger (OpenAPI 3)
    
-   **DevOps**: Docker & Docker Compose (multi-stage production image)
    
-   **Utilities**: `.ms` for human-readable durations
    
-   **Testing & Tools**: Postman collections, seed scripts
    

----------

## ✅ Features

### 👤 Users (Job Seekers)

-   Register, login, logout (secure cookies)
    
-   Get current user info (`/me`)
    
-   View & update profile
    
-   Change password
    
-   Upload resume (PDF only)
    
-   Browse/search jobs (title, company, location)
    
-   Apply for jobs (cover letter text + resume PDF)
    
-   View or withdraw applications
    

----------

### 🛠️ Admins

-   **Users**: list, create, update, soft delete, restore soft-deleted users
    
-   **Jobs**: create, update, delete, publish/unpublish, restore deleted jobs
    
-   **Applications**: view all, filter by job/user, update status (`pending → reviewed → accepted/rejected`)
    

----------

### ⚙️ System & Infrastructure

-   Role-based access control (`@Roles`)
    
-   Guards for auth & role-protected routes
    
-   JWT stored in **secure HTTP-only cookies**
    
-   Centralized response handling (simplified response DTOs)
    
-   Enhanced logging via `MyLoggerService`
    
-   Soft delete support (`deletedAt`) with optional fetch of deleted records
    
-   File uploads stored in `/uploads/resumes`
    
-   Dockerized with multi-stage builds and `docker-entrypoint.sh` for migrations
    
-   PostgreSQL database with TypeORM entities: `User`, `Job`, `Application`, `Role`
    
-   Swagger for API documentation
    
-   CSV export for admins (jobs/applications)
    
-   Pagination & filtering for listing endpoints
    
-   Data seeding (`/data/users.json`, `/data/jobs.json`)
    

----------

## 🧩 Improvements & Refactors

Centralized repeated logic, enhanced logging, implemented soft deletes with restore functionality, simplified API responses, refactored Docker setup for production, and improved environment variable management.
    

----------

## 🧱 Project Structure

```
src/
├── admin/             # Admin-only controllers & services
├── applications/      # Job applications module
├── auth/              # JWT auth, guards, roles
├── common/            # Global interceptors, decorators, filters
├── database/          # TypeORM config, migrations, seeding
├── jobs/              # Job entity & CRUD logic
├── my-logger/         # Custom logging service
├── profiles/          # User profiles & resume upload
├── users/             # User entity & CRUD logic
├── utils/             # Helper functions (e.g., DeleteFile)
├── app.module.ts      # Root module
└── main.ts            # Application bootstrap

```

----------

## 📦 Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/HAWKZ4/job-board-platform-api.git
cd job-board-platform-api

```

### 2️⃣ Configure environment variables

Copy `.env.example` → `.env` and adjust values:

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

> 💡 For **running inside Docker**, set `DATABASE_HOST` to the service name (e.g., `postgres`).  
> 💡 In **production**, adjust host, port, and secrets accordingly.

----------

### 3️⃣ Run with Docker (dev mode)

```bash
docker-compose -f docker-compose.dev.yml up --build

```

-   API → `http://localhost:5000/api/v1`
    
-   Swagger → `http://localhost:5000/api/v1/docs`
    
-   PGAdmin → `http://localhost:8080` (`admin@admin.com` / `admin`)
    

----------

### 4️⃣ Run with Docker (prod mode)

```bash
docker-compose -f docker-compose.prod.yml up --build -d

```

-   API → `http://localhost:3000/api/v1`
    
-   Production-ready with migrations auto-run via `docker-entrypoint.sh`
    

----------

### 5️⃣ Database Migrations

Generate a migration (based on entity changes):

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

----------

### 6️⃣ Seed Data

Random seed:

```bash
npm run seed:random

```

Seed from JSON files:

```bash
npm run seed:json

```

----------

## 📝 NPM Scripts

```json
"typeorm:create-migration": "npm run typeorm -- migration:create ./migrations/$npm_config_name",
"typeorm:run-migrations": "npm run typeorm migration:run -- -d ./typeorm.config.ts",
"typeorm:revert-migrations": "npm run typeorm migration:revert -- -d ./typeorm.config.ts",
"seed:random": "ts-node -r tsconfig-paths/register scripts/seed-random.ts",
"seed:json": "ts-node -r tsconfig-paths/register scripts/seed-from-json.ts",
"destroy": "ts-node -r tsconfig-paths/register scripts/destroy.ts"

```

----------

## 📚 API Documentation

-   **Swagger UI**: `http://localhost:3000/api/v1/docs`
    
-   **Postman collections**: `/postman`
    

----------


### 🧩 Key Decisions & Design Choices

-   **Cover Letter:** Stored as a string (`coverLetter: string`) — users type it in a text area; no file upload needed.
    
-   **Resume:** Uploaded as a PDF (`resumePath: string`) — only the file path is saved in the database.
    
-   **File Storage:** All uploaded resumes are saved in `/uploads/resumes/`.
    
-   **Entity Links:** Each `Application` is linked to its `User` and `Job`.
    
-   **Soft Delete:** Records are soft-deleted; admins can restore or fetch deleted entries.
    
-   **Who Can View Applications / Resumes:** Admin only.
    
-   **API Responses:** Refactored, simplified, and centralized DTOs; removed repetitive response structures.
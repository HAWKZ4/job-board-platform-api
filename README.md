# 💼 Job Board Platform – Backend API

A **production-ready job application backend** built with **NestJS**, **PostgreSQL**, **TypeORM**, and **JWT (HTTP-only cookies)**.  
Designed with **role-based access control**, **clean architecture**, and **developer-friendly tooling**.

----------

## 🚀 Tech Stack

-   **Framework**: [NestJS](https://nestjs.com/)
    
-   **Database**: PostgreSQL + TypeORM
    
-   **Authentication**: JWT (Access & Refresh, HTTP-only cookies)
    
-   **File Uploads**: Multer (resume PDFs)
    
-   **API Docs**: Swagger (OpenAPI 3)
    
-   **DevOps**: Docker & Docker Compose
    
-   **Testing & Tools**: Postman collections, seed scripts
    

----------

## ✅ Features

### 👤 Users (Job Seekers)

-   Register, login, logout (secure cookies)
    
-   View & update profile
    
-   Change password
    
-   Upload resume (PDF)
    
-   Browse/search jobs (title, company, location)
    
-   Apply for jobs (cover letter + resume)
    
-   View or withdraw applications
    

### 🛠️ Admins

-   **Users**: list, create, update, soft delete
    
-   **Jobs**: create, update, delete, publish/unpublish
    
-   **Applications**: view all, filter by job/user, update status
    
    -   `pending → reviewed → accepted/rejected`
        

### ⚙️ System & Infrastructure

-   Role-based access control (`@Roles`)
    
-   Guards for auth & role-protected routes
    
-   **CORS configuration** → controlled origins in dev/prod
    
-   **Rate limiting** → brute-force protection
    
-   **Global error handling** → unified API error responses
    
-   **Logging** → all requests & errors logged under `/logs` with timestamps
    
-   Entities: `User`, `Profile`, `Job`, `Application`, `Role`
    
-   Soft deletes + timestamps
    
-   CSV export for admins
    
-   Pagination & filtering
    
-   **Data seeding** → `/data/users.json` & `/data/jobs.json`
    

----------

## 📚 API Documentation

-   **Swagger UI**: `http://localhost:3000/api/docs` (dev)
    
-   **Postman collections** (in `/postman`):
    
    -   `Auth.postman_collection.json`
        
    -   `User.postman_collection.json`
        
    -   `Profile.postman_collection.json`
        
    -   `Job.postman_collection.json`
        
    -   `Application.postman_collection.json`
        
    -   `Local.postman_environment.json`
        

----------

## 📂 Project Structure

```
src/
  ├── admin/              # Admin-only controllers & services
  ├── applications/       # Job applications module
  ├── auth/               # JWT auth, guards, roles
  ├── common/             # Global interceptors, decorators, filters
  ├── database/           # TypeORM config, migrations, seeding
  ├── jobs/               # Job entity & CRUD logic
  ├── my-logger/          # Custom logging service
  ├── profiles/           # User profiles & resume upload
  ├── users/              # User entity & CRUD logic
  ├── all-exceptions-filter.ts   # Global error filter
  ├── app.module.ts              # Root module
  └── main.ts                    # Application bootstrap

```

----------

## 📦 Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/job-board-platform-api.git
cd job-board-platform-api

```

### 2️⃣ Configure environment variables

Copy `.env.example` → `.env` and adjust values:

```env
# App
PORT=3000
NODE_ENV=development

# Database
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=jobboard

# JWT
JWT_ACCESS_TOKEN_SECRET=supersecret
JWT_ACCESS_TOKEN_EXPIRATION_MS=900000
JWT_REFRESH_TOKEN_SECRET=supersecretrefresh
JWT_REFRESH_TOKEN_EXPIRATION_MS=604800000

# Uploads
RESUME_UPLOAD_PATH=./uploads/resumes

```

### 3️⃣ Run with Docker (dev mode)

```bash
docker-compose -f docker-compose.dev.yml up --build

```

-   API → `http://localhost:3000`
    
-   Swagger → `http://localhost:3000/api/docs`
    
-   PGAdmin → `http://localhost:8080` (`admin@admin.com` / `admin`)
    

### 4️⃣ Database migrations

```bash
npm run typeorm:run-migrations

```

### 5️⃣ Seeding data

-   Random data:
    
    ```bash
    npm run seed:random
    
    ```
    
-   From prepared JSON files (`/data/users.json`, `/data/jobs.json`):
    
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

## 📌 Notes for Reviewers

This repo is designed as a **showcase project**:

-   Clear **commit history** (feature branches → main)
    
-   Includes **API docs + Postman collections**
    
-   Demonstrates **real-world patterns**: auth, RBAC, error handling, logging, migrations, seeding
    
-   Dockerized for portability
    
-   Built with a focus on **security, observability, and maintainability**
    

----------
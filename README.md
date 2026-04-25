# Simplified KeyCloak — Identity & Access Management App

A full-stack IAM web application inspired by KeyCloak, built with NestJS, React, TypeScript, and PostgreSQL.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS (TypeScript), TypeORM |
| Frontend | React 19 (TypeScript), Vite, Tailwind CSS v4 |
| Database | PostgreSQL |
| Auth | JWT (access token + bcrypt password hashing) |
| State | Zustand (auth), TanStack Query (server state) |

---

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm 9 or higher

---

## Project Structure

```
simplified-keycloak/
├── backend/    # NestJS REST API
└── frontend/   # React + Vite SPA
```

---

## Setup — Backend

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create the database

```bash
psql -U postgres
```

```sql
CREATE DATABASE keycloak_db;
CREATE USER keycloak_user WITH PASSWORD 'keycloak_pass';
GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO keycloak_user;
\q
```

### 3. Configure environment variables

Create `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=keycloak_db
DB_USERNAME=keycloak_user
DB_PASSWORD=keycloak_pass

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

### 4. Seed the database

```bash
npm run seed
```

This creates:
- Admin user: `admin` / `admin123`
- Root organization: `Kunden`
- Default auth settings row

### 5. Start the backend

```bash
npm run start:dev
```

API runs at: `http://localhost:3000/api/v1`

---

## Setup — Frontend

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Start the frontend

```bash
npm run dev
```

App runs at: `http://localhost:5173`

---

## Seed Credentials

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |
| Email | `admin@example.com` |
| Role | System Administrator |

---

## API Endpoints

All endpoints are prefixed with `/api/v1`. Protected endpoints require `Authorization: Bearer <token>`.

### Auth (public)

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Login with username/email + password |
| POST | `/auth/register` | Register a new user |
| GET | `/auth/me` | Get current authenticated user |

### Users (protected)

| Method | Path | Description |
|---|---|---|
| GET | `/users` | List all users (optional `?search=`) |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create a new user |
| PATCH | `/users/:id` | Update a user |
| DELETE | `/users/:id` | Delete a user |
| PATCH | `/users/:id/activate` | Activate a user |
| PATCH | `/users/:id/deactivate` | Deactivate a user |

### Organizations (protected)

| Method | Path | Description |
|---|---|---|
| GET | `/organizations` | List organizations (optional `?search=`) |
| GET | `/organizations/:id` | Get organization by ID |
| POST | `/organizations` | Create organization |
| DELETE | `/organizations/:id` | Delete organization |

### Invitations (protected)

| Method | Path | Description |
|---|---|---|
| GET | `/invitations` | List all invitations |
| POST | `/invitations` | Create invitations for one or more emails |

### Settings (protected)

| Method | Path | Description |
|---|---|---|
| GET | `/settings` | Get global auth/MFA settings |
| PATCH | `/settings` | Update settings (partial) |

---

## Features

- JWT authentication with bcrypt password hashing
- User registration and login (+ Google button placeholder)
- Protected routes — unauthenticated users redirected to `/login`
- User management: list, search, create, edit, activate/deactivate, delete
- Organization management: hierarchical tree, create with optional parent
- User invitations: multi-email input, assign to organization
- Global auth settings: toggle Passkeys, Password, Email Passcodes, SMS
- Global MFA settings: toggle TOTP, Email, SMS
- Collapsible sidebar navigation
- Responsive two-panel layout (matching provided UI screenshots)
- Auto-logout on 401 (expired token)
- Optimistic UI updates on settings toggles

---

## Running in Production

> For production, make these changes before deploying:

1. Set `synchronize: false` in `app.module.ts` and use TypeORM migrations instead
2. Use strong random values for `JWT_SECRET` and `JWT_REFRESH_SECRET`
3. Set `NODE_ENV=production`
4. Run `npm run build` in both backend and frontend
5. Serve the frontend `dist/` folder via a static host or Nginx
6. Use environment variables — never commit `.env` files
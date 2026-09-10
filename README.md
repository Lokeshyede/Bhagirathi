# Bhagirathi Hostel & PG Management System

Welcome to the production release of the **Bhagirathi Hostel & PG Management System** — a highly structured, scalable, and secure monorepo built using **pnpm Workspaces**, **React 19**, **FastAPI**, **PostgreSQL**, and **Docker**.

This repository is designed with production-ready optimizations, including secure file uploads, database index query acceleration, and Gzip-compressed, hardened Nginx reverse proxy routing.

---

## 📖 Operational Documentation

We have generated comprehensive, production-grade guides for developers and operations staff:

1. **[Installation & Local Setup Guide (INSTALL.md)](file:///e:/bagiraty%20pg/INSTALL.md)**
   - Complete local environment setups, dependencies installations, database creations, and test seeding commands.
2. **[Environment Variables Reference (ENV_VARS.md)](file:///e:/bagiraty%20pg/ENV_VARS.md)**
   - Detailed guide on configuration variables, JWT secrets, database connection URLs, and client preferences.
3. **[Production Deployment Manual (DEPLOY.md)](file:///e:/bagiraty%20pg/DEPLOY.md)**
   - Walkthrough for orchestrating multi-container Docker compose environments, production builds, and Nginx reverse proxy configurations.
4. **[API Specification & Endpoints (API.md)](file:///e:/bagiraty%20pg/API.md)**
   - REST API standards catalog, query pagination models, and JWT authentication schemas.
5. **[Repository Folder Structure (STRUCTURE.md)](file:///e:/bagiraty%20pg/STRUCTURE.md)**
   - Monorepo folder organization, package namespaces, and application boundaries diagram.
6. **[Developer Guidelines (DEVELOPER.md)](file:///e:/bagiraty%20pg/DEVELOPER.md)**
   - Best practices for new developers regarding design aesthetics, UI standards, coding conventions, and automated tests.

---

## 🛠️ Monorepo Quick Overview

The workspace layout organizes logic boundaries clearly across folders:

* **`apps/`**: Standalone client and server interfaces.
  * `admin/`: Admin Dashboard portal (React 19, Vite, tailwind).
  * `tenant/`: Tenant billing, check-in, and notice panel (React 19, Vite, tailwind).
  * `maintenance/`: Task assignment and ticket resolution portal (React 19, Vite, tailwind).
  * `backend/`: FastAPI database REST backend, powered by SQLAlchemy + Alembic.
* **`packages/`**: Monorepo shared packages.
  * `ui/`: Design system components and Tailwind presets.
  * `api-client/`: Central Axios client, JWT authorization interceptors, and React Query instances.
  * `types/`: Shared Pydantic/TypeScript validation signatures.
  * `utils/`: Unified JavaScript helper libraries.
  * `validation/`: Client-side Zod form rules.
  * `constants/`: Shared enums, statuses, and config parameters.
* **`docker/`**: Infrastructure container blueprints.

---

## 🚀 Quick Run (Production Compose)

To start the entire platform with production proxying, caching, and database schemas:

```bash
# Start multi-container stack
docker compose up --build -d

# Run migrations (automatically done inside backend container entrypoint or run manually)
docker compose exec backend alembic upgrade head
```

Add these hosts configuration entries locally:
```text
127.0.0.1 admin.local
127.0.0.1 tenant.local
127.0.0.1 maintenance.local
```
- **Admin App**: `http://admin.local` (or `http://localhost` fallback)
- **Tenant App**: `http://tenant.local`
- **Maintenance App**: `http://maintenance.local`
- **FastAPI Documentation**: `/api/v1/docs` route on any server block.

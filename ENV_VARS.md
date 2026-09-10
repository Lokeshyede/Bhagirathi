# Environment Variables Reference Guide

This document catalogs all environment variables used by the Bhagirathi Hostel & PG Management System backend and frontends.

---

## 1. Backend Environment Variables

Create a `.env` file in `apps/backend/` to specify these settings:

| Variable Name | Type | Default Value | Description |
|---|---|---|---|
| `PROJECT_NAME` | String | `Bhagirathi Hostel & PG Management System` | Project title displayed in logs/FastAPI metadata. |
| `SECRET_KEY` | String | `bhagirathi_super_secret_key_development_only_change_in_production` | Cryptographic secret key used for signing JWT tokens. **Change this in production.** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Integer | `11520` (8 days) | JWT expiration threshold. |
| `BACKEND_CORS_ORIGINS` | CSV List | `http://localhost:5173,http://localhost:5174,http://localhost:5175,http://admin.local,http://tenant.local,http://maintenance.local` | Allowed CORS origins for browser AJAX calls. |
| `POSTGRES_SERVER` | String | `localhost` | PostgreSQL database hostname. |
| `POSTGRES_USER` | String | `postgres` | Database username. |
| `POSTGRES_PASSWORD` | String | `postgres` | Database password. |
| `POSTGRES_DB` | String | `bhagirathi_pg` | Target database name. |
| `DATABASE_URL` | String | *Auto-assembled* | Optional connection string. If provided, overrides separate postgres parameters. |

---

## 2. Frontend Configuration Variables

Vite reads environment variables starting with `VITE_`.
Create a `.env` file in the respective client apps (`apps/admin/`, `apps/tenant/`, `apps/maintenance/`):

| Variable Name | Type | Default Value | Description |
|---|---|---|---|
| `VITE_API_URL` | String | `http://localhost:8000` | Target URL pointing to the FastAPI API gateway. In production Docker setups, this can be mapped to `/` to leverage Nginx proxy paths. |

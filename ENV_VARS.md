# Environment Variables Reference Guide

This document catalogs all environment variables used by the Bhagirathi Hostel & PG Management System backend and frontends.

---

## 1. Backend Environment Variables

Create a `.env` file in `apps/backend/` to specify these settings:

| Variable Name | Type | Default Value | Description |
|---|---|---|---|
| `PROJECT_NAME` | String | `Bhagirathi Hostel & PG Management System` | Project title displayed in logs/FastAPI metadata. |
| `APP_ENV` | String | `development` | Deployment environment (`development` or `production`). Production enforces strict security guards. |
| `SECRET_KEY` | String | `bhagirathi_super_secret_key_...` | Cryptographic secret key used for signing JWT tokens. **Must be a secure 64-character random string in production.** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Integer | `60` | JWT access token expiration threshold (60 minutes). |
| `BACKEND_CORS_ORIGINS` | JSON / CSV | `["http://localhost:5173", ...]` | Allowed CORS origins. In Railway production, set to: `["https://bhagirathi-admin-seven.vercel.app","https://bhagirathi-tenant-ten.vercel.app","<maintenance-vercel-url>"]`. |
| `DATABASE_URL` | String | `postgresql://...` | Connection string for Neon PostgreSQL database. |
| `CLOUDINARY_CLOUD_NAME` | String | `""` | Cloudinary cloud identifier for secure media/document storage. |
| `CLOUDINARY_API_KEY` | String | `""` | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | String | `""` | Cloudinary API Secret (backend only). |
| `VAPID_PUBLIC_KEY` | String | `""` | Web Push VAPID public key (EC P-256). |
| `VAPID_PRIVATE_KEY` | String | `""` | Web Push VAPID private key (**backend only, never commit**). |
| `VAPID_CLAIM_EMAIL` | String | `mailto:admin@bhagirathihostel.com` | Contact email for Web Push VAPID claims. |

---

## 2. Frontend Configuration Variables

Vite reads environment variables starting with `VITE_`.
Create a `.env` file in the respective client apps (`apps/admin/`, `apps/tenant/`, `apps/maintenance/`):

| `VITE_API_URL` | String | `http://localhost:8000` (dev) | Target URL pointing to the FastAPI API gateway. In Vercel production deployment settings for all three apps, configure this to the production backend URL: `https://bhagirathibackend-production.up.railway.app`. Do NOT set to `/` on Vercel as SPA routing rewrites relative requests to `index.html`. |
| `VITE_VAPID_PUBLIC_KEY` | String | (fetched from backend) | Optional frontend override for the VAPID public key. If omitted, the frontend automatically fetches it from `/api/v1/notifications/push/public-key`. |

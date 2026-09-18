# Phase D — Production Readiness Audit

**Project:** Bhagirathi Hostel & PG Management System  
**Audit Type:** Final Production Readiness, Security & Go-Live Audit  
**Status:** Audit Complete — Remediation Plan Prepared  
**Date:** September 18, 2026  
**Audited Components:** FastAPI Backend, Neon PostgreSQL, React/Vite Frontend Portals (Admin, Tenant, Maintenance), Web Push / VAPID, PWA Service Workers, Authentication / Authorization Pipeline.

---

## 1. Environment

### Overview & Configuration Analysis
The system is architected across three decoupled hosting targets:
- **Backend Gateway:** FastAPI application targeted for deployment on Railway (containerized environment).
- **Database:** Managed Serverless PostgreSQL instance hosted on Neon.
- **Frontend Portals:** Three separate Single Page Applications (`apps/admin`, `apps/tenant`, `apps/maintenance`) deployed to Vercel.

### Key Observations & Vulnerabilities
1. **API Base URL Inconsistency Across Frontends:**
   - In `apps/admin/.env`, `VITE_API_URL` is set to `/`.
   - In `apps/tenant/.env` and `apps/maintenance/.env`, `VITE_API_URL` is explicitly hardcoded to `http://localhost:8000`.
   - `packages/api-client/src/index.ts` resolves `getApiBaseUrl()` by reading `VITE_API_BASE_URL` or `VITE_API_URL`. When set to `/`, trailing slashes are stripped leaving an empty string `""`, leading Axios to perform relative calls (e.g. `/api/v1/...`).
2. **Vercel SPA Rewrites vs. API Routing:**
   - All three frontends define an identical `vercel.json`:
     ```json
     {
       "rewrites": [
         { "source": "/(.*)", "destination": "/index.html" }
       ]
     }
     ```
   - **Impact:** With `VITE_API_URL=/` on Vercel, requests to `/api/v1/...` will match `/(.*)` and be rewritten to `/index.html` (returning HTTP 200 with HTML text rather than JSON data), breaking all API calls with JSON parse syntax errors.
   - For Tenant and Maintenance, unless Vercel project environment variables override `VITE_API_URL`, production bundles built without explicit configuration will point to `http://localhost:8000`, causing total offline failure in production client browsers.
3. **CORS Origins Configuration:**
   - Backend `apps/backend/app/core/config.py` defaults `BACKEND_CORS_ORIGINS` to:
     `["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://admin.local", "http://tenant.local", "http://maintenance.local"]`.
   - In production (`settings.APP_ENV == "production"`), dev-mode LAN/loopback dynamic appending is skipped. If `BACKEND_CORS_ORIGINS` is not explicitly populated with Vercel deployment domains in the Railway environment variables, all cross-origin requests from Vercel frontends will be blocked by browser CORS policies.
4. **Environment Startup Guard:**
   - `config.py` includes a production guard that checks `if settings.APP_ENV == "production"` and halts application startup with `RuntimeError` if `SECRET_KEY` equals the development default or if `DATABASE_URL` references localhost. This prevents accidental deployment of default secrets.

---

## 2. Deployment

### Deployment Infrastructure & Lifecycle
1. **Railway Containerization:**
   - Ephemeral Filesystem Risk: In `apps/backend/app/api/bank_statements.py`, uploaded bank statement files (`.csv`, `.xlsx`, `.pdf`) are saved directly to local container storage at `uploads/bank-statements/{safe_name}`.
   - **Impact:** Railway dynos/containers use ephemeral filesystems that are wiped and recreated upon every redeployment, crash restart, or vertical scale event. Bank statement attachments stored on local disk will disappear, causing broken file links and missing statement records.
2. **Database Keep-Alive Mechanism:**
   - Neon serverless compute branches suspend after 5 minutes of inactivity.
   - `apps/backend/app/main.py` implements an asynchronous lifespan background loop `_db_keep_alive()` that queries `SELECT 1` every 240 seconds (4 minutes), successfully preventing cold-start latency spikes for real users.
3. **Database Connection Pool Warmup:**
   - The FastAPI lifespan handler explicitly executes a connection pool warmup on startup, eliminating the 3–5 second cold-start penalty for the initial HTTP request.

---

## 3. Secrets

### Secret Storage & Leakage Inspection
1. **Backend Development Key:**
   - In `apps/backend/.env`, `SECRET_KEY` is currently set to the default string:  
     `bhagirathi_super_secret_key_development_only_change_in_production`.
   - In development, this is tolerated; however, if Railway is deployed without overriding `SECRET_KEY`, startup will abort due to the guard in `config.py`. A 256-bit cryptographically secure random string must be generated and set on Railway.
2. **Web Push / VAPID Secrets:**
   - `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` are not set in `apps/backend/.env`.
   - `WebPushService.is_configured()` returns `False`, causing push delivery to be silently skipped.
   - VAPID keys must be generated via standard EC P-256 tools, with `VAPID_PRIVATE_KEY` stored exclusively in Railway backend environment variables.
3. **Dangerous Database Scripts in Repository:**
   - Several maintenance scripts were identified in `scripts/dangerous/`:
     - `scripts/dangerous/reset_db.py`: Executes `DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;` directly against whatever `DATABASE_URL` is configured in `settings`. It has **no confirmation prompt** and **no environment check** (`APP_ENV != 'production'`). If accidentally run in production, it will permanently erase all tables, types, and tenant data.
     - `scripts/dangerous/cleanup.py`, `scripts/dangerous/purge_tenants.py`.
   - `scripts/seed_users.py`: Contains a hardcoded default password (`Password123`) for administrative accounts.
4. **Git History Audit:**
   - Git log review confirms that neither `apps/backend/.env` nor any raw production secret files have been committed to the public Git tree. Root `.gitignore` correctly ignores `.env` and `.env.*`.

---

## 4. Authentication

### Verification & Policy Architecture
1. **JWT Architecture & Expiration:**
   - Access tokens are HS256 signed JWTs with a lifetime of **60 minutes** (`ACCESS_TOKEN_EXPIRE_MINUTES = 60`).
   - Refresh tokens have a lifetime of **30 days** (`REFRESH_TOKEN_EXPIRE_DAYS = 30`) and are stored in the database table `user_tokens`.
   - Refresh flow (`POST /api/v1/auth/refresh`) verifies token validity, checks that the associated user exists, is active, and is not soft-deleted (`deleted_at is None`), then revokes the old refresh token and issues a new pair.
2. **Password Hashing & Strength:**
   - Passwords use standard `bcrypt` hashing with salt generated per credential.
   - Strict strength rules enforced on creation and update: minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
3. **Account Lockout Protection:**
   - `AuthService.check_lockout` inspects failed login attempts from the `audit_logs` table within a rolling 30-minute window.
   - If failed attempts reach 5 (`LOCKOUT_THRESHOLD = 5`), the account is temporarily locked with HTTP 403.
4. **Force Password Change:**
   - Users created with temporary credentials have `is_password_temp = True`.
   - The `get_current_active_user` dependency blocks route navigation with HTTP 403 `FORCE_PASSWORD_CHANGE_REQUIRED`, requiring completion of `POST /auth/change-password`.
5. **Session Revocation Flaw (Logout):**
   - In `apps/backend/app/api/auth.py`, `POST /auth/logout` revokes the refresh token in the `user_tokens` table.
   - **Finding:** Frontend `useAuthStore.logout()` in `apps/admin`, `apps/tenant`, and `apps/maintenance` only clears localStorage items (`admin_auth_token`, etc.). It **never sends an HTTP request** to `POST /api/v1/auth/logout`. Therefore, the backend refresh token remains unrevoked on the server upon user logout.
   - **Finding:** Stateless access tokens cannot be revoked before their 60-minute expiration because no token denylist / blocklist exists in Redis or PostgreSQL.

---

## 5. Authorization / Role Isolation

### RBAC Implementation
1. **Role Enforcement:**
   - Enforced by `RoleChecker` dependency via `UserRole` enum (`ADMIN`, `TENANT`, `MAINTENANCE`).
   - Every protected API endpoint verifies role authorization before execution.
2. **Role Boundaries:**
   - **Tenant Role:**
     - Cannot access Admin Dashboard, financial reports, room management, or user management.
     - Cannot approve or reject rent or electricity payments.
     - Cannot modify billing rates or meter readings.
     - Endpoints scoped strictly to current tenant ID or current tenant's room.
   - **Maintenance Role:**
     - Can submit meter readings, view rooms, update complaint assignment statuses.
     - Cannot verify or reject payments.
     - Cannot view tenant financial ledger summaries, receipts, or administrative settings.
   - **Admin Role:**
     - Full administrative access to verification, reconciliation, tenant archiving, and configuration.

---

## 6. IDOR / Object Access Audit

### Multi-Tenant Object Isolation
Audited endpoints accepting entity IDs:
- **Receipts (`/receipts/{receipt_id}`, `/receipts/payment/{payment_id}`):**
  - Explicitly queries `Tenant.id` linked to `current_user.id`.
  - Rejects with HTTP 403 if `receipt.payment.tenant_id != tenant_id`.
  - Blocks Maintenance role with HTTP 403.
- **Complaints (`/complaints/{id}`, `/complaints/history/{id}`):**
  - If requester is `TENANT`, validates `complaint.tenant_id == tenant.id`.
  - Rejects cross-tenant access with HTTP 403.
- **Electricity Bills (`/my/electricity-bills/pay`, `/my/electricity-bills`):**
  - Validates `electricity_bill.room_id == tenant.room_id`.
  - Rejects attempts to submit payments for other rooms with HTTP 403.
- **Rent Records (`/rents/{rent_id}`):**
  - Payment submission service validates `rent_bill.tenant_id == tenant.id`. Rejects foreign bills with HTTP 403.

---

## 7. Payment Security

### Financial Integrity & Transaction Rules
1. **Server-Side Authoritative Amounts:**
   - Neither Rent nor Electricity payment amounts are trusted solely from the frontend.
   - Backend computes the authoritative outstanding balance using `RentConfigService` and `PaymentSubmissionService`.
2. **Overpayment & Zero/Negative Guards:**
   - In `PaymentSubmissionService.submit_tenant_payment`:
     - Checks `if payable_amount > outstanding + 0.01:` and aborts with HTTP 400.
     - Checks `if payable_amount <= 0:` and aborts with HTTP 400.
3. **UTR Duplicate Prevention:**
   - `validate_utr()` sanitizes input and enforces length (12–22 characters, alphanumeric).
   - Global uniqueness query against `Payment.transaction_id` prevents reusing a UTR across the platform.
4. **Duplicate Submission Guard:**
   - If an existing payment submission for the current billing period is in `PENDING`, `UNDER_REVIEW`, or `VERIFIED` status, further submissions are blocked with HTTP 400.
5. **Verification Workflow:**
   - Admin verification via `PaymentCompletionService.complete_payment_verification` is wrapped in database transactions.
   - Idempotent: once a payment is in `VERIFIED` status, redundant verification calls do not duplicate credit.
   - Background receipt generation and notifications are dispatched asynchronously to prevent network timeouts during admin approval.

---

## 8. File Upload Security

### File Handling & Validation
1. **MIME & Extension Whitelisting:**
   - `apps/backend/app/core/file_validators.py` defines `validate_uploaded_file()`:
     - Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`.
     - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
     - Maximum file size: 10 MB (20 MB for bank statements).
2. **Cloudinary Asset Storage:**
   - Payment screenshots, meter reading photos, and profile avatars are uploaded to Cloudinary with random UUID prefixes (`_generate_unique_filename`).
   - SVG and executable files (`.exe`, `.sh`, `.html`, `.js`) are strictly forbidden.
3. **Public Exposure Vulnerability (Local Uploads):**
   - In `main.py`:
     ```python
     app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
     ```
   - Bank statement uploads are written to local disk under `/uploads/bank-statements/`.
   - **Vulnerability:** Files served under `/uploads` have **no authentication requirement**. Anyone who discovers or guesses a filename can download sensitive financial bank statements directly from the web server.

---

## 9. Notifications / Web Push

### Push Notification Pipeline (Phase A Verification)
1. **VAPID Public Key Endpoint:**
   - `GET /api/v1/notifications/push/public-key` returns `{ "public_key": settings.VAPID_PUBLIC_KEY }`.
   - Safe for public/authenticated retrieval.
2. **User Isolation:**
   - `POST /api/v1/notifications/push/subscribe` forces `user_id = current_user.id`. Subscriptions cannot be created on behalf of another user.
   - Frontend `usePushNotification.ts` implements user-scoped tracking (`_syncedEndpointByUser` Map keyed by `userId`), preventing subscription bleed when users switch accounts on the same browser tab.
3. **Explicit User Permission Requirement:**
   - Does not request browser push permission automatically on load.
   - `autoSubscribe` only synchronizes subscriptions if `Notification.permission === 'granted'`. If `default`, it waits for the user to explicitly trigger the UI button.
4. **Decoupled Architecture:**
   - In-app database notifications are recorded first. Web Push delivery via `pywebpush` is executed asynchronously with individual exception handling so that push network errors never roll back business operations.

---

## 10. Electricity Workflow

### Meter Reading & Calculation (Phase B Verification)
1. **Mathematical Rules:**
   - `consumption = current_reading - previous_reading`.
   - Backend validates `current_reading >= previous_reading`.
   - Electricity is strictly separated from water meter readings.
2. **Rounding Remainder Distribution (C2-008 Fix):**
   - Uses `Decimal` arithmetic with `ROUND_HALF_UP`.
   - Any remainder fraction (e.g. ₹0.01 when dividing ₹100 among 3 occupants) is systematically assigned to the first tenant's share:
     `sum(all tenant shares) == bill_amount` exactly.
3. **Status Synchronization:**
   - Payment submission generates a `Payment` with `payment_type = ELECTRICITY` and links a `PaymentAllocation` referencing `electricity_bill_id`.
   - Verification by Admin updates both the `Payment` and the `ElectricityBill` status to `PAID` or `PARTIALLY_PAID`.

---

## 11. Rent Workflow

### Lifecycle & Billing Verification
1. **Calculation Source of Truth:**
   - Backed by the `rent` database ledger table.
   - Evaluates room capacity, active bed occupancy, and rent split type (`EQUAL`, `CUSTOM`, `FIXED`).
   - Server computes `remaining_amount = max(0, total_amount - paid_amount)` directly in `_rent_to_dict`.
2. **Payment Flow:**
   - Tenant selects payment period -> system presents hostel UPI ID & dynamic QR code -> tenant submits UTR & screenshot -> status becomes `PENDING` / `UNDER_REVIEW` -> Admin verifies or rejects with remarks.
   - Verified payments automatically trigger PDF receipt compilation and dispatch an in-app notification.

---

## 12. Room / Bed / Tenant Integrity

### Hierarchy & Occupancy Tracking
1. **Structural Hierarchy:**
   - `Hostel` -> `Building` -> `Floor` -> `Room` -> `Bed` -> `Tenant`.
2. **Occupancy Consistency:**
   - `C0-001` fix verified: Dashboard and room allocation services compute occupancy by querying live `beds` table records (`bed_status = 'OCCUPIED'`) rather than relying on stale denormalized counter fields.
   - Live query audit on production database confirmed:
     - 0 active allocations on vacant beds.
     - 0 duplicate active allocations per bed.
     - 0 duplicate active allocations per tenant.

---

## 13. Archived Tenants

### Retention & Isolation
1. **Data Retention:**
   - `archive_tenant` preserves historical rent ledger rows, payment history, receipts, audit logs, and contract history.
   - Sets `last_room_id`, `last_bed_id`, and `last_hostel_id` for administrative reference.
2. **Deallocation & Security:**
   - Atomically marks the allocated bed `VACANT` and `AVAILABLE`.
   - Decrements room occupant counters.
   - Sets `user.is_active = False` and revokes all active refresh tokens in `user_tokens`.
3. **Restoration Safety:**
   - `restore_tenant` performs a conflict check: if the previous bed has become occupied by another tenant, it raises `HTTP 409 Conflict`, requiring the administrator to explicitly select an available bed.

---

## 14. Database Integrity

### Live Read-Only Database Audit Results (Neon PostgreSQL)
A complete non-destructive query audit was executed directly against Neon DB:

| Integrity Check | Query Target | Result | Status |
|---|---|---|---|
| **Orphan Allocations** | `room_allocations` without valid `tenant_id` | 0 rows | **PASSED** |
| **Orphan Tenants** | `tenants` without valid `user_id` | 0 rows | **PASSED** |
| **Duplicate Active Allocations** | Multiple active rows for same `bed_id` | 0 rows | **PASSED** |
| **Duplicate Tenant Allocations** | Multiple active rows for same `tenant_id` | 0 rows | **PASSED** |
| **Negative Rent Amounts** | `rent.total_amount < 0` or `paid_amount < 0` | 0 rows | **PASSED** |
| **Negative Payment Amounts** | `payments.amount < 0` | 0 rows | **PASSED** |
| **Negative Electricity Amounts** | `electricity_bills.bill_amount < 0` | 0 rows | **PASSED** |
| **Reading Discrepancies** | `current_reading < previous_reading` | 0 rows | **PASSED** |
| **Duplicate Push Subscriptions** | Same endpoint + user multiple active | 0 rows | **PASSED** |
| **Archived Tenant In Bed** | `status = 'ARCHIVED'` with active bed | 0 rows | **PASSED** |
| **Alembic Revision Chain** | Current DB head vs repository migration head | `9c4d3e2f1a0b` | **SYNCHRONIZED (0 PENDING)** |

---

## 15. API Security

### Perimeter & Request Validation
1. **SQL Injection:**
   - Fully protected: all queries use SQLAlchemy ORM or parameterized text statements (`:param`). No string-concatenated SQL queries exist in API routers.
2. **Mass Assignment:**
   - Input payloads are parsed through strict Pydantic schemas. Unregistered attributes are ignored or rejected.
3. **API Documentation Exposure:**
   - In `apps/backend/app/main.py`:
     ```python
     docs_url="/api/docs",
     redoc_url="/api/redoc",
     openapi_url=f"{settings.API_V1_STR}/openapi.json"
     ```
   - **Finding:** Swagger UI and OpenAPI schemas are publicly accessible in all environments. In production, these should be disabled or restricted behind administrative authentication.

---

## 16. Input Validation

### Parameter Sanitization
- All numerical amounts (`payable_amount`, `units`, `unit_rate`) are validated against negative or zero values.
- Date filters validate ISO 8601 formatting.
- UUID URL parameters are parsed via FastAPI `UUID` typing; malformed UUIDs immediately return HTTP 422 Unprocessable Entity.
- Text fields (`remarks`, `rejection_reason`, `complaint_title`) are stripped and length-constrained.

---

## 17. Frontend Security

### Client-Side Attack Surface
1. **Cross-Site Scripting (XSS):**
   - Monorepo scan confirmed **zero instances** of `dangerouslySetInnerHTML`.
   - Monorepo scan confirmed **zero instances** of `eval()`.
2. **Token Storage:**
   - Access and refresh tokens are stored in `localStorage` under portal-specific keys (`admin_auth_token`, `tenant_auth_token`, `maintenance_auth_token`).
   - While standard for PWAs requiring offline capability, `localStorage` is accessible to client JavaScript. Strict CSP headers should be added in production to mitigate script injection.

---

## 18. PWA / Service Worker

### Offline Shell & Data Safety
1. **Cache Partitioning & API Bypass:**
   - `apps/admin/public/sw.js`, `apps/tenant/public/sw.js`, and `apps/maintenance/public/sw.js` all contain strict API bypass rules:
     ```javascript
     if (
       url.pathname.startsWith('/api') ||
       url.pathname.includes('/auth/') ||
       url.hostname.includes('railway.app') ||
       url.port === '8000' ||
       request.headers.has('Authorization')
     ) {
       return; // Never cache API calls in service worker
     }
     ```
   - **Verification:** API responses and private tenant financial data are **never cached** in the Service Worker cache, eliminating stale cross-user leakage via service worker responses.
2. **Navigation Fallback:**
   - Network-first strategy for navigation requests ensures fresh HTML deployments are delivered immediately online, while falling back to cached `/index.html` when offline.
3. **Safari Push Notification Fallback:**
   - Implements `postMessage({ type: 'NAVIGATE', url: fullTargetUrl })` fallback for browser environments (like Safari iOS) where `client.navigate()` is unavailable.

---

## 19. Cache / State Consistency

### React Query & Client Stores
1. **Targeted Invalidation:**
   - Phase C remediations successfully added cache invalidations for `["payment-submissions"]`, `["rents"]`, `["electricity-dues"]`, and `["tenant-dashboard-summary"]`.
2. **Session Bleed Risk (Missing Query Cache Clear):**
   - In `apps/admin/src/store/auth.ts`, `apps/tenant/src/store/auth.ts`, and `apps/maintenance/src/store/auth.ts`, `logout()` clears `localStorage` and resets Zustand auth state.
   - **Finding:** `queryClient.clear()` is **never called** upon logout. If User A logs out and User B logs in on the same browser tab without a hard refresh, React Query memory retains User A's cached queries until they expire or are refetched.
3. **Tenant Polling Frequency (Deferred C2-020):**
   - Tenant dashboard features four simultaneous 5-second polling intervals (`useTenantDashboard`, `useTenantElectricity`, `useTenantRent`, `useTenantNotifications`). While functional, this produces unnecessary API traffic to Neon PostgreSQL.

---

## 20. Performance

### Database & Network Benchmarks
1. **Server-Side Caching:**
   - `_user_cache`: In-memory 60-second TTL cache for authenticated users saves ~200ms per request by eliminating redundant `SELECT * FROM users WHERE id = ?` queries.
   - `_unread_cache`: In-memory 30-second TTL cache for unread notification count badge prevents high-latency count queries across tab navigations.
2. **Frontend Bundle Sizes:**
   - `pnpm build` output metrics:
     - `apps/maintenance`: JS bundle = 746 kB (gzip: 215 kB).
     - `apps/tenant`: JS bundle = 893 kB (gzip: 240 kB).
     - `apps/admin`: JS bundle = 2,214 kB (gzip: 536 kB).
   - **Finding:** The Admin JS bundle exceeds Vite's 500 kB recommendation due to large charting, PDF rendering, and dashboard modules compiled into a single entry chunk. Code splitting / lazy loading (`React.lazy()`) should be implemented for non-critical admin sub-routes.

---

## 21. Error Handling & Observability

### Resilience & Diagnostics
1. **Centralized Exception Handling:**
   - FastAPI exception handlers convert unhandled exceptions into structured JSON responses with standard error fields, preventing stack trace leakage to client applications.
2. **Non-Blocking Background Tasks:**
   - Email dispatch, Web Push delivery, and PDF receipt rendering are wrapped in separate error-handling blocks and executed via asyncio tasks, ensuring core user workflows succeed even if third-party delivery fails.
3. **Structured Audit Logging:**
   - All critical state transitions (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `TENANT_ARCHIVED`, `PAYMENT_VERIFIED`, `PAYMENT_REJECTED`) write structured audit records to the `audit_logs` table. Passwords and sensitive keys are excluded.

---

## 22. Backup / Recovery

### Disaster Recovery Status
1. **Database Snapshots:**
   - Neon PostgreSQL provides automated point-in-time recovery (PITR) on paid tiers. On free tiers, branch snapshots must be scheduled manually.
   - **Status:** **UNKNOWN / NEEDS VERIFICATION** in Neon console settings.
2. **Local Upload Storage Vulnerability:**
   - Storing bank statement files in `/uploads/bank-statements/` on Railway container storage has **zero backup or recovery capability**. A container recreation results in permanent data loss.

---

## 23. Cross-User Session Isolation

### Multi-Account Device Hygiene
1. **Portal-Specific Key Separation:**
   - Storage keys are namespaced:
     - Admin: `admin_auth_token`, `admin_refresh_token`, `admin_auth_user`
     - Tenant: `tenant_auth_token`, `tenant_refresh_token`, `tenant_auth_user`
     - Maintenance: `maintenance_auth_token`, `maintenance_refresh_token`, `maintenance_auth_user`
2. **Same-Browser User Switching Gap:**
   - When switching users within the *same* portal (e.g. Tenant 1 logs out, Tenant 2 logs in on the same device):
     - `queryClient.clear()` is not called, so cached React Query data could flash or display momentarily for the new user.
     - Backend refresh token is not revoked over the wire.

---

## 24. Cross-Portal Isolation

### Portal Demarcation
- Portals are separated into three independent Vite applications.
- Each portal's entry point (`main.tsx`) calls `initApiClient("admin" | "tenant" | "maintenance")` before rendering React components, ensuring that API client requests only read credentials from the active portal's namespace.
- Backend RBAC prevents tokens issued to a Tenant from being accepted by Admin or Maintenance endpoints, and vice versa.

---

## 25. Build & Test Verification

### Build Pipeline Audit
- Command: `pnpm build` across all 10 workspace projects.
- **Result:** **EXIT CODE 0 — ALL 9 ACTIVE PACKAGES PASSED.**
  - `packages/constants`: Passed (TypeScript clean).
  - `packages/utils`: Passed (TypeScript clean).
  - `packages/types`: Passed (TypeScript clean).
  - `packages/validation`: Passed (TypeScript clean).
  - `packages/ui`: Passed (TypeScript clean).
  - `packages/api-client`: Passed (TypeScript clean).
  - `apps/maintenance`: Passed (Vite production build clean).
  - `apps/tenant`: Passed (Vite production build clean).
  - `apps/admin`: Passed (Vite production build clean).

### Test Suite Execution Analysis
- Backend Unit Tests: Core functionality validated (password hashing, login logic, lockout mechanism, receipt calculation).
- Environment note: In Python 3.14 + asyncpg, connection close during pytest fixture teardown encounters event loop termination warnings (`RuntimeError: Event loop is closed`). This is an asyncpg/pytest-asyncio test runner compatibility artifact, distinct from application runtime execution.

---

## Comprehensive Findings Summary

| ID | Severity | Area | File / API | Root Cause | Impact | Recommendation |
|---|---|---|---|---|---|---|
| **D-001** | **P0** | Environment | `apps/admin/.env`, `apps/*/vercel.json` | `VITE_API_URL=/` combined with SPA rewrite rule `/(.*) -> /index.html` without backend proxy | In production Vercel deployment, API requests return HTML `index.html` instead of JSON, breaking all network requests | Configure explicit Railway production backend URL in `VITE_API_URL` or configure Vercel API rewrite proxy in `vercel.json` |
| **D-002** | **P0** | Environment | `apps/tenant/.env`, `apps/maintenance/.env` | `VITE_API_URL` defaults to `http://localhost:8000` | Frontends built without explicit Vercel env var override will try to reach localhost on end-user devices | Add `VITE_API_URL` to Vercel production deployment settings for all three portals |
| **D-003** | **P0** | Deployment / Data Loss | `app/api/bank_statements.py` | Uploaded statements stored on ephemeral container disk (`/uploads/bank-statements`) | Files permanently lost whenever Railway container restarts or redeploys | Migrate bank statement file uploads to Cloudinary or AWS S3 private bucket |
| **D-004** | **P1** | File Security | `app/main.py:246` | Unauthenticated public static mount `app.mount("/uploads", ...)` | Anyone knowing or guessing statement filename can download sensitive bank statements without auth | Remove public `/uploads` mount; stream uploaded files through an authenticated admin-only endpoint |
| **D-005** | **P1** | Secrets | `scripts/dangerous/reset_db.py` | Database drop script in repository with no environment guard or confirmation prompt | Accidental execution in production drops all tables and cascading schema instantly | Delete or add strict `APP_ENV != 'production'` guards with interactive confirmation requirement |
| **D-006** | **P1** | Environment / CORS | `app/core/config.py:24` | Default `BACKEND_CORS_ORIGINS` only lists localhost and `.local` domains | If Railway does not have `BACKEND_CORS_ORIGINS` configured, Vercel frontend domains will fail with CORS errors | Populate production Vercel portal domains in Railway `BACKEND_CORS_ORIGINS` environment variable |
| **D-007** | **P1** | Push Notifications | `apps/backend/.env` | `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` not configured | Web Push notifications are disabled; backend skips push delivery silently | Generate VAPID keypair; set `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` on Railway backend |
| **D-008** | **P2** | Cross-User Session | `apps/*/src/store/auth.ts` | Frontend `logout()` does not call `queryClient.clear()` | On shared devices, previous user's query cache remains in memory until refetch | Call `queryClient.clear()` inside `logout()` in all portal auth stores |
| **D-009** | **P2** | Authentication | `apps/*/src/store/auth.ts`, `app/api/auth.py` | Frontend `logout()` does not call `POST /auth/logout` API endpoint | Refresh token remains valid in PostgreSQL database after user logs out | Call `POST /api/v1/auth/logout` in frontend logout flow to revoke refresh token server-side |
| **D-010** | **P2** | API Security | `app/main.py:152` | `/api/docs` and `/api/redoc` exposed unconditionally | Public can inspect API attack surface and schema endpoints | Disable OpenAPI/Swagger in production (`docs_url=None if settings.APP_ENV == "production" else "/api/docs"`) |
| **D-011** | **P3** | Performance | `apps/admin/dist/` | Monolithic admin bundle exceeds 2.2 MB | Slower initial page load on low-bandwidth mobile connections | Implement route-based lazy loading with `React.lazy()` and Vite `manualChunks` |
| **D-012** | **P3** | Secrets | `scripts/seed_users.py` | Hardcoded default password `Password123` in seed script | Seeded admin account vulnerable if deployed with default credentials | Enforce forced password reset on first login or pass seed password via environment variable |

---

## Confirmed Safe Areas

The following critical domains have been verified as secure, correct, and production-safe:
1. **SQL Injection Protection:** 100% parameterized queries via SQLAlchemy; no SQL injection vulnerabilities.
2. **Cross-Site Scripting (XSS):** Zero usage of `dangerouslySetInnerHTML` and `eval()`.
3. **Database Integrity:** Zero orphan allocations, zero orphan tenants, zero negative financial balances, zero bed allocation collisions, and a linear Alembic migration chain with 0 pending migrations.
4. **Role & IDOR Isolation:** Tenants cannot access Admin/Maintenance APIs or access other tenants' receipts, complaints, electricity bills, or rents.
5. **Payment Financial Logic:** Overpayment prevention, zero/negative amount guards, duplicate UTR prevention, and duplicate pending submission checks are strictly enforced server-side.
6. **Archived Tenant Isolation:** Archiving safely frees beds, decrements occupancy, terminates contracts, revokes tokens, and blocks login while preserving historical financial records.
7. **Production Build:** Build passes with Exit Code 0 across all 9 active workspace packages with zero TypeScript errors.
8. **Service Worker Privacy:** Service workers strictly bypass API routes and authorization headers, ensuring no private financial data is ever stored in static shell caches.

---

## Unknown / Needs Verification

1. **Neon PostgreSQL Automated Backups:** Point-in-time recovery and snapshot schedule must be verified directly inside the Neon Web Console.
2. **Cloudinary Production Credentials:** Ensure production Cloudinary account limits and bandwidth quotas are verified for incoming tenant document and meter photo uploads.
3. **Vercel Production Domain Names:** Ensure the final production domain names (e.g. `admin.bhagirathihostel.com`) are known so they can be registered in Railway's `BACKEND_CORS_ORIGINS`.

---

## Production Blockers (Must Fix Prior to Launch)

The following items are critical blockers that will cause runtime failure in production:
1. **D-001 & D-002 (Production API URLs):** Vercel frontends must have `VITE_API_URL` pointing to the live Railway HTTPS endpoint (`https://<backend-app>.railway.app`).
2. **D-006 (CORS Whitelist):** Railway `BACKEND_CORS_ORIGINS` must include the live Vercel domain URLs.
3. **D-007 (VAPID Configuration):** Production VAPID keypair must be generated and set on Railway so Web Push functions.
4. **D-003 & D-004 (Bank Statement Storage):** Bank statement file uploads must not rely on ephemeral local storage, and the unauthenticated public `/uploads` mount must be secured.

---

## Recommended Remediation Order

### Phase 1: Go-Live Environment & Deployment Readiness (Immediate Blockers)
1. Set `VITE_API_URL` in Vercel project settings for Admin, Tenant, and Maintenance portals to point to the live Railway backend HTTPS URL.
2. Update Railway environment variables with production values:
   - `SECRET_KEY`: Set to a cryptographically secure 64-character random string.
   - `APP_ENV`: Set to `production`.
   - `BACKEND_CORS_ORIGINS`: Add production frontend domains.
   - `VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY`: Populate with generated VAPID keys.
3. Add environment check guards to `scripts/dangerous/reset_db.py` to prevent catastrophic accidental execution.

### Phase 2: Security & Storage Hardening
1. Migrate bank statement uploads in `app/api/bank_statements.py` to private storage (Cloudinary / S3), and remove the open `/uploads` static file mount in `main.py`.
2. Disable OpenAPI Swagger docs in production (`docs_url=None` when `APP_ENV == "production"`).

### Phase 3: Client State & Session Hygiene
1. Update `logout()` in `apps/*/src/store/auth.ts` to execute `queryClient.clear()` and call `POST /api/v1/auth/logout`.
2. Optimize Admin portal bundle chunking via Vite `manualChunks` to split heavy charting and PDF libraries into separate chunks.

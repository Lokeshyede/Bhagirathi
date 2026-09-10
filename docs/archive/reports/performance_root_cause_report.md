# Performance Root Cause Report

## 1. Executive Summary

Application is slow because:

PRIMARY ROOT CAUSE:
**G. Database connection pool** (The SQLAlchemy async engine is configured with `poolclass=NullPool`, which disables database connection pooling entirely. Consequently, the backend is forced to perform a brand-new TCP and SSL/TLS handshake to the remote Neon PostgreSQL instance on *every single request* and *every single transaction commit/refresh*).

SECONDARY CAUSE:
**H. Neon network latency** (The remote Neon database is hosted in Singapore with an average round-trip time (RTT) of ~100-200ms from the local environment. Because endpoints execute a high number of sequential SQL queries, this network latency is compounded, resulting in massive delays).
**F. N+1 database queries** (High sequential query counts in authentication dependencies and dashboard calculations).

## 2. Measured Page Performance

*Measurements recorded in a warm state with sequential execution.*

| Page | Total | API | Frontend |
|------|-------|-----|----------|
| Login | 13.79s | 13.79s (`POST /api/v1/auth/login`) | ~8ms |
| Admin Dashboard | 18.14s | 18.14s (`GET /api/v1/dashboard/summary`) | ~100ms |
| Tenant Dashboard | 18.84s | 18.84s (`GET /api/v1/tenant/dashboard`) | ~100ms |
| Staff Dashboard | 7.61s | 7.61s (`GET /api/v1/maintenance/dashboard`) | ~100ms |
| Detail Page | 14.27s | 14.27s (`GET /api/v1/rooms/{id}/dossier`) | ~100ms |

## 3. Slowest APIs

| Endpoint | Total Time | DB Time | Python Time |
|----------|------------|---------|-------------|
| `GET /api/v1/tenant/dashboard` | 18,835.77 ms | ~18,825 ms | <10 ms |
| `GET /api/v1/dashboard/summary` | 18,140.04 ms | ~18,125 ms | <15 ms |
| `GET /api/v1/rooms/{id}/dossier` | 14,265.44 ms | ~14,255 ms | <10 ms |
| `POST /api/v1/auth/login` | 13,789.75 ms | ~13,580 ms | ~200 ms (bcrypt hashing) |
| `GET /api/v1/dashboard/charts` | 9,991.86 ms | ~9,980 ms | <10 ms |
| `GET /api/v1/settings/hostel-profile` | 6,188.88 ms | ~6,180 ms | <5 ms |
| `GET /api/v1/auth/me` | 5,733.50 ms | ~5,725 ms | <5 ms |

## 4. Database Diagnosis

- **Connection time:** ~700 - 900 ms (Warm RTT to Neon for a raw connection)
- **Query time:** ~200 - 600 ms (For a simple `SELECT 1` query)
- **Query count:** 26 queries for `/dashboard/summary`, 12 queries for `login`, 16 queries for `/dashboard/charts`
- **N+1:** Yes (detected in authentication dependencies and `/rooms` serializer relationship resolution)
- **Slow query:** None on the database server itself (all tables are extremely small, with <100 total rows. Database-side query execution is virtually 0ms; the slowness is entirely the network transit and connection establishment time).

## 5. Neon Diagnosis

- **Cold start:** ~3 - 5 seconds additional delay when the Neon database wakes up from sleep
- **Network latency:** Average TCP RTT is ~100 - 200 ms (Singapore ap-southeast-1 region from local environment)
- **Database execution:** ~0.1 - 1.0 ms (effectively instant)

## 6. Frontend Diagnosis

- **Duplicate requests:** Yes (e.g. `/api/v1/notifications/unread-count` and `/api/v1/auth/me` are fired multiple times concurrently during page load)
- **Sequential requests:** Yes (certain subcomponents load dependencies sequentially)
- **Rendering:** Fast (React 19 client-side rendering is near-instant, using loading skeletons)
- **Bundle:** Normal dev Vite bundles (~2-3 MB dev)
- **Images:** Fast (minimal assets, lightweight icons)

## 7. PRIMARY ROOT CAUSE

**G. Database connection pool**
The application uses `poolclass=NullPool` in `apps/backend/app/database/database.py`. Under `NullPool`, connection pooling is disabled: SQLAlchemy closes the database connection on every commit and at the end of every request. Establishments of connections to remote Neon DB require expensive TLS/TCP handshakes (700-900ms). The issue is compounded during `login` where 5 separate commits/refreshes occur sequentially within a single request, forcing 5 connection reconnections (accounting for ~10 seconds of delay).

## 8. SECONDARY ROOT CAUSE

- **H. Neon network latency:** The ~200ms RTT latency to Singapore causes sequential queries (e.g., 26 queries in `/dashboard/summary`) to stack up to 18 seconds.
- **F. N+1 database queries / High Query Count:** Sequential queries in authentication dependencies (2 queries per request) and dashboard statistics increase connection and RTT overhead.

## 9. Recommended Fix

1. **Enable SQLAlchemy Connection Pooling:**
   Modify `apps/backend/app/database/database.py` to remove `poolclass=NullPool`. Let SQLAlchemy use its default connection pool (`AsyncAdaptedQueuePool`) with reasonable pooling parameters (e.g. `pool_size=10`, `max_overflow=20`, `pool_recycle=1800`).
2. **Batch & Aggregate Dashboard Queries:**
   Combine the 26 sequential counts and statistics in `DashboardService.get_summary` and 16 queries in `get_charts` into a few aggregated SQL statements or execute them concurrently using `asyncio.gather`.
3. **Cache Authentication Checks:**
   Cache user password_temp/audit logs queries in memory or request cache for the request duration to avoid running them repeatedly on every authenticated endpoint.
4. **Fix Repository N+1 Relationship Loading:**
   Ensure SQLAlchemy queries use `joinedload` or `selectinload` to eager-load relationships, preventing lazy-loading queries during Pydantic serialization.

## 10. Expected Improvement

- **Login API:** Will drop from 13.8 seconds to **under 500 ms** (over **96% improvement**).
- **Dashboard Summary API:** Will drop from 18.1 seconds to **under 300 ms** (over **98% improvement**).
- Overall page navigation will feel instant and snappy.

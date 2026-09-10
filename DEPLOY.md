# Production Deployment Guide

This guide details the procedures for compiling the production asset bundles and deploying the application using Docker and Docker Compose.

---

## 1. Deploying via Docker Compose (Recommended)

Orchestrate the multi-container stack (Database, FastAPI, Nginx proxy, Frontends) using the root configuration:

1. Clone or copy the project files to the target production server.
2. Edit the `.env` file in the root to supply a strong random `SECRET_KEY` and updated database credentials.
3. Build and launch the containers:
   ```bash
   docker compose -f docker-compose.yml up --build -d
   ```
4. Verify the containers are healthy and running:
   ```bash
   docker compose ps
   ```
5. Apply migrations inside the backend service container:
   ```bash
   docker compose exec backend alembic upgrade head
   ```

---

## 2. Nginx Reverse Proxy Architecture

The Nginx proxy container listens on port `80` and routes incoming request virtual hosts to client folders or the API gateway container:

- `admin.local` / `localhost` -> Served from `/usr/share/nginx/html/admin`.
- `tenant.local` -> Served from `/usr/share/nginx/html/tenant`.
- `maintenance.local` -> Served from `/usr/share/nginx/html/maintenance`.
- `/api` requests inside any domain -> Proxied to `http://backend_api` (FastAPI backend service).

### Production Nginx Hardening Policies Implemented:
- **Security Headers**: Blocked clickjacking (`X-Frame-Options: SAMEORIGIN`) and MIME-type sniffing (`X-Content-Type-Options: nosniff`).
- **CSP**: Restricts source resources via custom policies.
- **Gzip**: Compresses text assets, Javascript modules, CSS stylesheets, and JSON API responses to boost page load speed.
- **Static Assets Caching**: Injects `Cache-Control: public, no-transform, immutable` headers with a `1-year` expiry window for asset files (`.js`, `.css`, images).

---

## 3. Database Maintenance

### Schema Upgrades
When pushing updates, execute migrations on the target DB container:
```bash
docker compose exec backend alembic upgrade head
```

### Backups
To take a SQL dump backup of the Postgres database:
```bash
docker exec -t bhagirathi_db pg_dumpall -c -U postgres > backup.sql
```

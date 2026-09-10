# Folder Structure Documentation

This document mappings the monorepo folder layout of the Bhagirathi Hostel & PG Management System.

---

```text
bhagirathi-pg/
├── apps/                          # Application deployment workspaces
│   ├── admin/                     # React 19 Admin control panel app
│   ├── tenant/                    # React 19 Tenant app
│   ├── maintenance/               # React 19 Maintenance staff app
│   └── backend/                   # FastAPI backend server codebase
│       ├── alembic/               # DB migration versions and templates
│       └── app/                   # Core application scripts
│           ├── core/              # Global security, middleware, database configs
│           └── modules/           # Modular domain layers (auth, rent, notice, etc.)
│               ├── model.py       # SQL Alchemy database entity mapping
│               ├── schemas.py     # Pydantic input/output schemas
│               ├── service.py     # Central business logic handlers
│               └── router.py      # FastAPI HTTP endpoint routes
├── packages/                      # Monorepo shared packages
│   ├── ui/                        # Tailwind-powered design components
│   ├── api-client/                # Base Axios configurations and Query interceptors
│   ├── types/                     # Shared typescript typings and interfaces
│   ├── utils/                     # Generic javascript libraries
│   ├── validation/                # Shared Zod form rule constraints
│   └── constants/                 # Core enums and status constants
├── docker/                        # Deployment Docker and Nginx proxy configs
│   ├── nginx/
│   │   └── nginx.conf             # Hardened Nginx HTTP/proxy settings
│   ├── Dockerfile.backend         # Python 3.11 builder recipe
│   └── Dockerfile.frontend        # Multi-stage Node.js + Nginx asset serving builder
├── docker-compose.yml             # Orchestration compose configurations
├── pnpm-workspace.yaml            # Monorepo workspace registrations
└── pnpm-lock.yaml                 # Locked NPM dependency trees
```

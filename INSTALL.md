# Local Installation & Setup Guide

This guide outlines the steps required to set up the Bhagirathi Hostel & PG Management System on a local machine for development and testing.

---

## 1. System Requirements

Ensure the following tools are installed:
- **Node.js**: `v20` or higher
- **pnpm**: `v8` or higher
- **Python**: `v3.11` or higher (equipped with `pip`)
- **PostgreSQL**: `v15` or higher

---

## 2. Setting Up the Frontends

The frontends are organized in a monorepo workspace.

1. Install root dependencies and bootstrap symlinks:
   ```bash
   pnpm install
   ```
2. Build the shared packages:
   ```bash
   npx tsc -b packages/types
   ```
3. Run the development apps:
   - **Admin Portal** (`http://localhost:5173`):
     ```bash
     pnpm --filter @bhagirathi/admin dev
     ```
   - **Tenant Portal** (`http://localhost:5174`):
     ```bash
     pnpm --filter @bhagirathi/tenant dev
     ```
   - **Maintenance Portal** (`http://localhost:5175`):
     ```bash
     pnpm --filter @bhagirathi/maintenance dev
     ```

---

## 3. Setting Up the Backend

The backend is built with FastAPI.

1. Navigate to the backend folder:
   ```bash
   cd apps/backend
   ```
2. Create a standard Python virtual environment, activate it, and install dependencies:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```
3. Configure the local environment variables in a `.env` file (see `ENV_VARS.md` for references).
4. Run migrations to initialize the database:
   ```bash
   alembic upgrade head
   ```
5. Run the Uvicorn development server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```

---

## 4. Initial Database Seeding

To seed the initial user accounts (Admin, Tenant, Maintenance staff) for local verification, run the following Python command from the root directory:

```bash
python scripts/seed_users.py
```

This will set up test credentials for quick login:
- **Admin**: `admin@bhagirathihostel.com` / `Password123`
- **Tenant**: `tenant@bhagirathihostel.com` / `Password123`
- **Maintenance**: `staff@bhagirathihostel.com` / `Password123`

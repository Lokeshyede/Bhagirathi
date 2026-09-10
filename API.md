# API Specification Document

The Bhagirathi Hostel & PG Management System backend exposes RESTful endpoints grouped by core business domains.

---

## 1. Overview and Base Paths

- **Base URL**: `http://localhost:8000/api/v1` or `/api/v1` (behind Nginx proxy)
- **FastAPI OpenAPI Interactive Docs**:
  - Swagger UI: `http://localhost:8000/docs`
  - ReDoc: `http://localhost:8000/redoc`

---

## 2. Authentication Strategy

API authentication leverages JSON Web Tokens (JWT) using the OAuth2 password bearer standard.

- **Requesting Token**:
  - **Endpoint**: `POST /api/v1/auth/login`
  - **Content-Type**: `application/x-www-form-urlencoded`
  - **Body parameters**: `username` (email/phone), `password`.
- **Authenticating Requests**:
  - Injected as an HTTP header: `Authorization: Bearer <JWT_ACCESS_TOKEN>`.

---

## 3. Standard Endpoints Catalog

### Authentication
- `POST /auth/login` - User authentication, returns JWT access and refresh token.
- `POST /auth/refresh` - Re-issues active JWT tokens using a refresh token.
- `POST /auth/forgot-password` - Requests reset password tokens.
- `POST /auth/reset-password` - Resets passwords using validation tokens.

### Hostel & Facilities Management
- `GET /hostels` - List all hostels (paginated).
- `POST /hostels` - Create new hostel.
- `GET /rooms` - Search rooms by capacity, building, and check-in options.

### Tenant Registrations
- `GET /tenants` - Search tenants by status, ID, or names.
- `POST /tenants` - Register tenant check-ins and lock beds.

### Rent Dues & Payments
- `GET /rent` - List invoices and balances.
- `POST /payments` - Submit UTR number and receipt image verification screenshots.
- `PUT /payments/{id}/verify` - Admin verification approval for submitted UTRs.

### Complaint Management
- `GET /complaints` - Query complaints by role status.
- `PUT /complaints/{id}/assign` - Designate maintenance staff targets.

### Notice Board
- `GET /notices` - Fetch notifications matching user targets.
- `POST /notices` - Publish scheduled notice boards.

---

## 4. Query Pagination & Filtering

Standard parameters used across list views:
- **`skip`** (default `0`): Offset count of records to bypass.
- **`limit`** (default `10`): Max number of items to return in a single payload.
- **`search`** (default `""`): Text filter applied to name, descriptions, or unique references.

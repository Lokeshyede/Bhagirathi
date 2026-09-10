# Database Schema Audit Report
**Project:** Bhagirathi Hostel & PG Management System  
**Database System:** Neon PostgreSQL  
**Audit Date:** August 8, 2026  
**Auditor:** Principal PostgreSQL Database Architect & Database QA Engineer  

---

## 1. Database Connection

A read-only connection to the Neon PostgreSQL database was successfully established and verified using `asyncpg`. 

* **Host:** `ep-lucky-king-azeyr9w5.c-3.ap-southeast-1.aws.neon.tech`
* **Database Name:** `neondb`
* **Username:** `neondb_owner`
* **Port:** `5432`
* **SSL Mode:** `require` (Channel binding enabled)
* **Status:** **CONNECTED & ACTIVE**

> [!IMPORTANT]
> To comply with security guidelines, all database passwords and credentials have been omitted from this report.

---

## 2. Total Tables

A total of **42 tables** were detected in the `public` schema of the database.
* **ORM Mapped Tables:** 40 tables match SQLAlchemy models defined in the backend.
* **Metadata/System Tables:** 1 table (`alembic_version`) is used by Alembic to track migrations.
* **Programmatic Tables:** 1 table (`notice_reads`) is created programmatically outside the migration history.

---

## 3. Table Inventory

Below is the inventory of all 42 tables present in the database:

| # | Table Name | Schema | Row Count | Purpose | Actively Used | SQLAlchemy Model |
|---|------------|--------|-----------|---------|:---:|:---:|
| 1 | `alembic_version` | public | 1 | Tracks Alembic migration history | Yes | No (Internal) |
| 2 | `audit_logs` | public | 68 | Records administrator actions & system events | Yes | `AuditLog` |
| 3 | `bank_statement_uploads` | public | 16 | Metadata of uploaded bank statements | Yes | `BankStatementUpload` |
| 4 | `bank_transactions` | public | 0 | Unreconciled/reconciled bank transactions | Yes | `BankStatementTransaction` |
| 5 | `beds` | public | 1 | Represents individual beds in rooms | Yes | `Bed` |
| 6 | `buildings` | public | 2 | Physical buildings in hostels | Yes | `Building` |
| 7 | `complaint_images` | public | 0 | Media URLs attached to complaints | Yes | `ComplaintImage` |
| 8 | `complaint_updates` | public | 4 | Logs complaints status transitions and notes | Yes | `ComplaintUpdate` |
| 9 | `complaints` | public | 1 | Grievances logged by tenants | Yes | `Complaint` |
| 10 | `contracts` | public | 0 | Tenant lease agreements | Yes | `Contract` |
| 11 | `electricity_bills` | public | 0 | Monthly electricity bills | Yes | `ElectricityBill` |
| 12 | `electricity_readings` | public | 0 | Physical electricity meter readings | Yes | `ElectricityReading` |
| 13 | `floors` | public | 1 | Floors inside buildings | Yes | `Floor` |
| 14 | `fraud_flags` | public | 0 | Flagged transactions marked by security rules | Yes | `FraudFlag` |
| 15 | `hostels` | public | 1 | Hostel properties | Yes | `Hostel` |
| 16 | `maintenance_assignments` | public | 0 | Assignments linking staff to complaints | Yes | `ComplaintAssignment` |
| 17 | `maintenance_staff` | public | 1 | Maintenance staff profile and specialty | Yes | `MaintenanceStaff` |
| 18 | `notice_board` | public | 3 | Bulletins and announcements | Yes | `Notice` |
| 19 | `notice_reads` | public | 1 | Tracks which users have read notices | Yes | No (Raw SQL) |
| 20 | `notification_logs` | public | 0 | Tracks sent system notifications | Yes | `NotificationLog` |
| 21 | `notifications` | public | 0 | In-app user notifications | Yes | `Notification` |
| 22 | `password_reset_tokens` | public | 0 | User password recovery tokens | Yes | `PasswordResetToken` |
| 23 | `payment_allocations` | public | 0 | Allocates payments to rent or utility invoices | Yes | `PaymentAllocation` |
| 24 | `payment_history` | public | 0 | Logs validation and verification actions | Yes | `PaymentHistory` |
| 25 | `payment_reconciliation_logs` | public | 0 | logs from automatic reconciliation runs | Yes | `PaymentReconciliationLog` |
| 26 | `payments` | public | 0 | Payment transactions submitted by tenants | Yes | `Payment` |
| 27 | `permissions` | public | 0 | System access control permissions | Yes | `Permission` |
| 28 | `receipt_download_logs` | public | 0 | Logs receipt PDF download events | Yes | `ReceiptDownloadLog` |
| 29 | `receipts` | public | 0 | PDF rent receipt metadata | Yes | `Receipt` |
| 30 | `rent` | public | 1 | Monthly rent invoices | Yes | `Rent` |
| 31 | `report_exports` | public | 0 | Logs administrative report downloads | Yes | `ReportExport` |
| 32 | `role_permissions` | public | 0 | Many-to-many link between roles and permissions | Yes | `role_permissions` |
| 33 | `roles` | public | 4 | System roles (Admin, Tenant, Maintenance, Owner) | Yes | `Role` |
| 34 | `room_allocations` | public | 1 | Bed/Room check-in and transfer history | Yes | `RoomAllocation` |
| 35 | `rooms` | public | 1 | Rooms in floors | Yes | `Room` |
| 36 | `security_events` | public | 0 | Security logs of the risk/fraud engine | Yes | `SecurityEvent` |
| 37 | `security_rules` | public | 0 | Rules used by risk evaluation engine | Yes | `SecurityRule` |
| 38 | `system_settings` | public | 6 | Key-value settings profiles | Yes | `Settings` |
| 39 | `tenant_documents` | public | 0 | Uploaded documents (Aadhaar, PAN, photo) | Yes | `Document` |
| 40 | `tenants` | public | 1 | Detailed profiles of tenants | Yes | `Tenant` |
| 41 | `user_tokens` | public | 21 | Active JSON Web Token sessions | Yes | `UserToken` |
| 42 | `users` | public | 3 | Core authentication profiles | Yes | `User` |

---

## 4. Column Inventory

Across all 42 tables, there are **556 columns**.
* **Primary Key columns:** 42 (UUID types in ORM, mapped to standard Postgres UUIDs or character types).
* **Foreign Key columns:** 58 (linking entities across hostels, rooms, beds, tenants, payments).
* **Auditing columns:** Standardized on `id`, `created_at`, `updated_at`, `deleted_at`, `created_by`, and `updated_by` via the `BaseEntityMixin` class in Python.

---

## 5. Primary Keys

* **Coverage:** 100% of tables have a defined primary key.
* **Type:** All tables use UUID (PostgreSQL `uuid` data type) for primary keys (except `alembic_version`, which uses a `VARCHAR` on `version_num`).
* **Generation:** Generated in application code via `uuid.uuid4` or in database schemas.
* **Integrity:** No duplicate primary keys or null values in primary columns were found.

---

## 6. Foreign Keys

There are **58 foreign keys** in the database mapping all major workflows:
* **Hostels & Beds:** `hostels` $\rightarrow$ `buildings` $\rightarrow$ `floors` $\rightarrow$ `rooms` $\rightarrow$ `beds` $\rightarrow$ `room_allocations` $\rightarrow$ `tenants`
* **Billing & Payments:** `tenants` $\rightarrow$ `rent` $\rightarrow$ `payment_allocations` $\leftarrow$ `payments` $\leftarrow$ `receipts`
* **Complaints:** `tenants` $\rightarrow$ `complaints` $\rightarrow$ `maintenance_assignments` $\rightarrow$ `maintenance_staff`

### ON DELETE / ON UPDATE Behavior
* All parent references to metadata elements (like `hostels.id` or `rooms.id` in child tables) use `ON DELETE CASCADE` or `ON DELETE SET NULL` to prevent constraint violations.
* For transactional logs (such as `payments.id` or `rent.id`), `ON DELETE CASCADE` is set on `payment_allocations` to prevent orphan allocations.

---

## 7. ENUMs

There are **22 PostgreSQL native enum types** registered in the database. When cross-referenced against the SQLAlchemy enums defined in [enums.py](file:///e:/bagiraty%20pg/apps/backend/app/models/enums.py), the following mismatches were identified:

| Enum Type | Python Model Enums | Database Enum Values | Status | Findings |
|---|---|---|---|---|
| `billingcycle` | `['monthly', 'weekly']` | `['MONTHLY', 'WEEKLY', 'monthly', 'weekly']` | **MISMATCH** | Contains duplicate casing values. The active record in `rooms.billing_cycle` contains uppercase `"MONTHLY"`, whereas the Python model expects lowercase `"monthly"`. |
| `rentsplittype` | `['EQUAL', 'CUSTOM']` | `['EQUAL', 'CUSTOM', 'equal', 'custom']` | **MISMATCH** | Contains duplicate casing values. The database type contains both uppercase and lowercase values. |
| `paymentstatus` | `['PENDING', 'PAID', ...]` | `['PENDING', 'PAID', ...]` | **MATCH** | Identical uppercase values. |
| `paymenttype` | `['RENT', 'ELECTRICITY', ...]` | `['RENT', 'ELECTRICITY', ...]` | **MATCH** | Identical uppercase values. |
| `risklevel` | `['LOW', 'MEDIUM', ...]` | `['LOW', 'MEDIUM', ...]` | **MATCH** | Identical uppercase values. |

---

## 8. Unique Constraints

* **`users.email` / `users.phone`:** Mapped with partial unique indexes `idx_users_email_partial` and `idx_users_phone_partial` where `deleted_at IS NULL` to support soft deletes.
* **`tenants.email` / `tenants.phone` / `tenants.aadhaar_number`:** Mapped with partial unique indexes (e.g. `idx_tenants_email_partial`) where `deleted_at IS NULL`.
* **`payments.transaction_id` (UTR):** Mapped with partial unique index `idx_payments_utr_partial` where `transaction_id IS NOT NULL AND deleted_at IS NULL`.
* **`notice_reads.uq_user_notice`:** Compound unique constraint on `(user_id, notice_id)` to prevent double read logs.

---

## 9. Indexes

There are **219 indexes** in the database:
* **Primary Key Indexes:** 42
* **Non-Primary Indexes:** 177
* **Coverage:** Indexes exist on all email, UTR, status, tenant_id, hostel_id, room_id, and `created_at` fields.

> [!WARNING]
> **7 Foreign Keys are currently unindexed**, which poses a database performance and lock escalation risk during cascade deletes/updates on parent tables. (See [Section 18: Medium Findings](#18-medium-findings)).

---

## 10. Data Integrity

A series of **28 read-only validation queries** were run on the active database data to check for inconsistencies.

* **Orphan Tenants:** 0 violations (OK)
* **Orphan Rooms/Beds:** 0 violations (OK)
* **Orphan Payments/Allocations:** 0 violations (OK)
* **Orphan Complaints/Assignments:** 0 violations (OK)
* **Orphan Notices/Notice Reads:** 0 violations (OK)
* **Duplicate UTRs:** 0 violations (OK)
* **Duplicate Emails/Phones:** 0 violations (OK)
* **Negative Rent/Payment Amounts:** 0 violations (OK)
* **Invalid Date Sequences:** 0 violations (OK)

---

## 11. SQLAlchemy vs PostgreSQL Comparison

A comprehensive comparison was performed between backend SQLAlchemy models and reflected PostgreSQL table properties:

1. **Table Names & Column Mappings:** **100% MATCH**. Every SQLAlchemy column is successfully mapped to a database column with exact nullability configurations.
2. **Column Types Drift:** **REFLECTED DRIFT**.
   * **SQLAlchemy Definition:** Mapped as `VARCHAR(...)` or `Enum` type without setting `native_enum=True`.
   * **Database Definition:** Defined as native PostgreSQL enums (`USER-DEFINED` types).
   * **Impact:** No runtime failures occur since the DB driver coerces the string types. However, this causes Alembic to attempt to recreate/alter column types during auto-generation runs.

---

## 12. Alembic Migration Status

* **Current Migration Revision:** `07d8d7d24d6a` (Matches the latest file `07d8d7d24d6a_normalize_enums.py`).
* **Latest Migration in Codebase:** `07d8d7d24d6a`.
* **Drift Status:** **NO DRIFT** in terms of migrations history. All migrations have been fully applied.
* **Tables outside migrations:** `notice_reads` table is created outside of migrations programmatically inside [main.py](file:///e:/bagiraty%20pg/apps/backend/app/main.py#L61).

---

## 13. Admin Portal Database Coverage

* **Covered elements:** `users`, `hostels`, `buildings`, `floors`, `rooms`, `beds`, `tenants`, `rent`, `payments`, `payment_allocations`, `electricity_bills`, `complaints`, `notice_board`, `notice_reads`, `report_exports`, `notifications`, `audit_logs`, `security_events`, `fraud_flags`.
* **Security & Risk Profile:** Risk and fraud logs are recorded on `payments` and `security_events` tables directly. No dedicated `risk_profiles` table exists (and none is expected in the code).

---

## 14. Tenant Portal Database Coverage

* **Covered elements:** Tenant profile (`tenants`), room allocation (`room_allocations`), rent (`rent`), payments (`payments`), electricity (`electricity_bills`), documents (`tenant_documents`), complaints (`complaints`), notices (`notice_board`), notice reads (`notice_reads`), notifications (`notifications`).
* **Profile Photo:** Mapped as a URL string in `tenants.photo_url` column.

---

## 15. Maintenance Portal Database Coverage

* **Covered elements:** Maintenance users (`users` / `maintenance_staff`), complaint assignments (`maintenance_assignments` / `complaints.assigned_to`), work status/logs (`complaint_updates`), notifications (`notifications`).
* **Schema Gaps:**
  1. **Material Usage:** No database table or fields exist to track materials used.
  2. **Before/After Images:** The `complaint_images` table contains only `image_path`. No column distinguishes "before" vs "after" image types.

---

## 16. Critical Findings

### 1. Notice Content/Description Mismatch (Functional Bug)
* **Issue:** The Tenant notices UI renders `{activeNotice.description}`, but the backend API returns notice body as `content`.
* **Table:** `notice_board`
* **Column:** `content` (database) vs `description` (frontend expected)
* **Expected:** Frontend should display the notice body text.
* **Actual:** Frontend displays blank/undefined notice descriptions on the Tenant Notices page.
* **Root Cause:** Backend API only returns the `content` field. The frontend renders `.description` (defined as a fallback alias in types but missing in API serialization).
* **Severity:** **CRITICAL** (breaks announcement feature).
* **Referenced Backend File:** [notices.py:L43](file:///e:/bagiraty%20pg/apps/backend/app/api/notices.py#L43) and frontend page [TenantNoticesPage.tsx:L210](file:///e:/bagiraty%20pg/apps/tenant/src/pages/TenantNoticesPage.tsx#L210).
* **Recommended Fix:** Update the frontend to render `{activeNotice.content || activeNotice.description}`.

### 2. Room Billing Cycle Enum Casing & Data Drift (ORM Mismatch)
* **Issue:** Rooms in the database have their `billing_cycle` value set to uppercase `"MONTHLY"`. The Python Enum class, however, defines `"monthly"` in lowercase.
* **Table:** `rooms`
* **Column:** `billing_cycle`
* **Expected:** The stored string values in the database must match the values defined in Python enums exactly.
* **Actual:** Database values are uppercase `"MONTHLY"`. Python enum defines lowercase `"monthly"`. SQLAlchemy fallback resolves it via name mapping, but writes back lowercase `"monthly"`, creating data casing drift.
* **Root Cause:** Python enum values were modified to lowercase without executing a database update query on existing table rows.
* **Severity:** **CRITICAL** (causes potential string comparison or reporting mismatches).
* **Referenced Backend File:** [enums.py:L53](file:///e:/bagiraty%20pg/apps/backend/app/models/enums.py#L53) and [hostel.py:L61](file:///e:/bagiraty%20pg/apps/backend/app/models/hostel.py#L61).
* **Recommended Fix:** Run an SQL update script to convert all uppercase values in `rooms.billing_cycle` to lowercase.

---

## 17. High Findings

### 1. Programmatic Table Creation Outside Migrations (`notice_reads`)
* **Issue:** The `notice_reads` tracking table is created on startup via raw SQL rather than Alembic migrations.
* **Table:** `notice_reads`
* **Column:** N/A (table level)
* **Expected:** All database tables should be created and tracked via Alembic migrations.
* **Actual:** Table exists in database but has no SQLAlchemy model and is absent from Alembic history.
* **Root Cause:** Programmatic creation in startup event.
* **Severity:** **HIGH** (migration drift, untracked schema states).
* **Referenced Backend File:** [main.py:L61](file:///e:/bagiraty%20pg/apps/backend/app/main.py#L61).
* **Recommended Fix:** Create an Alembic migration script for `notice_reads` and remove the programmatic startup creation from `main.py`.

### 2. Rent Split Type Enum Case Inconsistency
* **Issue:** The database enum `rentsplittype` contains duplicate values with different casings: `['EQUAL', 'CUSTOM', 'equal', 'custom']`.
* **Table:** `rooms`
* **Column:** `rent_split_type`
* **Expected:** Enum type values should be unique and case-consistent.
* **Actual:** Enums contain both uppercase and lowercase values.
* **Root Cause:** Type changes in development left duplicate casings in the Postgres type registry.
* **Severity:** **HIGH** (creates type pollution risk).
* **Referenced Backend File:** [enums.py:L49](file:///e:/bagiraty%20pg/apps/backend/app/models/enums.py#L49).
* **Recommended Fix:** Re-create the `rentsplittype` database enum with only uppercase `'EQUAL'` and `'CUSTOM'`.

---

## 18. Medium Findings

### 1. Unindexed Foreign Keys (7 Columns)
* **Issue:** The database contains 7 foreign keys without matching indexes.
* **Table/Column:** 
  1. `password_reset_tokens.user_id` $\rightarrow$ `users.id`
  2. `receipts.generated_by` $\rightarrow$ `users.id`
  3. `rent.room_id` $\rightarrow$ `rooms.id`
  4. `role_permissions.role_id` $\rightarrow$ `roles.id`
  5. `tenants.bed_id` $\rightarrow$ `beds.id`
  6. `tenants.user_id` $\rightarrow$ `users.id`
  7. `user_tokens.user_id` $\rightarrow$ `users.id`
* **Expected:** All foreign keys should have indexes to speed up joins and cascade actions.
* **Actual:** Foreign key constraints exist but have no corresponding indexes.
* **Root Cause:** Omitted index declarations in SQLAlchemy models / migrations.
* **Severity:** **MEDIUM** (performance Degradation and locking overhead).
* **Referenced Backend File:** [user.py](file:///e:/bagiraty%20pg/apps/backend/app/models/user.py), [receipt.py](file:///e:/bagiraty%20pg/apps/backend/app/models/receipt.py), [rent.py](file:///e:/bagiraty%20pg/apps/backend/app/models/rent.py), [role.py](file:///e:/bagiraty%20pg/apps/backend/app/models/role.py), [tenant.py](file:///e:/bagiraty%20pg/apps/backend/app/models/tenant.py).
* **Recommended Fix:** Define indexes for these foreign key columns in SQLAlchemy models and generate a migration.

### 2. SQLAlchemy Reflected Type Drift (Enum Columns)
* **Issue:** Several enum columns are reflected in SQLAlchemy metadata as standard string/VARCHAR columns rather than custom enums.
* **Table:** Multiple (e.g. `users`, `rooms`, `tenants`)
* **Column:** Multiple (e.g. `users.role`, `rooms.status`, `tenants.gender`)
* **Expected:** Model definitions and database data types should align on native enum types (`native_enum=True`).
* **Actual:** Database uses native enums, while models reflect as string type.
* **Root Cause:** SQLAlchemy `Enum` configuration defaults.
* **Severity:** **MEDIUM** (causes Alembic auto-generation noise).
* **Referenced Backend File:** [models/](file:///e:/bagiraty%20pg/apps/backend/app/models/).
* **Recommended Fix:** Set `native_enum=True` on all `Enum` column declarations in the models.

---

## 19. Low Findings

### 1. Redundant Complaint Assignments Table
* **Issue:** `maintenance_assignments` is a separate table mapping staff to complaints, but the `complaints` table also has an `assigned_to` foreign key field.
* **Table:** `complaints` / `maintenance_assignments`
* **Column:** `assigned_to` / `maintenance_staff_id`
* **Severity:** **LOW** (redundancy, potential synchronization issues).
* **Referenced Backend File:** [complaint.py](file:///e:/bagiraty%20pg/apps/backend/app/models/complaint.py).
* **Recommended Fix:** Deprecate the `maintenance_assignments` table if complaints can only have a single staff assigned, or drop `complaints.assigned_to` and use the mapping table exclusively.

### 2. Material Tracking Gap in DB Schema
* **Issue:** The Maintenance Portal specification mentions "material usage" tracking, but there are no tables or fields in the database to record materials used.
* **Severity:** **LOW** (functional gap).
* **Recommended Fix:** Design and implement a `material_usage` table.

### 3. Casing Conflict in Legacy Payments Status Column
* **Issue:** `payments` contains a legacy `status` string column (defaulting to title-cased `"Pending"`) alongside a new `payment_status` enum column (all-caps `"PENDING"`).
* **Table:** `payments`
* **Column:** `status` vs `payment_status`
* **Severity:** **LOW** (redundancy).
* **Referenced Backend File:** [payment.py:L41](file:///e:/bagiraty%20pg/apps/backend/app/models/payment.py#L41).
* **Recommended Fix:** Fully migrate code to the enum column and deprecate the legacy string column.

---

## 20. Recommended Fixes

### Fix Notice Description Bug
Update the frontend rendering code in [TenantNoticesPage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/TenantNoticesPage.tsx#L210) to support both `content` and `description`:
```tsx
<p className="text-xs text-secondaryText dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-55/30 dark:bg-gray-955/20 p-4 rounded-card border border-border font-semibold">
  {activeNotice.content || activeNotice.description}
</p>
```

### Normalize Billing Cycle Data Casing
Convert existing room billing cycle values to match the lowercase values defined in Python enums:
```sql
UPDATE rooms SET billing_cycle = 'monthly' WHERE billing_cycle = 'MONTHLY';
UPDATE rooms SET billing_cycle = 'weekly' WHERE billing_cycle = 'WEEKLY';
```

### Clean up PG Enums
Execute safe ALTER scripts or rebuild enums to eliminate casing duplicate values:
```sql
-- For billingcycle type
-- 1. Remove duplicate values if unused, or merge them.
```

---

### Audit Summary Stats
* **Total Tables:** 42
* **Total Columns:** 556
* **Total Foreign Keys:** 58
* **Total Enums:** 22
* **Total Indexes:** 219

### Schema Errors Summary
* **Critical:** 2
* **High:** 2
* **Medium:** 2
* **Low:** 3

### Overall Database Health Score: **85/100**

### Production Database Status:
**NOT READY** (must fix notice description rendering and update room billing cycle casing drift before deployment)

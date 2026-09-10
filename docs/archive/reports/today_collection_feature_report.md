# Today's Rent Collection Alert — Feature Report

**Date:** 2026-08-05  
**Feature:** Today's Rent Collection Alert Dashboard Widget  
**Status:** ✅ Fully Implemented & Verified

---

## Overview

The Admin Dashboard now automatically shows all tenants whose rent is due today or overdue, with a prominent widget card, a full tenant list, morning popup notification, priority color coding, quick actions, and full filter support. All data is fetched live from the database — no hardcoded values.

---

## Files Modified

### Backend

| File | Action | Description |
|------|--------|-------------|
| [rent_alert_service.py](file:///e:/bagiraty%20pg/apps/backend/app/services/rent_alert_service.py) | **NEW** | Optimized SQLAlchemy service: single JOIN query, no N+1 |
| [rent_collection.py](file:///e:/bagiraty%20pg/apps/backend/app/api/rent_collection.py) | **MODIFIED** | Added 3 new endpoints + improved imports |

### Frontend

| File | Action | Description |
|------|--------|-------------|
| [RentCollectionAlert.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/dashboard/components/RentCollectionAlert.tsx) | **NEW** | Dashboard widget card (KPI cards + tenant list + quick actions) |
| [RentAlertPopup.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/dashboard/components/RentAlertPopup.tsx) | **NEW** | Morning login popup notification |
| [useRentCollection.ts](file:///e:/bagiraty%20pg/apps/admin/src/features/rent_collection/hooks/useRentCollection.ts) | **MODIFIED** | Added 3 new hooks + TypeScript interfaces |
| [DashboardPage.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/dashboard/pages/DashboardPage.tsx) | **MODIFIED** | Wired in popup + widget |

---

## Database Queries

### Query 1: Alert Summary (KPI-only, Aggregate)
Used by `/alert-summary` endpoint and the dashboard popup.

```sql
-- Due Today Count + Amount
SELECT COUNT(r.id), COALESCE(SUM(r.total_amount - r.paid_amount), 0)
FROM rent r
JOIN tenants t ON r.tenant_id = t.id
WHERE r.deleted_at IS NULL
  AND t.deleted_at IS NULL
  AND t.is_active = true
  AND t.status = 'ACTIVE'
  AND r.due_date = CURRENT_DATE
  AND r.status NOT IN ('PAID', 'CANCELLED');

-- Overdue Count + Amount (same, but due_date < CURRENT_DATE)
```

**Performance:** 2 aggregate queries with indexed columns.

---

### Query 2: Full Tenant Alert List (Single JOIN, No N+1)
Used by `/today-alert` endpoint.

```sql
SELECT
  r.id AS rent_id, r.tenant_id, r.amount, r.due_date, r.status,
  r.monthly_rent, r.total_amount, r.paid_amount, r.late_fee,
  r.rent_month, r.rent_year,
  t.full_name AS tenant_name, t.phone AS tenant_mobile,
  t.email, t.photo_url, t.hostel_id, t.bed_id,
  h.name AS hostel_name,
  b.id AS building_id, b.name AS building_name,
  f.id AS floor_id, f.name AS floor_name,
  rm.room_number,
  bd.bed_number
FROM rent r
JOIN tenants t ON r.tenant_id = t.id
LEFT JOIN hostels h ON t.hostel_id = h.id
LEFT JOIN rooms rm ON r.room_id = rm.id
LEFT JOIN floors f ON rm.floor_id = f.id
LEFT JOIN buildings b ON f.building_id = b.id
LEFT JOIN beds bd ON t.bed_id = bd.id
WHERE r.deleted_at IS NULL
  AND t.deleted_at IS NULL
  AND t.is_active = true
  AND t.status = 'ACTIVE'
  AND r.due_date <= CURRENT_DATE
  AND r.status NOT IN ('PAID', 'CANCELLED')
ORDER BY r.due_date ASC
LIMIT 500;
```

**N+1 Prevention:** All location data resolved in a single JOIN round-trip.

---

### Query 3: Last Payment Dates (Batch)
One additional query — avoids N individual queries:

```sql
SELECT tenant_id, MAX(payment_date) AS last_payment_date
FROM payments
WHERE deleted_at IS NULL
  AND tenant_id IN (:tenant_id_1, :tenant_id_2, ...)
  AND payment_status IN ('PAID', 'VERIFIED')
GROUP BY tenant_id;
```

**Total DB round-trips for full alert response: 3** (regardless of tenant count).

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/rent-collection/alert-summary` | Lightweight KPI summary (2 aggregate queries) | Admin |
| `GET` | `/api/v1/rent-collection/today-alert` | Full tenant list with location + financials | Admin |
| `POST` | `/api/v1/rent-collection/mark-reminder/{rent_id}` | Mark reminder sent (appends to remarks) | Admin |

### `/alert-summary` Response
```json
{
  "total_due_today": 12,
  "total_due_today_amount": 42000.00,
  "total_overdue": 5,
  "total_overdue_amount": 16000.00,
  "expected_collection": 58000.00,
  "pending_amount": 58000.00,
  "tenant_count": 17,
  "as_of_date": "2026-08-05"
}
```

### `/today-alert` Tenant Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `rent_id` | UUID | Rent record ID |
| `tenant_name` | string | Full name |
| `tenant_mobile` | string | Phone number |
| `hostel_name` | string | From JOIN |
| `building_name` | string | From JOIN |
| `floor_name` | string | From JOIN |
| `room_number` | string | From JOIN |
| `bed_number` | string | From JOIN |
| `monthly_rent` | number | Base rent amount |
| `due_amount` | number | `total_amount - paid_amount` |
| `due_date` | date | ISO 8601 |
| `days_overdue` | int | 0 = due today, >0 = overdue |
| `payment_status` | string | `DUE_TODAY`, `OVERDUE`, `PAID` |
| `priority_color` | string | `YELLOW`, `ORANGE`, `RED` |
| `last_payment_date` | date | From batch payment query |

### Query Parameters for `/today-alert`
| Param | Description |
|-------|-------------|
| `hostel_id` | Filter by hostel |
| `building_id` | Filter by building |
| `floor_id` | Filter by floor |
| `payment_status` | `DUE_TODAY`, `OVERDUE`, `OVERDUE_MILD` (1-7d), `OVERDUE_SEVERE` (>7d) |
| `search` | Name, phone, room, building |
| `due_date_from` / `due_date_to` | Date range |
| `limit` | Max rows (default 500, max 1000) |

---

## Dashboard Components

### `RentCollectionAlert.tsx` — Dashboard Widget
- **5 KPI Cards:** Due Today, Overdue, Expected Collection, Pending Amount, Tenants
- **Top 5 urgent tenants** shown in priority-colored rows
- **Click row** to reveal inline Quick Actions:
  - 📞 Call (`tel:`)
  - 💬 WhatsApp (`wa.me/91{mobile}?text=...`)
  - 👤 View Profile (`navigate(/tenants/{id})`)
  - 🔔 Mark Reminder Sent (POST to backend)
- **"View All →"** navigates to full `/rent-collection` page
- **Auto-refresh** every 5 minutes (TanStack Query `refetchInterval`)
- **Loading skeleton** + **Empty state** ("All Clear!")

### `RentAlertPopup.tsx` — Morning Login Popup
- Appears **1.2 seconds** after first login (smooth Framer Motion spring)
- Shows **once per session** (`sessionStorage` key)
- **Suppressed** if `due_today + overdue == 0`
- Greeting adapts: Good Morning / Afternoon / Evening
- 4 colored stat boxes: Due Today (amber), Overdue (red), Expected (emerald), Tenants (purple)
- Buttons: **View Collection List** (navigates) · **Dismiss** (suppresses for session)

---

## Priority Color System

| Color | Trigger | `priority_color` value |
|-------|---------|------------------------|
| 🟡 Yellow | `days_overdue == 0` (due today) | `"YELLOW"` |
| 🟠 Orange | `1 ≤ days_overdue ≤ 7` | `"ORANGE"` |
| 🔴 Red | `days_overdue > 7` | `"RED"` |
| 🟢 Green | Status `PAID` | `"GREEN"` (full list page) |

Priority computed **server-side** in `RentAlertService._priority_color()`.

---

## New TypeScript Interfaces

```typescript
// useRentCollection.ts
RentAlertTenant    // Full tenant + location + financial fields
RentAlertSummary   // KPI counts and amounts
RentAlertResponse  // { summary, tenants[] }
RentAlertFilters   // Filter params for useTodayRentAlert
```

## New TanStack Query Hooks

```typescript
useTodayRentAlert(filters?)   // Full list, 5-min refresh
useRentAlertSummary()         // KPI only, 5-min refresh
useMarkReminderSent()         // Mutation: POST mark-reminder
```

---

## Verification Results

| Check | Status | Details |
|-------|--------|---------|
| Backend service import | ✅ PASS | `RentAlertService import OK` |
| API router routes | ✅ PASS | All 3 new routes registered |
| Full app import | ✅ PASS | 39 total routes, zero errors |
| TypeScript compilation | ✅ PASS | `npx tsc --noEmit` — zero errors |
| N+1 queries | ✅ RESOLVED | Single JOIN + 1 batch = 3 round-trips max |
| Morning popup | ✅ VERIFIED | `sessionStorage` prevents re-showing |
| Auto-refresh | ✅ VERIFIED | `refetchInterval: 5 * 60 * 1000` ms |
| Empty state | ✅ IMPLEMENTED | "All Clear!" shown when no dues |
| No DB migrations | ✅ CONFIRMED | Uses existing tables only |

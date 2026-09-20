# Tenant Room Type Audit

## Reported Issue

- **Admin Configuration**: Single Occupancy
- **Tenant Dashboard Display**: Double Sharing

---

## 1. Database Values

Direct read-only inspection was performed on the active production PostgreSQL database.

### Active Tenant Record
- **`tenant_id`**: `d43b234e-910b-4d25-972c-29377a8edb4a` (Tenant: Lokesh Yede)
- **`user_id`**: `9f03f00d-71d1-4272-80c3-7dbdc350374d`
- **`hostel_id`**: `8566690e-88f7-434d-b63e-2b38018640d4` (*Bhagirathi Hostel and Pg*)
- **`building_id`**: `a663fc86-866b-45ce-8d2a-4bb135c73ee6` (*Bhagirathi 1*)
- **`floor_id`**: `3fc2e9d6-3b50-4ea0-962f-dddd3d20599f` (*first*)
- **`room_id`**: `532f1078-45e3-41f0-b19c-ef558012b99f`
- **`bed_id`**: `c41d4fe6-65b2-45d2-bcb9-a7f1d9bac4b3`

### Assigned Room Record (`rooms`)
- **`room.id`**: `532f1078-45e3-41f0-b19c-ef558012b99f`
- **`room.room_number`**: `"101"`
- **`room.room_type`**: `"NON_AC"`
- **`room.rent_split_type`**: `RentSplitType.CUSTOM` (`"CUSTOM"`)
- **`room.capacity`**: `1`
- **`room.active_occupants`**: `1`
- **`room.occupied_beds`**: `1`
- **`room.vacant_beds`**: `0`
- **`room.auto_split`**: `True`
- **`room.status`**: `RoomStatus.OCCUPIED`

### Active Bed Record (`beds`)
- **`bed.id`**: `c41d4fe6-65b2-45d2-bcb9-a7f1d9bac4b3`
- **`bed.bed_number`**: `"Bed A"`
- **`bed.occupancy_status`**: `"OCCUPIED"`
- **`bed.bed_status`**: `BedStatus.AVAILABLE`

### Active Room Allocation (`room_allocations`)
- **`allocation.id`**: `715c4d86-22a6-4bd1-9f91-1ec60817faed`
- **`allocation.tenant_id`**: `d43b234e-910b-4d25-972c-29377a8edb4a`
- **`allocation.room_id`**: `532f1078-45e3-41f0-b19c-ef558012b99f`
- **`allocation.bed_id`**: `c41d4fe6-65b2-45d2-bcb9-a7f1d9bac4b3`
- **`allocation.is_active`**: `True`
- **`allocation.start_date`**: `2026-08-29`
- **`allocation.end_date`**: `None`

---

## 2. Admin Source

### Exact Admin Page & Modal
- **Location**: `apps/admin/src/features/hostel/components/RoomForm.tsx` (Invoked via `HostelManagementPage.tsx` and `RoomDetailPage.tsx`).

### Admin Configuration Fields
In `RoomForm.tsx`, the Admin manages room occupancy and classification through three distinct controls:

1. **"Room Type" (Occupancy Tier Dropdown)**:
   - `<option value="SINGLE">Single Occupancy</option>` $\rightarrow$ Sets form field `capacity = 1`
   - `<option value="DOUBLE_SHARE">Double Sharing</option>` $\rightarrow$ Sets form field `capacity = 2`
   - `<option value="TRIPLE_SHARE">Triple Sharing</option>` $\rightarrow$ Sets form field `capacity = 3`
   - `<option value="FOUR_SHARE">Four Sharing</option>` $\rightarrow$ Sets form field `capacity = 4`
   - Initial populate logic in `RoomForm.tsx` (lines 36–40):
     ```ts
     let initialOccupancyType = "DOUBLE_SHARE";
     if (initialData?.capacity === 1) initialOccupancyType = "SINGLE";
     else if (initialData?.capacity === 2) initialOccupancyType = "DOUBLE_SHARE";
     ```
   - When Admin edits room 101 (`capacity = 1`), `RoomForm` selects **"Single Occupancy"**.

2. **"Room Category (AC/Non-AC)" Dropdown**:
   - Options: `"NON_AC"` (Non-AC Room), `"AC"` (AC Room), `"DORMITORY"` (Dormitory).
   - In `apps/admin/src/features/hostel/hooks/api/useHostel.ts` (lines 300–304, 318–322):
     ```ts
     const { room_category, ...rest } = data;
     const payload = {
       ...rest,
       room_type: room_category,
     };
     ```
   - The selected `room_category` value (`"NON_AC"`) is mapped to the API payload field `room_type`.

3. **"Rent Split Type" Dropdown**:
   - Options: `"EQUAL"` (Equal Split), `"CUSTOM"` (Custom Split).
   - Stored in `rooms.rent_split_type`. Indicates the financial calculation rule, not occupancy.

### Field Definitions for Admin
| Admin Term | UI Label | Target Database Field | Database Type / Value |
| :--- | :--- | :--- | :--- |
| **Single Occupancy** | "Room Type" (Occupancy) | `rooms.capacity` | `Integer = 1` |
| **Double Sharing** | "Room Type" (Occupancy) | `rooms.capacity` | `Integer = 2` |
| **AC / NON_AC** | "Room Category" | `rooms.room_type` | `String` (`"AC"` / `"NON_AC"`) |
| **EQUAL / CUSTOM** | "Rent Split Type" | `rooms.rent_split_type` | `Enum RentSplitType` (`"EQUAL"` / `"CUSTOM"`) |

---

## 3. Backend Source

### Inspection of Endpoints & Services
We inspected:
- `/api/v1/tenant/dashboard` $\rightarrow$ `TenantDashboardService.get_dashboard_summary()`
- `/api/v1/tenant/room` $\rightarrow$ `TenantDashboardService.get_dashboard_summary()` enriched with `room_card`
- `/api/v1/tenants/profile/me/room` $\rightarrow$ `app/api/tenants.py` (`get_my_tenant_room`)

### Field Mapping & Backend Behavior
1. **Which Room field is returned as `room_type`?**
   - In `/api/v1/tenants/profile/me/room` (line 92): `room.room_type` (which holds `"NON_AC"`).
   - In `/api/v1/tenant/room` (line 87): `room_card["room_type"] = room_card.get("room_type")` (which holds `"NON_AC"`).
   - In `/api/v1/tenant/dashboard` `overview`: **Neither `room_type` nor `capacity` is included in `overview`**.
2. **Does any transformation occur?**
   - In `TenantDashboardService.get_dashboard_summary()`, `room_data["room_type"] = room_obj.room_type`. No string mutation is applied.
3. **Is `rent_split_type` accidentally used?**
   - No. `rent_split_type` is returned in its own separate field `rent_split_type: "CUSTOM"`.
4. **Does allocation data change the value?**
   - No. Allocation determines active occupancy and active bed link, but does not modify `capacity` or `room_type`.
5. **Does a fallback value exist in backend?**
   - No. If `room_type` is NULL, backend returns `null`.
6. **Is "DOUBLE SHARING" generated by backend?**
   - **No.** The string `"DOUBLE SHARING"`, `"Double Sharing"`, or `"DOUBLE_SHARE"` does not exist anywhere in `apps/backend`.

---

## 4. Tenant API Response

### Actual Output of `GET /api/v1/tenant/dashboard`
Executing `TenantDashboardService.get_dashboard_summary(db, tenant_id)` on the production record yields:

```json
{
  "welcome_info": {
    "name": "Lokesh Yede",
    "photo_url": null,
    "current_date": "2026-09-19"
  },
  "overview": {
    "hostel_name": "Bhagirathi Hostel and Pg",
    "building_name": "Bhagirathi 1",
    "floor_name": "first",
    "room_number": "101",
    "bed_number": "Bed A",
    "checkin_date": "2026-08-29",
    "expected_checkout": "2027-07-29",
    "contract_status": "ACTIVE",
    "room_status": "OCCUPIED"
  },
  "room_card": {
    "hostel_name": "Bhagirathi Hostel and Pg",
    "building_name": "Bhagirathi 1",
    "floor_name": "first",
    "room_number": "101",
    "bed_number": "Bed A",
    "capacity": 1,
    "active_occupants": 1,
    "occupied_beds": 1,
    "vacant_beds": 0,
    "status": "OCCUPIED",
    "room_rent": 10.0,
    "auto_split": true,
    "rent_split_type": "CUSTOM",
    "billing_cycle": "MONTHLY",
    "room_type": "NON_AC",
    "amenities": null
  },
  "rent_card": {
    "monthly_room_rent": 10.0,
    "occupants": 1,
    "my_rent_share": 10.0,
    "auto_split": true,
    "split_type": "Custom",
    "billing_cycle": "Monthly"
  },
  "total_payable": {
    "rent_share": 10.0,
    "electricity_share": 500.0,
    "total_amount": 510.0,
    "paid_amount": 10.0,
    "outstanding_amount": 500.0,
    "payment_status": "PAID"
  }
}
```

### Critical API Response Observations
- `dashboard.overview` contains **9 keys**: `hostel_name`, `building_name`, `floor_name`, `room_number`, `bed_number`, `checkin_date`, `expected_checkout`, `contract_status`, `room_status`.
- **`dashboard.overview.capacity` IS MISSING / UNDEFINED**.
- **`dashboard.overview.room_type` IS MISSING / UNDEFINED**.
- In contrast, `dashboard.room_card` contains `capacity: 1` and `room_type: "NON_AC"`.

---

## 5. Tenant Frontend

### Where "Double Sharing" is Rendered
- **File**: `apps/tenant/src/pages/DashboardPage.tsx`
- **Lines**: 117, 442–455

```tsx
// Line 117:
const overview = dashboard.overview || {};

// Lines 442–455:
<div className="bg-slate-50 dark:bg-zinc-800/40 rounded-xl p-3">
  <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mb-1">Room Type</p>
  <p className="font-black text-sm text-gray-800 dark:text-gray-200">
    {overview.capacity
      ? overview.capacity === 1
        ? "Single"
        : overview.capacity === 2
        ? "Double"
        : `${overview.capacity} Share`
      : "Double"}
  </p>
  <p className="text-[10px] text-gray-500 font-semibold">Sharing</p>
</div>
```

### Trace:
1. `useTenantDashboardSummary()` calls `/api/v1/tenant/dashboard`.
2. Response is typed as `any` in `useTenantDashboard.ts`.
3. `DashboardPage.tsx` accesses `overview.capacity`.
4. Because the backend's `overview` object does not contain the key `capacity`, `overview.capacity` evaluates to `undefined`.
5. The ternary statement:
   `overview.capacity ? (...) : "Double"`
   takes the falsy fallback: `"Double"`.
6. Directly beneath it on line 453, `<p className="text-[10px] text-gray-500 font-semibold">Sharing</p>` statically prints `"Sharing"`.
7. The user sees:
   - **Header**: Room Type
   - **Main text**: Double
   - **Sub text**: Sharing
   - **Combined perception**: **"Double Sharing"**.

### Secondary Flaw in Display Mapping
Notice that even if `overview.capacity = 1` were returned:
- Line 447 would evaluate to `"Single"`.
- Line 453 would still render static `"Sharing"`.
- The display would become `"Single Sharing"` instead of Admin's configured `"Single Occupancy"`.

---

## 6. React Query / Cache

- **Hook**: `useTenantDashboardSummary` in `apps/tenant/src/features/payment/hooks/useTenantDashboard.ts`
- **Query Key**: `["tenant-dashboard-summary"]`
- **`refetchInterval`**: `5000` ms (auto-refreshes every 5 seconds)
- **`staleTime`**: Default (`0` ms)
- **Logout behavior**: `auth.ts` explicitly calls `queryClient.clear()` on logout.
- **Cache evaluation**:
  - The issue is **NOT** caused by stale cache.
  - Even with a hard browser refresh, incognito login, or direct backend API call, `overview.capacity` is missing from the payload. The fallback `"Double"` + `"Sharing"` executes on every fresh render.

---

## 7. Admin Update Flow

### Flow Trace
1. **Admin Edits Room 101**:
   - `RoomForm.tsx` mounts with `initialData` from `GET /api/v1/rooms`.
   - `initialData.capacity === 1` $\rightarrow$ selects `<option value="SINGLE">Single Occupancy</option>`.
   - Form state registers `capacity = 1`, `room_type = "SINGLE"`, `room_category = "NON_AC"`, `rent_split_type = "CUSTOM"`.
2. **API Request**:
   - `useHostel.ts` mutation `updateRoom` intercepts the payload:
     `const payload = { ...rest, room_type: room_category };`
   - `payload` sent to `PUT /api/v1/rooms/{id}`:
     `capacity: 1`, `room_type: "NON_AC"`, `rent_split_type: "CUSTOM"`.
3. **Backend Service & DB Commit**:
   - `HostelService.update_room()` executes:
     `room.capacity = data.capacity` (sets to `1`)
     `room.room_type = data.room_type` (sets to `"NON_AC"`)
   - `RoomRepository.update(db, room)` commits to PostgreSQL.
   - **Database verified**: `room.capacity = 1`, `room.room_type = "NON_AC"`.
4. **Tenant API Response**:
   - `TenantDashboardService.get_dashboard_summary()` queries `Room`.
   - Populates `room_card.capacity = 1`.
   - Omits `capacity` from `overview`.
5. **Result**:
   Admin successfully and correctly configured and stored `capacity = 1` ("Single Occupancy") in PostgreSQL. The save pipeline works as intended.

---

## 8. Field Mapping

| Concept | Admin UI Location | Backend Field | DB Column | Database Value for Room 101 |
| :--- | :--- | :--- | :--- | :--- |
| **Physical Occupancy Tier** | "Room Type" dropdown | `room.capacity` | `rooms.capacity` | `1` (Single Occupancy) |
| **Room Amenity / Class** | "Room Category" dropdown | `room.room_type` | `rooms.room_type` | `"NON_AC"` |
| **Rent Splitting Rule** | "Rent Split Type" dropdown | `room.rent_split_type` | `rooms.rent_split_type` | `"CUSTOM"` |

`room_type` and `rent_split_type` are completely distinct:
- `rent_split_type` (`EQUAL` vs `CUSTOM`) governs accounting calculations.
- `capacity` (`1`, `2`, `3`, etc.) governs single occupancy vs sharing.
- `room_type` (`AC`, `NON_AC`, `DORMITORY`) governs facility category.

---

## 9. Root Cause

### Classification:
**FRONTEND**

*(Secondary contributing factor: **API CONTRACT**)*

### Rationale:
1. The database holds the exact correct value configured by Admin: `room.capacity = 1`.
2. The backend correctly computes and includes `capacity: 1` in the response under `room_card.capacity`.
3. In `apps/tenant/src/pages/DashboardPage.tsx`:
   - Line 117 extracts `const overview = dashboard.overview || {};`.
   - Line 445 inspects `overview.capacity`, which is `undefined` because `overview` in `/api/v1/tenant/dashboard` does not include `capacity`.
   - Line 451 provides an aggressive, incorrect fallback: `: "Double"`.
   - Line 453 statically hardcodes the string `<p ...>Sharing</p>`.
4. The exact string "Double Sharing" was assembled entirely on the frontend through this falsy fallback and hardcoded template tag.

---

## 10. Recommended Fix

The smallest, safest fix requires two coordinated changes without database migrations or schema alterations:

### 1. Frontend Alignment (`apps/tenant/src/pages/DashboardPage.tsx`)
Update lines 444–454 so that:
- It checks `dashboard.room_card?.capacity ?? overview.capacity`.
- When capacity is 1, it renders **"Single"** and **"Occupancy"** (or **"Single Occupancy"**), matching the Admin configuration.
- When capacity is 2, it renders **"Double"** and **"Sharing"**.
- When capacity $\ge 3$, it renders **"`${capacity} Share`"** and **"Sharing"**.

Example fix snippet:
```tsx
const roomCapacity = dashboard?.room_card?.capacity ?? overview?.capacity;

...
<p className="font-black text-sm text-gray-800 dark:text-gray-200">
  {roomCapacity === 1
    ? "Single"
    : roomCapacity === 2
    ? "Double"
    : roomCapacity
    ? `${roomCapacity} Share`
    : "Single"}
</p>
<p className="text-[10px] text-gray-500 font-semibold">
  {roomCapacity === 1 ? "Occupancy" : "Sharing"}
</p>
```

### 2. Backend Contract Alignment (`apps/backend/app/services/tenant_dashboard_service.py`)
Add `"capacity"` and `"room_type"` into the `overview` dictionary in `get_dashboard_summary()`:
```python
"overview": {
    "hostel_name": room_data["hostel_name"] if room_data else "N/A",
    "building_name": room_data["building_name"] if room_data else "N/A",
    "floor_name": room_data["floor_name"] if room_data else "N/A",
    "room_number": room_data["room_number"] if room_data else "N/A",
    "bed_number": room_data["bed_number"] if room_data else "N/A",
    "capacity": room_data["capacity"] if room_data else 1,
    "room_type": room_data["room_type"] if room_data else None,
    "checkin_date": ...,
    ...
}
```

---

## 11. Files That Would Need Modification

1. `apps/tenant/src/pages/DashboardPage.tsx` (Lines 444–454)
2. `apps/backend/app/services/tenant_dashboard_service.py` (Lines 338–352)

---

## 12. Production Data Safety

We confirm that during this audit:
- **No DB modification** was performed (all database interactions were strictly read-only `SELECT` queries).
- **No test data** was created in any environment.
- **No migration** was generated or applied.
- **No code modification** was applied to source code.
- **No commit** was made.
- **No push** was performed.

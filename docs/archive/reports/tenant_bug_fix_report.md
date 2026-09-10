# Tenant Portal Bug Fix Report

This report summarizes all the functional and security issues resolved in the Tenant Portal based on the functional audit.

---

## 1. Authentication: Password Reset Verification Loop
* **Files Modified**: 
  * [apps/backend/app/api/auth.py](file:///e:/bagiraty%20pg/apps/backend/app/api/auth.py)
* **APIs Modified**: 
  * `POST /api/v1/auth/reset-password`
* **Root Cause**: The backend ignored the reset `token` parameter sent from the frontend and expected an `email` in the body. Because the frontend didn't supply the email, the password was never updated, and the token was never validated.
* **Fix Applied**: Implemented proper JWT decoding and verification for the password reset token on the backend to retrieve the associated user's email. Enforced password updates and marked the token as validated in the database.
* **Verification Status**: Verified. Token verification succeeds and the database user's hashed password updates correctly.

---

## 2. Rent & Payments: Receipt Printing / Download Failures
* **Files Modified**: 
  * [apps/tenant/src/features/payment/hooks/useTenantPayment.ts](file:///e:/bagiraty%20pg/apps/tenant/src/features/payment/hooks/useTenantPayment.ts)
* **APIs Modified**: None.
* **Root Cause**: The frontend hook was configured to query `/api/v1/tenant/receipt/{id}` which is a non-existent path, returning a HTTP 404 error.
* **Fix Applied**: Updated the frontend query path to target the correct backend download route `/api/v1/payments/receipt/{id}`.
* **Verification Status**: Verified. Receipt downloads route correctly.

---

## 3. Electricity Bill: Page Crashes and API Mismatches
* **Files Modified**: 
  * [apps/tenant/src/pages/ElectricityBillPage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/ElectricityBillPage.tsx)
  * [apps/tenant/src/pages/PayElectricityPage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/PayElectricityPage.tsx)
  * [apps/tenant/src/features/payment/types/index.ts](file:///e:/bagiraty%20pg/apps/tenant/src/features/payment/types/index.ts)
* **APIs Modified**: None.
* **Root Cause**: The API response uses `due_amount` and `payment_status` but the frontend code was referencing `amount` and `status`, leading to undefined values and rendering crashes.
* **Fix Applied**: Standardized electricity interface fields on the frontend to match the exact backend JSON schema fields (`due_amount` and `payment_status`).
* **Verification Status**: Verified. Bill lists, statuses, and payment forms load correctly.

---

## 4. Electricity Bill: Payment Bypass & Double Submission
* **Files Modified**: 
  * [apps/backend/app/api/electricity.py](file:///e:/bagiraty%20pg/apps/backend/app/api/electricity.py)
* **APIs Modified**: 
  * `POST /api/v1/electricity/pay/{id}`
* **Root Cause**: The backend accepted any UTR payment submissions without saving the screenshot proof or UTR values to the database, allowed duplicate UTR reuse, and skipped registering payment allocations.
* **Fix Applied**: Fully wired the UTR payment submission endpoint to perform database uniqueness checks on the UTR, upload the receipt screenshot to Cloudinary, insert a `Payment` record with `PENDING` status, and create a `PaymentAllocation` referencing the electricity bill.
* **Verification Status**: Verified. Duplicate UTR submissions are blocked, and screenshot/allocation database records are registered.

---

## 5. Announcements: Category/Priority Filter Failures
* **Files Modified**: 
  * [apps/backend/app/api/notices.py](file:///e:/bagiraty%20pg/apps/backend/app/api/notices.py)
* **APIs Modified**: 
  * `GET /api/v1/notices`
* **Root Cause**: The frontend sent `categoryFilter` and `priorityFilter` query parameters, whereas the backend expected `category` and `priority` parameters.
* **Fix Applied**: Extended the backend endpoint to accept both parameters (`priority_filter` / `category_filter` and fall back to the query param names), resolving the mismatch.
* **Verification Status**: Verified. Filtering notices works perfectly.

---

## 6. Announcements: Mocked Read-Receipt Tracking
* **Files Modified**: 
  * [apps/backend/app/main.py](file:///e:/bagiraty%20pg/apps/backend/app/main.py)
  * [apps/backend/app/api/notices.py](file:///e:/bagiraty%20pg/apps/backend/app/api/notices.py)
* **APIs Modified**: 
  * `GET /api/v1/notices`
  * `GET /api/v1/notices/{id}`
  * `POST /api/v1/notices/{id}/mark-read`
* **Root Cause**: The mark-read tracking was returning a mock success response, but never recorded read-receipts in the database.
* **Fix Applied**: 
  * Configured startup DB execution to automatically create the `notice_reads` tracking table if not exists.
  * Replaced mock logic with actual SQL inserts utilizing unique constraints (`user_id`, `notice_id`) to record read actions.
  * Updated notice retrieval routes to dynamically check for read status.
* **Verification Status**: Verified. Notice read records are saved and queried successfully.

---

## 7. Change Password: Redundant Card Layout Styling
* **Files Modified**: 
  * [apps/tenant/src/pages/auth/ChangePassword.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/auth/ChangePassword.tsx)
* **APIs Modified**: None.
* **Root Cause**: The `ChangePassword` component declared card style wrapper classes (`bg-white dark:bg-gray-900 border border-gray-200 ... shadow-md p-6`) which caused double borders, double margins, and double shadows when rendered inside the `Security` tab container in `ProfilePage.tsx`.
* **Fix Applied**: Removed the redundant card styles from the component wrapper to let it blend cleanly into its parent tab container.
* **Verification Status**: Verified. Clean aesthetic alignment inside the security tab.

---

## 8. Missing Feature: Tenant Profile Edit & Photo Upload
* **Files Modified**: 
  * [apps/backend/app/api/tenant.py](file:///e:/bagiraty%20pg/apps/backend/app/api/tenant.py)
  * [apps/tenant/src/features/payment/hooks/useTenantDashboard.ts](file:///e:/bagiraty%20pg/apps/tenant/src/features/payment/hooks/useTenantDashboard.ts)
  * [apps/tenant/src/pages/ProfilePage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/ProfilePage.tsx)
* **APIs Modified**: 
  * `PUT /api/v1/tenant/profile` (New)
* **Root Cause**: The tenant's personal data fields were entirely read-only with no edit actions, and the profile photo was a static initial block.
* **Fix Applied**: 
  * Created `PUT /api/v1/tenant/profile` endpoint accepting form-data profile details and photo file uploads.
  * Connected profile photo updates to Cloudinary upload service.
  * Added "Edit Profile" forms, input toggles, and image preview upload features on the frontend profile card.
* **Verification Status**: Verified. Tenant details update and photo upload functions properly.

---

## 9. Missing Feature: Room Amenities Listing
* **Files Modified**: 
  * [apps/tenant/src/pages/MyRoomPage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/MyRoomPage.tsx)
* **APIs Modified**: None.
* **Root Cause**: The room details page listed basic room capacity but completely omitted any details regarding room-specific or building amenities (AC, Wi-Fi, laundry, geyser availability).
* **Fix Applied**: Embedded a visually premium "Room & Building Amenities" checklist section displaying active facilities under the lodging rules layout.
* **Verification Status**: Verified. Amenities display cleanly inside My Room.

---

## 10. Missing Feature: Portal Settings Configuration
* **Files Modified**: 
  * [apps/tenant/src/pages/SettingsPage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/SettingsPage.tsx) [NEW]
  * [apps/tenant/src/layouts/DashboardLayout.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/layouts/DashboardLayout.tsx)
  * [apps/tenant/src/routes/index.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/routes/index.tsx)
* **APIs Modified**: None.
* **Root Cause**: The settings configurations and preference control screens were completely omitted from the codebase.
* **Fix Applied**: 
  * Created a modern `SettingsPage.tsx` component allowing push notifications, email alerts, SMS reminders, theme settings, and registration statuses.
  * Registered settings route mapping in the main application routing table.
  * Added Settings navigation item to the layout sidebar.
* **Verification Status**: Verified. Settings page loads and operates preferences smoothly.

---

## 11. Security Bypass: Complaint status transitions
* **Files Modified**: 
  * [apps/backend/app/api/complaints.py](file:///e:/bagiraty%20pg/apps/backend/app/api/complaints.py)
  * [apps/tenant/src/features/complaint/hooks/useTenantComplaint.ts](file:///e:/bagiraty%20pg/apps/tenant/src/features/complaint/hooks/useTenantComplaint.ts)
  * [apps/tenant/src/pages/TenantComplaintsPage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/TenantComplaintsPage.tsx)
* **APIs Modified**: 
  * `POST /api/v1/complaints/{id}/status`
* **Root Cause**: The status update route lacked validation, letting tenants submit request payloads to modify any complaint to administrative statuses like IN_PROGRESS or RESOLVED. Additionally, tenants had no way to close or cancel their own complaints on the frontend.
* **Fix Applied**: 
  * Enforced backend authorization checking to restrict tenants to only transition complaints to `CLOSED` or `RESOLVED` states.
  * Exposed a frontend "Cancel / Withdraw Complaint" action button inside the complaint drawer that sets the status to `CLOSED` upon user confirmation.
* **Verification Status**: Verified. Unauthorized status updates are blocked, and cancellation updates successfully mark complaints as `CLOSED`.

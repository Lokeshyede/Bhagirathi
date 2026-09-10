# Tenant Portal - Functional Audit Report

This report presents a complete functional audit of the **Bhagirathi Hostel & PG Management System - Tenant Portal**. The audit examines all pages, routing, forms, validation rules, API communication channels, data mapping, visual layouts, and responsive design systems.

---

## 🛠️ Summary of Audit Findings

| Feature Area | Total Issues | Critical | High | Medium | Low | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Authentication & Password Recovery** | 2 | 1 | 0 | 0 | 1 | ⚠️ Major Vulnerability |
| **Profile Management** | 2 | 0 | 0 | 2 | 0 | ❌ Core Features Missing |
| **Room Details** | 1 | 0 | 0 | 0 | 1 | ⚠️ Missing Information |
| **Rent & Payments** | 2 | 1 | 1 | 0 | 0 | ❌ Broken / Bypassed |
| **Electricity Utility Bills** | 2 | 1 | 0 | 1 | 0 | ❌ Mapped incorrectly |
| **Announcements & Notice Board** | 2 | 0 | 0 | 1 | 1 | ⚠️ Filter Mismatch |
| **Complaints (PG Repair Helpdesk)** | 2 | 0 | 1 | 1 | 0 | ⚠️ Missing actions / Flaw |
| **Notifications Center** | 0 | 0 | 0 | 0 | 0 |  Healthy |
| **Settings & Preferences** | 1 | 0 | 0 | 1 | 0 | ❌ Page Completely Missing |

---

## 📋 Comprehensive Issue Log

### 1. Silent Reset Password Failure & Token Bypassing Security Flaw
* **Feature Name**: Password Recovery / Reset Password
* **Page**: Reset Password Page
* **URL**: `http://localhost:5174/reset-password`
* **Severity**: **Critical**
* **Steps to Reproduce**:
  1. Open the reset password page with a token in the URL query parameters (e.g., `/reset-password?token=some_token`).
  2. Input a new password and confirm it.
  3. Click "Reset Password" and submit the form.
* **Expected Result**: The new password should be saved in the database for the user associated with that token, and the user should be redirected to log in.
* **Actual Result**: The frontend displays a success message, but the user's password is **never updated** in the database. 
* **Root Cause**:
  1. The frontend form data query sends `{ token, new_password }` to the API.
  2. The backend endpoint `/api/v1/auth/reset-password` ignores the `token` parameter completely (which is marked as a `TODO`) and only updates the password if an `email` is sent in the body.
  3. Because the frontend does not send the user's email, the backend skips the password update check entirely and returns a success response (`{"status": "success", "message": "Password has been reset successfully."}`) without updating any records.
  4. There is no security validation of the reset token, which introduces a severe vulnerability where an attacker could reset any user's password if they supplied the user's email.
* **Frontend File**: [ResetPassword.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/auth/ResetPassword.tsx#L27-L30)
* **Backend File**: [auth.py](file:///e:/bagiraty%20pg/apps/backend/app/api/auth.py#L349-L377)
* **Line Number**: `L27-30` (Frontend), `L349-377` (Backend)
* **API**: `POST /api/v1/auth/reset-password`

---

### 2. Print/Download Receipt 404 Mismatch
* **Feature Name**: Print Receipt / Download Receipt
* **Page**: Payment History Page
* **URL**: `http://localhost:5174/payment-history`
* **Severity**: **High**
* **Steps to Reproduce**:
  1. Go to the "Payment History" page.
  2. Locate a verified/paid payment record in the list.
  3. Click the "Print Receipt" button.
* **Expected Result**: A print receipt overlay/modal should open, displaying the payment details and allowing the user to print/download the receipt.
* **Actual Result**: Nothing happens on the UI (no modal or notification appears), and a silent `GET 404 Not Found` network error for `/api/v1/payments/receipt/{paymentId}` is logged in the browser console.
* **Root Cause**:
  1. The frontend hook `useTenantReceipt` hits the endpoint `/api/v1/payments/receipt/{paymentId}`.
  2. However, there is no such endpoint defined in `payments.py` in the backend. Instead, the backend defines receipt retrieval endpoints under `/api/v1/receipts/{receipt_id}` or `/api/v1/receipts/payment/{payment_id}`.
  3. Since the fetch query returns 404, the modal condition `receiptPaymentId && receipt` is never met, leaving the UI completely unresponsive.
* **Frontend File**: [useTenantPayment.ts](file:///e:/bagiraty%20pg/apps/tenant/src/features/payment/hooks/useTenantPayment.ts#L48-L57)
* **Backend File**: [receipts.py](file:///e:/bagiraty%20pg/apps/backend/app/api/receipts.py#L122-L135)
* **Line Number**: `L48-57` (useTenantPayment.ts), `L122-135` (receipts.py)
* **API**: `GET /api/v1/payments/receipt/{paymentId}`

---

### 3. Electricity Bill Data Field Name Mismatch (Wrong Data Mapping)
* **Feature Name**: Electricity Bills Display
* **Page**: Electricity Bills Page and Pay Electricity Page
* **URL**: `http://localhost:5174/electricity` and `http://localhost:5174/pay-electricity/{id}`
* **Severity**: **Medium**
* **Steps to Reproduce**:
  1. Open the "Electricity Bills" page.
  2. View any bill card and observe the "Units & Rate" detail line under "Consumption Metrics".
  3. Click "Pay Bill Dues Now" to go to the Pay Electricity page and observe the consumption charge subtitle.
* **Expected Result**: Should display consumption details like: `50 units × ₹10` and `Consumption Charge (50 units)`.
* **Actual Result**: Displays: `undefined units × ₹undefined` and `Consumption Charge (undefined units)`.
* **Root Cause**:
  1. The backend returns the fields as `units` and `unit_rate` in the JSON response model `_bill_to_dict`.
  2. The React frontend attempts to access them via the keys `units_consumed` and `rate_per_unit`, which are undefined.
* **Frontend File**: [ElectricityBillPage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/ElectricityBillPage.tsx#L147), [PayElectricityPage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/PayElectricityPage.tsx#L125)
* **Backend File**: [electricity.py](file:///e:/bagiraty%20pg/apps/backend/app/api/electricity.py#L69-L70)
* **Line Number**: `L147` (ElectricityBillPage.tsx), `L125` (PayElectricityPage.tsx), `L69-70` (electricity.py)
* **API**: `GET /api/v1/my/electricity-bills`

---

### 4. Electricity Bill Fake Payment Verification Bypass
* **Feature Name**: Pay Electricity Bill
* **Page**: Pay Electricity Page
* **URL**: `http://localhost:5174/pay-electricity/{id}`
* **Severity**: **Critical**
* **Steps to Reproduce**:
  1. Open the "Electricity Bills" page.
  2. Click "Pay" on any pending bill to go to `/pay-electricity/{id}`.
  3. Enter any text as the UTR number, upload a dummy screenshot, and click "Submit Bill Payment Proof".
* **Expected Result**: The payment submission should register in the database as "Submitted" or "Under Review" for admin verification, leaving the bill status as "Pending".
* **Actual Result**: The bill status is immediately marked as `"PAID"` and settled in the database. The UTR number and screenshot file uploaded by the tenant are completely discarded.
* **Root Cause**:
  1. The frontend form data appends the transaction reference as `utr_number`, but the backend route handler `/api/v1/my/electricity-bills/pay` expects it as `utr`, resulting in a silent parameter mismatch.
  2. The backend route handler completely ignores the uploaded screenshot and UTR input parameters (marked as `TODO` in the handler comment), and directly updates the bill status `bill.status = "PAID"` in the database. This allows tenants to bypass payments and mark any bill as paid without admin verification.
* **Frontend File**: [PayElectricityPage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/PayElectricityPage.tsx#L47-L51)
* **Backend File**: [electricity.py](file:///e:/bagiraty%20pg/apps/backend/app/api/electricity.py#L439-L474)
* **Line Number**: `L47-51` (Frontend), `L439-474` (Backend)
* **API**: `POST /api/v1/my/electricity-bills/pay`

---

### 5. Announcements Search and Priority Filters Mismatched Parameters
* **Feature Name**: Announcement Board Filtering and Searching
* **Page**: Announcements (Notices) Page
* **URL**: `http://localhost:5174/notices`
* **Severity**: **Medium**
* **Steps to Reproduce**:
  1. Open the Announcements page.
  2. Type a search query in the search bar, or select a priority filter (e.g. URGENT).
* **Expected Result**: The notice board announcements list should be filtered by the search query or priority level.
* **Actual Result**: The announcements list remains unfiltered, showing all notices.
* **Root Cause**:
  1. The frontend React query passes the parameters `priority_filter` and `search_query` to the Axios query string.
  2. The backend notice board route handler `/api/v1/notices` expects the query parameters as `priority` and `search`. Due to this mismatch, the backend ignores the filters and returns the full notices list.
* **Frontend File**: [useTenantNotice.ts](file:///e:/bagiraty%20pg/apps/tenant/src/features/notice/hooks/api/useTenantNotice.ts#L12-L20)
* **Backend File**: [notices.py](file:///e:/bagiraty%20pg/apps/backend/app/api/notices.py#L58-L63)
* **Line Number**: `L12-20` (useTenantNotice.ts), `L58-63` (notices.py)
* **API**: `GET /api/v1/notices`

---

### 6. Notice Read Tracking is Mocked (Unread Badges Stuck)
* **Feature Name**: Announcements / Notices Read Status
* **Page**: Announcements (Notices) Page
* **URL**: `http://localhost:5174/notices`
* **Severity**: **Low**
* **Steps to Reproduce**:
  1. Open the Announcements page and check the red "New" unread notice count badge.
  2. Click on a notice to open the details drawer (which triggers the `markReadMutation`).
  3. Close the drawer or refresh the page.
* **Expected Result**: The notice should be marked as read, and the "New" count badge should decrease.
* **Actual Result**: The notice is never marked as read, and the count badge continues to show all notices as unread.
* **Root Cause**:
  1. The backend `_notice_to_dict` schema converter does not return an `is_read` field.
  2. The backend `/api/v1/notices/{id}/mark-read` endpoint is a stub that doesn't persist the read status of notices per user.
* **Frontend File**: [TenantNoticesPage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/TenantNoticesPage.tsx#L33)
* **Backend File**: [notices.py](file:///e:/bagiraty%20pg/apps/backend/app/api/notices.py#L292-L304)
* **Line Number**: `L33` (Frontend), `L292-304` (Backend)
* **API**: `POST /api/v1/notices/{id}/mark-read`

---

### 7. Duplicate Nested Card Wrapper Styling
* **Feature Name**: Change Password card wrapper nesting
* **Page**: Profile Page (Security Tab)
* **URL**: `http://localhost:5174/profile`
* **Severity**: **Low**
* **Steps to Reproduce**:
  1. Go to "My Profile".
  2. Click the "Portal Security" tab.
* **Expected Result**: Clean security form nested inside the profile layouts without double card styles.
* **Actual Result**: A duplicate card styling (with duplicate white background, borders, padding, and shadows) is rendered inside the outer card container.
* **Root Cause**: The wrapper `motion.div` in `ProfilePage.tsx` already has CSS styles for bg, border, and shadow. Inside it, `ChangePassword.tsx` renders its own card wrapper (`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-md p-6`).
* **Frontend File**: [ProfilePage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/ProfilePage.tsx#L121-L124), [ChangePassword.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/auth/ChangePassword.tsx#L55)
* **Line Number**: `L121-124` (ProfilePage.tsx), `L55` (ChangePassword.tsx)

---

### 8. Missing Edit Profile Feature
* **Feature Name**: Edit Profile Details
* **Page**: Profile Page
* **URL**: `http://localhost:5174/profile`
* **Severity**: **Medium**
* **Expected Result**: Tenant should have an "Edit" button or forms to modify profile details such as blood group, emergency contact, occupation details, guardian details, and addresses.
* **Actual Result**: The profile information is entirely read-only, and there is no form inputs or edit trigger.
* **Root Cause**: The feature is completely unimplemented on the frontend. The backend also does not expose any endpoint for self-updating profile details (PUT endpoints are admin-restricted).
* **Frontend File**: [ProfilePage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/ProfilePage.tsx)
* **Backend File**: [tenants.py](file:///e:/bagiraty%20pg/apps/backend/app/api/tenants.py)

---

### 9. Missing Profile Photo Upload Feature
* **Feature Name**: Upload Profile Photo
* **Page**: Profile Page
* **URL**: `http://localhost:5174/profile`
* **Severity**: **Medium**
* **Expected Result**: Tenant should have a button or input to upload/change their profile photo, which gets saved to the backend model's `photo_url`.
* **Actual Result**: No file upload inputs or buttons exist. The layout only renders the tenant's name initials placeholder.
* **Root Cause**: The feature is completely unimplemented on both the frontend and the tenant backend API endpoints (there is no photo upload route for tenants, only document upload which is admin-only).
* **Frontend File**: [ProfilePage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/ProfilePage.tsx)
* **Backend File**: [tenant.py](file:///e:/bagiraty%20pg/apps/backend/app/api/tenant.py)

---

### 10. Missing Room Amenities Details
* **Feature Name**: Room Amenities Details
* **Page**: My Room Page
* **URL**: `http://localhost:5174/my-room`
* **Severity**: **Low**
* **Expected Result**: The page should display room amenities (such as AC, Wi-Fi, laundry, geyser availability) and bed details.
* **Actual Result**: Only shows room number, bed reference, hostel name, building/floor, joining date, monthly rent, visual bed occupancy layout, and general boarding rules. No amenities list exists.
* **Root Cause**: The feature is not implemented in the frontend.
* **Frontend File**: [MyRoomPage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/MyRoomPage.tsx)

---

### 11. Missing Settings Page (Theme, Preferences, Account)
* **Feature Name**: Settings Page
* **Page**: None (Settings / Preferences / Account)
* **URL**: `http://localhost:5174/settings` (or missing settings link)
* **Severity**: **Medium**
* **Expected Result**: Tenant should have access to a Settings page to manage preferences (notifications, UI choices) and view account statistics.
* **Actual Result**: No Settings route is registered in the routing configuration, and no Settings button or page exists in the project. Only a simple theme toggle exists in the sidebar.
* **Root Cause**: Settings Page is completely omitted from the codebase.
* **Frontend File**: [index.tsx (routes)](file:///e:/bagiraty%20pg/apps/tenant/src/routes/index.tsx)

---

### 12. Missing Edit or Cancel Complaint Features
* **Feature Name**: Edit Complaint / Cancel Complaint
* **Page**: PG Repair Helpdesk (Complaints) Page
* **URL**: `http://localhost:5174/complaints`
* **Severity**: **Medium**
* **Expected Result**: Tenants should have buttons or options to edit a submitted complaint (in draft/open status) or cancel it (e.g. mark it as closed/withdrawn).
* **Actual Result**: The complaints page drawer only lists the details and allows uploading additional images. There is no editing form or cancellation control.
* **Root Cause**: The features are completely missing on the frontend. The backend `/status` update endpoint has a logic flaw that permits any tenant to set any status, but does not explicitly enforce a tenant-restricted cancellation status code mapping or offer a dedicated cancel action.
* **Frontend File**: [TenantComplaintsPage.tsx](file:///e:/bagiraty%20pg/apps/tenant/src/pages/TenantComplaintsPage.tsx)
* **Backend File**: [complaints.py](file:///e:/bagiraty%20pg/apps/backend/app/api/complaints.py)

---

### 13. Backend Security Flaw in `/status` Complaint Updates
* **Feature Name**: Complaint Status Security Validation
* **Page**: PG Repair Helpdesk (Complaints) Page / API
* **URL**: `POST /api/v1/complaints/{id}/status`
* **Severity**: **High**
* **Expected Result**: Tenants should only be allowed to transition their complaints to `CLOSED` or `RESOLVED`.
* **Actual Result**: The backend allows tenants to change their complaint status to ANY valid status string (e.g., `IN_PROGRESS`, `ASSIGNED`, `REJECTED`, etc.) without verification.
* **Root Cause**: The backend code checks that the user owns the complaint, but does not check or limit the `status` value being set by the tenant in the request payload.
* **Backend File**: [complaints.py](file:///e:/bagiraty%20pg/apps/backend/app/api/complaints.py#L372-L409)
* **Line Number**: `L372-409`
* **API**: `POST /api/v1/complaints/{id}/status`

# Admin Portal Functional Audit Report

This document outlines the functional and data integrity audit results for the Bhagirathi Hostel & PG Management System Admin Portal.

---

### Issue 1: Wrong Data Mapping on Rent Ledger Dashboard / Statistics Cards

- **Feature Name**: Rent Ledger
- **Page**: Rent Ledger
- **URL**: `http://localhost:5173/rent`
- **Steps to Reproduce**:
  1. Login as an Administrator.
  2. Navigate to **Finance > Rent Ledger** in the sidebar.
  3. Notice that the statistics cards at the top show `₹NaN Collected`, `₹NaN Outstanding`, and circular progress metrics show `Eff. Rate: undefined%`.
- **Expected Result**: Rent collection stats, outstanding balances, and circular gauges should load and display actual numbers.
- **Actual Result**: Values render as `₹NaN` and `undefined%`.
- **Root Cause**: Mismatch between the JSON keys returned by the backend `/api/v1/rents/dashboard` API endpoint and the keys expected by the frontend. The backend `get_rent_dashboard` endpoint in [rents.py](file:///e:/bagiraty%20pg/apps/backend/app/api/rents.py#L122-L130) returns snake_case keys like `total_collected`, `total_pending_amount`, and `collection_rate`. However, the frontend components [StatisticsCards.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/rent/components/StatisticsCards.tsx#L6-L10) and [RentDashboardCards.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/rent/components/RentDashboardCards.tsx#L12-L16) expect camelCase keys such as `collectedRent`, `pendingRent`, and `collectionPercentage`.
- **File Name**:
  - [StatisticsCards.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/rent/components/StatisticsCards.tsx)
  - [RentDashboardCards.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/rent/components/RentDashboardCards.tsx)
- **Line Number**:
  - [StatisticsCards.tsx:L6-10](file:///e:/bagiraty%20pg/apps/admin/src/features/rent/components/StatisticsCards.tsx#L6-L10)
  - [RentDashboardCards.tsx:L12-16](file:///e:/bagiraty%20pg/apps/admin/src/features/rent/components/RentDashboardCards.tsx#L12-L16)
- **Severity**: High

---

### Issue 2: Wrong Data Mapping in Rent Collection Summary KPI Widgets

- **Feature Name**: Rent Collection
- **Page**: Rent Collection Dashboard
- **URL**: `http://localhost:5173/rent-collection`
- **Steps to Reproduce**:
  1. Login as an Administrator.
  2. Navigate to **Finance > Rent Collection** in the sidebar.
  3. Observe the summary dashboard widgets at the top.
  4. Notice that under the "Total Pending" widget, it reads `undefined active tenants`, and other metrics such as "Today Due" are empty/null.
- **Expected Result**: The active tenant count and KPI counts should show actual numbers.
- **Actual Result**: Renders `undefined active tenants` and empty KPIs.
- **Root Cause**: Mismatch between the keys returned by the backend `/api/v1/rent-collection/summary` endpoint and the keys expected by the frontend's `RentCollectionSummary` hook interface. The backend summary endpoint in [rent_collection.py](file:///e:/bagiraty%20pg/apps/backend/app/api/rent_collection.py#L205-L215) returns keys like `total_tenants`, `paid`, `pending`, `overdue`, etc. The frontend's [RentCollectionPage.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/rent_collection/pages/RentCollectionPage.tsx#L606) expects fields like `today_due_count`, `tomorrow_due_count`, `total_active_tenants`, etc., causing them to resolve to `undefined`.
- **File Name**:
  - [RentCollectionPage.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/rent_collection/pages/RentCollectionPage.tsx)
  - [useRentCollection.ts](file:///e:/bagiraty%20pg/apps/admin/src/features/rent_collection/hooks/useRentCollection.ts)
- **Line Number**:
  - [RentCollectionPage.tsx:L606](file:///e:/bagiraty%20pg/apps/admin/src/features/rent_collection/pages/RentCollectionPage.tsx#L606)
  - [useRentCollection.ts:L45-59](file:///e:/bagiraty%20pg/apps/admin/src/features/rent_collection/hooks/useRentCollection.ts#L45-L59)
- **Severity**: Medium

---

### Issue 3: Backend AttributeError Exception on Reports Dashboard API

- **Feature Name**: Reports & Analytics
- **Page**: Dashboard Reports
- **URL**: `http://localhost:5173/reports/dashboard`
- **Steps to Reproduce**:
  1. Login as an Administrator.
  2. Navigate to **Reports & Analytics > Reports** in the sidebar.
  3. Notice that the Reports page hangs, displays a spinner, or renders an error/crash block ("Failed to load dashboard").
- **Expected Result**: Reports page loads the analytical cards and payment trends successfully.
- **Actual Result**: Endpoint crashes with a 500 error, resulting in a failed page load.
- **Root Cause**: In [analytics_service.py](file:///e:/bagiraty%20pg/apps/backend/app/services/analytics_service.py#L118), the backend tries to query rejected payments by comparing `Payment.payment_status == PaymentStatus.FAILED`. However, the `PaymentStatus` enum defined in [enums.py](file:///e:/bagiraty%20pg/apps/backend/app/models/enums.py#L64-L72) has no member named `FAILED` (it is defined as `REJECTED`). This triggers an `AttributeError` which crashes the `/api/v1/reports/dashboard` API call.
- **File Name**: [analytics_service.py](file:///e:/bagiraty%20pg/apps/backend/app/services/analytics_service.py)
- **Line Number**: [analytics_service.py:L118](file:///e:/bagiraty%20pg/apps/backend/app/services/analytics_service.py#L118)
- **Severity**: High

---

### Issue 4: Backend PostgreSQL Enum Type Casting Error on Security High-Risk API

- **Feature Name**: Security & Fraud Protection
- **Page**: High Risk Queue
- **URL**: `http://localhost:5173/security/high-risk`
- **Steps to Reproduce**:
  1. Login as an Administrator.
  2. Navigate to **Security > High Risk Queue** in the sidebar.
  3. Notice that the page fails to load, showing a blank screen, spinner, or error screen.
- **Expected Result**: High Risk Queue page loads all payments marked as High or Critical risk.
- **Actual Result**: API crashes with a 500 server error, causing page load failure.
- **Root Cause**: The backend security endpoint `GET /api/v1/security/high-risk` in [security.py](file:///e:/bagiraty%20pg/apps/backend/app/api/security.py#L98) defaults to/uses title-case string values `["High", "Critical"]` for filtering. However, the database schema column `Payment.risk_level` uses the PostgreSQL enum `risklevel` which defines uppercase strings (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`). This causes PostgreSQL to throw an `asyncpg.exceptions.InvalidTextRepresentationError` when SQLAlchemy tries to execute the query, resulting in a 500 server error.
- **File Name**:
  - [security.py](file:///e:/bagiraty%20pg/apps/backend/app/api/security.py)
  - [security_repository.py](file:///e:/bagiraty%20pg/apps/backend/app/repositories/security_repository.py)
- **Line Number**:
  - [security.py:L98](file:///e:/bagiraty%20pg/apps/backend/app/api/security.py#L98)
  - [security_repository.py:L131](file:///e:/bagiraty%20pg/apps/backend/app/repositories/security_repository.py#L131), [security_repository.py:L135](file:///e:/bagiraty%20pg/apps/backend/app/repositories/security_repository.py#L135)
- **Severity**: High

---

### Issue 5: Visual Layout Collapsing of Complaints Search Box

- **Feature Name**: Complaints Desk
- **Page**: Complaints Desk
- **URL**: `http://localhost:5173/complaints`
- **Steps to Reproduce**:
  1. Login as an Administrator.
  2. Navigate to **Operations > Complaints** in the sidebar.
  3. Look at the search bar at the top of the complaints list.
  4. Notice that at certain screen resolutions, the Search Bar collapses or completely disappears from the screen.
- **Expected Result**: Search bar should be cleanly visible on all screen sizes next to the filters.
- **Actual Result**: Search bar collapses and disappears.
- **Root Cause**: In [ComplaintManagementPage.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/complaint/pages/ComplaintManagementPage.tsx), the search bar and the `FilterPanel` component are placed side-by-side in a `flex justify-between` row at large viewports. However, [FilterPanel.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/complaint/components/FilterPanel.tsx) contains its own nested card container with its own borders, padding (`p-4.5`), and background. Because the search bar does not have a `flex-shrink-0` style and the nested `FilterPanel` card is very wide, the flexbox layout squishes the Search Bar to a width of 0px, causing it to disappear.
- **File Name**:
  - [ComplaintManagementPage.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/complaint/pages/ComplaintManagementPage.tsx)
  - [FilterPanel.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/complaint/components/FilterPanel.tsx)
- **Line Number**:
  - [ComplaintManagementPage.tsx:L178-186](file:///e:/bagiraty%20pg/apps/admin/src/features/complaint/pages/ComplaintManagementPage.tsx#L178-L186)
  - [FilterPanel.tsx:L56](file:///e:/bagiraty%20pg/apps/admin/src/features/complaint/components/FilterPanel.tsx#L56)
- **Severity**: Medium

---

### Issue 6: Wrong Data Mapping on Notice Board Description Fields

- **Feature Name**: Notice Board
- **Page**: Notice Board / Notice Review Drawer
- **URL**: `http://localhost:5173/notices`
- **Steps to Reproduce**:
  1. Login as an Administrator.
  2. Navigate to **Operations > Notices** in the sidebar.
  3. Look at the notice board card listing and the Notice Details slide drawer.
  4. Notice that descriptions/bodies are completely blank.
- **Expected Result**: Notices should display their content bodies in the card grid and review drawer.
- **Actual Result**: Descriptions render as blank text boxes.
- **Root Cause**: Mismatch between the database notice model property name (`content`) and the frontend's expected prop (`description`). The notice database model in [notice.py](file:///e:/bagiraty%20pg/apps/backend/app/models/notice.py#L8) and backend API serialization in [notices.py](file:///e:/bagiraty%20pg/apps/backend/app/api/notices.py#L43) define the announcement body as `content`. However, frontend components [NoticeCard.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/notice/components/NoticeCard.tsx#L47) and [NoticeDetailsDrawer.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/notice/components/NoticeDetailsDrawer.tsx#L110) look for `n.description`.
- **File Name**:
  - [NoticeCard.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/notice/components/NoticeCard.tsx)
  - [NoticeDetailsDrawer.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/notice/components/NoticeDetailsDrawer.tsx)
- **Line Number**:
  - [NoticeCard.tsx:L47](file:///e:/bagiraty%20pg/apps/admin/src/features/notice/components/NoticeCard.tsx#L47)
  - [NoticeDetailsDrawer.tsx:L110](file:///e:/bagiraty%20pg/apps/admin/src/features/notice/components/NoticeDetailsDrawer.tsx#L110)
- **Severity**: High

---

### Issue 7: Wrong Notice Board Draft Creation Payload Mapping

- **Feature Name**: Notice Board
- **Page**: Notice Board / Draft Notice Modal
- **URL**: `http://localhost:5173/notices`
- **Steps to Reproduce**:
  1. Login as an Administrator.
  2. Navigate to **Operations > Notices**.
  3. Click **Draft Notice** in the header.
  4. Fill in the title, announcement body, targets, and click **Save Notice**.
  5. Check the newly created notice in the listing or the database; its announcement body is empty.
- **Expected Result**: Notice should save with the body text entered in the form.
- **Actual Result**: Notice is saved with an empty content body (`content = ""`).
- **Root Cause**: The frontend [NoticeForm.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/notice/components/NoticeForm.tsx#L104) sends a payload with `description: data.description` when saving a notice. However, the backend creation route `create_notice` in [notices.py](file:///e:/bagiraty%20pg/apps/backend/app/api/notices.py#L174) extracts `content=payload.get("content", "")`. Because the payload contains `description` instead of `content`, the backend sets `content` to `""`.
- **File Name**:
  - [NoticeForm.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/notice/components/NoticeForm.tsx)
  - [notices.py](file:///e:/bagiraty%20pg/apps/backend/app/api/notices.py)
- **Line Number**:
  - [NoticeForm.tsx:L104](file:///e:/bagiraty%20pg/apps/admin/src/features/notice/components/NoticeForm.tsx#L104)
  - [notices.py:L174](file:///e:/bagiraty%20pg/apps/backend/app/api/notices.py#L174)
- **Severity**: High

---

### Issue 8: Incorrect Redirection on Dashboard "Add Hostel" Quick Action

- **Feature Name**: Dashboard / Quick Actions
- **Page**: Dashboard
- **URL**: `http://localhost:5173/dashboard`
- **Steps to Reproduce**:
  1. Login as an Administrator.
  2. Navigate to the main Dashboard page.
  3. Click the **Add Hostel** quick action card.
  4. Notice you are redirected to the Room Management Page at `/rooms` without opening the hostel form.
- **Expected Result**: Clicking "Add Hostel" should navigate to the rooms directory and automatically trigger/open the "Add Hostel" modal form.
- **Actual Result**: Navigates to `/rooms` but stays on the listing view.
- **Root Cause**: The quick actions list in [QuickActions.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/dashboard/components/QuickActions.tsx#L16) maps `path: "/rooms"` for the "Add Hostel", "Add Building", "Add Room", and "Add Bed" shortcuts. Navigating directly to `/rooms` does not pass any query params or trigger the open state of the create dialog, requiring the user to manually click the floating action button at the bottom-right of the page to create properties.
- **File Name**: [QuickActions.tsx](file:///e:/bagiraty%20pg/apps/admin/src/features/dashboard/components/QuickActions.tsx)
- **Line Number**: [QuickActions.tsx:L16](file:///e:/bagiraty%20pg/apps/admin/src/features/dashboard/components/QuickActions.tsx#L16)
- **Severity**: Medium

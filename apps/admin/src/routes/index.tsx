import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { UserRole } from "@bhagirathi/constants";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ErrorBoundary } from "@bhagirathi/ui";

// Import Auth Pages
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ChangePassword from "../pages/auth/ChangePassword";
import Unauthorized from "../pages/auth/Unauthorized";

// Import Dashboard Feature Page
import DashboardPage from "../features/dashboard/pages/DashboardPage";

// Import Hostel Management Feature Page
import HostelManagementPage from "../features/hostel/pages/HostelManagementPage";
import RoomDetailPage from "../features/hostel/pages/RoomDetailPage";
import AvailabilityPage from "../features/hostel/pages/AvailabilityPage";


// Import Tenant Management Feature Page
import TenantManagementPage from "../features/tenant/pages/TenantManagementPage";
import TenantProfilePage from "../features/tenant/pages/TenantProfilePage";
import ArchivedTenantsPage from "../features/tenant/pages/ArchivedTenantsPage";


// Import Rent Management Feature Page
import RentManagementPage from "../features/rent/pages/RentManagementPage";
import BillingDashboardPage from "../features/rent/pages/BillingDashboardPage";

// Import Payment Management Feature Page
import PaymentManagementPage from "../features/payment/pages/PaymentManagementPage";
import { CashVerificationPage } from "../features/payment/pages/CashVerificationPage";
import VerificationQueuePage from "../features/payment/pages/VerificationQueuePage";
import PaymentDetailsPage from "../features/payment/pages/PaymentDetailsPage";
import BankStatementPage from "../features/payment/pages/BankStatementPage";
import StatementPreviewPage from "../features/payment/pages/StatementPreviewPage";
import ReconciliationDashboardPage from "../features/payment/pages/ReconciliationDashboardPage";
import ReconciliationDetailPage from "../features/payment/pages/ReconciliationDetailPage";
import ManualReviewQueuePage from "../features/payment/pages/ManualReviewQueuePage";
import SmartVerificationDashboard from "../features/payment/pages/SmartVerificationDashboard";
import ReceiptHistoryPage from "../features/payment/pages/ReceiptHistoryPage";
import ReceiptDetailPage from "../features/payment/pages/ReceiptDetailPage";

// Import Complaint Management Feature Page
import ComplaintManagementPage from "../features/complaint/pages/ComplaintManagementPage";

// Import Notice Management Feature Page
import NoticeManagementPage from "../features/notice/pages/NoticeManagementPage";
import { NotificationCenterPage } from "../features/notification/pages/NotificationCenterPage";

// Import Reports Feature Page
import ReportsPage from "../features/reports/pages/ReportsPage";

// Import Settings Feature Page
import SettingsPage from "../features/settings/pages/SettingsPage";

// Import Electricity Page
import { ElectricityPage } from "../pages/electricity/ElectricityPage";

// Import Rent Collection Page
import RentCollectionPage from "../features/rent_collection/pages/RentCollectionPage";

// Import new admin pages
import MaintenanceManagementPage from "../features/maintenance/pages/MaintenanceManagementPage";
import UserManagementPage from "../features/user-management/pages/UserManagementPage";
import ForceChangePassword from "../pages/auth/ForceChangePassword";

// Import Security & Fraud Protection Feature Pages (PAYMENT-9)
import SecurityDashboardPage from "../features/security/pages/SecurityDashboardPage";
import HighRiskQueuePage from "../features/security/pages/HighRiskQueuePage";
import PaymentSecurityPage from "../features/security/pages/PaymentSecurityPage";
import SecurityEventTimelinePage from "../features/security/pages/SecurityEventTimelinePage";
import SecurityRulesPage from "../features/security/pages/SecurityRulesPage";
import SuspiciousUsersPage from "../features/security/pages/SuspiciousUsersPage";

interface RouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.force_password_change) return <Navigate to="/force-change-password" replace />;

  return children;
};

export const ForcePasswordRoute: React.FC<RouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.force_password_change) return <Navigate to="/dashboard" replace />;

  return children;
};

interface RoleRouteProps extends RouteProps {
  allowedRoles: UserRole[];
}

/**
 * RoleRoute — Enterprise Auth Guard
 *
 * SECURITY: Never performs cross-portal redirects.
 * If the authenticated user's role doesn't match this portal:
 *   1. Immediately clears auth state (logout)
 *   2. Redirects to THIS portal's /login page only
 *   3. Shows a descriptive message so the user knows what happened
 *
 * This prevents infinite redirect loops between portals.
 */
export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !allowedRoles.includes(user.role || (("" as any) as UserRole))) {
      // Clear stale auth state for this portal immediately
      logout();
      // Redirect to THIS portal's own login — never to another port
      navigate(`/login?error=role_mismatch&role=${user.role}`, { replace: true });
    }
  }, [user, allowedRoles, logout, navigate]);

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role || (("" as any) as UserRole))) return null; // effect handles redirect

  return children;
};

// Simple GuestRoute to prevent logged-in users visiting login
export const GuestRoute: React.FC<RouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};


export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        path="/force-change-password"
        element={
          <ForcePasswordRoute>
            <ForceChangePassword />
          </ForcePasswordRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<ErrorBoundary name="Dashboard"><DashboardPage /></ErrorBoundary>} />
        <Route path="change-password" element={<ErrorBoundary name="Change Password"><ChangePassword /></ErrorBoundary>} />
        <Route path="rooms" element={<ErrorBoundary name="Rooms"><HostelManagementPage /></ErrorBoundary>} />
        <Route path="rooms/availability" element={<ErrorBoundary name="Room Availability"><AvailabilityPage /></ErrorBoundary>} />
        <Route path="rooms/:roomId" element={<ErrorBoundary name="Room Details"><RoomDetailPage /></ErrorBoundary>} />

        <Route path="tenants" element={<ErrorBoundary name="Tenants"><TenantManagementPage /></ErrorBoundary>} />
        <Route path="tenants/archived" element={<ErrorBoundary name="Archived Tenants"><ArchivedTenantsPage /></ErrorBoundary>} />
        <Route path="tenants/:tenantId" element={<ErrorBoundary name="Tenant Profile"><TenantProfilePage /></ErrorBoundary>} />

        <Route path="maintenance" element={<ErrorBoundary name="Maintenance"><MaintenanceManagementPage /></ErrorBoundary>} />
        <Route path="users" element={<ErrorBoundary name="Users"><UserManagementPage /></ErrorBoundary>} />
        <Route path="rent" element={<ErrorBoundary name="Rent"><RentManagementPage /></ErrorBoundary>} />
        <Route path="rent/cash-collection" element={<ErrorBoundary name="Rent Collection"><RentCollectionPage /></ErrorBoundary>} />
        <Route path="billing" element={<ErrorBoundary name="Billing"><BillingDashboardPage /></ErrorBoundary>} />
        <Route path="payments" element={<ErrorBoundary name="Payments"><PaymentManagementPage /></ErrorBoundary>} />
        <Route path="payments/cash-verification" element={<ErrorBoundary name="Cash Verification"><CashVerificationPage /></ErrorBoundary>} />
        <Route path="payments/queue" element={<ErrorBoundary name="Verification Queue"><VerificationQueuePage initialStatus="ALL" /></ErrorBoundary>} />
        <Route path="payments/submitted" element={<ErrorBoundary name="Verification Queue"><VerificationQueuePage initialStatus="Submitted" /></ErrorBoundary>} />
        <Route path="payments/verified" element={<ErrorBoundary name="Verification Queue"><VerificationQueuePage initialStatus="Verified" /></ErrorBoundary>} />
        <Route path="payments/rejected" element={<ErrorBoundary name="Verification Queue"><VerificationQueuePage initialStatus="Rejected" /></ErrorBoundary>} />
        <Route path="payments/bank-statements" element={<ErrorBoundary name="Bank Statements"><BankStatementPage /></ErrorBoundary>} />
        <Route path="payments/bank-statements/:statementId" element={<ErrorBoundary name="Statement Preview"><StatementPreviewPage /></ErrorBoundary>} />
        <Route path="payments/verification" element={<ErrorBoundary name="Smart Verification"><SmartVerificationDashboard /></ErrorBoundary>} />
        <Route path="payments/receipts" element={<ErrorBoundary name="Receipt History"><ReceiptHistoryPage /></ErrorBoundary>} />
        <Route path="payments/receipts/:receiptId" element={<ErrorBoundary name="Receipt Details"><ReceiptDetailPage /></ErrorBoundary>} />
        <Route path="payments/reconciliation" element={<ErrorBoundary name="Reconciliation Dashboard"><ReconciliationDashboardPage /></ErrorBoundary>} />
        <Route path="payments/reconciliation/:paymentId" element={<ErrorBoundary name="Reconciliation Details"><ReconciliationDetailPage /></ErrorBoundary>} />
        <Route path="payments/manual-review" element={<ErrorBoundary name="Manual Review Queue"><ManualReviewQueuePage /></ErrorBoundary>} />
        <Route path="payments/:paymentId" element={<ErrorBoundary name="Payment Details"><PaymentDetailsPage /></ErrorBoundary>} />
        <Route path="electricity" element={<ErrorBoundary name="Electricity"><ElectricityPage /></ErrorBoundary>} />
        <Route path="complaints" element={<ErrorBoundary name="Complaints"><ComplaintManagementPage /></ErrorBoundary>} />
        <Route path="notices" element={<ErrorBoundary name="Notices"><NoticeManagementPage /></ErrorBoundary>} />
        <Route path="notifications" element={<ErrorBoundary name="Notifications"><NotificationCenterPage /></ErrorBoundary>} />
        <Route path="reports" element={<Navigate to="/reports/dashboard" replace />} />
        <Route path="reports/:tab" element={<ErrorBoundary name="Reports"><ReportsPage /></ErrorBoundary>} />
        <Route path="settings" element={<ErrorBoundary name="Settings"><SettingsPage /></ErrorBoundary>} />

        {/* PAYMENT-9: Security & Fraud Protection */}
        <Route path="security" element={<ErrorBoundary name="Security Dashboard"><SecurityDashboardPage /></ErrorBoundary>} />
        <Route path="security/high-risk" element={<ErrorBoundary name="High Risk Queue"><HighRiskQueuePage /></ErrorBoundary>} />
        <Route path="security/payment/:paymentId" element={<ErrorBoundary name="Payment Security"><PaymentSecurityPage /></ErrorBoundary>} />
        <Route path="security/events" element={<ErrorBoundary name="Security Events"><SecurityEventTimelinePage /></ErrorBoundary>} />
        <Route path="security/rules" element={<ErrorBoundary name="Security Rules"><SecurityRulesPage /></ErrorBoundary>} />
        <Route path="security/suspicious-users" element={<ErrorBoundary name="Suspicious Users"><SuspiciousUsersPage /></ErrorBoundary>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

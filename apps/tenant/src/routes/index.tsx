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
import Unauthorized from "../pages/auth/Unauthorized";

// Import Payments Pages
import RentDetailsPage from "../pages/RentDetailsPage";
import PayRentPage from "../pages/PayRentPage";
import PaymentHistoryPage from "../pages/PaymentHistoryPage";
import { ElectricityBillPage } from "../pages/ElectricityBillPage";
import { PayElectricityPage } from "../pages/PayElectricityPage";

// Import Complaints Pages
import TenantComplaintsPage from "../pages/TenantComplaintsPage";

// Import Notices Pages
import TenantNoticesPage from "../pages/TenantNoticesPage";

// Import New Pages
import DashboardPage from "../pages/DashboardPage";
import MyRoomPage from "../pages/MyRoomPage";
import ProfilePage from "../pages/ProfilePage";
import MyContractPage from "../pages/MyContractPage";
import DocumentsPage from "../pages/DocumentsPage";
import SupportPage from "../pages/SupportPage";
import SettingsPage from "../pages/SettingsPage";
import { NotificationCenterPage } from "../features/notification/pages/NotificationCenterPage";

import ForceChangePassword from "../pages/auth/ForceChangePassword";

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
            <RoleRoute allowedRoles={[UserRole.TENANT]}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<ErrorBoundary name="Dashboard"><DashboardPage /></ErrorBoundary>} />
        <Route path="my-room" element={<ErrorBoundary name="My Room"><MyRoomPage /></ErrorBoundary>} />
        <Route path="my-contract" element={<ErrorBoundary name="My Contract"><MyContractPage /></ErrorBoundary>} />
        <Route path="rent-details" element={<ErrorBoundary name="Rent Details"><RentDetailsPage /></ErrorBoundary>} />
        <Route path="pay-rent" element={<ErrorBoundary name="Pay Rent"><PayRentPage /></ErrorBoundary>} />
        <Route path="payment-history" element={<ErrorBoundary name="Payment History"><PaymentHistoryPage /></ErrorBoundary>} />
        <Route path="electricity" element={<ErrorBoundary name="Electricity Bill"><ElectricityBillPage /></ErrorBoundary>} />
        <Route path="pay-electricity/:id" element={<ErrorBoundary name="Pay Electricity"><PayElectricityPage /></ErrorBoundary>} />
        <Route path="complaints" element={<ErrorBoundary name="Complaints"><TenantComplaintsPage /></ErrorBoundary>} />
        <Route path="notices" element={<ErrorBoundary name="Notices"><TenantNoticesPage /></ErrorBoundary>} />
        <Route path="documents" element={<ErrorBoundary name="Documents"><DocumentsPage /></ErrorBoundary>} />
        <Route path="notifications" element={<ErrorBoundary name="Notifications"><NotificationCenterPage /></ErrorBoundary>} />
        <Route path="profile" element={<ErrorBoundary name="Profile"><ProfilePage /></ErrorBoundary>} />
        <Route path="support" element={<ErrorBoundary name="Support"><SupportPage /></ErrorBoundary>} />
        <Route path="settings" element={<ErrorBoundary name="Settings"><SettingsPage /></ErrorBoundary>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

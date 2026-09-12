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

// Import Application Pages
import DashboardPage from "../pages/DashboardPage";
import MaintenanceComplaintsPage from "../pages/MaintenanceComplaintsPage";
import BillReadingPage from "../pages/BillReadingPage";
import ProfilePage from "../pages/ProfilePage";
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
            <RoleRoute allowedRoles={[UserRole.MAINTENANCE]}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<ErrorBoundary name="Dashboard"><DashboardPage /></ErrorBoundary>} />
        <Route path="change-password" element={<ErrorBoundary name="Change Password"><ChangePassword /></ErrorBoundary>} />
        <Route path="complaints" element={<ErrorBoundary name="Complaints"><MaintenanceComplaintsPage /></ErrorBoundary>} />
        <Route path="tasks" element={<Navigate to="/complaints" replace />} />
        <Route path="bills" element={<ErrorBoundary name="Bill Reading"><BillReadingPage /></ErrorBoundary>} />
        <Route path="notifications" element={<ErrorBoundary name="Notifications"><NotificationCenterPage /></ErrorBoundary>} />
        <Route path="profile" element={<ErrorBoundary name="Profile"><ProfilePage /></ErrorBoundary>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

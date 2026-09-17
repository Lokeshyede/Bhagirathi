import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useThemeStore } from "../store/theme";
import {
  Sun, Moon, Building2, Users, Receipt, MessageSquare, Megaphone,
  BarChart3, CreditCard, FileBarChart2, Settings, Zap, IndianRupee, Wrench, Shield, Brain, Clock, ShieldAlert, FileText, AlertTriangle, Sparkles, Archive
} from "lucide-react";
import { NotificationBell } from "../features/notification/components/NotificationBell";
import { NotificationDrawer } from "../features/notification/components/NotificationDrawer";
import { usePushNotification } from "../features/notification/hooks/usePushNotification";
import {
  PageContainer,
  PageContent,
  Header,
  Sidebar,
  Footer,
  Breadcrumb,
  SearchTrigger,
  CommandPalette,
  ProfileDropdown,
  useLayout,
} from "@bhagirathi/ui";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: BarChart3 },
    ]
  },
  {
    label: "Property",
    items: [
      { name: "PG & Rooms", path: "/rooms", icon: Building2 },
      { name: "Room Availability", path: "/rooms/availability", icon: Building2 },
      { name: "Tenants", path: "/tenants", icon: Users },
      { name: "Archived Tenants", path: "/tenants/archived", icon: Archive },
    ]
  },
  {
    label: "Management",
    items: [
      { name: "Maintenance Staff", path: "/maintenance", icon: Wrench },
      { name: "User Accounts", path: "/users", icon: Shield },
    ]
  },
  {
    label: "Finance",
    items: [
      { name: "Rent Ledger", path: "/rent", icon: Receipt },
      { name: "Rent Collection", path: "/rent/cash-collection", icon: IndianRupee },
      { name: "Billing Engine", path: "/billing", icon: Sparkles },
      { name: "Electricity", path: "/electricity", icon: Zap },
    ]
  },
  {
    label: "Payments",
    collapsible: true,
    items: [
      { name: "Smart Verification", path: "/payments/verification", icon: Zap },
      { name: "Verification Queue", path: "/payments/queue", icon: CreditCard },
      { name: "Submitted Payments", path: "/payments/submitted", icon: CreditCard },
      { name: "Verified Payments", path: "/payments/verified", icon: CreditCard },
      { name: "Rejected Payments", path: "/payments/rejected", icon: CreditCard },
      { name: "Bank Statements", path: "/payments/bank-statements", icon: FileBarChart2 },
      { name: "Receipt History", path: "/payments/receipts", icon: Receipt },
      { name: "AI Reconciliation", path: "/payments/reconciliation", icon: Brain },
      { name: "Manual Review Queue", path: "/payments/manual-review", icon: Clock },
    ]
  },
  {
    label: "Reports & Analytics",
    collapsible: true,
    items: [
      { name: "Dashboard Reports", path: "/reports/dashboard", icon: BarChart3 },
      { name: "Payment Reports", path: "/reports/payments", icon: CreditCard },
      { name: "Revenue Reports", path: "/reports/rents", icon: Receipt },
      { name: "Electricity Reports", path: "/reports/electricity", icon: Zap },
      { name: "Occupancy Reports", path: "/reports/occupancy", icon: Building2 },
      { name: "Tenant Reports", path: "/reports/tenants", icon: Users },
      { name: "Contract Reports", path: "/reports/contracts", icon: FileText },
      { name: "Audit Reports", path: "/reports/audit", icon: ShieldAlert },
    ]
  },
  {
    label: "Operations",
    items: [
      { name: "Complaints", path: "/complaints", icon: MessageSquare },
      { name: "Noticeboard", path: "/notices", icon: Megaphone },
    ]
  },
  {
    label: "Security",
    collapsible: true,
    items: [
      { name: "Security Dashboard", path: "/security", icon: ShieldAlert },
      { name: "High Risk Queue", path: "/security/high-risk", icon: AlertTriangle },
      { name: "Security Events", path: "/security/events", icon: Zap },
      { name: "Security Rules", path: "/security/rules", icon: Settings },
      { name: "Suspicious Users", path: "/security/suspicious-users", icon: Users },
    ]
  },
  {
    label: "System",
    items: [
      { name: "Settings", path: "/settings", icon: Settings },
    ]
  },
];

const allNavItems = navGroups.flatMap(g => g.items);

function getBreadcrumb(pathname: string): string {
  const found = allNavItems.find(n => pathname.startsWith(n.path));
  return found?.name ?? "Dashboard";
}

export const DashboardLayout: React.FC = () => {
  const {
    isSidebarCollapsed,
    isMobileDrawerOpen,
    isSearchOpen,
    toggleSidebar,
    toggleMobileDrawer,
    openSearch,
    closeSearch,
  } = useLayout();

  usePushNotification({ autoSubscribe: true });
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentPage = getBreadcrumb(location.pathname);

  // Command palette search actions/routes
  const searchOptions = [
    { id: "nav-dash", label: "Dashboard Overview", description: "Go to dashboard analytics", category: "action" as const, onClick: () => navigate("/dashboard") },
    { id: "nav-rooms", label: "Rooms & PG Spaces", description: "Manage rooms, buildings, and floors", category: "room" as const, onClick: () => navigate("/rooms") },
    { id: "nav-tenants", label: "Tenant Roster", description: "View and manage hostel tenants", category: "tenant" as const, onClick: () => navigate("/tenants") },
    { id: "nav-rent", label: "Rent Ledger", description: "Track rental invoices and due amounts", category: "payment" as const, onClick: () => navigate("/rent") },
    { id: "nav-rent-collection", label: "Rent Collection", description: "View which tenants have rent due today", category: "payment" as const, onClick: () => navigate("/rent/cash-collection") },
    { id: "nav-payments-queue", label: "Verification Queue", description: "Verify pending tenant transactions", category: "payment" as const, onClick: () => navigate("/payments/queue") },
    { id: "nav-payments-submitted", label: "Submitted Payments", description: "View submitted tenant payments", category: "payment" as const, onClick: () => navigate("/payments/submitted") },
    { id: "nav-payments-verified", label: "Verified Payments", description: "View verified payments registry", category: "payment" as const, onClick: () => navigate("/payments/verified") },
    { id: "nav-payments-rejected", label: "Rejected Payments", description: "View rejected payments list", category: "payment" as const, onClick: () => navigate("/payments/rejected") },
    { id: "nav-bank-statements", label: "Bank Statements", description: "Upload and import bank statement files", category: "payment" as const, onClick: () => navigate("/payments/bank-statements") },
    { id: "nav-reconciliation", label: "AI Reconciliation", description: "Run AI-powered payment matching and confidence scoring", category: "payment" as const, onClick: () => navigate("/payments/reconciliation") },
    { id: "nav-manual-review", label: "Manual Review Queue", description: "Payments with low AI confidence requiring human review", category: "payment" as const, onClick: () => navigate("/payments/manual-review") },

    { id: "nav-complaints", label: "Complaints & Maintenance", description: "View active complaints and tickets", category: "complaint" as const, onClick: () => navigate("/complaints") },
    { id: "nav-notices", label: "Noticeboard Alerts", description: "Publish announcements and rules", category: "notice" as const, onClick: () => navigate("/notices") },
    { id: "nav-reports", label: "Financial Reports", description: "View analytics reports and statistics", category: "action" as const, onClick: () => navigate("/reports") },
    { id: "nav-settings", label: "Portal Settings", description: "Configure business and portal options", category: "action" as const, onClick: () => navigate("/settings") },
    
    // Explicit global search shortcuts
    { id: "search-hostel", label: "Global Search: Hostels", description: "Find and filter hostel campuses", category: "room" as const, onClick: () => navigate("/rooms") },
    { id: "search-room", label: "Global Search: Rooms", description: "Search room capacities, rents, and split bills", category: "room" as const, onClick: () => navigate("/rooms") },
    { id: "search-tenant", label: "Global Search: Tenants", description: "Search tenant profiles, ID proof status, and dues", category: "tenant" as const, onClick: () => navigate("/tenants") },
    { id: "search-contract", label: "Global Search: Contracts", description: "Search active contracts and rent agreements", category: "payment" as const, onClick: () => navigate("/rent") },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-gray-950">
      {/* Mobile Drawer Notification & Shell Overlays */}
      <NotificationDrawer />
      
      <Sidebar
        brandName="Bhagirathi"
        portalName="Admin Portal"
        brandIcon={Building2}
        groups={navGroups}
        activePath={location.pathname}
        user={user ? { name: user.full_name, email: user.email, role: user.role } : null}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileDrawerOpen}
        onMobileClose={toggleMobileDrawer}
        LinkComponent={Link}
        themeToggle={
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-button text-text-secondary hover:bg-background dark:text-gray-400 dark:hover:bg-gray-800 transition outline-none cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            ) : (
              <Moon className="h-4.5 w-4.5" />
            )}
          </button>
        }
      />

      <PageContainer>
        <Header
          onMenuToggle={toggleMobileDrawer}
          isMenuOpen={isMobileDrawerOpen}
          breadcrumb={
            <Breadcrumb
              items={[{ label: "Bhagirathi" }, { label: currentPage }]}
              onItemClick={(item) => {
                if (item.label === "Home") navigate("/");
              }}
            />
          }
          searchTrigger={<SearchTrigger onClick={openSearch} />}
          themeToggle={
            <button
              onClick={toggleTheme}
              className="p-2 rounded-button text-text-secondary hover:bg-background dark:text-gray-400 dark:hover:bg-gray-800 transition outline-none cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4.5 w-4.5" />
              )}
            </button>
          }
          notificationDropdown={<NotificationBell />}
          profileDropdown={
            <ProfileDropdown
              user={user ? { name: user.full_name, email: user.email, role: user.role } : null}
              onLogout={handleLogout}
              onSettingsClick={() => navigate("/settings")}
            />
          }
        />

        <PageContent>
          <Outlet />
        </PageContent>

        <Footer />
      </PageContainer>

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={closeSearch}
        options={searchOptions}
      />
    </div>
  );
};

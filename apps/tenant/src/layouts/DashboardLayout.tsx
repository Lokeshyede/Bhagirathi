import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useThemeStore } from "../store/theme";
import {
  Sun,
  Moon,
  Home,
  Receipt,
  MessageSquare,
  Megaphone,
  User,
  LogOut,
  FileText,
  LifeBuoy,
  FileCheck,
  Menu,
  X,
  Settings,
  Zap,
  ChevronRight
} from "lucide-react";
import { NotificationBell } from "../features/notification/components/NotificationBell";
import { NotificationDrawer } from "../features/notification/components/NotificationDrawer";
import { motion, AnimatePresence } from "framer-motion";

export const DashboardLayout: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pathname = location.pathname;

  // The complete list of Sidebar items
  const sidebarItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "My Room", path: "/my-room", icon: Home },
    { name: "My Contract", path: "/my-contract", icon: FileCheck },
    { name: "Pay Rent", path: "/pay-rent", icon: Receipt },
    { name: "Rent Details", path: "/rent-details", icon: FileText },
    { name: "Complaints", path: "/complaints", icon: MessageSquare },
    { name: "Notices", path: "/notices", icon: Megaphone },
    { name: "Documents", path: "/documents", icon: FileText },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Support", path: "/support", icon: LifeBuoy },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  // Mobile Bottom Navigation Maps 5 key items
  const bottomNavItems = [
    { name: "Home", path: "/dashboard", icon: Home },
    { name: "Pay Rent", path: "/pay-rent", icon: Receipt },
    { name: "Complaints", path: "/complaints", icon: MessageSquare },
    { name: "Notices", path: "/notices", icon: Megaphone },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const initials = (user?.full_name || "Tenant").charAt(0).toUpperCase();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0a0a0a] font-sans text-stone-900 dark:text-stone-100 antialiased">
      {/* Notifications Drawer Component */}
      <NotificationDrawer />

      {/* ── 1. Left Sidebar for Desktop ─────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 z-30 sidebar-glass border-r border-white/5">
        {/* Logo / Brand area */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-white/5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-black text-sm text-white shrink-0 shadow-lg shadow-red-900/40">
            {initials}
          </div>
          <div className="min-w-0">
            <span className="block text-[9px] font-black text-red-400 uppercase tracking-widest leading-none truncate">
              Bhagirathi PG
            </span>
            <span className="block text-xs font-black text-white mt-1 leading-none truncate">
              Resident Portal
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? "sidebar-active-item text-white"
                    : "text-stone-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-white/60"
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}
                <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-stone-500 group-hover:text-white"}`} />
                <span className="truncate flex-1">{item.name}</span>
                {isActive && <ChevronRight className="h-3 w-3 text-white/50 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Controls */}
        <div className="p-3 border-t border-white/5 space-y-1">
          {/* Theme toggle row */}
          <div className="flex items-center justify-between px-3.5 py-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              {isDarkMode ? "Dark Mode" : "Light Mode"}
            </span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 transition-colors cursor-pointer outline-none"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-stone-400" />
              )}
            </button>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-stone-500 hover:bg-red-600/10 hover:text-red-400 transition-all duration-200 cursor-pointer outline-none border border-transparent hover:border-red-600/20 group"
          >
            <LogOut className="h-4 w-4 text-stone-600 group-hover:text-red-400 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── 2. Main Layout ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Sticky Top Header */}
        <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 px-4 sm:px-6 select-none">
          {/* Left: Hamburger + Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer outline-none transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>

            {/* Mobile brand */}
            <div className="md:hidden flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-black text-xs text-white shadow-md shadow-red-900/20">
                {initials}
              </div>
              <span className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider truncate max-w-[110px]">
                {(user?.full_name || "Tenant").split(" ")[0]}
              </span>
            </div>

            {/* Desktop label */}
            <div className="hidden md:flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-red-500" />
              <span className="text-[11px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                Welcome back,{" "}
                <span className="text-stone-700 dark:text-stone-200">{(user?.full_name || "Tenant").split(" ")[0]}</span>
              </span>
            </div>
          </div>

          {/* Right: Notification + Theme + Logout */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <NotificationBell />
            </div>

            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer outline-none"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-stone-600" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-stone-500 hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors cursor-pointer outline-none"
                title="Log Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 top-14 z-20 bg-black/60 backdrop-blur-sm md:hidden"
              />
              {/* Drawer Panel */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="fixed inset-y-0 left-0 top-14 w-4/5 max-w-sm z-30 flex md:hidden sidebar-glass flex-col p-4 space-y-1 shadow-2xl border-r border-white/5 select-none"
              >
                <div className="flex items-center justify-between px-3 pb-3 border-b border-white/8 mb-2">
                  <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Navigation</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded text-stone-500 hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto space-y-0.5 pr-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "sidebar-active-item text-white"
                            : "text-stone-500 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-28 md:pb-8 max-w-5xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* ── 4. Premium Bottom Navigation (Mobile only) ────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/5 select-none shadow-2xl"
        style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-lg mx-auto flex h-16 items-center justify-around px-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center w-16 h-full text-center transition-colors cursor-pointer"
              >
                {/* Active pill indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute top-0 h-0.5 w-6 rounded-full bg-gradient-to-r from-red-500 to-red-700"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon with scale animation */}
                <motion.div
                  animate={{ scale: isActive ? 1.18 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                      : "text-stone-400 dark:text-stone-500"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </motion.div>

                {/* Label */}
                <span
                  className={`text-[9px] font-black uppercase tracking-wider mt-0.5 transition-colors ${
                    isActive ? "text-red-600 dark:text-red-400" : "text-stone-400 dark:text-stone-500"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;

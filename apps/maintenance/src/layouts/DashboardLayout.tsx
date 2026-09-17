import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useThemeStore } from "../store/theme";
import {
  Sun,
  Moon,
  Home,
  Wrench,
  Activity,
  History,
  User,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { NotificationBell } from "../features/notification/components/NotificationBell";
import { NotificationDrawer } from "../features/notification/components/NotificationDrawer";
import { usePushNotification } from "../features/notification/hooks/usePushNotification";
import { motion, AnimatePresence } from "framer-motion";
import { BhagirathiLogo } from "@bhagirathi/ui";

export const DashboardLayout: React.FC = () => {
  usePushNotification({ autoSubscribe: true });
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

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Tasks", path: "/tasks", icon: Wrench },
    { name: "Bill Reading", path: "/bills", icon: Activity },
    { name: "History", path: "/complaints", icon: History },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-zinc-950 font-sans text-stone-900 dark:text-stone-100 antialiased">
      {/* Notifications Drawer Component */}
      <NotificationDrawer />

      {/* 1. Left Sidebar for Desktop (md and above) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 select-none shadow-sm z-30">
        <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <BhagirathiLogo size="md" className="h-9 w-9 shrink-0" />
          <div className="min-w-0">
            <span className="block text-[9px] font-black text-red-600 dark:text-red-500 uppercase tracking-widest leading-none truncate">Bhagirathi Staff</span>
            <span className="block text-xs font-black text-stone-800 dark:text-white mt-1 leading-none truncate">Maintenance Portal</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-red-600 text-white shadow-md shadow-red-600/10"
                    : "text-stone-500 dark:text-stone-400 hover:bg-red-50/50 dark:hover:bg-zinc-800/50 hover:text-red-600 dark:hover:text-red-400"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePillStaff"
                    className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-white"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-white" : "text-stone-400"}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-xs font-black text-stone-700 dark:text-stone-300 shrink-0">
                {user?.full_name?.charAt(0) || "M"}
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-black text-stone-800 dark:text-white truncate">{user?.full_name || "Staff Officer"}</span>
                <span className="block text-[10px] font-bold text-stone-400 capitalize truncate">{user?.role?.toLowerCase() || "Maintenance"}</span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors cursor-pointer outline-none"
              title="Logout"
            >
              <LogOut className="h-[18px] w-[18px] text-stone-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Body Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-zinc-950">
        
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 sm:px-6 select-none shadow-sm">
          {/* Left Side:
              Mobile: Bhagirathi multicolor circular logo (clean & compact, approx 32px, NO text beside it)
              Desktop: Header label */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Circular Logo */}
            <div className="md:hidden flex items-center shrink-0">
              <BhagirathiLogo size="sm" className="h-8 w-8 shrink-0" />
            </div>
            
            {/* Desktop header label */}
            <span className="hidden md:inline text-[11px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest select-none truncate max-w-sm">
              Workforce Portal <span className="text-stone-400 font-bold mx-1">·</span> Officer <span className="text-stone-700 dark:text-stone-300">{user?.full_name}</span>
            </span>
          </div>

          {/* Right Side:
              Mobile: [Bell] [☰ Hamburger]
              Desktop: Desktop Logo, Notification Bell */}
          <div className="flex items-center gap-2.5">
            {/* Desktop header logo */}
            <div className="hidden md:flex items-center mr-1">
              <BhagirathiLogo size="sm" className="h-8 w-8" />
            </div>

            {/* Notifications Trigger */}
            <div className="relative">
              <NotificationBell />
            </div>

            {/* Mobile Hamburger / Sidebar button (Far Right) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-stone-600 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer outline-none transition-colors shrink-0"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile menu overlay/panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 top-16 z-20 bg-stone-900/60 backdrop-blur-sm md:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="fixed inset-y-0 left-0 top-16 w-4/5 max-w-sm z-30 flex md:hidden bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex-col p-5 shadow-xl select-none"
              >
                {/* Brand header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <BhagirathiLogo size="xs" className="h-6 w-6 ring-1 ring-slate-200 dark:ring-zinc-700 shrink-0" />
                    <span className="text-xs font-black uppercase text-stone-800 dark:text-white tracking-wider">Bhagirathi Staff</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded text-stone-400 hover:text-stone-600 cursor-pointer"
                    aria-label="Close navigation menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 overflow-y-auto space-y-1 pr-1 py-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-red-600 text-white shadow-md shadow-red-600/10"
                            : "text-stone-500 dark:text-stone-400 hover:bg-red-50/50 dark:hover:bg-zinc-800/50 hover:text-red-600 dark:hover:text-red-405"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Utility Section: Dark Mode + Logout (Moved into sidebar) */}
                <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2 mt-auto shrink-0">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                      {isDarkMode ? "Dark Mode" : "Light Mode"}
                    </span>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer outline-none"
                      aria-label="Toggle theme"
                    >
                      {isDarkMode ? (
                        <Sun className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Moon className="h-4 w-4 text-stone-400" />
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-stone-600 hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all duration-200 cursor-pointer outline-none"
                  >
                    <LogOut className="h-4 w-4 text-stone-400 group-hover:text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 3. Main Page Content Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-28 md:pb-8 max-w-4xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* 4. Modern Bottom Navigation Bar (Visible only on mobile/tablet) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md select-none shadow-lg" style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}>
        <div className="max-w-lg mx-auto flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center w-16 h-full text-center transition-colors cursor-pointer"
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicatorStaff"
                    className="absolute top-0 h-1 w-8 rounded-full bg-red-605"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Animated Icon Wrapper */}
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`${
                    isActive ? "text-red-600" : "text-stone-400 hover:text-stone-605 dark:text-stone-500"
                  }`}
                >
                  <Icon className="h-5.5 w-5.5" />
                </motion.div>

                {/* Tab Label */}
                <span
                  className={`text-[9px] font-black uppercase tracking-wider mt-1.5 transition-colors ${
                    isActive ? "text-red-600" : "text-stone-400 dark:text-stone-550"
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

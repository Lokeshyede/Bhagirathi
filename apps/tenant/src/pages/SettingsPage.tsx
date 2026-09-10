import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTenantProfile, useTenantContract } from "../features/payment/hooks/useTenantDashboard";
import { Button } from "@bhagirathi/ui";
import { useThemeStore } from "../store/theme";
import { Settings, Bell, Shield, Eye, Sun, Moon, CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: profile } = useTenantProfile();
  const { data: contract } = useTenantContract();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePreferences = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto pb-12"
    >
      {/* Title */}
      <div className="flex items-center gap-3 select-none">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
        >
          <ArrowLeft className="h-4.5 w-4.5 text-stone-700 dark:text-stone-300" />
        </button>
        <div>
          <h1 className="text-lg font-black text-stone-900 dark:text-white leading-tight uppercase tracking-wider flex items-center gap-2">
            <Settings className="h-5 w-5 text-red-655" />
            <span>Portal Settings</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
            Manage your portal configurations, toggle alert preferences, and view account statuses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3 select-none">
              <Bell className="h-4.5 w-4.5 text-red-655 animate-pulse" />
              <h3 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">
                Notification Preferences
              </h3>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl flex items-center gap-2 text-xs font-bold text-green-700 dark:text-green-400">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Preferences updated successfully!</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between py-1 select-none">
                <div>
                  <span className="text-xs font-bold text-stone-850 dark:text-white block">Push Notifications</span>
                  <span className="text-[10px] text-stone-450 dark:text-stone-500 block mt-0.5">Receive real-time alerts in this browser portal</span>
                </div>
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={(e) => setPushEnabled(e.target.checked)}
                  className="h-5 w-5 rounded-lg border-slate-200 text-red-600 focus:ring-red-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-1 select-none">
                <div>
                  <span className="text-xs font-bold text-stone-850 dark:text-white block">Email Alerts</span>
                  <span className="text-[10px] text-stone-450 dark:text-stone-500 block mt-0.5">Receive rent invoices, receipts, and contract copies on email</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="h-5 w-5 rounded-lg border-slate-200 text-red-650 focus:ring-red-650 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-1 select-none">
                <div>
                  <span className="text-xs font-bold text-stone-850 dark:text-white block">SMS Reminders</span>
                  <span className="text-[10px] text-stone-450 dark:text-stone-500 block mt-0.5">Receive monthly rent reminders on your registered mobile number</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="h-5 w-5 rounded-lg border-slate-200 text-red-650 focus:ring-red-650 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end select-none">
              <Button onClick={handleSavePreferences} className="btn-primary-tenant h-9 px-4 font-black text-xs uppercase tracking-wider cursor-pointer rounded-xl text-white">
                Save Preferences
              </Button>
            </div>
          </div>

          {/* Theme Display Config */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3 select-none">
              <Eye className="h-4.5 w-4.5 text-red-655" />
              <h3 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">
                Display &amp; Theme Settings
              </h3>
            </div>

            <div className="flex items-center justify-between py-2 select-none">
              <div>
                <span className="text-xs font-bold text-stone-850 dark:text-white block">System Theme Mode</span>
                <span className="text-[10px] text-stone-450 dark:text-stone-500 block mt-0.5">Current: {isDarkMode ? "Dark Theme" : "Light Theme"}</span>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-250 hover:border-red-600 rounded-xl text-xxs font-black uppercase transition cursor-pointer text-stone-800 dark:text-white"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Account Status */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3 select-none">
              <Shield className="h-4.5 w-4.5 text-red-655" />
              <h3 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">
                Account Status
              </h3>
            </div>

            {profile && (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Resident ID</span>
                  {/* BUG-005 FIX: API returns 'id', not 'tenant_id' */}
                  <span className="font-mono font-black text-stone-800 dark:text-white block select-all mt-1">{profile.id}</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Account Role</span>
                  <span className="font-bold text-stone-800 dark:text-white mt-1 block uppercase tracking-wide">Tenant / Resident</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Registration Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-[9px] font-black uppercase bg-green-50 text-green-700 dark:bg-green-955/20 dark:text-green-400 border border-green-200 dark:border-green-900/30">
                    Active
                  </span>
                </div>
                {contract && (
                  <div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Contract Tenancy</span>
                    <span className="font-semibold text-stone-800 dark:text-white mt-1 block leading-relaxed">
                      {contract.start_date ? new Date(contract.start_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "N/A"} -{" "}
                      {contract.end_date ? new Date(contract.end_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "N/A"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;

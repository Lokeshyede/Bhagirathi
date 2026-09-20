import React, { useState } from "react";
import { Building, CreditCard, User, Settings as SettingsIcon, Home, ChevronRight } from "lucide-react";
import { SettingsCard } from "../components/SettingsCard";
import { HostelProfileForm } from "../components/HostelProfileForm";
import { PaymentSettingsForm } from "../components/PaymentSettingsForm";
import { AdminProfileForm } from "../components/AdminProfileForm";
import { PreferencesForm } from "../components/PreferencesForm";
import { motion, AnimatePresence } from "framer-motion";

type SettingsTab = "HOSTEL" | "PAYMENT" | "PROFILE" | "PREFS";

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("HOSTEL");

  const tabs = [
    { id: "HOSTEL" as SettingsTab, name: "Hostel Profile", icon: Building, desc: "Manage contact details, owner credentials, and general address." },
    { id: "PAYMENT" as SettingsTab, name: "UPI Payments Settings", icon: CreditCard, desc: "Configure merchant UPI ID, account holder bank details, and QR codes." },
    { id: "PROFILE" as SettingsTab, name: "Admin Account Profile", icon: User, desc: "Edit name, update mobile, change profile picture, and reset account passwords." },
    { id: "PREFS" as SettingsTab, name: "Application Preferences", icon: SettingsIcon, desc: "Customize default currencies, date formats, time display parameters, and default interface themes." }
  ];

  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      {/* 1. Breadcrumbs Header */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 border border-border dark:border-gray-800 p-4 rounded-card shadow-card select-none">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondaryText dark:text-gray-400">
          <Home className="h-4.5 w-4.5 text-primary" />
          <ChevronRight className="h-3 w-3" />
          <span className="text-primaryText dark:text-white">Settings &amp; Parameters</span>
        </div>
      </div>

      {/* 2. Main content split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Sidebar/Tab List */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-2 sm:p-4 shadow-card flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1 lg:space-y-1 select-none scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-auto lg:w-full shrink-0 whitespace-nowrap items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer text-left ${
                  isActive
                    ? "bg-primary/5 text-primary border border-primary/20"
                    : "text-secondaryText dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-805 border border-transparent"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Form Content */}
        <div className="lg:col-span-8">
          <AnimatePresence>
            {currentTab && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <SettingsCard title={currentTab.name} description={currentTab.desc}>
                  {activeTab === "HOSTEL" && <HostelProfileForm />}
                  {activeTab === "PAYMENT" && <PaymentSettingsForm />}
                  {activeTab === "PROFILE" && <AdminProfileForm />}
                  {activeTab === "PREFS" && <PreferencesForm />}
                </SettingsCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </motion.div>
  );
};

export default SettingsPage;

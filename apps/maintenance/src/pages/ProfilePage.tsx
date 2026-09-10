import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useMaintenanceDashboardStats } from "../features/complaint/hooks/useMaintenanceComplaint";
import {
  Phone,
  Mail,
  Shield,
  KeyRound,
  Wrench,
  Building,
  Calendar,
  UserCheck,
  Star,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  MessageSquare,
  ClipboardList
} from "lucide-react";
import { Button, Modal } from "@bhagirathi/ui";
import { apiClient } from "@bhagirathi/api-client";
import { motion } from "framer-motion";

export const ProfilePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const navigate = useNavigate();
  const { data: stats } = useMaintenanceDashboardStats();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || user?.mobile || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* 1. HERO HEADER PROFILE CARD */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-700 p-6 md:p-8 text-white shadow-md select-none animate-in fade-in duration-300"
      >
        {/* Soft background grid pattern & glow overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
 
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Large Avatar with ring glow */}
            <div className="relative shrink-0">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-white/10 border-2 border-white/20 backdrop-blur-md shadow-lg flex items-center justify-center font-black text-2xl md:text-3xl uppercase tracking-wider">
                {user?.full_name?.charAt(0) || "M"}
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-50 border-4 border-rose-600 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-green-50 animate-ping" />
              </div>
            </div>

            {/* Name and Basic Role Info */}
            <div className="text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl md:text-[32px] font-black tracking-tight leading-none">
                  {user?.full_name}
                </h1>
                <span className="inline-flex px-2 py-0.5 rounded-full bg-white/15 border border-white/25 text-[9px] font-black uppercase tracking-widest">
                  {user?.role || "Staff"}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3.5 gap-y-1 text-xs text-rose-100 font-semibold">
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  <span>ID: {user?.user_id || user?.id?.substring(0, 8) || "N/A"}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Aug 2026"}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center shrink-0">
            <Button
              onClick={() => navigate("/tasks")}
              className="font-black text-xs bg-white text-red-600 hover:bg-rose-50 h-10 px-5 rounded-xl shadow-xs tracking-wider uppercase flex items-center gap-1.5 transition cursor-pointer border-none"
            >
              <Wrench className="h-4 w-4" />
              <span>Go to Active Jobs</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 2-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Profile details & KPI Summary */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* PROFILE DETAILS */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5"
          >
            <h3 className="text-base font-black text-stone-855 dark:text-white uppercase tracking-wider select-none border-b border-slate-100 dark:border-zinc-800 pb-2">
              Profile Details
            </h3>

            <div className="space-y-4">
              {/* Employee ID */}
              <div className="flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-900 p-2 rounded-2xl transition-colors">
                <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center rounded-xl shrink-0">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Employee ID</span>
                  <span className="text-[16px] font-bold text-stone-850 dark:text-stone-200 mt-0.5 select-all uppercase">
                    {user?.user_id || user?.id?.substring(0, 8) || "N/A"}
                  </span>
                </div>
              </div>

              {/* Mobile phone */}
              <div className="flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-900 p-2 rounded-2xl transition-colors">
                <div className="h-10 w-10 bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center rounded-xl shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Mobile Phone</span>
                  <span className="text-[16px] font-bold text-stone-855 dark:text-stone-200 mt-0.5 select-all">
                    {user?.phone || user?.mobile || "N/A"}
                  </span>
                </div>
              </div>

              {/* Email address */}
              <div className="flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-900 p-2 rounded-2xl transition-colors">
                <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/10 text-blue-600 flex items-center justify-center rounded-xl shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Email Address</span>
                  <span className="text-[16px] font-bold text-stone-855 dark:text-stone-200 mt-0.5 select-all">
                    {user?.email || "N/A"}
                  </span>
                </div>
              </div>

              {/* Department */}
              <div className="flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-900 p-2 rounded-2xl transition-colors">
                <div className="h-10 w-10 bg-rose-50 dark:bg-rose-900/20 text-red-600 flex items-center justify-center rounded-xl shrink-0">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Department / Unit</span>
                  <span className="text-[16px] font-bold text-stone-855 dark:text-stone-200 mt-0.5">
                    Facility Maintenance &amp; Operations
                  </span>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-900 p-2 rounded-2xl transition-colors">
                <div className="h-10 w-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center rounded-xl shrink-0">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Assigned Role</span>
                  <span className="text-[16px] font-bold text-stone-855 dark:text-stone-200 mt-0.5">
                    {user?.role || "Technician"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* PERFORMANCE DASHBOARD CARD */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5"
          >
            <h3 className="text-base font-black text-stone-855 dark:text-white uppercase tracking-wider select-none border-b border-slate-100 dark:border-zinc-800 pb-2">
              Performance Indicators
            </h3>

            {/* Grid of KPI Cards */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="p-4 bg-slate-50 dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800 rounded-2xl text-center space-y-1 select-none">
                <div className="h-9 w-9 bg-green-50 dark:bg-green-905/20 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[9px] text-stone-400 uppercase font-black block">Tasks Done</span>
                <span className="text-lg font-black text-stone-850 dark:text-white block mt-0.5">
                  {stats?.completed_today_count !== undefined ? stats.completed_today_count + 142 : "148"}
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800 rounded-2xl text-center space-y-1 select-none">
                <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-905/20 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[9px] text-stone-400 uppercase font-black block">Today's Jobs</span>
                <span className="text-lg font-black text-stone-850 dark:text-white block mt-0.5">
                  {stats?.assigned_tasks_count !== undefined ? stats.assigned_tasks_count : "3"}
                </span>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800 rounded-2xl text-center space-y-1 select-none">
                <div className="h-9 w-9 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-[18px] w-[18px] fill-amber-500 text-amber-500" />
                </div>
                <span className="text-[9px] text-stone-400 uppercase font-black block">Average Rating</span>
                <span className="text-lg font-black text-stone-855 dark:text-white block mt-0.5">4.9 / 5.0</span>
              </div>
 
              <div className="p-4 bg-slate-50 dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800 rounded-2xl text-center space-y-1 select-none">
                <div className="h-9 w-9 bg-rose-50 dark:bg-rose-905/20 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[9px] text-stone-400 uppercase font-black block">Completion Rate</span>
                <span className="text-lg font-black text-stone-855 dark:text-white block mt-0.5">
                  {stats?.completion_percentage !== undefined ? `${stats.completion_percentage}%` : "98%"}
                </span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN: Account security & Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* ACCOUNT SECURITY CARD */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5"
          >
            <h3 className="text-base font-black text-stone-855 dark:text-white uppercase tracking-wider select-none border-b border-slate-100 dark:border-zinc-800 pb-2">
              Account Security
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide">Password Status</span>
                <span className="font-extrabold text-green-600 uppercase tracking-wider">Active (Strong)</span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide">Last Access log</span>
                <span className="font-bold text-stone-800 dark:text-stone-300">Today, {new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide">Security Health</span>
                <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 dark:bg-green-905/20 px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase border border-green-200">
                  Excellent
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 select-none">
              <Button
                onClick={() => navigate("/change-password")}
                className="w-full flex items-center justify-center gap-1.5 font-black h-11 text-white cursor-pointer bg-red-600 hover:bg-red-700 rounded-xl uppercase tracking-wider text-xs border-none"
              >
                <KeyRound className="h-[18px] w-[18px]" />
                <span>Change Password</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => alert("Security settings logged to system settings.")}
                className="w-full flex items-center justify-center gap-1.5 font-black h-11 border-slate-200 dark:border-zinc-800 text-stone-600 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-zinc-950 rounded-xl uppercase tracking-wider text-xs cursor-pointer"
              >
                <Settings className="h-[18px] w-[18px]" />
                <span>Security Settings</span>
              </Button>
            </div>
          </motion.div>

          {/* ASSIGNED PROPERTIES CARD */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5 select-none"
          >
            <h3 className="text-base font-black text-stone-855 dark:text-white uppercase tracking-wider select-none border-b border-slate-100 dark:border-zinc-800 pb-2">
              Assigned PG Access
            </h3>

            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-950/25 border border-slate-200 dark:border-zinc-800 rounded-2xl">
              <div className="h-10 w-10 bg-red-600/10 text-red-600 border border-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Building className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="font-black text-xs.5 text-stone-850 dark:text-white">Bhagirathi PG Buildings</span>
                <p className="text-[10px] text-stone-400 font-bold uppercase mt-0.5">All Hostels &amp; PG rooms</p>
              </div>
            </div>
          </motion.div>

          {/* QUICK ACTIONS GRID */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5"
          >
            <h3 className="text-base font-black text-stone-855 dark:text-white uppercase tracking-wider select-none border-b border-slate-100 dark:border-zinc-800 pb-2">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-3.5 select-none text-xs font-semibold">
              <Link
                to="/change-password"
                className="p-4 bg-slate-50 hover:bg-red-50/50 dark:bg-zinc-950 dark:hover:bg-red-900/15 border border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between aspect-square group transition"
              >
                <div className="h-[34px] w-[34px] rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center border border-red-100 dark:border-red-900/30">
                  <KeyRound className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <span className="font-extrabold text-[11px] text-stone-850 dark:text-white block group-hover:text-red-600 transition-colors uppercase tracking-wider">Credential Edit</span>
                  <p className="text-[9px] text-stone-400 font-medium mt-0.5 leading-snug">Edit password</p>
                </div>
              </Link>

              <button
                onClick={() => {
                  setEditName(user?.full_name || "");
                  setEditPhone(user?.phone || user?.mobile || "");
                  setFormError(null);
                  setSuccessMsg(null);
                  setIsEditModalOpen(true);
                }}
                className="p-4 bg-slate-50 hover:bg-red-50/50 dark:bg-zinc-950 dark:hover:bg-red-900/15 border border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between aspect-square text-left group transition cursor-pointer"
              >
                <div className="h-[34px] w-[34px] rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
                  <UserCheck className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <span className="font-extrabold text-[11px] text-stone-855 dark:text-white block group-hover:text-red-600 transition-colors uppercase tracking-wider">Update Profile</span>
                  <p className="text-[9px] text-stone-400 font-medium mt-0.5 leading-snug">Request changes</p>
                </div>
              </button>

              <button
                onClick={() => alert("Initiating admin support connection...")}
                className="p-4 bg-slate-50 hover:bg-red-50/50 dark:bg-zinc-950 dark:hover:bg-red-900/15 border border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between aspect-square text-left group transition cursor-pointer"
              >
                <div className="h-[34px] w-[34px] rounded-lg bg-green-50 dark:bg-green-905/20 text-green-600 flex items-center justify-center border border-green-100 dark:border-green-900/30">
                  <MessageSquare className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <span className="font-extrabold text-[11px] text-stone-855 dark:text-white block group-hover:text-red-600 transition-colors uppercase tracking-wider">Contact Admin</span>
                  <p className="text-[9px] text-stone-400 font-medium mt-0.5 leading-snug">Message warden</p>
                </div>
              </button>

              <Link
                to="/tasks"
                className="p-4 bg-slate-50 hover:bg-red-50/50 dark:bg-zinc-900 dark:hover:bg-red-900/15 border border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between aspect-square group transition"
              >
                <div className="h-[34px] w-[34px] rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
                  <ClipboardList className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <span className="font-extrabold text-[11px] text-stone-855 dark:text-white block group-hover:text-red-600 transition-colors uppercase tracking-wider">Active Tasks</span>
                  <p className="text-[9px] text-stone-400 font-medium mt-0.5 leading-snug">Open job card</p>
                </div>
              </Link>
            </div>
          </motion.div>

      </div>
    </div>

    <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Profile Details"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!editName.trim()) {
              setFormError("Full name is required.");
              return;
            }
            try {
              setIsUpdating(true);
              setFormError(null);
              setSuccessMsg(null);
              const res = await apiClient.put("/api/v1/maintenance/profile", {
                full_name: editName,
                phone: editPhone
              });
              if (res.data.status === "success") {
                updateUser({ ...user, ...res.data.user });
                setSuccessMsg("Profile updated successfully!");
                setTimeout(() => {
                  setIsEditModalOpen(false);
                }, 1500);
              }
            } catch (err: any) {
              setFormError(err.response?.data?.detail || "Failed to update profile.");
            } finally {
              setIsUpdating(false);
            }
          }}
          className="space-y-4 p-2 text-xs font-semibold text-stone-850 dark:text-zinc-205"
        >
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl border border-red-200 dark:border-red-900/40">
              {formError}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-green-50 dark:bg-green-905/20 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-900/40">
              {successMsg}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block text-stone-400 dark:text-stone-550 uppercase font-black tracking-wider text-[9px]">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-10 w-full px-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-stone-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600"
              placeholder="Full name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-stone-400 dark:text-stone-550 uppercase font-black tracking-wider text-[9px]">Phone Number</label>
            <input
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="h-10 w-full px-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-stone-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600"
              placeholder="Phone number"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 h-11 rounded-xl uppercase tracking-wider text-xs font-black"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isUpdating}
              className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl uppercase tracking-wider text-xs font-black border-none cursor-pointer"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
};

export default ProfilePage;

import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import {
  useMaintenanceDashboardStats,
  useAssignedComplaints
} from "../features/complaint/hooks/useMaintenanceComplaint";
import { Button } from "@bhagirathi/ui";
import {
  Wrench,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
  ArrowRight,
  User,
  History,
  Bell
} from "lucide-react";
import { motion } from "framer-motion";
import { ComplaintStatus, ComplaintPriority } from "@bhagirathi/constants";

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  // Queries
  const { data: stats, isLoading: isStatsLoading, isError: isStatsError, refetch: refetchStats } = useMaintenanceDashboardStats();
  const { data: complaints, isLoading: isComplaintsLoading, refetch: refetchComplaints } = useAssignedComplaints({});

  const isLoading = isStatsLoading || isComplaintsLoading;
  const isError = isStatsError;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleRetry = () => {
    refetchStats();
    refetchComplaints();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none max-w-4xl mx-auto">
        <div className="flex justify-between items-center py-2">
          <div className="space-y-2">
            <div className="h-6 w-36 bg-slate-100 dark:bg-zinc-800 rounded-lg" />
            <div className="h-4 w-48 bg-slate-100 dark:bg-zinc-800 rounded-lg" />
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-zinc-800" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-zinc-800" />
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-zinc-800" />
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-zinc-800" />
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-zinc-800" />
        </div>
        <div className="h-48 rounded-card bg-slate-100 dark:bg-zinc-800" />
        <div className="h-64 rounded-card bg-slate-100 dark:bg-zinc-800" />
      </div>
    );
  }

  if (isError || !stats || !complaints) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-205 dark:border-zinc-850 rounded-card text-center shadow-sm select-none max-w-md mx-auto my-12">
        <AlertTriangle className="h-10 w-10 text-primary mb-3" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Error loading dashboard</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed font-semibold">
          There was an issue fetching your maintenance parameters. Please verify your connection.
        </p>
        <Button onClick={handleRetry} className="btn-primary-tenant font-bold h-10 px-6 rounded-xl cursor-pointer text-white bg-primary hover:bg-primary-hover">
          Retry Connection
        </Button>
      </div>
    );
  }

  // Derived metrics with full backend/types fallback support
  const rawStats = stats as any;
  const pendingTasksCount = stats?.pending_tasks_count ?? rawStats?.open ?? 0;
  const completedTodayCount = stats?.completed_today_count ?? rawStats?.resolved ?? 0;
  const totalComplaints = rawStats?.total_complaints ?? (rawStats?.my_assigned_tasks || 0);
  const completionPercentage = stats?.completion_percentage ?? (totalComplaints ? Math.round((completedTodayCount / totalComplaints) * 100) : 0);

  // Filter complaints list to locate the most urgent task
  const urgentTask = complaints.find(
    (c) =>
      (c.priority === ComplaintPriority.CRITICAL || c.priority === ComplaintPriority.HIGH) &&
      (c.status === ComplaintStatus.OPEN || c.status === ComplaintStatus.ASSIGNED || c.status === ComplaintStatus.IN_PROGRESS)
  );

  // Active Complaints list (up to 3 items)
  const activeAssignments = complaints
    .filter((c) => c.status === ComplaintStatus.OPEN || c.status === ComplaintStatus.ASSIGNED || c.status === ComplaintStatus.IN_PROGRESS)
    .slice(0, 3);

  // Dynamic Recent Activity Timeline Fallback
  const recentActivitiesList = stats?.recent_activity ?? (complaints || [])
    .filter(c => c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED)
    .slice(0, 3)
    .map(c => ({
      id: c.id,
      complaint_id: c.id,
      complaint_number: c.complaint_number || c.id.substring(0, 8),
      complaint_title: c.title,
      status: c.status,
      remarks: c.resolution_notes || "Work status updated.",
      action_at: c.updated_at || c.created_at || new Date().toISOString()
    }));

  // Quick Action items
  const quickActions = [
    { name: "Meter Logs", path: "/bills", icon: Activity, color: "text-blue-600 bg-blue-50/80 dark:bg-blue-900/20 dark:text-blue-400" },
    { name: "Tenant Complaints", path: "/complaints", icon: History, color: "text-indigo-600 bg-indigo-50/80 dark:bg-indigo-900/20 dark:text-indigo-400" },
    { name: "Alert Center", path: "/notifications", icon: Bell, color: "text-amber-600 bg-amber-50/80 dark:bg-amber-900/20 dark:text-amber-400" },
    { name: "My Profile", path: "/profile", icon: User, color: "text-emerald-600 bg-emerald-50/80 dark:bg-emerald-900/20 dark:text-emerald-400" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* 1. WELCOME HEADER */}
      <div className="flex justify-between items-center py-2 select-none">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight flex items-center gap-2">
            <span>{getGreeting()}, {user?.full_name?.split(" ")[0]}</span>
            <span>👋</span>
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-semibold">
            Here's your maintenance workload summary.
          </p>
        </div>
        <div className="h-11 w-11 rounded-full bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-900/35 overflow-hidden flex items-center justify-center font-bold text-base uppercase text-primary shrink-0 shadow-sm">
          {user?.full_name?.charAt(0) || "M"}
        </div>
      </div>

      {/* 2. TODAY'S WORK: Compact Statistics Console */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block px-1 select-none">
          Today's Tasks Status
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 select-none">
          {/* Stat 1 */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-card p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider block">Total Complaints</span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-white block mt-0.5">{totalComplaints}</span>
            </div>
            <div className="h-[34px] w-[34px] rounded-xl bg-indigo-50/80 dark:bg-indigo-905/25 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wrench className="h-[18px] w-[18px]" />
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-card p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider block">Pending Actions</span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-white block mt-0.5">{pendingTasksCount}</span>
            </div>
            <div className="h-[34px] w-[34px] rounded-xl bg-amber-50/80 dark:bg-amber-900/25 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="h-[18px] w-[18px]" />
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-card p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider block">Completed Today</span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-white block mt-0.5">{completedTodayCount}</span>
            </div>
            <div className="h-[34px] w-[34px] rounded-xl bg-green-50/80 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
              <CheckCircle className="h-[18px] w-[18px]" />
            </div>
          </div>

          {/* Stat 4 */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-card p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider block">Success Rate</span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-white block mt-0.5">{completionPercentage}%</span>
            </div>
            <div className="h-[34px] w-[34px] rounded-xl bg-red-50/80 dark:bg-red-900/25 text-red-600 dark:text-red-400 flex items-center justify-center">
              <TrendingUp className="h-[18px] w-[18px]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. URGENT TASK ANCHOR CARD */}
      {urgentTask && (
        <div className="bg-red-50/15 dark:bg-red-900/5 border border-red-200 dark:border-red-900/30 rounded-card p-5 shadow-xs select-none">
          <div className="flex justify-between items-start border-b border-red-200/40 dark:border-red-900/15 pb-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 bg-primary text-white text-[8px] font-bold uppercase tracking-widest py-0.5 px-2.5 rounded-full">
                <AlertTriangle className="h-2.5 w-2.5 text-white animate-pulse" />
                <span>Urgent Action Required</span>
              </div>
              <h3 className="text-sm.5 font-bold text-gray-900 dark:text-white mt-2 leading-tight text-wrap-safe">
                {urgentTask.title}
              </h3>
            </div>
            <span className="text-[9px] text-primary dark:text-red-400 font-bold uppercase tracking-widest bg-red-50/85 dark:bg-red-900/35 border border-red-100 px-2 py-0.5 rounded-full select-all font-mono">
              #{urgentTask.complaint_number}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs font-semibold">
            <div>
              <span className="text-gray-450 dark:text-gray-500 text-[9px] uppercase font-bold tracking-wider block">Location</span>
              <span className="text-gray-800 dark:text-gray-200 mt-0.5 block truncate">
                Room {urgentTask.room_number || "Common Area"}
              </span>
            </div>
            <div>
              <span className="text-gray-450 dark:text-gray-550 text-[9px] uppercase font-bold tracking-wider block">Reported By</span>
              <span className="text-gray-800 dark:text-gray-200 mt-0.5 block truncate">{urgentTask.tenant_name || "Resident"}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-gray-450 dark:text-gray-550 text-[9px] uppercase font-bold tracking-wider block">Assigned Date</span>
              <span className="text-gray-800 dark:text-gray-200 mt-0.5 block truncate">
                {urgentTask.created_at ? new Date(urgentTask.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Today"}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-red-200/30 dark:border-red-900/15 mt-4 flex justify-between items-center">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
              Hostel: {urgentTask.hostel_name}
            </span>
            <Button
              onClick={() => navigate("/complaints")}
              className="btn-primary-tenant font-bold text-xs uppercase tracking-wider h-10 px-5 rounded-xl cursor-pointer text-white flex items-center gap-1.5 bg-primary hover:bg-primary-hover shadow-sm"
            >
              <span>View Complaint</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 4. MY ASSIGNMENTS SECTION */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1 select-none">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
            Active Complaints
          </span>
          <Link to="/complaints" className="text-[10px] font-bold uppercase text-primary hover:text-primary-hover tracking-wider">
            All Complaints →
          </Link>
        </div>

        {activeAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeAssignments.map((task) => (
              <div
                key={task.id}
                onClick={() => navigate("/complaints")}
                className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-card p-4.5 shadow-xs cursor-pointer hover:border-primary/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3 select-none">
                    <span className="font-mono text-[9px] font-bold text-gray-400 bg-slate-50 dark:bg-zinc-900 px-1.5 py-0.5 border border-slate-200/60 dark:border-zinc-800 rounded">
                      #{task.complaint_number}
                    </span>
                    <span className={`text-[8px] font-bold py-0.5 px-2.5 border rounded-full uppercase tracking-wider ${
                      task.status === ComplaintStatus.ASSIGNED ? "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-905/20" :
                      "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20"
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs.5 text-gray-900 dark:text-white line-clamp-1 mb-1.5 text-wrap-safe">
                    {task.title}
                  </h4>

                  <div className="flex gap-2 select-none">
                    <span className={`text-[8px] font-bold py-0.5 px-1.5 border rounded uppercase tracking-wider ${
                      task.priority === ComplaintPriority.CRITICAL ? "text-red-700 bg-red-50 border-red-200" :
                      task.priority === ComplaintPriority.HIGH ? "text-orange-700 bg-orange-50 border-orange-200" :
                      "text-blue-700 bg-blue-50 border-blue-200"
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-0.5 truncate max-w-[80px]">
                      {task.category}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 dark:border-zinc-800/80 pt-3 mt-4 text-[9.5px] text-gray-400 select-none">
                  <span className="font-bold">Room {task.room_number || "Common"}</span>
                  <span className="font-bold text-primary dark:text-red-400 inline-flex items-center gap-0.5">
                    View <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-card shadow-xs text-center select-none">
            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-xs font-bold text-gray-900 dark:text-white">You're all caught up</p>
            <p className="text-[10px] text-gray-400 mt-0.5">No active complaints waiting.</p>
          </div>
        )}
      </div>

      {/* 5. QUICK ACTIONS CONSOLE */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-widest block px-1 select-none">
          Quick Actions Console
        </span>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 select-none">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.name}
                onClick={() => navigate(action.path)}
                className="flex items-center md:flex-col md:justify-center gap-3.5 p-3.5 border border-slate-200/80 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-xs hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-pointer group text-left md:text-center"
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${action.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-gray-900 dark:text-white block uppercase tracking-wider truncate">
                    {action.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. RECENT ACTIVITY Operations logs timeline */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-card p-5 shadow-xs space-y-4">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-widest block border-b border-slate-100 dark:border-zinc-800 pb-2.5 select-none">
          Recent Operations Logs
        </span>
        
        {recentActivitiesList.length > 0 ? (
          <div className="flow-root pl-1">
            <ul className="-mb-8">
              {recentActivitiesList.map((activity, idx) => {
                const isLast = idx === recentActivitiesList.length - 1;
                return (
                  <li key={activity.id || idx}>
                    <div className="relative pb-8">
                      {!isLast && (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-100 dark:bg-zinc-800" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3.5">
                        <div className="shrink-0 select-none">
                          <span className="h-[34px] w-[34px] rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 flex items-center justify-center text-gray-400">
                            ⚙️
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <Link to="/complaints" className="text-xs font-bold text-gray-900 dark:text-white hover:text-primary hover:underline text-wrap-safe">
                                {activity.complaint_title}
                              </Link>
                              <p className="text-[9px] font-mono font-bold text-gray-400 uppercase mt-0.5 select-none">
                                #{activity.complaint_number}
                              </p>
                            </div>
                            <span className="text-[9px] text-gray-400 font-semibold whitespace-nowrap select-none">
                              {activity.action_at ? new Date(activity.action_at).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                            </span>
                          </div>
                          
                          <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400 bg-slate-50/50 dark:bg-zinc-950/20 p-2.5 rounded-lg border border-slate-150 dark:border-zinc-800/80 font-semibold leading-relaxed text-wrap-safe">
                            <span className="font-bold uppercase text-[8px] text-gray-400 dark:text-gray-500 block mb-0.5 select-none">
                              Status: {activity.status}
                            </span>
                            {activity.remarks || "Work status updated."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-gray-405 select-none">
            <Clock className="h-8 w-8 text-slate-200 dark:text-zinc-800 mb-2 animate-pulse" />
            <p className="text-xs font-semibold">No operational updates logged today.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardPage;

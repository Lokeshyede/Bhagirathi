import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/auth";
import { Sun, Moon, Sunrise, Sparkles } from "lucide-react";

interface DashboardHeaderProps {
  occupancyRate?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ occupancyRate = 92 }) => {
  const user = useAuthStore((state) => state.user);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return { text: "Good Morning", icon: <Sunrise className="h-5 w-5 text-orange-500" />, color: "from-orange-50 to-amber-50/50 dark:from-orange-950/10 dark:to-transparent" };
    if (hour < 18) return { text: "Good Afternoon", icon: <Sun className="h-5 w-5 text-yellow-500" />, color: "from-yellow-50 to-amber-50/50 dark:from-yellow-950/10 dark:to-transparent" };
    return { text: "Good Evening", icon: <Moon className="h-5 w-5 text-indigo-400" />, color: "from-indigo-50 to-violet-50/50 dark:from-indigo-950/10 dark:to-transparent" };
  };

  const { text: greetingText, icon: greetingIcon, color: greetingGrad } = getGreeting();

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const firstName = user?.full_name || "Administrator";
  const hostelName = "Bhagirathi Hostel & PG";

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${greetingGrad} border border-border dark:border-gray-800 rounded-card p-4 sm:p-6 shadow-card mb-4 sm:mb-6`}>
      {/* Decorative background orbs */}
      <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-primary/4 dark:bg-primary/8 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-4 right-20 h-24 w-24 rounded-full bg-warning/6 dark:bg-warning/10 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        {/* Welcome Greeting & Summary */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-icon bg-white dark:bg-gray-900 border border-border dark:border-gray-800 shadow-card flex items-center justify-center flex-shrink-0">
            {greetingIcon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 select-none">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-warning flex-shrink-0" />
              <span className="text-[10px] font-bold text-secondaryText dark:text-gray-400 uppercase tracking-widest truncate">
                {hostelName}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-primaryText dark:text-white leading-tight truncate">
              {greetingText}, <span className="text-primary">{firstName}</span>
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-secondaryText dark:text-gray-400 mt-1">
              Running at <span className="text-primary font-bold">{occupancyRate}% occupancy</span> today.
            </p>
          </div>
        </div>

        {/* Live Clock & Date */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-0.5 ml-[52px] sm:ml-0">
          <div className="text-lg sm:text-xl font-black text-primaryText dark:text-white tabular-nums tracking-tight">
            {formattedTime}
          </div>
          <div className="hidden sm:block text-xs text-secondaryText dark:text-gray-400 font-medium">
            {formattedDate}
          </div>
          <div className="flex items-center gap-1.5 sm:mt-1 select-none">
            <span className="status-dot-active" />
            <span className="text-[10px] text-success font-semibold">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

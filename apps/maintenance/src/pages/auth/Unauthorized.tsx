import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@bhagirathi/ui";
import { ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-zinc-900 p-4 transition-colors select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.04),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-lg p-8 relative z-10 text-center space-y-6"
      >
        <div className="flex justify-center text-red-600">
          <ShieldAlert className="h-16 w-16 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight leading-none">403</h1>
          <h2 className="text-base font-black text-stone-850 dark:text-gray-200 uppercase tracking-wider">Access Forbidden</h2>
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs mx-auto">
            You do not have the required permissions to view this resource. Please make sure you are logged in to the correct account.
          </p>
        </div>
        
        <div className="flex gap-[18px] justify-center font-black text-xs uppercase tracking-wider select-none pt-2">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex-1 font-black h-11 border-slate-200 dark:border-zinc-800 text-stone-600 rounded-xl cursor-pointer"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/login")}
            className="flex-1 font-black bg-red-600 hover:bg-red-700 h-11 text-white rounded-xl cursor-pointer border-none"
          >
            Sign In
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;

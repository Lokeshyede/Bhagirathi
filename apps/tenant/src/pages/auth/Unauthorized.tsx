import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@bhagirathi/ui";
import { ShieldAlert } from "lucide-react";

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-zinc-955 p-4 transition-colors select-none">
      <div className="w-full max-w-md text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-lg space-y-6">
        <div className="flex justify-center text-red-650 dark:text-red-500">
          <ShieldAlert className="h-16 w-16 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-stone-850 dark:text-white tracking-tight uppercase">403</h1>
          <h2 className="text-base font-black text-stone-800 dark:text-gray-250 uppercase tracking-wide">Access Forbidden</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-semibold">
            You do not have the required permissions to view this resource. Please make sure you are logged in to the correct portal.
          </p>
        </div>
        <div className="flex gap-3.5 justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1 font-black uppercase tracking-wider text-xs h-10 rounded-xl cursor-pointer border-slate-200 dark:border-zinc-850 text-stone-700 dark:text-stone-300 bg-slate-50 dark:bg-zinc-950"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/login")}
            className="btn-primary-tenant flex-1 font-black uppercase tracking-wider text-xs h-10 rounded-xl cursor-pointer text-white"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

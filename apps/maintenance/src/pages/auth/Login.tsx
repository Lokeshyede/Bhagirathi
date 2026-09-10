import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { loginSchema, LoginInput } from "@bhagirathi/validation";
import { apiClient } from "@bhagirathi/api-client";
import { UserRole } from "@bhagirathi/constants";
import { Button } from "@bhagirathi/ui";
import { useAuthStore } from "../../store/auth";
import {
  Building2,
  ShieldAlert,
  Eye,
  EyeOff
} from "lucide-react";
import { motion } from "framer-motion";

// Portal-specific localStorage keys — must match store/auth.ts
const TOKEN_KEY = "maintenance_auth_token";
const REFRESH_KEY = "maintenance_refresh_token";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  TENANT: "Tenant",
  MAINTENANCE: "Maintenance Staff",
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Show descriptive message when redirected here due to role mismatch
  const roleMismatchError = searchParams.get("error") === "role_mismatch"
    ? `You are currently logged in as ${ROLE_LABELS[searchParams.get("role") ?? ""] ?? searchParams.get("role")}. Please sign in with a MAINTENANCE STAFF account to access the Staff Portal.`
    : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: UserRole.MAINTENANCE,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const response = await apiClient.post("/api/v1/auth/login", data);
      return response.data;
    },
    onSuccess: async (tokenData) => {
      try {
        localStorage.setItem(TOKEN_KEY, tokenData.access_token);
        localStorage.setItem(REFRESH_KEY, tokenData.refresh_token);

        // BUG-002 fix: use user object embedded in login response directly.
        const user = tokenData.user;
        if (!user) {
          // Fallback: fetch /me if the server does not include user in response
          const meResponse = await apiClient.get("/api/v1/auth/me");
          const fallbackUser = meResponse.data;
          login(fallbackUser, tokenData.access_token, tokenData.refresh_token);
          if (fallbackUser.force_password_change) {
            navigate("/force-change-password");
          } else {
            navigate("/dashboard");
          }
          return;
        }

        login(user, tokenData.access_token, tokenData.refresh_token);
        if (tokenData.force_password_change) {
          navigate("/force-change-password");
        } else {
          navigate("/dashboard");
        }
      } catch (err: any) {
        setServerError("Failed to load user profile details.");
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "Invalid email or password.";
      setServerError(typeof msg === "string" ? msg : "Authentication failed.");
    },
  });

  const onSubmit = (data: LoginInput) => {
    setServerError(null);
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-zinc-900 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[420px] bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-xs"
      >
        {/* Branding header */}
        <div className="flex flex-col items-center select-none text-center">
          {/* Logo Container */}
          <div className="h-12 w-12 bg-[#E53935] text-white flex items-center justify-center rounded-2xl shadow-sm mb-4">
            <Building2 className="h-6 w-6" />
          </div>
          
          {/* Brand Name */}
          <h1 className="text-xl sm:text-22px font-black text-[#111827] dark:text-white uppercase tracking-wider leading-none">
            Bhagirathi Hostel &amp; PG
          </h1>
          
          {/* Portal Label */}
          <span className="text-[11px] font-black text-[#64748B] dark:text-zinc-400 uppercase tracking-widest mt-2.5">
            Staff Portal
          </span>
          
          {/* Welcome Text */}
          <h2 className="text-24px sm:text-26px font-black text-[#111827] dark:text-white mt-4 tracking-tight leading-tight select-none">
            Welcome Back
          </h2>
        </div>

        {/* Alerts for warnings/errors */}
        <div className="mt-5 space-y-3 font-semibold text-xs leading-normal">
          {roleMismatchError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 rounded-2xl border border-amber-200/50 dark:border-amber-900/25"
            >
              <ShieldAlert className="h-[18px] w-[18px] shrink-0 mt-0.5" />
              <span>{roleMismatchError}</span>
            </motion.div>
          )}

          {serverError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/10 text-[#E53935] dark:text-red-400 rounded-2xl border border-red-200/50 dark:border-red-900/25"
            >
              <ShieldAlert className="h-[18px] w-[18px] shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </motion.div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4 text-xs font-semibold text-[#111827] dark:text-zinc-200">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="block text-13px font-bold">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className={`h-[50px] w-full px-4 rounded-xl border bg-white dark:bg-zinc-900 text-stone-800 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E53935]/15 focus:border-[#E53935] transition duration-150 ${
                errors.email ? "border-[#E53935]" : "border-[#E2E8F0] dark:border-zinc-800"
              }`}
            />
            {errors.email?.message && (
              <p className="text-[10px] text-[#E53935] font-bold tracking-wide mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="block text-13px font-bold">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className={`h-[50px] w-full pl-4 pr-12 rounded-xl border bg-white dark:bg-zinc-950 text-stone-800 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E53935]/15 focus:border-[#E53935] transition duration-150 ${
                  errors.password ? "border-[#E53935]" : "border-[#E2E8F0] dark:border-zinc-800"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 p-1 text-stone-400 hover:text-stone-600 transition cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
            {errors.password?.message && (
              <p className="text-[10px] text-[#E53935] font-bold tracking-wide mt-1">{errors.password.message}</p>
            )}
          </div>

          <input type="hidden" value={UserRole.MAINTENANCE} {...register("role")} />

          {/* Forgot Password link & remember controls */}
          <div className="flex items-center justify-between pt-1 select-none text-[11px] font-bold uppercase tracking-wider">
            <label className="flex items-center gap-2.5 cursor-pointer text-[#64748B] dark:text-zinc-400">
              <input
                type="checkbox"
                className="accent-[#E53935] h-[18px] w-[18px] rounded border-[#E2E8F0]"
              />
              <span>Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-[#E53935] hover:text-[#C62828] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-[50px] font-black bg-[#E53935] hover:bg-[#C62828] text-white flex items-center justify-center gap-1.5 rounded-xl uppercase tracking-wider text-sm cursor-pointer border-none mt-4 transition-all duration-150"
            isLoading={mutation.isPending}
          >
            {mutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;

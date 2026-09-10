import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Input, Button } from "@bhagirathi/ui";
import { useAdminProfile, useUpdateAdminProfile } from "../hooks/useSettings";
import { ImageUploader } from "./ImageUploader";
import { ShieldAlert, CheckCircle, KeyRound } from "lucide-react";

const adminProfileSchema = zod.object({
  full_name: zod.string().min(2, "Full name is required"),
  email: zod.string().email("Invalid email format"),
  mobile: zod.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  current_password: zod.string().optional().nullable().or(zod.literal("")),
  new_password: zod.string().optional().nullable().or(zod.literal("")),
  confirm_new_password: zod.string().optional().nullable().or(zod.literal(""))
}).refine((data) => {
  if (data.new_password || data.confirm_new_password || data.current_password) {
    return !!data.current_password && !!data.new_password && !!data.confirm_new_password;
  }
  return true;
}, {
  message: "To update security key, current, new, and confirm values are required.",
  path: ["current_password"]
}).refine((data) => {
  if (data.new_password && data.new_password.length > 0 && data.new_password.length < 8) {
    return false;
  }
  return true;
}, {
  message: "New password must be at least 8 characters long.",
  path: ["new_password"]
}).refine((data) => {
  if (data.new_password !== data.confirm_new_password) {
    return false;
  }
  return true;
}, {
  message: "Confirm password does not match.",
  path: ["confirm_new_password"]
});

type AdminProfileFormValues = zod.infer<typeof adminProfileSchema>;

export const AdminProfileForm: React.FC = () => {
  const { data: admin, isLoading } = useAdminProfile();
  const updateMutation = useUpdateAdminProfile();
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminProfileSchema)
  });

  // Populate data when fetched
  useEffect(() => {
    if (admin) {
      reset({
        full_name: admin.full_name,
        email: admin.email,
        mobile: admin.mobile,
        current_password: "",
        new_password: "",
        confirm_new_password: ""
      });
    }
  }, [admin, reset]);

  const onSubmit = async (values: AdminProfileFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    
    try {
      const fd = new FormData();
      fd.append("full_name", values.full_name);
      fd.append("email", values.email);
      fd.append("mobile", values.mobile);
      if (values.current_password && values.new_password) {
        fd.append("current_password", values.current_password);
        fd.append("new_password", values.new_password);
      }
      if (photoFile) {
        fd.append("photo_file", photoFile);
      }

      await updateMutation.mutateAsync(fd);
      setSuccessMsg("Admin profile credentials saved successfully!");
      setPhotoFile(null);
      
      // Reset password fields
      reset({
        full_name: values.full_name,
        email: values.email,
        mobile: values.mobile,
        current_password: "",
        new_password: "",
        confirm_new_password: ""
      });
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || "Failed to update profile.");
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    if (admin) {
      reset({
        full_name: admin.full_name,
        email: admin.email,
        mobile: admin.mobile,
        current_password: "",
        new_password: "",
        confirm_new_password: ""
      });
      setPhotoFile(null);
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <span className="text-xs text-gray-500 animate-pulse font-semibold">Loading profile parameters...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-green-50 dark:bg-green-955 text-green-700 dark:text-green-400 rounded-xl text-xs font-bold uppercase tracking-wider border border-green-100 dark:border-green-950/30">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-red-50 dark:bg-red-955 text-red-655 dark:text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-100 dark:border-red-950/30">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Profile Photo Image Selector */}
        <div className="md:col-span-2">
          <ImageUploader
            label="Admin Profile Avatar Photo"
            currentImageUrl={admin?.profile_photo || null}
            onFileSelect={setPhotoFile}
            maxSizeMB={2}
          />
        </div>

        <Input
          label="Full Name *"
          placeholder="e.g. Administrator"
          error={errors.full_name?.message}
          {...register("full_name")}
        />

        <Input
          label="Email Address *"
          type="email"
          placeholder="e.g. admin@bhagirathipg.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Mobile Number *"
          placeholder="e.g. 9876543210"
          error={errors.mobile?.message}
          {...register("mobile")}
        />

        {/* Change password section heading */}
        <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-gray-850 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-red-650 shrink-0" />
          <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">Update Account Security Key</h4>
        </div>

        <Input
          label="Current Password"
          type="password"
          placeholder="••••••••"
          error={errors.current_password?.message}
          {...register("current_password")}
        />

        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.new_password?.message}
          {...register("new_password")}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirm_new_password?.message}
          {...register("confirm_new_password")}
        />

      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-850">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="font-bold cursor-pointer h-10 px-6"
        >
          Reset Fields
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={updateMutation.isPending}
          className="font-bold cursor-pointer h-10 px-6"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default AdminProfileForm;

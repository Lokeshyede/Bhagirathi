import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Input, Button } from "@bhagirathi/ui";
import { useHostelProfile, useUpdateHostelProfile } from "../hooks/useSettings";
import { ShieldAlert, CheckCircle } from "lucide-react";

const hostelProfileSchema = zod.object({
  hostel_name: zod.string().min(2, "Hostel name is required"),
  owner_name: zod.string().min(2, "Owner name is required"),
  mobile: zod.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  email: zod.string().email("Invalid email format"),
  address: zod.string().min(5, "Address must be at least 5 characters"),
  city: zod.string().min(2, "City is required"),
  state: zod.string().min(2, "State is required"),
  pincode: zod.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  gst_number: zod.string().optional().nullable().or(zod.literal("")),
  description: zod.string().optional().nullable().or(zod.literal(""))
});

type HostelProfileFormValues = zod.infer<typeof hostelProfileSchema>;

export const HostelProfileForm: React.FC = () => {
  const { data: profile, isLoading } = useHostelProfile();
  const updateMutation = useUpdateHostelProfile();
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<HostelProfileFormValues>({
    resolver: zodResolver(hostelProfileSchema)
  });

  // Populate data when fetched
  useEffect(() => {
    if (profile) {
      reset({
        hostel_name: profile.hostel_name,
        owner_name: profile.owner_name,
        mobile: profile.mobile,
        email: profile.email,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        gst_number: profile.gst_number || "",
        description: profile.description || ""
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values: HostelProfileFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    
    try {
      const fd = new FormData();
      fd.append("hostel_name", values.hostel_name);
      fd.append("owner_name", values.owner_name);
      fd.append("mobile", values.mobile);
      fd.append("email", values.email);
      fd.append("address", values.address);
      fd.append("city", values.city);
      fd.append("state", values.state);
      fd.append("pincode", values.pincode);
      if (values.gst_number) fd.append("gst_number", values.gst_number);
      if (values.description) fd.append("description", values.description);

      await updateMutation.mutateAsync(fd);
      setSuccessMsg("Hostel profile parameters saved successfully!");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || "Failed to update hostel profile.");
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    if (profile) {
      reset({
        hostel_name: profile.hostel_name,
        owner_name: profile.owner_name,
        mobile: profile.mobile,
        email: profile.email,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        gst_number: profile.gst_number || "",
        description: profile.description || ""
      });
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
        <div className="flex items-center gap-2 p-3.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-xl text-xs font-bold uppercase tracking-wider border border-green-100 dark:border-green-950/30">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-100 dark:border-red-950/30">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Hostel Name *"
          placeholder="e.g. Bhagirathi Premium Hostel"
          error={errors.hostel_name?.message}
          {...register("hostel_name")}
        />

        <Input
          label="Owner / Contact Person Name *"
          placeholder="e.g. Rajesh Kumar"
          error={errors.owner_name?.message}
          {...register("owner_name")}
        />

        <Input
          label="Mobile Number *"
          placeholder="e.g. 9876543210"
          error={errors.mobile?.message}
          {...register("mobile")}
        />

        <Input
          label="Email Address *"
          type="email"
          placeholder="e.g. contact@bhagirathipg.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="md:col-span-2">
          <Input
            label="Address *"
            placeholder="e.g. 123 Main St, Sector 62"
            error={errors.address?.message}
            {...register("address")}
          />
        </div>

        <Input
          label="City *"
          placeholder="Noida"
          error={errors.city?.message}
          {...register("city")}
        />

        <Input
          label="State *"
          placeholder="Uttar Pradesh"
          error={errors.state?.message}
          {...register("state")}
        />

        <Input
          label="Pincode *"
          placeholder="e.g. 201301"
          error={errors.pincode?.message}
          {...register("pincode")}
        />

        <Input
          label="GST Number (Optional)"
          placeholder="e.g. 09AAAAA1111A1Z1"
          error={errors.gst_number?.message}
          {...register("gst_number")}
        />

        <div className="md:col-span-2 space-y-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Hostel Description
          </label>
          <textarea
            {...register("description")}
            className="w-full min-h-[90px] p-2.5 bg-gray-50 dark:bg-gray-955 border border-gray-250 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
            placeholder="Short details about default policies or visual location markers..."
          />
        </div>
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
          Save Profile
        </Button>
      </div>
    </form>
  );
};

export default HostelProfileForm;

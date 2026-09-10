import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { maintenanceStaffSchema } from "@bhagirathi/validation";
import { Modal, Button, Input } from "@bhagirathi/ui";
import { useHostels } from "../../hostel/hooks/api/useHostel";
import { ChevronRight, ChevronLeft, Building } from "lucide-react";

interface MaintenanceStaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

export const MaintenanceStaffForm: React.FC<MaintenanceStaffFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}) => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  
  const { data: hostels } = useHostels();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(maintenanceStaffSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      department: "GENERAL",
      assigned_building_ids: "[]",
      notes: "",
      password: "",
      confirm_password: "",
      force_password_change: true,
    }
  });

  const watchedEmail = watch("email");
  const watchedPassword = watch("password") || "";

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setShowPassword(false);
      
      if (initialData) {
        let parsedBuildings: string[] = [];
        try {
          if (initialData.assigned_building_ids) {
            parsedBuildings = JSON.parse(initialData.assigned_building_ids);
          }
        } catch {}
        setSelectedBuildings(parsedBuildings);

        reset({
          full_name: initialData.full_name || "",
          phone: initialData.phone || "",
          email: initialData.email || "",
          department: initialData.department || "GENERAL",
          assigned_building_ids: initialData.assigned_building_ids || "[]",
          notes: initialData.notes || "",
          password: "",
          confirm_password: "",
          force_password_change: false,
        });
      } else {
        setSelectedBuildings([]);
        reset({
          full_name: "",
          phone: "",
          email: "",
          department: "GENERAL",
          assigned_building_ids: "[]",
          notes: "",
          password: "",
          confirm_password: "",
          force_password_change: true,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  useEffect(() => {
    setValue("assigned_building_ids", JSON.stringify(selectedBuildings));
  }, [selectedBuildings, setValue]);

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = ["full_name", "phone", "email", "department"];
    } else if (step === 3) {
      fieldsToValidate = ["password", "confirm_password"];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (step === 2 && initialData) {
        setStep(4);
      } else {
        setStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (step === 4 && initialData) {
      setStep(2);
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const toggleBuilding = (id: string) => {
    setSelectedBuildings((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const onLocalSubmit = (data: any) => {
    const payload = { ...data };
    if (initialData) {
      delete payload.password;
      delete payload.confirm_password;
      delete payload.force_password_change;
    }
    onSubmit(payload);
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;
    return score;
  };
  const pwdStrength = getPasswordStrength(watchedPassword);
  const getStrengthLabel = (score: number) => {
    if (score === 0) return { label: "", color: "bg-gray-200" };
    if (score <= 2) return { label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { label: "Medium", color: "bg-orange-500" };
    return { label: "Strong", color: "bg-green-500" };
  };
  const strengthInfo = getStrengthLabel(pwdStrength);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Staff Details" : "Register Maintenance Staff"}
      className="max-w-2xl"
    >
      <div className="flex gap-4 select-none">
        <div className="w-1/4 border-r pr-4 hidden md:block space-y-4 font-bold text-[10px] uppercase tracking-wider border-gray-100 dark:border-gray-800">
          {[
            "Staff Details",
            "Assigned Buildings",
            ...(!initialData ? ["Login Credentials"] : []),
            "Review & Save"
          ].map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div
                key={stepNum}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400"
                    : isCompleted
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-xxs font-black border ${
                    isActive
                      ? "border-red-500 bg-red-500 text-white"
                      : isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  {isCompleted ? "✓" : stepNum}
                </div>
                <span>{title}</span>
              </div>
            );
          })}
        </div>

        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit(onLocalSubmit)} className="space-y-4">
            
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest border-b pb-1">
                  Employee Profile Details
                </h4>
                <Input
                  label="Employee Name *"
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  error={errors.full_name?.message as string}
                  {...register("full_name")}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Phone Number *"
                    type="text"
                    placeholder="10 digit number"
                    error={errors.phone?.message as string}
                    {...register("phone")}
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="e.g. staff@bhagirathi.com"
                    error={errors.email?.message as string}
                    {...register("email")}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Department *</label>
                  <select
                    {...register("department")}
                    className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="GENERAL">General Maintenance</option>
                    <option value="ELECTRICAL">Electrical Department</option>
                    <option value="PLUMBING">Plumbing Department</option>
                    <option value="CLEANING">Housekeeping & Cleaning</option>
                    <option value="CARPENTRY">Carpentry & Structural</option>
                    <option value="SECURITY">Security Division</option>
                  </select>
                </div>
                <Input
                  label="Private Memo Notes"
                  type="text"
                  placeholder="Optional details..."
                  error={errors.notes?.message as string}
                  {...register("notes")}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest border-b pb-1">
                  Assigned Facility Buildings
                </h4>
                
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {hostels && hostels.length > 0 ? (
                    hostels.map((h: any) => (
                      <div key={h.id} className="p-3 bg-gray-50/50 dark:bg-gray-955/10 border border-gray-150 dark:border-gray-800 rounded-xl space-y-2">
                        <div className="text-xxs font-black text-gray-400 uppercase tracking-wider">{h.name} ({h.type})</div>
                        <div className="grid grid-cols-2 gap-2">
                          {h.buildings?.map((b: any) => (
                            <label
                              key={b.id}
                              className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-bold cursor-pointer transition select-none ${
                                selectedBuildings.includes(b.id)
                                  ? "bg-red-50/30 border-red-500 text-red-650 dark:bg-red-955/10 dark:text-red-400"
                                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-955/15"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedBuildings.includes(b.id)}
                                onChange={() => toggleBuilding(b.id)}
                                className="hidden"
                              />
                              <Building className="h-4 w-4 shrink-0" />
                              <span>{b.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xxs text-gray-400">No hostels or buildings registered in system.</p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && !initialData && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest border-b pb-1">
                  Staff Login Account
                </h4>
                <Input
                  label="Login Username / ID (Email)"
                  type="text"
                  value={watchedEmail}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label="Account Password *"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      error={errors.password?.message as string}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[34px] text-xxs font-bold text-gray-400 hover:text-gray-650 dark:hover:text-gray-200"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <Input
                    label="Confirm Password *"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    error={errors.confirm_password?.message as string}
                    {...register("confirm_password")}
                  />
                </div>

                {watchedPassword && (
                  <div className="space-y-1.5 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-lg">
                    <div className="flex justify-between items-center text-xxs font-semibold">
                      <span className="text-gray-500">Password Strength:</span>
                      <span className={
                        pwdStrength <= 2 ? "text-red-500" : pwdStrength <= 4 ? "text-orange-500" : "text-green-500"
                      }>
                        {strengthInfo.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthInfo.color} transition-all duration-300`}
                        style={{ width: `${(pwdStrength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="force_password_change"
                    className="accent-primary h-4 w-4 rounded cursor-pointer"
                    {...register("force_password_change")}
                  />
                  <label htmlFor="force_password_change" className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                    Force Password Change on First Login
                  </label>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-fade-in font-semibold text-xs text-gray-700 dark:text-gray-300">
                <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest border-b pb-1">
                  Onboarding Review
                </h4>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-xl space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-450 font-bold">Employee Name:</span>
                    <span className="text-gray-900 dark:text-white font-bold">{watch("full_name")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-450 font-bold">Mobile Phone:</span>
                    <span>{watch("phone")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-450 font-bold">Email Address:</span>
                    <span>{watch("email")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-450 font-bold">Department:</span>
                    <span className="text-red-600 dark:text-red-400 uppercase font-black text-[10px]">{watch("department")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-450 font-bold">Assigned Buildings:</span>
                    <span>{selectedBuildings.length} building(s) selected</span>
                  </div>
                  {!initialData && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-800 text-xxs">
                      <span className="text-gray-450 font-black uppercase tracking-wider">Force Password Change:</span>
                      <span className={watch("force_password_change") ? "text-green-600" : "text-gray-400"}>
                        {watch("force_password_change") ? "ENABLED" : "DISABLED"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-150 dark:border-gray-800">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                  className="flex-1 font-bold"
                  disabled={isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1 inline" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1 font-bold"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 font-bold"
                >
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-1 inline" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 font-bold"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {initialData ? "Save Changes" : "Confirm Onboarding"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

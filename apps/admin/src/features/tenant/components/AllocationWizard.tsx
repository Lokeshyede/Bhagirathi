import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { tenantSchema } from "@bhagirathi/validation";
import { Modal, Button, Input } from "@bhagirathi/ui";
import { FileCheck, Upload, ChevronRight, ChevronLeft } from "lucide-react";
import { parseApiError } from "@bhagirathi/utils";

import { useHostels, useBuildings, useFloors, useRooms, useBeds } from "../../hostel/hooks/api/useHostel";
import { useTenantMutations } from "../hooks/api/useTenant";
import { useAllocationMutations } from "../hooks/api/useAllocation";
import { RoomOccupancyCard } from "./RoomOccupancyCard";
import { BedStatusGrid } from "./BedStatusGrid";

interface AllocationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: {
    hostel_id: string;
    building_id: string;
    floor_id: string;
    room_id: string;
    bed_id: string;
  };
}

// Combined state schema for wizard tracking
const wizardSchema = tenantSchema.extend({
  hostel_id: z.string().uuid("Select a hostel"),
  building_id: z.string().uuid("Select a building"),
  floor_id: z.string().uuid("Select a floor"),
  room_id: z.string().uuid("Select a room"),
  bed_id: z.string().uuid("Select a bed"),
  checkin_date: z.string().min(1, "Check-in date is required"),
  agreement_start_date: z.string().min(1, "Agreement start date is required"),
  agreement_end_date: z.string().min(1, "Agreement end date is required"),
  security_deposit: z.coerce.number().min(0, "Deposit must be positive"),
  monthly_rent: z.coerce.number().min(0, "Rent must be positive"),
  remarks: z.string().optional().nullable(),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
  confirm_password: z.string(),
  force_password_change: z.boolean().default(true),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type WizardInput = z.infer<typeof wizardSchema>;

export const AllocationWizard: React.FC<AllocationWizardProps> = ({ 
  isOpen, 
  onClose,
  initialValues
}) => {
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Document staging — files are selected and previewed here, then uploaded
  // to Cloudinary AFTER the tenant record is created (so we have a tenant ID).
  // Each entry: type = DocumentType enum value, file = File object (not a fake path).
  const [stagedDocs, setStagedDocs] = useState<Array<{ type: string; file: File }>>([]);
  const [docType, setDocType] = useState<string>("AADHAAR_FRONT");
  const [, setUploadingDocs] = useState<boolean>(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const { createTenantWithAccount } = useTenantMutations();
  const { allocateBed } = useAllocationMutations();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<WizardInput>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      full_name: "",
      gender: "MALE",
      dob: "",
      mobile: "",
      email: "",
      aadhaar_number: "",
      guardian_name: "",
      guardian_mobile: "",
      emergency_contact: "",
      permanent_address: "",
      current_address: "",
      occupation: "STUDENT",
      company_college: "",
      blood_group: "",
      joining_date: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      hostel_id: "",
      building_id: "",
      floor_id: "",
      room_id: "",
      bed_id: "",
      checkin_date: new Date().toISOString().split("T")[0],
      agreement_start_date: new Date().toISOString().split("T")[0],
      agreement_end_date: new Date(new Date().setMonth(new Date().getMonth() + 11)).toISOString().split("T")[0],
      security_deposit: 5000,
      monthly_rent: 0,
      remarks: "",
      password: "",
      confirm_password: "",
      force_password_change: true,
    },
  });

  const watchedHostel = watch("hostel_id");
  const watchedBuilding = watch("building_id");
  const watchedFloor = watch("floor_id");
  const watchedRoom = watch("room_id");
  const watchedBed = watch("bed_id");
  const watchedPassword = watch("password") || "";

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

  // Cascading queries
  const { data: hostels } = useHostels();
  const { data: buildings } = useBuildings(watchedHostel || null);
  const { data: floors } = useFloors(watchedBuilding || null);
  const { data: rooms } = useRooms(watchedFloor || null);
  const { data: beds } = useBeds(watchedRoom || null);

  // Auto-reset selectors (guarded by initialValues check to allow pre-population)
  useEffect(() => {
    if (initialValues?.hostel_id !== watchedHostel) {
      setValue("building_id", "");
      setValue("floor_id", "");
      setValue("room_id", "");
      setValue("bed_id", "");
    }
  }, [watchedHostel, setValue, initialValues]);

  useEffect(() => {
    if (initialValues?.building_id !== watchedBuilding) {
      setValue("floor_id", "");
      setValue("room_id", "");
      setValue("bed_id", "");
    }
  }, [watchedBuilding, setValue, initialValues]);

  useEffect(() => {
    if (initialValues?.floor_id !== watchedFloor) {
      setValue("room_id", "");
      setValue("bed_id", "");
    }
  }, [watchedFloor, setValue, initialValues]);

  useEffect(() => {
    if (initialValues?.room_id !== watchedRoom) {
      setValue("bed_id", "");
    }
  }, [watchedRoom, setValue, initialValues]);

  // Removed auto-populate of monthly_rent.
  // We should NOT prefill monthly_rent with the full room_rent because for EQUAL split rooms,
  // the RentConfigService calculates the rent dynamically. Setting this field creates a FIXED override.
  // The user should only fill this if they explicitly want to override the tenant's rent.

  // Form Reset / Initial State on Open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      if (initialValues) {
        reset({
          full_name: "",
          gender: "MALE",
          dob: "",
          mobile: "",
          email: "",
          aadhaar_number: "",
          guardian_name: "",
          guardian_mobile: "",
          emergency_contact: "",
          permanent_address: "",
          current_address: "",
          occupation: "STUDENT",
          company_college: "",
          blood_group: "",
          joining_date: new Date().toISOString().split("T")[0],
          status: "ACTIVE",
          hostel_id: initialValues.hostel_id,
          building_id: initialValues.building_id,
          floor_id: initialValues.floor_id,
          room_id: initialValues.room_id,
          bed_id: initialValues.bed_id,
          checkin_date: new Date().toISOString().split("T")[0],
          agreement_start_date: new Date().toISOString().split("T")[0],
          agreement_end_date: new Date(new Date().setMonth(new Date().getMonth() + 11)).toISOString().split("T")[0],
          security_deposit: 5000,
          monthly_rent: 0,
          remarks: "",
          password: "",
          confirm_password: "",
          force_password_change: true,
        });
        setStep(3); // Jump to Agreement parameters
      } else {
        reset({
          full_name: "",
          gender: "MALE",
          dob: "",
          mobile: "",
          email: "",
          aadhaar_number: "",
          guardian_name: "",
          guardian_mobile: "",
          emergency_contact: "",
          permanent_address: "",
          current_address: "",
          occupation: "STUDENT",
          company_college: "",
          blood_group: "",
          joining_date: new Date().toISOString().split("T")[0],
          status: "ACTIVE",
          hostel_id: "",
          building_id: "",
          floor_id: "",
          room_id: "",
          bed_id: "",
          checkin_date: new Date().toISOString().split("T")[0],
          agreement_start_date: new Date().toISOString().split("T")[0],
          agreement_end_date: new Date(new Date().setMonth(new Date().getMonth() + 11)).toISOString().split("T")[0],
          security_deposit: 5000,
          monthly_rent: 0,
          remarks: "",
          password: "",
          confirm_password: "",
          force_password_change: true,
        });
        setStep(1);
      }
    }
  }, [isOpen, initialValues, reset]);

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = ["full_name", "gender", "dob", "mobile", "email", "aadhaar_number", "permanent_address", "occupation", "joining_date"];
    } else if (step === 2) {
      fieldsToValidate = ["guardian_name", "guardian_mobile"];
    } else if (step === 4) {
      fieldsToValidate = ["hostel_id", "building_id", "floor_id", "room_id", "bed_id"];
    } else if (step === 5) {
      fieldsToValidate = ["password", "confirm_password"];
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  /** Stage a selected file for upload (BUG-004: real file, not fake path string) */
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PNG, JPG, JPEG, WEBP, PDF)
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadErrors([`Unsupported file type: ${file.type}. Allowed: PNG, JPG, WEBP, PDF`]);
      e.target.value = "";
      return;
    }
    // Validate file size (max 10 MB)
    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadErrors([`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: ${MAX_SIZE_MB} MB`]);
      e.target.value = "";
      return;
    }

    setUploadErrors([]);
    setStagedDocs((prev) => [...prev, { type: docType, file }]);
    // Reset the file input so the same file can be re-selected if needed
    e.target.value = "";
  };

  const handleRemoveDoc = (index: number) => {
    setStagedDocs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const onWizardSubmit = async (data: WizardInput) => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      // 1. Create Tenant Profile and Account atomically
      const result = await createTenantWithAccount.mutateAsync({
        tenant: {
          full_name: data.full_name,
          phone: data.mobile,
          email: data.email,
          photo_url: data.photo_url || null,
          gender: data.gender || null,
          dob: data.dob || null,
          aadhaar_number: data.aadhaar_number || null,
          guardian_name: data.guardian_name || null,
          guardian_phone: data.guardian_mobile || null,
          emergency_contact: data.emergency_contact || null,
          permanent_address: data.permanent_address || null,
          current_address: data.current_address || null,
          occupation: data.occupation || null,
          company_college: data.company_college || null,
          blood_group: data.blood_group || null,
          joining_date: data.joining_date || null,
          status: data.status || "ACTIVE",
        },
        temporary_password: data.password,
        force_password_change: data.force_password_change ?? true,
      });

      const tenantId = result.id;

      // 2. Perform Bed Allocation Check-in
      await allocateBed.mutateAsync({
        tenant_id: tenantId,
        hostel_id: data.hostel_id,
        building_id: data.building_id,
        floor_id: data.floor_id,
        room_id: data.room_id,
        bed_id: data.bed_id,
        allocation_date: data.checkin_date,
        monthly_rent: data.monthly_rent,
        security_deposit: data.security_deposit,
        agreement_start_date: data.agreement_start_date,
        agreement_end_date: data.agreement_end_date,
        remarks: data.remarks,
      });

      // 3. Upload staged documents to Cloudinary via multipart form upload
      // BUG-004 fix: use the real file upload endpoint instead of fake file paths.
      if (stagedDocs.length > 0) {
        setUploadingDocs(true);
        const { apiClient } = await import("@bhagirathi/api-client");
        const docErrors: string[] = [];

        for (const doc of stagedDocs) {
          try {
            const formData = new FormData();
            formData.append("document_type", doc.type);
            formData.append("file", doc.file);

            await apiClient.post(
              `/api/v1/tenants/${tenantId}/documents/upload`,
              formData,
              { headers: { "Content-Type": "multipart/form-data" } }
            );
          } catch (docErr: any) {
            // Collect individual upload errors but continue with other documents
            const errMsg = docErr?.response?.data?.detail || `Failed to upload ${doc.file.name}`;
            docErrors.push(errMsg);
          }
        }

        setUploadingDocs(false);
        if (docErrors.length > 0) {
          setUploadErrors(docErrors);
          // Non-fatal: tenant was created and bed allocated; just report upload failures
        }
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(parseApiError(err, "Verification failed. Check parameters and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Intelligent Allocation Wizard"
      className="max-w-3xl"
    >
      <div className="flex gap-4 select-none">
        {/* Sidebar steps tracker */}
        <div className="w-1/4 border-r pr-4 hidden md:block space-y-4 font-semibold text-xs border-gray-100 dark:border-gray-800">
          {[
            "Personal Information",
            "Guardian Contacts",
            "Identity Documents",
            "Room & Bed Allocation",
            "Login Credentials",
            "Contract Parameters",
          ].map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div
                key={stepNum}
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                    : isCompleted
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-xxs font-black border ${
                    isActive
                      ? "border-indigo-500 bg-indigo-500 text-white"
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

        {/* Wizard step form panels */}
        <div className="flex-1 min-w-0">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900 rounded-lg text-xxs font-semibold text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onWizardSubmit)} className="space-y-4">
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest border-b pb-1">
                  Personal Information
                </h4>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  error={errors.full_name?.message}
                  {...register("full_name")}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Gender</label>
                    <select
                      {...register("gender")}
                      className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-700 dark:text-gray-350 focus:outline-none cursor-pointer"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <Input
                    label="Date of Birth"
                    type="date"
                    error={errors.dob?.message}
                    {...register("dob")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Mobile"
                    type="text"
                    placeholder="e.g. 9876543210"
                    error={errors.mobile?.message}
                    {...register("mobile")}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. name@domain.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Aadhaar Number"
                    type="text"
                    placeholder="12 digit ID"
                    error={errors.aadhaar_number?.message}
                    {...register("aadhaar_number")}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Blood Group</label>
                    <select
                      {...register("blood_group")}
                      className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-700 dark:text-gray-350 focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Optional</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="O+">O+</option>
                      <option value="AB+">AB+</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="O-">O-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
                <Input
                  label="Permanent Address"
                  type="text"
                  placeholder="Address details..."
                  error={errors.permanent_address?.message}
                  {...register("permanent_address")}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Occupation"
                    type="text"
                    error={errors.occupation?.message}
                    {...register("occupation")}
                  />
                  <Input
                    label="Joining Date"
                    type="date"
                    error={errors.joining_date?.message}
                    {...register("joining_date")}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Guardian Details */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest border-b pb-1">
                  Guardian & Contacts
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Guardian Name"
                    type="text"
                    error={errors.guardian_name?.message}
                    {...register("guardian_name")}
                  />
                  <Input
                    label="Guardian Mobile"
                    type="text"
                    error={errors.guardian_mobile?.message}
                    {...register("guardian_mobile")}
                  />
                </div>
                <Input
                  label="Emergency Contact Alternative"
                  type="text"
                  placeholder="Alternative details..."
                  error={errors.emergency_contact?.message}
                  {...register("emergency_contact")}
                />
              </div>
            )}

            {/* Step 3: Document Uploader — BUG-004 fix: real file upload */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest border-b pb-1">
                  Identity & Credential Documents
                </h4>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload tenant documents (Aadhaar, photo, agreement). Files are uploaded to secure cloud storage after the tenant account is created. This step is optional — documents can be added later from the tenant profile.
                </p>

                {/* Upload errors */}
                {uploadErrors.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
                    {uploadErrors.map((err, i) => (
                      <p key={i} className="text-xs text-red-600 dark:text-red-400 font-semibold">{err}</p>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Document Type</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-xs font-semibold text-gray-750 dark:text-gray-300 focus:outline-none cursor-pointer"
                      >
                        <option value="AADHAAR_FRONT">Aadhaar — Front Side</option>
                        <option value="AADHAAR_BACK">Aadhaar — Back Side</option>
                        <option value="PHOTO">Passport Photo</option>
                        <option value="AGREEMENT">Agreement PDF</option>
                        <option value="OTHER">Other Document</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Select File <span className="text-gray-400 font-normal">(PNG, JPG, WEBP, PDF · max 10 MB)</span>
                      </label>
                      <label className="h-10 px-3 flex items-center gap-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs font-semibold text-[#E53935] cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/10 transition">
                        <Upload className="h-4 w-4 shrink-0" />
                        <span>Choose file...</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,application/pdf"
                          className="sr-only"
                          onChange={handleFileSelected}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Staged documents list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stagedDocs.length === 0 ? (
                    <div className="col-span-2 py-6 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-400 text-xs flex flex-col items-center justify-center gap-1">
                      <Upload className="h-6 w-6 opacity-40" />
                      <span>No documents staged yet. Select a file above to add.</span>
                    </div>
                  ) : (
                    stagedDocs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 rounded-lg">
                            <FileCheck className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-gray-850 dark:text-white truncate">
                              {doc.type.replace(/_/g, " ")}
                            </div>
                            <div className="text-xxs text-gray-400 truncate mt-0.5">
                              {doc.file.name} · {(doc.file.size / 1024).toFixed(0)} KB
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(idx)}
                          className="text-xxs text-red-500 font-bold hover:text-red-700 ml-2 shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Room & Bed Selector */}
            {step === 4 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest border-b pb-1">
                  Facility Allocation
                </h4>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Hostel</label>
                    <select
                      {...register("hostel_id")}
                      className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Hostel</option>
                      {hostels?.map((h: any) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Building</label>
                    <select
                      {...register("building_id")}
                      disabled={!watchedHostel}
                      className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-750 dark:text-gray-300 focus:outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select Building</option>
                      {buildings?.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Floor</label>
                    <select
                      {...register("floor_id")}
                      disabled={!watchedBuilding}
                      className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-750 dark:text-gray-300 focus:outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select Floor</option>
                      {floors?.map((f: any) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {watchedFloor && (
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-gray-750 dark:text-gray-300 block">Select Room</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {rooms?.map((rm: any) => {
                        const activeBeds = rm.beds || [];
                        const occupiedBedsCount = activeBeds.filter((b: any) => b.occupancy_status === "OCCUPIED").length;
                        const vacantBedsCount = activeBeds.filter((b: any) => b.occupancy_status === "VACANT" && b.bed_status === "AVAILABLE" && b.is_active).length;

                        return (
                          <RoomOccupancyCard
                            key={rm.id}
                            roomNumber={rm.room_number}
                            roomType={rm.room_type}
                            capacity={rm.capacity}
                            occupiedCount={occupiedBedsCount}
                            vacantCount={vacantBedsCount}
                            status={rm.status}
                            isSelected={watchedRoom === rm.id}
                            onClick={() => setValue("room_id", rm.id)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {watchedRoom && (
                  <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <label className="text-xs font-semibold text-gray-750 dark:text-gray-300 block">Select Bed</label>
                    {beds && beds.length > 0 ? (
                      <BedStatusGrid
                        beds={beds}
                        selectedBedId={watchedBed}
                        onSelectBed={(bedId) => setValue("bed_id", bedId)}
                      />
                    ) : (
                      <p className="text-xxs text-gray-400">Loading beds in Room...</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Login Credentials */}
            {step === 5 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest border-b pb-1">
                  Login Credentials
                </h4>
                <Input
                  label="Login Email Address *"
                  type="email"
                  placeholder="e.g. tenant@domain.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label="Password *"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      error={errors.password?.message}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[34px] text-xxs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <Input
                    label="Confirm Password *"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    error={errors.confirm_password?.message}
                    {...register("confirm_password")}
                  />
                </div>

                {/* Password Strength Meter */}
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
                    <ul className="text-[10px] text-gray-455 dark:text-gray-400 list-disc list-inside space-y-0.5 mt-1 font-medium">
                      <li className={watchedPassword.length >= 8 ? "text-green-600 dark:text-green-400" : "text-gray-400"}>
                        At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(watchedPassword) ? "text-green-600 dark:text-green-400" : "text-gray-400"}>
                        At least one uppercase letter (A-Z)
                      </li>
                      <li className={/[a-z]/.test(watchedPassword) ? "text-green-600 dark:text-green-400" : "text-gray-400"}>
                        At least one lowercase letter (a-z)
                      </li>
                      <li className={/[0-9]/.test(watchedPassword) ? "text-green-600 dark:text-green-400" : "text-gray-400"}>
                        At least one number (0-9)
                      </li>
                      <li className={/[@$!%*?&]/.test(watchedPassword) ? "text-green-600 dark:text-green-400" : "text-gray-400"}>
                        At least one special character (@$!%*?&)
                      </li>
                    </ul>
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

            {/* Step 6: Rent & Contract */}
            {step === 6 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest border-b pb-1">
                  Contractual Variables
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Check-In Date"
                    type="date"
                    error={errors.checkin_date?.message}
                    {...register("checkin_date")}
                  />
                  <Input
                    label="Agreement Start Date"
                    type="date"
                    error={errors.agreement_start_date?.message}
                    {...register("agreement_start_date")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Agreement End Date"
                    type="date"
                    error={errors.agreement_end_date?.message}
                    {...register("agreement_end_date")}
                  />
                  <div className="space-y-1 sm:col-span-2">
                    <Input
                      label="Custom Rent Override (₹)"
                      type="number"
                      placeholder="Leave empty for auto-calculation"
                      error={errors.monthly_rent?.message}
                      {...register("monthly_rent", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <Input
                  label="Security Deposit (INR)"
                  type="number"
                  error={errors.security_deposit?.message}
                  {...register("security_deposit")}
                />
                <Input
                  label="Remarks"
                  type="text"
                  placeholder="Optional annotations..."
                  error={errors.remarks?.message}
                  {...register("remarks")}
                />
              </div>
            )}

            {/* Wizard Navigation Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-150 dark:border-gray-800">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                  className="flex-1 cursor-pointer font-semibold"
                  disabled={submitting}
                >
                  <ChevronLeft className="h-4 w-4 mr-1 inline" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1 cursor-pointer font-semibold"
                  disabled={submitting}
                >
                  Cancel
                </Button>
              )}

              {step < 6 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 font-semibold cursor-pointer"
                >
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-1 inline" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 font-semibold cursor-pointer"
                  isLoading={submitting}
                  disabled={submitting}
                >
                  Confirm Registration & Allocation
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
export default AllocationWizard;

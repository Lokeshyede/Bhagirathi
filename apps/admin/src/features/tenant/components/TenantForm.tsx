import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tenantSchema, TenantInput } from "@bhagirathi/validation";
import { Modal, Button, Input } from "@bhagirathi/ui";
import { User, Phone, MapPin, Landmark } from "lucide-react";

interface TenantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TenantInput) => void;
  initialData?: any;
  isLoading?: boolean;
}

export const TenantForm: React.FC<TenantFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantInput>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      full_name: initialData?.full_name || "",
      gender: initialData?.gender || "MALE",
      dob: initialData?.dob || "",
      mobile: initialData?.mobile || "",
      email: initialData?.email || "",
      aadhaar_number: initialData?.aadhaar_number || "",
      guardian_name: initialData?.guardian_name || "",
      guardian_mobile: initialData?.guardian_mobile || "",
      emergency_contact: initialData?.emergency_contact || "",
      permanent_address: initialData?.permanent_address || "",
      current_address: initialData?.current_address || "",
      occupation: initialData?.occupation || "",
      company_college: initialData?.company_college || "",
      blood_group: initialData?.blood_group || "",
      joining_date: initialData?.joining_date || new Date().toISOString().split("T")[0],
      status: initialData?.status || "ACTIVE",
    },
  });

  const sectionHeaderClass = "text-[10px] font-bold text-secondaryText dark:text-gray-400 uppercase tracking-widest border-b border-border dark:border-gray-800 pb-2 mb-3.5 flex items-center gap-2 select-none";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Tenant Profile" : "Register New Tenant"}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
        
        {/* Section 1: Personal Details */}
        <div className="bg-gray-50/20 dark:bg-gray-950/20 border border-border dark:border-gray-855 rounded-card p-4">
          <h4 className={sectionHeaderClass}>
            <User className="h-4 w-4 text-primary" />
            <span>Personal Details</span>
          </h4>
          
          <div className="space-y-4">
            <Input
              label="Full Name *"
              type="text"
              placeholder="e.g. Ramesh Kumar"
              error={errors.full_name?.message}
              autoFocus
              {...register("full_name")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 select-none">
                <label className="text-xs font-bold text-secondaryText dark:text-gray-300">Gender Policy *</label>
                <select
                  {...register("gender")}
                  className="admin-select"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <Input
                label="Date of Birth *"
                type="date"
                error={errors.dob?.message}
                {...register("dob")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Number *"
                type="text"
                placeholder="10 digit contact"
                error={errors.mobile?.message}
                {...register("mobile")}
              />

              <Input
                label="Email Address *"
                type="email"
                placeholder="e.g. name@domain.com"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Aadhaar Card Number *"
                type="text"
                placeholder="12 digit identifier"
                error={errors.aadhaar_number?.message}
                {...register("aadhaar_number")}
              />

              <div className="flex flex-col gap-1.5 select-none">
                <label className="text-xs font-bold text-secondaryText dark:text-gray-300">Blood Group</label>
                <select
                  {...register("blood_group")}
                  className="admin-select"
                >
                  <option value="">Select (Optional)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Emergency Contact */}
        <div className="bg-gray-50/20 dark:bg-gray-955/10 border border-border dark:border-gray-855 rounded-card p-4">
          <h4 className={sectionHeaderClass}>
            <Phone className="h-4 w-4 text-warning" />
            <span>Emergency Contacts</span>
          </h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Guardian Name *"
                type="text"
                placeholder="Parent/Guardian Name"
                error={errors.guardian_name?.message}
                {...register("guardian_name")}
              />

              <Input
                label="Guardian Mobile *"
                type="text"
                placeholder="Guardian phone number"
                error={errors.guardian_mobile?.message}
                {...register("guardian_mobile")}
              />
            </div>

            <Input
              label="Emergency Contact (Alternative)"
              type="text"
              placeholder="Alternative Contact details"
              error={errors.emergency_contact?.message}
              {...register("emergency_contact")}
            />
          </div>
        </div>

        {/* Section 3: Addresses */}
        <div className="bg-gray-50/20 dark:bg-gray-955/10 border border-border dark:border-gray-855 rounded-card p-4">
          <h4 className={sectionHeaderClass}>
            <MapPin className="h-4 w-4 text-info" />
            <span>Address Details</span>
          </h4>
          
          <div className="space-y-4">
            <Input
              label="Permanent Address *"
              type="text"
              placeholder="House no, Street, State, Pin Code"
              error={errors.permanent_address?.message}
              {...register("permanent_address")}
            />

            <Input
              label="Current Address"
              type="text"
              placeholder="Leave empty if same as permanent address"
              error={errors.current_address?.message}
              {...register("current_address")}
            />
          </div>
        </div>

        {/* Section 4: Occupation & Join Details */}
        <div className="bg-gray-50/20 dark:bg-gray-955/10 border border-border dark:border-gray-855 rounded-card p-4">
          <h4 className={sectionHeaderClass}>
            <Landmark className="h-4 w-4 text-success" />
            <span>Occupation & Join Settings</span>
          </h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Occupation"
                type="text"
                placeholder="e.g. Student / Software Engineer"
                error={errors.occupation?.message}
                {...register("occupation")}
              />

              <Input
                label="Company / College Name"
                type="text"
                placeholder="Institution details"
                error={errors.company_college?.message}
                {...register("company_college")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Joining Date *"
                type="date"
                error={errors.joining_date?.message}
                {...register("joining_date")}
              />

              <div className="flex flex-col gap-1.5 select-none">
                <label className="text-xs font-bold text-secondaryText dark:text-gray-300">Status *</label>
                <select
                  {...register("status")}
                  className="admin-select"
                >
                  <option value="ACTIVE">Active Profile</option>
                  <option value="INACTIVE">Inactive Profile</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border dark:border-gray-800 select-none">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 cursor-pointer font-bold h-9.5"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 font-bold cursor-pointer h-9.5 text-white"
            isLoading={isLoading}
          >
            {initialData ? "Save Profile" : "Register Profile"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TenantForm;

import React, { useState } from "react";
import { Modal, Button, Input } from "@bhagirathi/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminResetPasswordSchema } from "@bhagirathi/validation";
import { Shuffle, Check, Copy } from "lucide-react";

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
  user: any;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(adminResetPasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
      force_password_change: true,
    }
  });

  const watchedPassword = watch("new_password");

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
    let pwd = "";
    // Ensure strength requirements are met
    pwd += "A"[0];
    pwd += "a"[0];
    pwd += "1"[0];
    pwd += "@"[0];
    for (let i = 0; i < 9; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const shuffled = pwd.split("").sort(() => 0.5 - Math.random()).join("");
    setValue("new_password", shuffled);
    setValue("confirm_password", shuffled);
  };

  const handleCopy = () => {
    if (watchedPassword) {
      navigator.clipboard.writeText(watchedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const onLocalSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await onConfirm(data);
      reset();
      onClose();
    } catch {
      alert("Failed to reset password. Please satisfy password criteria.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset User Password"
      className="max-w-md"
    >
      {user && (
        <form onSubmit={handleSubmit(onLocalSubmit)} className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 font-semibold">
              You are resetting the login password for:
            </p>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-lg text-xs font-bold">
              <div className="text-gray-900 dark:text-white">{user.full_name}</div>
              <div className="text-secondaryText dark:text-gray-400 font-medium">{user.email}</div>
            </div>
          </div>

          <div className="relative">
            <Input
              label="New Password *"
              type="text"
              placeholder="Enter secure password"
              error={errors.new_password?.message}
              {...register("new_password")}
            />
            <div className="absolute right-2 top-[34px] flex gap-1">
              {watchedPassword && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500"
                  title="Copy password"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              )}
              <button
                type="button"
                onClick={generateRandomPassword}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500"
                title="Generate Random"
              >
                <Shuffle className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Input
            label="Confirm New Password *"
            type="text"
            placeholder="Confirm secure password"
            error={errors.confirm_password?.message}
            {...register("confirm_password")}
          />

          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-lg select-none">
            <input
              type="checkbox"
              id="reset_force_password"
              className="accent-primary h-4 w-4 rounded cursor-pointer"
              {...register("force_password_change")}
            />
            <label htmlFor="reset_force_password" className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              Force Password Change on Next Login
            </label>
          </div>

          <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 font-bold"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 font-bold"
              isLoading={submitting}
              disabled={submitting}
            >
              Update Password
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
export default ResetPasswordDialog;

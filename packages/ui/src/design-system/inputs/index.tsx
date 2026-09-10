import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Search, UploadCloud, X, Check, AlertTriangle } from "lucide-react";
import { cn } from "../utils";
import { Icon } from "../icons";

export interface BaseInputProps {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  isLoading?: boolean;
}

// 1. TEXT INPUT
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseInputProps {
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, success, helperText, isLoading, leftIcon: LeftIcon, rightIcon: RightIcon, disabled, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 select-none">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-primary dark:text-gray-200">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {LeftIcon && (
            <div className="absolute left-3.5 text-text-muted">
              <LeftIcon className="h-4.5 w-4.5" />
            </div>
          )}
          
          <input
            type={type}
            disabled={disabled || isLoading}
            className={cn(
              "flex h-10 w-full rounded-input border border-border bg-white text-sm text-text-primary placeholder:text-text-muted transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary disabled:cursor-not-allowed disabled:bg-background/80 disabled:opacity-60 dark:bg-gray-900 dark:text-white dark:border-gray-800",
              LeftIcon ? "pl-10" : "px-3.5",
              RightIcon || isLoading ? "pr-10" : "pr-3.5",
              error && "border-danger focus:ring-danger/15 focus:border-danger",
              success && "border-success focus:ring-success/15 focus:border-success",
              className
            )}
            ref={ref}
            {...props}
          />

          {isLoading ? (
            <div className="absolute right-3.5">
              <svg className="animate-spin h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : RightIcon ? (
            <div className="absolute right-3.5 text-text-muted">
              <RightIcon className="h-4.5 w-4.5" />
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="flex items-center gap-1 text-xs text-danger font-medium"><AlertTriangle className="h-3 w-3 shrink-0" />{error}</p>
        ) : success ? (
          <p className="flex items-center gap-1 text-xs text-success font-medium"><Check className="h-3 w-3 shrink-0" />{success}</p>
        ) : helperText ? (
          <p className="text-xs text-text-secondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

// 2. TEXTAREA
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, success, helperText, disabled, isLoading, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 select-none">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-primary dark:text-gray-200">
            {label}
          </label>
        )}
        <textarea
          disabled={disabled || isLoading}
          className={cn(
            "flex min-h-[90px] w-full rounded-input border border-border bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary disabled:cursor-not-allowed disabled:bg-background/80 disabled:opacity-60 dark:bg-gray-900 dark:text-white dark:border-gray-800",
            error && "border-danger focus:ring-danger/15 focus:border-danger",
            success && "border-success focus:ring-success/15 focus:border-success",
            className
          )}
          ref={ref}
          {...props}
        />
        {error ? (
          <p className="flex items-center gap-1 text-xs text-danger font-medium"><AlertTriangle className="h-3 w-3 shrink-0" />{error}</p>
        ) : success ? (
          <p className="flex items-center gap-1 text-xs text-success font-medium"><Check className="h-3 w-3 shrink-0" />{success}</p>
        ) : helperText ? (
          <p className="text-xs text-text-secondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// 3. SELECT
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, BaseInputProps {
  options?: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, success, helperText, options, children, disabled, isLoading, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 select-none">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-primary dark:text-gray-200">
            {label}
          </label>
        )}
        <select
          disabled={disabled || isLoading}
          className={cn(
            "flex h-10 w-full rounded-input border border-border bg-white px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary disabled:cursor-not-allowed disabled:bg-background/80 disabled:opacity-60 dark:bg-gray-900 dark:text-white dark:border-gray-800",
            error && "border-danger focus:ring-danger/15 focus:border-danger",
            success && "border-success focus:ring-success/15 focus:border-success",
            className
          )}
          ref={ref}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error ? (
          <p className="flex items-center gap-1 text-xs text-danger font-medium"><AlertTriangle className="h-3 w-3 shrink-0" />{error}</p>
        ) : success ? (
          <p className="flex items-center gap-1 text-xs text-success font-medium"><Check className="h-3 w-3 shrink-0" />{success}</p>
        ) : helperText ? (
          <p className="text-xs text-text-secondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";

// 4. SEARCH INPUT
export const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "leftIcon">>(
  ({ className, placeholder = "Search...", ...props }, ref) => {
    return (
      <Input
        type="search"
        ref={ref}
        leftIcon={Search}
        placeholder={placeholder}
        className={className}
        {...props}
      />
    );
  }
);
SearchInput.displayName = "SearchInput";

// 5. PASSWORD INPUT
export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type" | "rightIcon">>(
  ({ className, label = "Password", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const toggle = () => setShowPassword((prev) => !prev);
    const PasswordIcon = showPassword ? EyeOff : Eye;

    return (
      <Input
        label={label}
        ref={ref}
        type={showPassword ? "text" : "password"}
        rightIcon={PasswordIcon}
        className={className}
        {...props}
        onClick={props.onClick} // Keep custom clicks working
      />
    );
  }
);
PasswordInput.displayName = "PasswordInput";

// 6. PHONE INPUT
export const PhoneInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  ({ className, label = "Phone Number", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 select-none">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-primary dark:text-gray-200">
            {label}
          </label>
        )}
        <div className="flex rounded-input border border-border bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary/15 focus-within:border-primary dark:bg-gray-900 dark:border-gray-800">
          <span className="flex items-center justify-center bg-background px-3.5 border-r border-border text-sm text-text-secondary dark:bg-gray-800 font-semibold select-none">
            +91
          </span>
          <input
            type="tel"
            ref={ref}
            className={cn(
              "flex h-10 w-full bg-transparent px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";

// 7. DATE PICKER
export const DatePicker = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  ({ className, label = "Select Date", ...props }, ref) => {
    return (
      <Input
        type="date"
        ref={ref}
        label={label}
        className={cn("cursor-pointer", className)}
        {...props}
      />
    );
  }
);
DatePicker.displayName = "DatePicker";

// 8. OTP INPUT
export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({ length = 6, value, onChange, label, error, disabled }) => {
  const inputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value;
    if (!val) return;

    // Grab only last typed character
    const char = val.substring(val.length - 1);
    const otpArr = value.split("");
    otpArr[idx] = char;
    const newOtp = otpArr.join("").substring(0, length);
    onChange(newOtp);

    // Shift focus forward
    if (idx < length - 1 && inputsRef.current[idx + 1]) {
      inputsRef.current[idx + 1].focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      const otpArr = value.split("");
      
      // If block contains value, clear it. Else move backward.
      if (otpArr[idx]) {
        otpArr[idx] = "";
        onChange(otpArr.join(""));
      } else if (idx > 0 && inputsRef.current[idx - 1]) {
        otpArr[idx - 1] = "";
        onChange(otpArr.join(""));
        inputsRef.current[idx - 1].focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasteData)) return; // numbers only

    const otpArr = pasteData.split("").slice(0, length);
    const newOtp = otpArr.join("");
    onChange(newOtp);

    const focusIdx = Math.min(newOtp.length, length - 1);
    if (inputsRef.current[focusIdx]) {
      inputsRef.current[focusIdx].focus();
    }
  };

  return (
    <div className="flex flex-col gap-2 select-none">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-primary dark:text-gray-200">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2.5">
        {Array.from({ length }).map((_, idx) => (
          <input
            key={idx}
            type="text"
            ref={(el) => {
              if (el) inputsRef.current[idx] = el;
            }}
            disabled={disabled}
            value={value[idx] || ""}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={handlePaste}
            maxLength={1}
            className={cn(
              "h-12 w-12 text-center text-lg font-bold border border-border rounded-input bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:bg-background/80 dark:bg-gray-900 dark:border-gray-800 dark:text-white",
              error && "border-danger focus:ring-danger/20 focus:border-danger"
            )}
          />
        ))}
      </div>
      {error && <p className="text-xs text-danger font-medium flex items-center gap-1 mt-0.5"><AlertTriangle className="h-3 w-3 shrink-0" />{error}</p>}
    </div>
  );
};

// 9. FILE UPLOAD
export interface FileUploadProps {
  label?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  error?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  value,
  onChange,
  accept = "*",
  maxSizeMB = 5,
  error: propsError,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(propsError || null);
  const [progress, setProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setError(propsError || null);
  }, [propsError]);

  const validateFile = (file: File): boolean => {
    setError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds maximum limit of ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        simulateUpload(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        simulateUpload(file);
      }
    }
  };

  const simulateUpload = (file: File) => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          onChange(file);
          setTimeout(() => setProgress(null), 500); // clear bar
          return 100;
        }
        return prev + 25; // 25% increments
      });
    }, 150);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full flex flex-col gap-1.5 select-none">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-primary dark:text-gray-200">
          {label}
        </label>
      )}

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-card bg-white cursor-pointer transition-all duration-200 hover:bg-background/40 hover:border-primary/50 dark:bg-gray-900 dark:border-gray-800",
          dragActive && "border-primary bg-primary-light/10 scale-[0.99]",
          disabled && "opacity-50 cursor-not-allowed bg-background/50",
          error && "border-danger hover:border-danger/60"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept={accept}
          disabled={disabled}
          className="hidden"
        />

        {!value && progress === null ? (
          <div className="flex flex-col items-center text-center">
            <UploadCloud className="h-10 w-10 text-text-muted mb-2 transition duration-200" />
            <p className="text-sm font-semibold text-text-primary dark:text-gray-200">
              Drag & drop file or <span className="text-primary hover:underline">browse</span>
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Supports files up to {maxSizeMB}MB
            </p>
          </div>
        ) : progress !== null ? (
          <div className="w-full flex flex-col items-center px-4 py-2">
            <p className="text-sm font-semibold text-text-primary mb-2">
              Uploading file... {progress}%
            </p>
            <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full p-2.5 bg-background dark:bg-gray-800 rounded-input">
            <div className="flex items-center gap-2 overflow-hidden pr-2">
              <UploadCloud className="h-5 w-5 text-primary shrink-0" />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-text-primary dark:text-gray-200 truncate">
                  {value?.name}
                </p>
                <p className="text-xxs text-text-secondary font-medium">
                  {((value?.size ?? 0) / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-1 rounded-full text-text-secondary hover:bg-border dark:hover:bg-gray-700 hover:text-text-primary transition shrink-0"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-danger font-medium flex items-center gap-1 mt-0.5"><AlertTriangle className="h-3 w-3 shrink-0" />{error}</p>}
    </div>
  );
};

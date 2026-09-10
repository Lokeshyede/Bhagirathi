import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Cloud, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "../../design-system/utils";

// 1. STEP PROGRESS STEPPER
export interface StepItem {
  title: string;
  description?: string;
}

export interface StepProgressProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (idx: number) => void;
}

export const StepProgress: React.FC<StepProgressProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="w-full flex items-center justify-between gap-2.5 mb-6 select-none">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;

        return (
          <React.Fragment key={idx}>
            <div
              className={cn(
                "flex items-center gap-2 cursor-pointer group",
                onStepClick === undefined && "pointer-events-none"
              )}
              onClick={() => onStepClick?.(idx)}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition duration-200 border shrink-0",
                  isCompleted
                    ? "bg-success border-success text-white"
                    : isActive
                    ? "bg-primary border-primary text-white ring-4 ring-primary/10"
                    : "bg-white border-border text-text-secondary dark:bg-gray-900 dark:border-gray-800"
                )}
              >
                {isCompleted ? <Check className="h-4.5 w-4.5" /> : idx + 1}
              </div>
              <div className="hidden sm:block text-left">
                <p
                  className={cn(
                    "text-xs font-bold transition duration-200 uppercase tracking-wide",
                    isActive ? "text-primary" : isCompleted ? "text-success" : "text-text-secondary"
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-[10px] text-text-muted font-medium mt-0.5 truncate max-w-[120px]">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 transition duration-300 rounded",
                  isCompleted ? "bg-success" : "bg-border dark:bg-gray-800"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// 2. FORM WIZARD (CONTAINER WITH FRAMER MOTION TRANSITIONS)
export interface FormWizardProps {
  currentStep: number;
  children: React.ReactNode;
}

const wizardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

export const FormWizard: React.FC<FormWizardProps> = ({ currentStep, children }) => {
  const stepsArray = React.Children.toArray(children);
  const activeStep = stepsArray[currentStep];

  return (
    <div className="relative overflow-hidden w-full min-h-[300px]">
      <AnimatePresence mode="wait" custom={currentStep}>
        <motion.div
          key={currentStep}
          custom={currentStep}
          variants={wizardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="w-full h-full"
        >
          {activeStep}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// 3. AUTOSAVE INDICATOR STATUS BADGE
export interface AutosaveIndicatorProps {
  state: "idle" | "saving" | "saved" | "error";
  className?: string;
}

export const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({ state, className }) => {
  const config = {
    idle: {
      text: "Autosave ready",
      icon: Cloud,
      class: "text-text-muted bg-gray-100 dark:bg-gray-800/40",
    },
    saving: {
      text: "Saving changes...",
      icon: Loader2,
      class: "text-primary bg-primary-light animate-pulse",
    },
    saved: {
      text: "Changes saved",
      icon: Check,
      class: "text-success bg-success-light",
    },
    error: {
      text: "Autosave error",
      icon: AlertCircle,
      class: "text-danger bg-danger-light",
    },
  };

  const current = config[state] || config.idle;
  const StateIcon = current.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-badge text-[10px] font-bold uppercase tracking-wider select-none shrink-0 transition-all duration-200",
        current.class,
        className
      )}
    >
      <StateIcon className={cn("h-3.5 w-3.5", state === "saving" && "animate-spin")} />
      <span>{current.text}</span>
    </div>
  );
};

// 4. FORM LAYOUT WRAPPER
export interface FormLayoutProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export const FormLayout: React.FC<FormLayoutProps> = ({ children, className, ...props }) => {
  return (
    <form className={cn("space-y-6 max-w-4xl", className)} {...props}>
      {children}
    </form>
  );
};

// 5. FORM SECTION HEADER & PANEL
export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-divider last:border-0 dark:border-gray-850",
        className
      )}
      {...props}
    >
      <div className="md:col-span-1 select-none space-y-1.5">
        <h4 className="text-sm font-bold text-text-primary dark:text-white uppercase tracking-wide">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-text-secondary dark:text-gray-400 font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="md:col-span-2 space-y-4">
        {children}
      </div>
    </div>
  );
};

// 6. FIELD LABELS & HELPER TEXTS
export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({ children, required, className, ...props }) => {
  return (
    <label
      className={cn(
        "block text-xs font-semibold uppercase tracking-wider text-text-primary dark:text-gray-200 select-none",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {required && <span className="text-danger ml-1">*</span>}
    </label>
  );
};

export const HelperText: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={cn("text-xs text-text-secondary select-none font-medium leading-normal", className)}
      {...props}
    >
      {children}
    </p>
  );
};

// Validation Labels
export const ErrorLabel: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={cn("flex items-center gap-1.5 text-xs text-danger font-medium mt-1 select-none", className)}
      {...props}
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
};

export const SuccessLabel: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={cn("flex items-center gap-1.5 text-xs text-success font-medium mt-1 select-none", className)}
      {...props}
    >
      <Check className="h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
};

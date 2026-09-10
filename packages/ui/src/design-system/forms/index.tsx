import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Cloud, AlertCircle } from "lucide-react";
import { cn } from "../utils";

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

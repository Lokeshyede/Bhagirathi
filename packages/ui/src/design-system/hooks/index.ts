import { useState, useEffect, useRef, useCallback } from "react";

// Hook for Multi-step Wizard progress
export interface UseStepsProps {
  initialStep?: number;
  totalSteps: number;
}

export function useSteps({ initialStep = 0, totalSteps }: UseStepsProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const setStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
  }, [totalSteps]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progressPercent = Math.round((currentStep / (totalSteps - 1)) * 100);

  return {
    currentStep,
    nextStep,
    prevStep,
    setStep,
    isFirstStep,
    isLastStep,
    progressPercent,
  };
}

// Hook for tracking click outside elements (Modal, Dropdown, Drawer dismissals)
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// Hook for detecting specific key presses
export function useKeyPress(targetKey: string, callback: () => void) {
  const handler = useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        callback();
      }
    },
    [targetKey, callback]
  );

  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [handler]);
}

// Hook to support auto-saving states with visual indicators
export function useAutosave<T>(value: T, delay = 1500, onSave: (val: T) => void | Promise<void>) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsSaving(true);
    const timer = setTimeout(async () => {
      try {
        await onSave(value);
        setLastSaved(new Date());
      } catch (err) {
        console.error("Autosave failed", err);
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, onSave]);

  return { isSaving, lastSaved };
}
export { useTheme } from "../theme";

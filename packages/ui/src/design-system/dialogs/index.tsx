import React, { useEffect, useRef } from "react";
import { X, AlertOctagon, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";
import { Button } from "../buttons";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

// 1. BASE DIALOG
export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-[3px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={cn(
              "bg-white dark:bg-gray-900 rounded-dialog shadow-dialog w-full max-w-md overflow-hidden flex flex-col border border-border dark:border-gray-800 z-10",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border dark:border-gray-800 select-none">
              {title && (
                <h3 className="text-base font-bold text-text-primary dark:text-white uppercase tracking-wider">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-button text-text-secondary hover:bg-background hover:text-text-primary dark:hover:bg-gray-800 dark:text-gray-400 transition cursor-pointer ml-auto"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// 2. CONFIRMATION DIALOG
export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}) => (
  <Dialog isOpen={isOpen} onClose={onClose} title={title} className="max-w-sm">
    <div className="flex flex-col items-center text-center select-none">
      <div className="p-3 bg-primary-light rounded-full text-primary mb-4">
        <HelpCircle className="h-8 w-8" />
      </div>
      <p className="text-sm font-medium text-text-secondary leading-relaxed mb-6">
        {message}
      </p>
      <div className="flex items-center gap-3 w-full">
        <Button variant="secondary" onClick={onClose} fullWidth disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant="primary" onClick={onConfirm} fullWidth isLoading={isLoading}>
          {confirmText}
        </Button>
      </div>
    </div>
  </Dialog>
);

// 3. DELETE DIALOG
export interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  title?: string;
  message: string;
  deleteText?: string;
  isLoading?: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onClose,
  onDelete,
  title = "Delete Confirmation",
  message,
  deleteText = "Delete Permanently",
  isLoading = false,
}) => (
  <Dialog isOpen={isOpen} onClose={onClose} title={title} className="max-w-sm">
    <div className="flex flex-col items-center text-center select-none">
      <div className="p-3 bg-danger-light rounded-full text-danger mb-4">
        <AlertOctagon className="h-8 w-8" />
      </div>
      <p className="text-sm font-semibold text-text-primary mb-1">
        This action is irreversible.
      </p>
      <p className="text-xs text-text-secondary leading-relaxed mb-6">
        {message}
      </p>
      <div className="flex items-center gap-3 w-full">
        <Button variant="secondary" onClick={onClose} fullWidth disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onDelete} fullWidth isLoading={isLoading}>
          {deleteText}
        </Button>
      </div>
    </div>
  </Dialog>
);

// 4. FORM DIALOG
export interface FormDialogProps extends DialogProps {
  onCancel?: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitText?: string;
  cancelText?: string;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onCancel,
  onSubmit,
  isSubmitting = false,
  submitText = "Save Changes",
  cancelText = "Cancel",
  className,
}) => (
  <Dialog isOpen={isOpen} onClose={onClose} title={title} className={className}>
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex-1 overflow-y-auto max-h-[60vh] pr-1.5">{children}</div>
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-divider dark:border-gray-800">
        <Button variant="secondary" onClick={onCancel || onClose} disabled={isSubmitting}>
          {cancelText}
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {submitText}
        </Button>
      </div>
    </form>
  </Dialog>
);

// 5. IMAGE PREVIEW DIALOG
export interface ImagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt?: string;
}

export const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageAlt = "Preview image",
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-[4px]"
        />

        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-card border border-white/10 z-10 flex items-center justify-center bg-gray-950"
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="max-w-full max-h-[85vh] object-contain select-none"
          />
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default Dialog;


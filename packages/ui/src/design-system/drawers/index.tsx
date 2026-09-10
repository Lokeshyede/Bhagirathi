import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  position?: "left" | "right";
  widthClass?: string; // e.g. "max-w-md", "max-w-lg"
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  position = "right",
  widthClass = "max-w-md",
}) => {
  // ESC key listener to close the drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const slideVariants = {
    hidden: { x: position === "right" ? "100%" : "-100%" },
    visible: { x: 0, transition: { type: "tween", duration: 0.22, ease: "easeInOut" } },
    exit: { x: position === "right" ? "100%" : "-100%", transition: { type: "tween", duration: 0.18, ease: "easeInOut" } },
  };

  const placementClasses = position === "right" ? "right-0 pl-10" : "left-0 pr-10";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
          />

          {/* Drawer Wrapper */}
          <div className={cn("fixed inset-y-0 max-w-full flex", placementClasses)}>
            <motion.div
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "w-screen bg-white border-l border-border shadow-dialog flex flex-col dark:bg-gray-900 dark:border-gray-800",
                widthClass,
                className
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border dark:border-gray-800 select-none">
                {title && (
                  <h3 className="text-base font-bold text-text-primary uppercase tracking-wider dark:text-white">
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

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const SidePanel = Drawer;
export default Drawer;

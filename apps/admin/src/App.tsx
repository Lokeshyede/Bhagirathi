import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@bhagirathi/api-client";
import { Modal, Button, ToastContainer, OfflineIndicator } from "@bhagirathi/ui";
import { useThemeStore } from "./store/theme";
import { useAuthStore } from "./store/auth";
import { useToastStore } from "./store/useToastStore";
import { AppRoutes } from "./routes";
import { ShieldAlert } from "lucide-react";

export const App: React.FC = () => {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const logout = useAuthStore((state) => state.logout);
  const { toasts, removeToast } = useToastStore();
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  useEffect(() => {
    initializeTheme();

    const handleUnauthorized = () => {
      setShowExpiredModal(true);
    };

    window.addEventListener("bhagirathi-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("bhagirathi-unauthorized", handleUnauthorized);
    };
  }, [initializeTheme]);

  const handleModalClose = () => {
    logout();
    setShowExpiredModal(false);
    window.location.replace("/login");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <OfflineIndicator />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>

      <Modal
        isOpen={showExpiredModal}
        onClose={handleModalClose}
        title="Session Expired"
      >
        <div className="flex flex-col items-center gap-4 text-center p-2">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-800 dark:text-gray-200 font-medium">
              Your security session has expired.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Please sign in again to resume managing your pg records.
            </p>
          </div>
          <Button onClick={handleModalClose} className="w-full mt-2 cursor-pointer">
            Sign In Again
          </Button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onClose={removeToast} position="top-right" />
    </QueryClientProvider>
  );
};

export default App;

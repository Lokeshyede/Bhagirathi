import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@bhagirathi/ui";
import { ShieldAlert } from "lucide-react";

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center text-red-650 dark:text-red-500">
          <ShieldAlert className="h-20 w-20 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">403</h1>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Access Forbidden</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You do not have the required permissions to view this resource. Please make sure you are logged in to the correct portal.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="font-medium cursor-pointer"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/login")}
            className="font-medium cursor-pointer"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

import React, { useState } from "react";
import { useAdminUsers, useAdminUserMutations } from "../hooks/api/useUserManagement";
import { UserTable } from "../components/UserTable";
import { ResetPasswordDialog } from "../components/ResetPasswordDialog";
import { Button } from "@bhagirathi/ui";
import { ShieldCheck, Search, ShieldAlert, RotateCcw, RefreshCw } from "lucide-react";

export const UserManagementPage: React.FC = () => {
  const { data: users, isLoading, isError, refetch } = useAdminUsers();
  const { updateUser, resetPassword, deleteUser } = useAdminUserMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [resetUser, setResetUser] = useState<any | null>(null);

  const handleResetPassword = (user: any) => {
    setResetUser(user);
  };

  const handleConfirmReset = async (data: any) => {
    if (resetUser) {
      await resetPassword.mutateAsync({
        id: resetUser.id,
        data: {
          new_password: data.new_password,
          force_password_change: data.force_password_change,
        }
      });
      alert(`Password for ${resetUser.full_name} updated successfully.`);
    }
  };

  const handleToggleStatus = (user: any) => {
    const nextActive = !user.is_active;
    const msg = `Are you sure you want to ${nextActive ? "activate" : "deactivate"} login access for ${user.full_name}?`;
    if (confirm(msg)) {
      updateUser.mutate({
        id: user.id,
        data: {
          is_active: nextActive,
          status: nextActive ? "ACTIVE" : "INACTIVE"
        }
      });
    }
  };

  const handleDeleteUser = (user: any) => {
    if (confirm(`Are you sure you want to permanently delete the login account for ${user.full_name}? This cannot be undone.`)) {
      deleteUser.mutate(user.id);
    }
  };

  const filteredUsers = users?.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-16 rounded-card bg-white dark:bg-gray-900 border border-border dark:border-gray-800" />
        <div className="h-64 rounded-card bg-white dark:bg-gray-900 border border-border dark:border-gray-800" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-900 border border-border rounded-card">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-3" />
        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Failed to Load User Registry</h3>
        <p className="text-xs text-secondaryText mt-1">Verify that you are logged in as Admin or check server status.</p>
        <Button onClick={() => refetch()} className="mt-4 font-bold inline-flex items-center gap-1.5 cursor-pointer">
          <RotateCcw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-sm">
        <div className="flex items-center gap-3 select-none">
          <div className="h-11 w-11 rounded-xl bg-indigo-650 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">User Account Management</h2>
            <p className="text-xxs text-secondaryText dark:text-gray-400 font-semibold mt-0.5">Control login profiles, status locks, and security credentials</p>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => refetch()}
          className="p-2 cursor-pointer self-end md:self-auto"
        >
          <RefreshCw className="h-4 w-4 text-gray-500" />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-450 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search accounts by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 border border-border dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
          />
        </div>
      </div>

      <UserTable
        users={filteredUsers}
        onResetPassword={handleResetPassword}
        onEditStatus={handleToggleStatus}
        onDelete={handleDeleteUser}
      />

      <ResetPasswordDialog
        isOpen={!!resetUser}
        onClose={() => setResetUser(null)}
        onConfirm={handleConfirmReset}
        user={resetUser}
      />
    </div>
  );
};

export default UserManagementPage;

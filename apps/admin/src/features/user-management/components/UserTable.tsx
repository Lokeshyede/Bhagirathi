import React from "react";
import { Key, Trash2, Shield, User, AlertTriangle, ToggleLeft, CheckCircle2 } from "lucide-react";
import { formatDate } from "@bhagirathi/utils";
import { TableActionMenu } from "@bhagirathi/ui";
import { motion } from "framer-motion";

interface UserTableProps {
  users: any[];
  onResetPassword: (user: any) => void;
  onEditStatus: (user: any) => void;
  onDelete: (user: any) => void;
}

const roleBadges: Record<string, string> = {
  ADMIN: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-950/30",
  TENANT: "bg-blue-50 text-blue-700 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-150/40",
  MAINTENANCE: "bg-red-50 text-red-700 dark:bg-red-955/20 dark:text-red-400 border border-red-150/40",
};

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onResetPassword,
  onEditStatus,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-sm transition-colors">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-955 border-b border-border dark:border-gray-800 font-bold text-xxs text-secondaryText dark:text-gray-400 uppercase tracking-wider select-none">
            <th className="p-4">Account Name</th>
            <th className="p-4">System Role</th>
            <th className="p-4">Auth Status</th>
            <th className="p-4">Force Change</th>
            <th className="p-4">Last Login</th>
            <th className="p-4">Created</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-gray-800 text-xs font-semibold text-primaryText dark:text-gray-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-secondaryText dark:text-gray-400 font-medium">
                No user accounts registered.
              </td>
            </tr>
          ) : (
            users.map((u, idx) => {
              return (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: idx * 0.02 }}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-955/15 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm bg-gradient-to-br ${
                        u.role === "ADMIN" ? "from-indigo-500 to-indigo-700 text-white" :
                        u.role === "MAINTENANCE" ? "from-red-500 to-red-700 text-white" :
                        "from-blue-500 to-blue-700 text-white"
                      }`}>
                        {u.role === "ADMIN" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{u.full_name}</div>
                        <div className="text-[10px] text-secondaryText dark:text-gray-400 mt-0.5">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${roleBadges[u.role] || "bg-gray-100 text-gray-700"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                      u.is_active && u.status === "ACTIVE"
                        ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30"
                        : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-405 border border-red-200 dark:border-red-900/30"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        u.is_active && u.status === "ACTIVE" ? "bg-success" : "bg-danger"
                      }`} />
                      {u.is_active && u.status === "ACTIVE" ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                    {u.force_password_change ? (
                      <span className="text-orange-500 font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Required
                      </span>
                    ) : (
                      <span className="text-green-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Cleared
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-secondaryText dark:text-gray-455 font-medium">
                    {u.last_login ? formatDate(u.last_login) : "Never Logged In"}
                  </td>
                  <td className="p-4 text-secondaryText dark:text-gray-455 font-medium">
                    {formatDate(u.created_at || u.createdAt || "")}
                  </td>
                  <td className="p-4 text-right">
                    <TableActionMenu
                      actions={[
                        {
                          label: "Reset Password",
                          icon: Key,
                          onClick: () => onResetPassword(u),
                        },
                        {
                          label: u.is_active ? "Deactivate Login" : "Activate Login",
                          icon: ToggleLeft,
                          onClick: () => onEditStatus(u),
                        },
                        ...((u.role !== "ADMIN") ? [{
                          label: "Remove Account",
                          icon: Trash2,
                          onClick: () => onDelete(u),
                          variant: "danger" as const,
                        }] : [])
                      ]}
                    />
                  </td>
                </motion.tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
export default UserTable;

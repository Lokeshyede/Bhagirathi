import React from "react";
import { MaintenanceStaff } from "@bhagirathi/types";
import { Edit2, Trash2, Mail, Phone, Briefcase } from "lucide-react";
import { formatDate } from "@bhagirathi/utils";
import { TableActionMenu } from "@bhagirathi/ui";
import { motion } from "framer-motion";

interface MaintenanceTableProps {
  staffList: MaintenanceStaff[];
  onEdit: (staff: MaintenanceStaff) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-950/30",
    dot: "bg-success",
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    dot: "bg-muted",
  },
};

export const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
  staffList,
  onEdit,
  onDelete
}) => {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-sm transition-colors">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-950 border-b border-border dark:border-gray-800 font-bold text-xxs text-secondaryText dark:text-gray-400 uppercase tracking-wider select-none">
            <th className="p-4">Employee Details</th>
            <th className="p-4">Department</th>
            <th className="p-4">Assigned Buildings</th>
            <th className="p-4">Status</th>
            <th className="p-4">Joined Date</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-gray-800 text-xs font-semibold text-primaryText dark:text-gray-200">
          {staffList.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-secondaryText dark:text-gray-400 font-medium">
                No maintenance staff members registered yet.
              </td>
            </tr>
          ) : (
            staffList.map((staff, idx) => {
              const status = staff.status || "ACTIVE";
              const conf = statusConfig[status] || statusConfig.ACTIVE;
              
              let buildingsLabel = "None";
              try {
                if (staff.assigned_building_ids) {
                  const parsed = JSON.parse(staff.assigned_building_ids);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    buildingsLabel = `${parsed.length} Building(s)`;
                  }
                }
              } catch {
                buildingsLabel = staff.assigned_building_ids || "None";
              }

              return (
                <motion.tr
                  key={staff.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: idx * 0.03 }}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-950/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white font-black text-xs flex items-center justify-center shadow-sm">
                        {staff.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          {staff.full_name}
                          <span className="text-[10px] text-gray-450 dark:text-gray-500 font-medium">({staff.staff_id})</span>
                        </div>
                        <div className="text-[10px] text-secondaryText dark:text-gray-400 mt-0.5 flex flex-col gap-0.5 font-medium">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {staff.email}</span>
                          {staff.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {staff.phone}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 rounded-full font-bold text-[10px] uppercase border border-red-100 dark:border-red-950/30">
                      <Briefcase className="h-3.5 w-3.5" />
                      {staff.department}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                    {buildingsLabel}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-black text-[10px] ${conf.className}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />
                      {conf.label}
                    </span>
                  </td>
                  <td className="p-4 text-secondaryText dark:text-gray-455 font-medium">
                    {formatDate(staff.created_at || staff.createdAt || "")}
                  </td>
                  <td className="p-4 text-right">
                    <TableActionMenu
                      actions={[
                        {
                          label: "Edit Profile",
                          icon: Edit2,
                          onClick: () => onEdit(staff),
                        },
                        {
                          label: "Remove Staff",
                          icon: Trash2,
                          onClick: () => onDelete(staff.id),
                          variant: "danger" as const,
                        },
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

import React from "react";
import { MaintenanceStaff } from "@bhagirathi/types";
import { Briefcase, Mail, Phone, Home, Edit2, Trash2 } from "lucide-react";
import { Button } from "@bhagirathi/ui";

interface MaintenanceCardProps {
  staff: MaintenanceStaff;
  onEdit: (staff: MaintenanceStaff) => void;
  onDelete: (id: string) => void;
}

export const MaintenanceCard: React.FC<MaintenanceCardProps> = ({
  staff,
  onEdit,
  onDelete
}) => {
  let buildingsCount = 0;
  try {
    if (staff.assigned_building_ids) {
      const parsed = JSON.parse(staff.assigned_building_ids);
      if (Array.isArray(parsed)) {
        buildingsCount = parsed.length;
      }
    }
  } catch {}

  return (
    <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white font-black text-sm flex items-center justify-center shadow-sm">
              {staff.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                {staff.full_name}
              </h4>
              <span className="text-[10px] text-gray-450 font-bold block mt-0.5">ID: {staff.staff_id || "N/A"}</span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-black text-[9px] ${
            staff.status === "ACTIVE"
              ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30"
              : "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800"
          }`}>
            {staff.status === "ACTIVE" ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-gray-900 dark:text-white font-bold">{staff.department}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="truncate">{staff.email}</span>
          </div>
          {staff.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{staff.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-gray-400 shrink-0" />
            <span>Assigned: {buildingsCount} Building(s)</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-5 pt-3 border-t border-gray-100 dark:border-gray-800">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(staff)}
          className="flex-1 font-bold inline-flex items-center justify-center gap-1.5 py-1.5"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDelete(staff.id)}
          className="flex-1 font-bold text-red-500 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 inline-flex items-center justify-center gap-1.5 py-1.5 animate-transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
};

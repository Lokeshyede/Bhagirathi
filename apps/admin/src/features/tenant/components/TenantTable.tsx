import React, { useState } from "react";
import { Tenant } from "@bhagirathi/types";
import { Edit2, Trash2, Key, LogOut, Move, RefreshCw, Eye } from "lucide-react";
import { formatDate } from "@bhagirathi/utils";
import { TableActionMenu, Badge } from "@bhagirathi/ui";
import { useToastStore } from "../../../store/useToastStore";
import { motion } from "framer-motion";

interface TenantTableProps {
  tenants: Tenant[];
  onEdit: (tenant: Tenant) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onCheckIn: (tenant: Tenant) => void;
  onCheckOut: (tenant: Tenant) => void;
  onTransferRoom: (tenant: Tenant) => void;
  onTransferBed: (tenant: Tenant) => void;
}

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-950/30",
    dot: "bg-success",
  },
  CHECKED_OUT: {
    label: "Checked Out",
    className: "bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-950/30",
    dot: "bg-danger",
  },
  INACTIVE: {
    label: "Inactive Profile",
    className: "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    dot: "bg-muted",
  },
};

const genderColors: Record<string, "info" | "warning" | "reserved"> = {
  MALE: "info",
  FEMALE: "warning",
  OTHER: "reserved",
};

const avatarColors = [
  "from-primary to-red-700",
  "from-blue-600 to-blue-700",
  "from-success to-green-700",
  "from-purple-600 to-violet-750",
  "from-warning to-amber-600",
];

function getInitials(name: string): string {
  return (name ?? "").split(" ").filter(Boolean).map(p => p[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";
}

export const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  onEdit,
  onDelete,
  onSelect,
  onCheckIn,
  onCheckOut,
  onTransferRoom,
  onTransferBed,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const toast = useToastStore();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(tenants.map(t => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="glass-panel overflow-hidden border border-white/20 dark:border-white/5">
      {/* Table bulk operations actions display */}
      {selectedIds.size > 0 && (
        <div className="bg-primary/5 dark:bg-red-950/10 border-b border-primary/20 dark:border-red-900/30 px-4 sm:px-5 py-3 sm:py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-bold text-primary animate-in fade-in select-none">
          <span>{selectedIds.size} tenant profile(s) selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.success(`Exporting ${selectedIds.size} profiles to CSV`);
                setSelectedIds(new Set());
              }}
              className="px-2.5 py-1 bg-white border border-border text-text-primary hover:bg-background rounded text-[10px] transition cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:text-white"
            >
              Bulk Export CSV
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete ${selectedIds.size} profiles permanently?`)) {
                  selectedIds.forEach(id => onDelete(id));
                  setSelectedIds(new Set());
                }
              }}
              className="px-2.5 py-1 bg-red-650 hover:bg-red-700 text-white rounded text-[10px] transition cursor-pointer"
            >
              Bulk Delete
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="pg-table">
          <thead>
            <tr className="select-none">
              <th className="pl-5 w-12 text-center">
                <input
                  type="checkbox"
                  checked={tenants.length > 0 && selectedIds.size === tenants.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-800 text-primary focus:ring-primary cursor-pointer h-4 w-4"
                />
              </th>
              <th>Tenant</th>
              <th className="hidden sm:table-cell">Contact</th>
              <th className="hidden md:table-cell">Gender & DOB</th>
              <th className="hidden lg:table-cell">Aadhaar Number</th>
              <th>Status</th>
              <th className="text-right pr-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t, i) => {
              const status = statusConfig[t.status] ?? statusConfig.INACTIVE;
              const genderClass = genderColors[(t.gender ?? "").toUpperCase()] ?? genderColors.OTHER;
              const colorClass = avatarColors[i % avatarColors.length];

              const actions = [];
              if (t.status !== "ACTIVE") {
                actions.push({
                  label: "Check-In Tenant",
                  icon: Key,
                  onClick: () => onCheckIn(t),
                  variant: "success" as const,
                });
              } else {
                actions.push(
                  {
                    label: "Check-Out Tenant",
                    icon: LogOut,
                    onClick: () => onCheckOut(t),
                    variant: "danger" as const,
                  },
                  {
                    label: "Transfer Room",
                    icon: Move,
                    onClick: () => onTransferRoom(t),
                  },
                  {
                    label: "Transfer Bed",
                    icon: RefreshCw,
                    onClick: () => onTransferBed(t),
                  }
                );
              }
              actions.push(
                {
                  label: "View Full Dossier",
                  icon: Eye,
                  onClick: () => onSelect(t.id),
                },
                {
                  label: "Edit Profile Info",
                  icon: Edit2,
                  onClick: () => onEdit(t),
                },
                {
                  label: "Delete Tenant Profile",
                  icon: Trash2,
                  onClick: () => onDelete(t.id),
                  variant: "danger" as const,
                }
              );

              return (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors"
                >
                  {/* Select Checkbox */}
                  <td className="pl-5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(t.id)}
                      onChange={() => handleSelectRow(t.id)}
                      className="rounded border-gray-300 dark:border-gray-800 text-primary focus:ring-primary cursor-pointer h-4 w-4"
                    />
                  </td>

                  {/* Tenant */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden ${t.photo_url ? "bg-gray-100" : `bg-gradient-to-br ${colorClass}`}`}>
                        {t.photo_url ? (
                          <img src={t.photo_url} alt={t.full_name} className="h-full w-full object-cover animate-fade-in" />
                        ) : (
                          getInitials(t.full_name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={() => onSelect(t.id)}
                          className="font-bold text-primaryText dark:text-white hover:text-primary dark:hover:text-red-400 transition-colors cursor-pointer text-sm truncate block text-left max-w-[120px] sm:max-w-none"
                        >
                          {t.full_name}
                        </button>
                        <span className="text-[10px] text-muted dark:text-gray-500 font-mono tracking-wider">
                          {t.tenant_id}
                        </span>
                        {/* Mobile-only: show phone since Contact column is hidden */}
                        {t.mobile && (
                          <span className="sm:hidden text-[10px] text-secondaryText dark:text-gray-400 font-semibold block mt-0.5">
                            📱 {t.mobile}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact — hidden on mobile */}
                  <td className="hidden sm:table-cell">
                    <span className="font-bold text-primaryText dark:text-gray-250 block text-xs">
                      {t.mobile}
                    </span>
                    <span className="text-[10px] text-muted dark:text-gray-500 block truncate max-w-[150px]">
                      {t.email}
                    </span>
                  </td>

                  {/* Gender & DOB — hidden on mobile + tablet */}
                  <td className="hidden md:table-cell">
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant={genderClass} size="sm" pill={false}>
                        {t.gender}
                      </Badge>
                      <span className="text-[10px] text-text-muted dark:text-gray-500 tabular-nums">
                        DOB: {formatDate(t.dob || "", false)}
                      </span>
                    </div>
                  </td>

                  {/* Aadhaar — hidden until lg */}
                  <td className="hidden lg:table-cell">
                    <span className="font-mono text-xs text-secondaryText dark:text-gray-300 tracking-widest tabular-nums">
                      {t.aadhaar_number}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <Badge variant={t.status.toLowerCase() as any} size="sm">
                      {status.label}
                    </Badge>
                  </td>

                  {/* Actions (Action Menu Dropdown) */}
                  <td className="text-right pr-5">
                    <div className="flex justify-end items-center gap-1.5">
                      {/* Short cut: View */}
                      <button
                        onClick={() => onSelect(t.id)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-secondaryText dark:text-gray-400 hover:text-primary dark:hover:text-red-400 transition cursor-pointer"
                        title="View Profile Summary"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <TableActionMenu actions={actions} />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenantTable;

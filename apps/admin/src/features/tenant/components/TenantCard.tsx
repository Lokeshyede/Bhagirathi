import React from "react";
import { Tenant } from "@bhagirathi/types";
import { Phone, Mail, Key, LogOut, Move, RefreshCw, Trash2, Edit2 } from "lucide-react";
import { Badge } from "@bhagirathi/ui";
import { motion } from "framer-motion";

interface TenantCardProps {
  tenant: Tenant;
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

const avatarColors = [
  "from-primary to-red-700",
  "from-blue-600 to-blue-700",
  "from-success to-green-700",
  "from-purple-600 to-violet-755",
  "from-warning to-amber-600",
];

function getInitials(name: string): string {
  return (name ?? "").split(" ").filter(Boolean).map(p => p[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";
}

export const TenantCard: React.FC<TenantCardProps> = ({
  tenant,
  onEdit,
  onDelete,
  onSelect,
  onCheckIn,
  onCheckOut,
  onTransferRoom,
  onTransferBed,
}) => {
  const status = statusConfig[tenant.status] ?? statusConfig.INACTIVE;
  const hashVal = (tenant.full_name ?? "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorClass = avatarColors[hashVal % avatarColors.length];

  return (
    <motion.div
      whileHover={{ y: -2, shadow: "0 10px 20px -5px rgba(0,0,0,0.05)" }}
      className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card p-5 flex flex-col justify-between h-64 transition-all"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-4 select-none">
          <span className="text-[10px] font-mono font-bold text-muted dark:text-gray-500 tracking-wider">
            ID: {tenant.tenant_id}
          </span>
          <Badge variant={tenant.status.toLowerCase() as any} size="sm">
            {status.label}
          </Badge>
        </div>

        {/* Profile Identity */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className={`h-11 w-11 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-border dark:border-gray-800 ${tenant.photo_url ? "bg-gray-50 dark:bg-gray-850" : `bg-gradient-to-br ${colorClass}`}`}>
            {tenant.photo_url ? (
              <img src={tenant.photo_url} alt={tenant.full_name} className="h-full w-full object-cover" />
            ) : (
              getInitials(tenant.full_name)
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <button
              onClick={() => onSelect(tenant.id)}
              className="font-bold text-sm text-primaryText dark:text-white hover:text-primary dark:hover:text-red-400 transition-colors truncate block text-left w-full cursor-pointer hover:underline"
            >
              {tenant.full_name}
            </button>
            <span className="text-[10px] text-secondaryText dark:text-gray-450 block mt-0.5 font-bold uppercase tracking-wider">
              {tenant.occupation || "Tenant"}
            </span>
          </div>
        </div>

        {/* Details list */}
        <div className="space-y-2.5 text-xs text-secondaryText dark:text-gray-400 mb-4 pt-1 select-none">
          <a
            href={`tel:${tenant.mobile}`}
            className="flex items-center gap-2.5 hover:text-primary transition-colors font-medium tabular-nums"
          >
            <Phone className="h-3.5 w-3.5 text-muted shrink-0" />
            <span>{tenant.mobile}</span>
          </a>
          <div className="flex items-center gap-2.5">
            <Mail className="h-3.5 w-3.5 text-muted shrink-0" />
            <span className="truncate font-medium" title={tenant.email}>
              {tenant.email}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col gap-2 pt-3.5 border-t border-gray-150/40 dark:border-gray-850/40 select-none">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2.5">
            {tenant.status !== "ACTIVE" ? (
              <button
                onClick={() => onCheckIn(tenant)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-success hover:text-green-700 transition cursor-pointer"
              >
                <Key className="h-3.5 w-3.5" />
                Check-In
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onCheckOut(tenant)}
                  className="inline-flex items-center gap-0.5 text-[11px] font-bold text-danger hover:text-red-700 transition cursor-pointer"
                  title="Check-Out Tenant"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Out
                </button>
                <button
                  onClick={() => onTransferRoom(tenant)}
                  className="inline-flex items-center gap-0.5 text-[11px] font-bold text-reserved hover:text-purple-650 transition cursor-pointer"
                  title="Transfer Room"
                >
                  <Move className="h-3.5 w-3.5" />
                  Room
                </button>
                <button
                  onClick={() => onTransferBed(tenant)}
                  className="inline-flex items-center gap-0.5 text-[11px] font-bold text-warning hover:text-amber-600 transition cursor-pointer"
                  title="Transfer Bed"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Bed
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(tenant)}
              className="p-1.5 text-secondaryText hover:text-primaryText dark:hover:text-white rounded-button hover:bg-gray-50 dark:hover:bg-gray-805 transition cursor-pointer"
              title="Edit Profile"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(tenant.id)}
              className="p-1.5 text-muted hover:text-danger rounded-button hover:bg-red-50/10 transition cursor-pointer"
              title="Delete Profile"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TenantCard;

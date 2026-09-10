import React from "react";
import { Check, X, Lock, AlertTriangle } from "lucide-react";

interface Bed {
  id: string;
  bed_number: string;
  bed_status: string;        // AVAILABLE | MAINTENANCE
  occupancy_status: string;  // VACANT | OCCUPIED | RESERVED
}

interface BedStatusGridProps {
  beds: Bed[];
  selectedBedId: string;
  onSelectBed: (bedId: string) => void;
}

export const BedStatusGrid: React.FC<BedStatusGridProps> = ({
  beds,
  selectedBedId,
  onSelectBed
}) => {
  // Determine logical state of the bed
  const getBedState = (bed: Bed) => {
    if (bed.bed_status.toUpperCase() === "MAINTENANCE") {
      return {
        label: "Maintenance",
        color: "border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-955/10 text-amber-600 dark:text-amber-400 cursor-not-allowed opacity-60",
        badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-350",
        icon: <AlertTriangle size={14} className="text-amber-500" />,
        selectable: false
      };
    }
    
    switch (bed.occupancy_status.toUpperCase()) {
      case "OCCUPIED":
        return {
          label: "Occupied",
          color: "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-955/10 text-red-600 dark:text-red-400 cursor-not-allowed opacity-60",
          badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-350",
          icon: <X size={14} className="text-red-500" />,
          selectable: false
        };
      case "RESERVED":
        return {
          label: "Reserved",
          color: "border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-955/10 text-blue-600 dark:text-blue-400 cursor-not-allowed opacity-60",
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-350",
          icon: <Lock size={14} className="text-blue-500" />,
          selectable: false
        };
      case "VACANT":
      default:
        return {
          label: "Vacant",
          color: "border-green-200 dark:border-green-900 hover:border-green-400 dark:hover:border-green-700 bg-white dark:bg-gray-900 text-green-700 dark:text-green-400 cursor-pointer",
          badge: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-350",
          icon: <Check size={14} className="text-green-500" />,
          selectable: true
        };
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
      {beds.map((bed) => {
        const { label, color, badge, icon, selectable } = getBedState(bed);
        const isSelected = selectedBedId === bed.id;

        return (
          <div
            key={bed.id}
            onClick={() => selectable && onSelectBed(bed.id)}
            className={`p-4 border rounded-xl flex flex-col items-center justify-between gap-3 text-center transition-all duration-200 ${color} ${
              isSelected
                ? "ring-2 ring-indigo-500 border-indigo-500 shadow-sm shadow-indigo-100 dark:shadow-none bg-indigo-50/20 dark:bg-indigo-950/20"
                : ""
            }`}
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block tracking-wider">
                Bed Number
              </span>
              <h5 className="text-lg font-black text-gray-900 dark:text-white">
                Bed {bed.bed_number}
              </h5>
            </div>

            <div className="flex items-center gap-1.5 justify-center">
              {icon}
              <span className={`px-2 py-0.5 text-xxs font-extrabold rounded-full border ${badge}`}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

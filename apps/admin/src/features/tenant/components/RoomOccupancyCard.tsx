import React from "react";

interface RoomOccupancyCardProps {
  roomNumber: string;
  roomType: string;
  capacity: number;
  occupiedCount: number;
  vacantCount: number;
  status: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export const RoomOccupancyCard: React.FC<RoomOccupancyCardProps> = ({
  roomNumber,
  roomType,
  capacity,
  occupiedCount,
  vacantCount,
  status,
  isSelected,
  onClick
}) => {
  const occupancyRate = (occupiedCount / capacity) * 100;
  
  // Format status tag style
  const getStatusBadge = () => {
    switch ((status ?? "UNKNOWN").toUpperCase()) {
      case "AVAILABLE":
        return "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900";
      case "FULL":
      case "OCCUPIED":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900";
      case "MAINTENANCE":
        return "bg-red-55 text-red-700 dark:bg-red-955/30 dark:text-red-400 border-red-200 dark:border-red-900";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-955/30 dark:text-gray-400 border-gray-200 dark:border-gray-900";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 flex flex-col justify-between h-full select-none ${
        isSelected
          ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10 shadow-sm shadow-indigo-100 dark:shadow-none"
          : "border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-750"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 border-b pb-2 mb-3 border-gray-100 dark:border-gray-800">
          <div>
            <h5 className="text-sm font-bold text-gray-900 dark:text-white">
              Room {roomNumber ?? "N/A"}
            </h5>
            <p className="text-xxs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
              {(roomType ?? "UNKNOWN").replace("_", " ")}
            </p>
          </div>
          <span className={`px-2 py-0.5 text-xxs font-bold rounded-full border ${getStatusBadge()}`}>
            {status ?? "UNKNOWN"}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xxs font-bold text-gray-700 dark:text-gray-350">
            <span>Occupancy Gauge</span>
            <span>{occupiedCount} / {capacity} Beds Occupied</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                occupancyRate === 100
                  ? "bg-amber-500"
                  : occupancyRate > 50
                  ? "bg-indigo-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-800 text-xxs font-semibold text-gray-600 dark:text-gray-400">
        <span>Capacity: <strong>{capacity}</strong></span>
        <span className={vacantCount > 0 ? "text-green-600 dark:text-green-400" : "text-gray-400"}>
          Vacant: <strong>{vacantCount}</strong>
        </span>
      </div>
    </div>
  );
};

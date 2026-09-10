import React from "react";
import { Calendar, ArrowRight, UserCheck, UserX, Move, RefreshCw } from "lucide-react";
import { useAllocationHistory } from "../hooks/api/useAllocation";
import { formatDate } from "@bhagirathi/utils";

interface AllocationTimelineProps {
  tenantId: string;
}

export const AllocationTimeline: React.FC<AllocationTimelineProps> = ({ tenantId }) => {
  const { data, isLoading } = useAllocationHistory(tenantId);

  if (isLoading) {
    return <div className="text-xxs text-gray-400 dark:text-gray-500 animate-pulse py-4">Loading allocation chronology...</div>;
  }

  // Assemble events list
  const events: Array<{
    date: Date;
    title: string;
    type: "CHECK_IN" | "CHECK_OUT" | "ROOM_TRANSFER" | "BED_TRANSFER";
    description: React.ReactNode;
    reason?: string | null;
    remarks?: string | null;
  }> = [];

  if (data) {
    // 1. Bed Allocations (Check-ins & check-outs)
    data.allocations.forEach((alloc) => {
      const allocDate = new Date(alloc.allocation_date);
      events.push({
        date: allocDate,
        title: "Bed Allocation / Check-In",
        type: "CHECK_IN",
        description: (
          <div className="text-xxs text-gray-700 dark:text-gray-300">
            Assigned to <strong className="text-gray-900 dark:text-white">{alloc.hostel_name}</strong> &gt;{" "}
            {alloc.building_name} &gt; Room {alloc.room_number} (Bed {alloc.bed_number})
          </div>
        ),
        remarks: alloc.remarks
      });

      if (alloc.checkout_date && alloc.status === "CHECKED_OUT") {
        events.push({
          date: new Date(alloc.checkout_date),
          title: "Tenant Checked Out",
          type: "CHECK_OUT",
          description: (
            <div className="text-xxs text-gray-700 dark:text-gray-300">
              Vacated Room {alloc.room_number} (Bed {alloc.bed_number}) from {alloc.hostel_name}.
            </div>
          )
        });
      }
    });

    // 2. Room Transfers
    data.room_transfers.forEach((tr) => {
      events.push({
        date: new Date(tr.transfer_date),
        title: "Room Transfer",
        type: "ROOM_TRANSFER",
        description: (
          <div className="text-xxs text-gray-700 dark:text-gray-300 flex items-center flex-wrap gap-1.5">
            <span>Transferred from Room {tr.from_room_id ? "Old Room" : "N/A"} (Bed {tr.from_bed_id ? "Old" : "N/A"})</span>
            <ArrowRight size={10} className="text-gray-400" />
            <span>Destination: Room {tr.to_room_id ? "New Room" : "N/A"} (Bed {tr.to_bed_id ? "New" : "N/A"})</span>
          </div>
        ),
        reason: tr.reason,
        remarks: tr.remarks
      });
    });

    // 3. Bed Transfers
    data.bed_transfers.forEach((tr) => {
      events.push({
        date: new Date(tr.transfer_date),
        title: "Bed Switch (Same Room)",
        type: "BED_TRANSFER",
        description: (
          <div className="text-xxs text-gray-700 dark:text-gray-300 flex items-center flex-wrap gap-1.5">
            <span>Swapped bed inside room</span>
            <ArrowRight size={10} className="text-gray-400" />
            <span>Bed Switch Completed</span>
          </div>
        ),
        reason: tr.reason,
        remarks: tr.remarks
      });
    });
  }

  // Sort chronological descending order
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  if (events.length === 0) {
    return (
      <div className="text-center py-6 text-xxs text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
        No allocation timeline milestones found for this tenant.
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "CHECK_IN":
        return "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400 border-green-200 dark:border-green-900";
      case "CHECK_OUT":
        return "bg-red-50 text-red-600 dark:bg-red-955/20 dark:text-red-400 border-red-200 dark:border-red-900";
      case "ROOM_TRANSFER":
        return "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900";
      case "BED_TRANSFER":
      default:
        return "bg-amber-50 text-amber-600 dark:bg-amber-955/20 dark:text-amber-400 border-amber-200 dark:border-amber-900";
    }
  };

  return (
    <div className="space-y-4">
      <h5 className="text-xs font-bold text-gray-805 dark:text-gray-250 uppercase tracking-wider mb-2">
        Allocation Chronology Timeline
      </h5>
      <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-4 pl-6 space-y-6 py-2">
        {events.map((ev, idx) => (
          <div key={idx} className="relative select-none">
            {/* Timeline icon indicator */}
            <span
              className={`absolute -left-10 top-0.5 h-7 w-7 rounded-full flex items-center justify-center border shadow-sm ${getEventIcon(
                ev.type
              )}`}
            >
              {ev.type === "CHECK_IN" && <UserCheck size={12} />}
              {ev.type === "CHECK_OUT" && <UserX size={12} />}
              {ev.type === "ROOM_TRANSFER" && <Move size={12} />}
              {ev.type === "BED_TRANSFER" && <RefreshCw size={12} />}
            </span>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {ev.title}
                </span>
                <span className="text-xxs text-gray-400 dark:text-gray-500 font-semibold inline-flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(ev.date)}
                </span>
              </div>
              
              <div className="mt-1">{ev.description}</div>

              {(ev.reason || ev.remarks) && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-lg text-xxs font-medium text-gray-600 dark:text-gray-400 space-y-1">
                  {ev.reason && (
                    <div>
                      <strong>Reason:</strong> {ev.reason}
                    </div>
                  )}
                  {ev.remarks && (
                    <div>
                      <strong>Remarks:</strong> {ev.remarks}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

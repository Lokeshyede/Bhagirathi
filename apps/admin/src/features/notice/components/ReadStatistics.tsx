import React from "react";
import { useNoticeReadStatistics } from "../hooks/api/useNotice";
import { CheckCircle, Clock, Users, AlertCircle } from "lucide-react";
import { Spinner } from "@bhagirathi/ui";

interface ReadStatisticsProps {
  noticeId: string;
}

export const ReadStatistics: React.FC<ReadStatisticsProps> = ({ noticeId }) => {
  const { data: stats, isLoading, isError } = useNoticeReadStatistics(noticeId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <Spinner size="sm" className="mb-2" />
        <span className="text-[10px]">Loading read logs...</span>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-4 text-center text-xs text-red-655 bg-red-50/50 rounded-lg flex items-center gap-2 border">
        <AlertCircle className="h-4.5 w-4.5 shrink-0" />
        <span>Failed to load read stats.</span>
      </div>
    );
  }

  const readCount = stats?.read_count ?? (stats as any)?.total_reads ?? 0;
  const totalTargets = stats?.total_targets ?? 0;
  const readRate = stats?.read_rate ?? (stats as any)?.read_percentage ?? 0;
  const readers = stats?.readers ?? [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Progress Stats bar */}
      <div className="bg-gray-50 dark:bg-gray-950 p-4 border border-gray-100 dark:border-gray-850 rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-500" />
            Audience Read Progress
          </span>
          <span>{readCount} / {totalTargets} ({readRate}%)</span>
        </div>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${readRate}%` }}
          />
        </div>
      </div>

      {/* Reader list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto border border-gray-150 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-gray-900">
        <h5 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Targeted Tenant List</h5>
        {readers.length === 0 ? (
          <p className="text-xxs text-gray-400 italic text-center py-4">No active tenants targeted by this notice filter.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {readers.map((r, idx) => (
              <div key={r.tenant_id || idx} className="flex justify-between items-center py-2 text-xs">
                <div>
                  <div className="font-bold text-gray-850 dark:text-gray-200">{r.tenant_name}</div>
                  <span className="text-xxs text-gray-450 dark:text-gray-500">
                    {r.hostel_name} | Room: {r.room_number || "N/A"}
                  </span>
                </div>
                <div>
                  {r.is_read ? (
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-250 px-1.5 py-0.2 rounded">
                        <CheckCircle className="h-3 w-3" /> Read
                      </span>
                      {r.read_at && (
                        <span className="text-[8px] text-gray-400 font-semibold mt-0.5">
                          {new Date(r.read_at).toLocaleDateString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-505 bg-gray-50 border border-gray-200 px-1.5 py-0.2 rounded">
                      <Clock className="h-3 w-3" /> Unread
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
export default ReadStatistics;

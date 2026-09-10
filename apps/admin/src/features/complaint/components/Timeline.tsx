import React from "react";
import { Clock, CheckCircle2, XCircle, User, Wrench, Play } from "lucide-react";
import { ComplaintHistoryItem } from "@bhagirathi/types";
import { ComplaintStatus } from "@bhagirathi/constants";

interface TimelineProps {
  history: ComplaintHistoryItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic p-2">
        No audit log timeline available.
      </p>
    );
  }

  const getStatusNode = (status: string) => {
    switch (status) {
      case ComplaintStatus.OPEN:
        return {
          icon: Clock,
          color: "text-amber-500 bg-amber-50 border-amber-250",
          title: "Complaint Registered"
        };
      case ComplaintStatus.ASSIGNED:
        return {
          icon: Wrench,
          color: "text-indigo-650 bg-indigo-50 border-indigo-250",
          title: "Maintenance Crew Assigned"
        };
      case ComplaintStatus.IN_PROGRESS:
        return {
          icon: Play,
          color: "text-blue-500 bg-blue-50 border-blue-200",
          title: "Work Started"
        };
      case ComplaintStatus.RESOLVED:
        return {
          icon: CheckCircle2,
          color: "text-green-600 bg-green-50 border-green-200",
          title: "Issue Resolved"
        };
      case ComplaintStatus.CLOSED:
        return {
          icon: CheckCircle2,
          color: "text-gray-550 bg-gray-50 border-gray-250",
          title: "Complaint Closed"
        };
      case ComplaintStatus.REJECTED:
        return {
          icon: XCircle,
          color: "text-red-700 bg-red-50 border-red-200",
          title: "Complaint Rejected / Reopened"
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-500 bg-gray-50 border-gray-200",
          title: status
        };
    }
  };

  return (
    <div className="flow-root pl-2">
      <ul role="list" className="-mb-8">
        {history.map((item, idx) => {
          const node = getStatusNode(item.status);
          const Icon = node.icon;
          const isLast = idx === history.length - 1;

          return (
            <li key={item.id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4.5 top-4.5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-9 w-9 rounded-full flex items-center justify-center border ${node.color}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {node.title}
                      </p>
                      <time className="text-3xs text-gray-400 dark:text-gray-550 whitespace-nowrap font-medium">
                        {new Date(item.action_at || item.created_at || "").toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </time>
                    </div>
                    {item.remarks && (
                      <p className="text-xxs text-gray-550 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-950/50 p-2.5 border border-gray-100 dark:border-gray-850 rounded-lg">
                        {item.remarks}
                      </p>
                    )}
                    {item.action_by_name && (
                      <div className="flex items-center gap-1 mt-1 text-3xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        <User className="h-3 w-3" />
                        <span>By: {item.action_by_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default Timeline;

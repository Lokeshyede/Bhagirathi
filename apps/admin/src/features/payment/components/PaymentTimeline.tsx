import React from "react";
import { usePaymentTimeline } from "../hooks/useAdminPayment";
import { Calendar, CheckCircle2, XCircle, AlertCircle, Clock, Search } from "lucide-react";

interface PaymentTimelineProps {
  paymentId?: string | null;
  history?: any[]; // For backwards compatibility with the existing PaymentDetailsDrawer
}

export const PaymentTimeline: React.FC<PaymentTimelineProps> = ({ paymentId, history }) => {
  // Only execute query if history is not provided
  const { data: queryEvents, isLoading, isError } = usePaymentTimeline(history ? null : paymentId);

  if (!history && isLoading) {
    return (
      <div className="space-y-4 animate-pulse p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-2 w-1/4 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!history && (isError || !queryEvents || queryEvents.length === 0)) {
    return (
      <div className="text-center p-6 text-xs text-muted font-semibold bg-gray-50 dark:bg-gray-950 border border-border dark:border-gray-850 rounded-card select-none">
        No payment timeline history recorded yet.
      </div>
    );
  }

  // Map history array (backwards compatible) or use query events
  const events = history
    ? history.map((h: any) => {
        let title = h.status || "Status Change";
        let statusStr = h.status || "Pending";
        
        if (h.status === "PENDING") {
          title = "Payment Submitted";
          statusStr = "Submitted";
        } else if (h.status === "VERIFIED") {
          title = "Payment Verified";
          statusStr = "Verified";
        } else if (h.status === "REJECTED") {
          title = "Payment Rejected";
          statusStr = "Rejected";
        } else if (h.status === "UNDER_REVIEW") {
          title = "Review Started";
          statusStr = "Under Review";
        }

        return {
          title,
          status: statusStr,
          timestamp: h.action_at || h.createdAt || new Date().toISOString(),
          details: h.remarks ? { remarks: h.remarks } : null
        };
      })
    : queryEvents || [];

  if (events.length === 0) {
    return (
      <div className="text-center p-6 text-xs text-muted font-semibold bg-gray-50 dark:bg-gray-950 border border-border dark:border-gray-850 rounded-card select-none">
        No timeline details available.
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Verified":
        return {
          icon: CheckCircle2,
          color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/40",
          dotColor: "bg-green-600"
        };
      case "Rejected":
        return {
          icon: XCircle,
          color: "text-danger bg-danger-light/10 border-danger/25",
          dotColor: "bg-danger"
        };
      case "Clarification Requested":
        return {
          icon: AlertCircle,
          color: "text-amber-500 bg-amber-500/10 border-amber-500/25",
          dotColor: "bg-amber-500"
        };
      case "Under Review":
        return {
          icon: Search,
          color: "text-blue-500 bg-blue-500/10 border-blue-500/25",
          dotColor: "bg-blue-500"
        };
      case "Submitted":
        return {
          icon: Clock,
          color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40",
          dotColor: "bg-indigo-600"
        };
      default:
        return {
          icon: Calendar,
          color: "text-text-muted bg-background border-border",
          dotColor: "bg-text-muted"
        };
    }
  };

  return (
    <div className="relative pl-6 space-y-6 select-none">
      {/* Vertical linking line */}
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-150 dark:bg-gray-800" />

      {events.map((event: any, index: number) => {
        const style = getStatusStyle(event.status);
        const Icon = style.icon;
        
        const eventTime = new Date(event.timestamp).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });

        return (
          <div key={index} className="relative flex flex-col gap-1.5">
            {/* Left aligned absolute point marker */}
            <div className={`absolute -left-6 top-1 h-6.5 w-6.5 rounded-full border flex items-center justify-center ${style.color}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>

            {/* Content area */}
            <div className="flex flex-col pl-3">
              <h4 className="text-xs font-black text-primaryText dark:text-gray-100 uppercase tracking-wide">
                {event.title}
              </h4>
              <span className="text-[10px] text-muted font-bold block mt-0.5 uppercase">
                {eventTime}
              </span>

              {/* Event payload details (e.g. remarks, custom message, UTR codes) */}
              {event.details && (
                <div className="mt-2 p-3 bg-gray-55 dark:bg-gray-955 border border-border dark:border-gray-850 rounded-card text-xxs font-medium text-text-secondary dark:text-gray-400 space-y-1.5 leading-relaxed">
                  {event.details.utr && (
                    <p>
                      <span className="font-bold uppercase text-text-muted">UTR Reference:</span>{" "}
                      <code className="text-primaryText dark:text-gray-200 select-all font-mono font-bold">{event.details.utr}</code>
                    </p>
                  )}
                  {event.details.reason && (
                    <p>
                      <span className="font-bold uppercase text-text-muted">Reason:</span>{" "}
                      <span className="text-primaryText dark:text-gray-200 font-bold">{event.details.reason}</span>
                    </p>
                  )}
                  {event.details.remarks && (
                    <p>
                      <span className="font-bold uppercase text-text-muted">Admin Remarks:</span>{" "}
                      <span className="italic">"{event.details.remarks}"</span>
                    </p>
                  )}
                  {event.details.message && (
                    <p>
                      <span className="font-bold uppercase text-text-muted">Message to Tenant:</span>{" "}
                      <span className="italic">"{event.details.message}"</span>
                    </p>
                  )}
                  {event.details.billing_month && event.details.billing_year && (
                    <p>
                      <span className="font-bold uppercase text-text-muted">Billing Cycle:</span>{" "}
                      <span>{event.details.billing_month}/{event.details.billing_year}</span>
                    </p>
                  )}
                  {event.details.screenshot_url && (
                    <p>
                      <span className="font-bold uppercase text-text-muted">Screenshot Attached:</span>{" "}
                      <a href={event.details.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
                        View Upload
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

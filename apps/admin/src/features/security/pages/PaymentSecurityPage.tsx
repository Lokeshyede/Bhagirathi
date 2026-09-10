import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { RiskAnalysisPanel } from "../components/RiskAnalysisPanel";
import { usePaymentSecurityDetail } from "../hooks/useSecurityHooks";

/**
 * Full security investigation page for a single payment.
 * Route: /security/payment/:paymentId
 */
export const PaymentSecurityPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { data } = usePaymentSecurityDetail(paymentId);

  if (!paymentId) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-4 sm:px-6 py-4 bg-slate-900/50">
        <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-start">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white">
                Security Investigation
              </h1>
              <p className="text-xs text-slate-400">
                {data?.payment.payment_reference ?? paymentId.slice(0, 16)}
              </p>
            </div>
          </div>
          <div className="sm:ml-auto">
            <button
              onClick={() => navigate(`/payments/${paymentId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <span className="hidden xs:inline">View Payment</span> <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">
        <RiskAnalysisPanel paymentId={paymentId} />
      </div>
    </div>
  );
};

export default PaymentSecurityPage;

import React, { useState } from "react";
import { Modal, Button } from "@bhagirathi/ui";
import { useArchivedTenantDossier } from "../hooks/api/useTenant";
import {
  User,
  Home,
  Receipt,
  CreditCard,
  Zap,
  MessageSquare,
  FileText,
  Files,
  Clock,
  ExternalLink,
  Download,
  RotateCcw
} from "lucide-react";
import { formatDate } from "@bhagirathi/utils";

interface ArchivedTenantDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string | null;
  onRestoreTrigger?: (dossier: any) => void;
  onRestoreClick?: (tenant: any) => void;
}

export const ArchivedTenantDossierModal: React.FC<ArchivedTenantDossierModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  onRestoreTrigger,
  onRestoreClick
}) => {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const { data: dossier, isLoading, isError } = useArchivedTenantDossier(tenantId);

  if (!isOpen) return null;

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "rooms", label: "Room History", count: dossier?.room_history?.length, icon: Home },
    { id: "rent", label: "Rent History", count: dossier?.rent_history?.length, icon: Receipt },
    { id: "payments", label: "Payments", count: dossier?.payment_history?.length, icon: CreditCard },
    { id: "elec_bills", label: "Electricity Bills", count: dossier?.electricity_bills?.length, icon: Zap },
    { id: "elec_payments", label: "Electricity Payments", count: dossier?.electricity_payments?.length, icon: Zap },
    { id: "complaints", label: "Complaints", count: dossier?.complaints?.length, icon: MessageSquare },
    { id: "contracts", label: "Contracts", count: dossier?.contracts?.length, icon: FileText },
    { id: "documents", label: "Documents", count: dossier?.documents?.length, icon: Files },
    { id: "receipts", label: "Receipts", count: dossier?.receipts?.length, icon: Receipt },
    { id: "audit", label: "Audit Trail", count: dossier?.audit_history?.length, icon: Clock },
  ];

  const tenant = dossier?.tenant;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Archived Tenant Historical Dossier"
      className="max-w-5xl w-full"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold">Loading historical tenant dossier...</p>
        </div>
      ) : isError || !dossier ? (
        <div className="p-8 text-center text-xs text-red-500">
          Failed to load historical dossier. Please try again.
        </div>
      ) : (
        <div className="flex flex-col h-[78vh]">
          {/* Header Banner */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-red-500 overflow-hidden flex items-center justify-center shrink-0">
                {tenant?.photo_url ? (
                  <img src={tenant.photo_url} alt={tenant.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{tenant?.full_name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Archived
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  ID: {tenant?.id} • Phone: {tenant?.phone} • Email: {tenant?.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-right text-[11px]">
                <p className="text-slate-500">
                  Archived on: <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(tenant?.archived_at || "")}</span>
                </p>
                {tenant?.archived_by_name && (
                  <p className="text-slate-500">
                    Archived by: <span className="font-bold text-slate-800 dark:text-slate-200">{tenant.archived_by_name}</span>
                  </p>
                )}
                {tenant?.archive_reason && (
                  <p className="text-red-600 dark:text-red-400 text-[10px] italic">
                    Reason: "{tenant.archive_reason}"
                  </p>
                )}
              </div>

              {(onRestoreTrigger || onRestoreClick) && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (onRestoreTrigger && dossier) onRestoreTrigger(dossier);
                    else if (onRestoreClick) onRestoreClick(tenant);
                  }}
                  className="flex items-center gap-1.5 font-bold cursor-pointer shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Tenant</span>
                </Button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 px-4 scrollbar-thin shrink-0 select-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-red-500 text-red-600 dark:text-red-400 bg-white/70 dark:bg-slate-900/70"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {typeof tab.count === "number" && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 overflow-y-auto p-5 text-xs">
            {/* 1. Profile Section */}
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 space-y-3">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    Personal Particulars
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Full Name</span>
                      <span className="font-bold text-slate-900 dark:text-white">{tenant?.full_name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Gender</span>
                      <span className="font-bold">{tenant?.gender || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Date of Birth</span>
                      <span className="font-bold">{tenant?.dob ? formatDate(tenant.dob, false) : "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Blood Group</span>
                      <span className="font-bold">{tenant?.blood_group || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Aadhaar Number</span>
                      <span className="font-mono font-bold">{tenant?.aadhaar_number || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Joining Date</span>
                      <span className="font-bold">{tenant?.joining_date ? formatDate(tenant.joining_date, false) : "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 space-y-3">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    Contact & Address
                  </h4>
                  <div className="space-y-2.5 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Permanent Address</span>
                      <span className="text-slate-800 dark:text-slate-200">{tenant?.permanent_address || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current Address</span>
                      <span className="text-slate-800 dark:text-slate-200">{tenant?.current_address || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Guardian Name</span>
                        <span className="font-bold">{tenant?.guardian_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Guardian Phone</span>
                        <span className="font-bold">{tenant?.guardian_phone || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Room History */}
            {activeTab === "rooms" && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Hostel</th>
                      <th className="p-3">Building / Floor</th>
                      <th className="p-3">Room</th>
                      <th className="p-3">Bed</th>
                      <th className="p-3">Check-in Date</th>
                      <th className="p-3">Check-out Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {dossier.room_history.length === 0 ? (
                      <tr><td colSpan={8} className="p-6 text-center text-slate-400">No room allocations recorded.</td></tr>
                    ) : (
                      dossier.room_history.map((alloc) => (
                        <tr key={alloc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{alloc.hostel_name}</td>
                          <td className="p-3">{alloc.building_name} • {alloc.floor_name}</td>
                          <td className="p-3 font-bold">Room {alloc.room_number}</td>
                          <td className="p-3">Bed {alloc.bed_number}</td>
                          <td className="p-3">{alloc.start_date ? formatDate(alloc.start_date, false) : "N/A"}</td>
                          <td className="p-3">{alloc.end_date ? formatDate(alloc.end_date, false) : "Current / Open"}</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">{alloc.allocation_type}</span></td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${alloc.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                              {alloc.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Rent History */}
            {activeTab === "rent" && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Billing Period</th>
                      <th className="p-3">Rent</th>
                      <th className="p-3">Deposit</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Paid Amount</th>
                      <th className="p-3">Outstanding</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {dossier.rent_history.length === 0 ? (
                      <tr><td colSpan={8} className="p-6 text-center text-slate-400">No rent ledger records found.</td></tr>
                    ) : (
                      dossier.rent_history.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">Month {r.rent_month} / {r.rent_year}</td>
                          <td className="p-3 font-mono">₹{r.monthly_rent.toFixed(2)}</td>
                          <td className="p-3 font-mono">₹{r.security_deposit.toFixed(2)}</td>
                          <td className="p-3 font-mono font-bold">₹{r.total_amount.toFixed(2)}</td>
                          <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">₹{r.paid_amount.toFixed(2)}</td>
                          <td className="p-3 font-mono text-red-600 dark:text-red-400 font-bold">₹{r.outstanding_amount.toFixed(2)}</td>
                          <td className="p-3">{r.due_date ? formatDate(r.due_date, false) : "N/A"}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === "PAID" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                            }`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. Payment History */}
            {activeTab === "payments" && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">UTR / Ref</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Verification</th>
                      <th className="p-3">Proof</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {dossier.payment_history.length === 0 ? (
                      <tr><td colSpan={7} className="p-6 text-center text-slate-400">No payment transactions found.</td></tr>
                    ) : (
                      dossier.payment_history.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{p.payment_date ? formatDate(p.payment_date, false) : "N/A"}</td>
                          <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{p.total_amount.toFixed(2)}</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">{p.payment_method}</span></td>
                          <td className="p-3 font-mono text-[11px]">{p.utr || p.transaction_id || "N/A"}</td>
                          <td className="p-3 text-[10px] font-bold uppercase">{p.payment_type || "RENT"}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.verification_status === "VERIFIED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}>
                              {p.verification_status}
                            </span>
                          </td>
                          <td className="p-3">
                            {p.proof_image_url ? (
                              <a href={p.proof_image_url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline flex items-center gap-1 font-bold">
                                <ExternalLink className="w-3 h-3" />
                                <span>Proof</span>
                              </a>
                            ) : (
                              <span className="text-slate-400">None</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. Electricity Bills */}
            {activeTab === "elec_bills" && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Room</th>
                      <th className="p-3">Billing Period</th>
                      <th className="p-3">Units</th>
                      <th className="p-3">Unit Rate</th>
                      <th className="p-3">Bill Amount</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {dossier.electricity_bills.length === 0 ? (
                      <tr><td colSpan={7} className="p-6 text-center text-slate-400">No electricity bill records found for this tenant's rooms.</td></tr>
                    ) : (
                      dossier.electricity_bills.map((eb) => (
                        <tr key={eb.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">Room {eb.room_number}</td>
                          <td className="p-3">{eb.billing_month || `Month ${eb.bill_month}/${eb.bill_year}`}</td>
                          <td className="p-3 font-mono">{eb.units} units</td>
                          <td className="p-3 font-mono">₹{eb.unit_rate.toFixed(2)}</td>
                          <td className="p-3 font-mono font-bold">₹{eb.bill_amount.toFixed(2)}</td>
                          <td className="p-3">{eb.due_date ? formatDate(eb.due_date, false) : "N/A"}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700">
                              {eb.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. Electricity Payments */}
            {activeTab === "elec_payments" && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Electricity Share Amount</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">UTR / Ref</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {dossier.electricity_payments.length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-slate-400">No electricity payment entries found.</td></tr>
                    ) : (
                      dossier.electricity_payments.map((ep) => (
                        <tr key={ep.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{ep.payment_date ? formatDate(ep.payment_date, false) : "N/A"}</td>
                          <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{ep.amount.toFixed(2)}</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">{ep.payment_method}</span></td>
                          <td className="p-3 font-mono text-[11px]">{ep.transaction_id || "N/A"}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              {ep.verification_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 7. Complaints */}
            {activeTab === "complaints" && (
              <div className="space-y-3">
                {dossier.complaints.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-400">
                    No complaints filed by this tenant.
                  </div>
                ) : (
                  dossier.complaints.map((comp) => (
                    <div key={comp.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 dark:text-white text-xs">{comp.title}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">{comp.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">{comp.priority}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">{comp.status}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">{comp.description}</p>
                      {comp.resolution_notes && (
                        <p className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-100 dark:border-slate-800">
                          <span className="font-bold">Resolution Notes: </span>{comp.resolution_notes}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">Logged: {formatDate(comp.created_at || "")}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 8. Contracts */}
            {activeTab === "contracts" && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Contract #</th>
                      <th className="p-3">Room</th>
                      <th className="p-3">Start Date</th>
                      <th className="p-3">End Date</th>
                      <th className="p-3">Rent</th>
                      <th className="p-3">Deposit</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Document</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {dossier.contracts.length === 0 ? (
                      <tr><td colSpan={8} className="p-6 text-center text-slate-400">No contracts found.</td></tr>
                    ) : (
                      dossier.contracts.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-bold font-mono text-slate-900 dark:text-white">{c.contract_number}</td>
                          <td className="p-3">Room {c.room_number}</td>
                          <td className="p-3">{c.start_date ? formatDate(c.start_date, false) : "N/A"}</td>
                          <td className="p-3">{c.end_date ? formatDate(c.end_date, false) : "Open"}</td>
                          <td className="p-3 font-mono font-bold">₹{c.rent_amount.toFixed(2)}</td>
                          <td className="p-3 font-mono">₹{c.security_deposit.toFixed(2)}</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">{c.status}</span></td>
                          <td className="p-3">
                            {c.agreement_url ? (
                              <a href={c.agreement_url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline flex items-center gap-1 font-bold">
                                <ExternalLink className="w-3 h-3" />
                                <span>Agreement</span>
                              </a>
                            ) : (
                              <span className="text-slate-400">None</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 9. Documents */}
            {activeTab === "documents" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {dossier.documents.length === 0 ? (
                  <div className="col-span-full p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-400">
                    No documents uploaded.
                  </div>
                ) : (
                  dossier.documents.map((doc) => (
                    <div key={doc.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white">{doc.document_type}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800">{doc.status}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Uploaded: {formatDate(doc.created_at || "")}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <a
                          href={doc.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-center font-bold text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View File</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 10. Receipts */}
            {activeTab === "receipts" && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Receipt Number</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Generated Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {dossier.receipts.length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-slate-400">No payment receipts issued.</td></tr>
                    ) : (
                      dossier.receipts.map((rc) => (
                        <tr key={rc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{rc.receipt_number}</td>
                          <td className="p-3 font-bold uppercase text-[10px]">{rc.receipt_type}</td>
                          <td className="p-3">{rc.generated_at ? formatDate(rc.generated_at) : "N/A"}</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">{rc.status}</span></td>
                          <td className="p-3">
                            {rc.pdf_url ? (
                              <a href={rc.pdf_url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline flex items-center gap-1 font-bold">
                                <Download className="w-3 h-3" />
                                <span>Download PDF</span>
                              </a>
                            ) : (
                              <span className="text-slate-400">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 11. Audit Trail */}
            {activeTab === "audit" && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Target Table</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Details / Values</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {dossier.audit_history.length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-slate-400">No audit log entries recorded.</td></tr>
                    ) : (
                      dossier.audit_history.map((al) => (
                        <tr key={al.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 text-[11px] text-slate-500">{al.created_at ? formatDate(al.created_at) : "N/A"}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                              {al.action}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[10px]">{al.table_name}</td>
                          <td className="p-3 font-bold">{al.actor_name}</td>
                          <td className="p-3 text-[10px] font-mono text-slate-500 max-w-xs truncate">
                            {JSON.stringify(al.new_values || al.old_values || {})}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

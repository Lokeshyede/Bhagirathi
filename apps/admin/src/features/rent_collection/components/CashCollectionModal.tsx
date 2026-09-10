import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote, X, Info, Search, AlertTriangle, RefreshCw
} from "lucide-react";
import { Button, Input, Select, Textarea } from "@bhagirathi/ui";
import { useTenants } from "../../tenant/hooks/api/useTenant";
import {
  useTenantCurrentObligation,
  useRecordCashCollection
} from "../hooks/useRentCollection";
import { useToastStore } from "../../../store/useToastStore";

interface CashCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTenantId?: string | null;
}

export const CashCollectionModal: React.FC<CashCollectionModalProps> = ({
  isOpen,
  onClose,
  initialTenantId = null
}) => {
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [remarks, setRemarks] = useState("Cash collected by Admin");
  const [billingMonth, setBillingMonth] = useState<number | "">("");
  const [billingYear, setBillingYear] = useState<number | "">("");
  const toast = useToastStore();

  // Queries & Mutations
  const { data: tenants, isLoading: isTenantsLoading } = useTenants();
  const { 
    data: obligation, 
    isLoading: isObligationLoading,
    isError: isObligationError,
    error: obligationError
  } = useTenantCurrentObligation(selectedTenantId || null);
  const recordCollection = useRecordCashCollection();

  // Reset or set initial tenant
  useEffect(() => {
    if (initialTenantId) {
      setSelectedTenantId(initialTenantId);
    } else {
      setSelectedTenantId("");
    }
    setAmount("");
    setRemarks("Cash collected by Admin");
  }, [initialTenantId, isOpen]);

  // Set default amount when obligation is loaded
  useEffect(() => {
    if (obligation && obligation.has_rent_config) {
      setAmount(String(obligation.outstanding_amount));
      if (obligation.billing_month) {
        setBillingMonth(obligation.billing_month);
      }
      if (obligation.billing_year) {
        setBillingYear(obligation.billing_year);
      }
    } else {
      setAmount("");
    }
  }, [obligation]);

  const activeTenants = tenants?.filter(t => t.status === "ACTIVE" || t.is_active) || [];
  const filteredTenants = activeTenants.filter(t =>
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.tenant_id || t.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTenantId) {
      toast.error("Please select a tenant.");
      return;
    }

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }

    try {
      await recordCollection.mutateAsync({
        tenant_id: selectedTenantId,
        amount: amtNum,
        remarks,
        billing_month: billingMonth === "" ? undefined : billingMonth,
        billing_year: billingYear === "" ? undefined : billingYear
      });
      toast.success("Cash payment recorded successfully. Rent settled and receipt generated.");
      setAmount("");
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to record cash payment collection.");
    }
  };

  const currentTenantObj = tenants?.find(t => t.id === selectedTenantId);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border dark:border-gray-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-primaryText dark:text-white uppercase tracking-wider">Record Cash Rent</h3>
                    <p className="text-[10px] text-muted font-medium">Record cash payment, settle rent ledger, and generate receipt automatically</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-muted transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Tenant Selector */}
                {!initialTenantId ? (
                  <div className="space-y-1.5">
                    <Input
                      label="Select Resident Tenant"
                      type="text"
                      placeholder="Search tenant by name, ID..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      leftIcon={Search}
                    />
                    
                    {/* Dropdown area */}
                    <div className="border border-border dark:border-gray-800 rounded max-h-36 overflow-y-auto divide-y divide-border dark:divide-gray-800">
                      {isTenantsLoading ? (
                        <div className="p-3 text-xs text-muted">Loading tenants...</div>
                      ) : filteredTenants.length === 0 ? (
                        <div className="p-3 text-xs text-muted">No active tenants found.</div>
                      ) : (
                        filteredTenants.map(t => (
                          <div
                            key={t.id}
                            onClick={() => {
                              setSelectedTenantId(t.id);
                              setSearchQuery(t.full_name);
                            }}
                            className={`p-2.5 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                              selectedTenantId === t.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-secondaryText dark:text-gray-300"
                            }`}
                          >
                            <span>{t.full_name} ({t.tenant_id || t.id})</span>
                            <span className="text-[10px] text-muted font-mono">{(t as any).room_number ? `Room ${(t as any).room_number}` : ((t as any).room_id ? "Room Assigned" : "No Room")}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-55/45 dark:bg-gray-950 border border-border dark:border-gray-800 rounded-xl flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                      {currentTenantObj?.full_name?.charAt(0) || "T"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primaryText dark:text-white">{currentTenantObj?.full_name}</p>
                      <p className="text-[10px] text-muted">{currentTenantObj?.tenant_id || currentTenantObj?.id} · Room {(currentTenantObj as any)?.room_number || "Assigned"}</p>
                    </div>
                  </div>
                )}

                {/* 2. Rent Obligation Context */}
                {selectedTenantId && (
                  <div className="p-4 bg-gray-55/50 dark:bg-gray-950/20 border border-border dark:border-gray-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-border dark:border-gray-850 pb-2">
                      <h4 className="text-[10px] text-muted font-bold uppercase tracking-wider">Current Rent Obligation</h4>
                      {isObligationLoading ? (
                        <RefreshCw className="h-3 w-3 animate-spin text-muted" />
                      ) : (
                        <span className="text-[10px] font-bold text-primary uppercase">{obligation?.period_label || "Current Period"}</span>
                      )}
                    </div>

                    {isObligationError ? (
                      <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Error fetching obligation</p>
                          <p>{(obligationError as any)?.response?.data?.detail || "An unexpected server error occurred (500)."}</p>
                        </div>
                      </div>
                    ) : obligation?.has_rent_config ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <span className="text-[9px] text-muted uppercase font-bold block">Base Room Rent</span>
                          <span className="text-xs font-extrabold text-primaryText dark:text-white mt-1 block">₹{obligation.room_rent?.toLocaleString("en-IN")}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-muted uppercase font-bold block">Calculated Share</span>
                          <span className="text-xs font-extrabold text-primary mt-1 block">₹{obligation.configured_rent?.toLocaleString("en-IN")}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-muted uppercase font-bold block">Paid So Far</span>
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">₹{obligation.paid_amount?.toLocaleString("en-IN")}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-muted uppercase font-bold block">Outstanding Balance</span>
                          <span className="text-xs font-extrabold text-red-650 dark:text-red-400 mt-1 block">₹{obligation.outstanding_amount?.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    ) : (
                      !isObligationLoading && (
                        <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-500">
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                          <p>{obligation?.error || "This tenant does not have a valid rent configuration or active contract."}</p>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* 3. Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Amount Collected (₹)"
                    type="number"
                    step="any"
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />

                  <Select
                    label="Billing Month"
                    value={billingMonth}
                    onChange={e => setBillingMonth(e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="" disabled>Select Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("default", { month: "long" })}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Billing Year"
                    value={billingYear}
                    onChange={e => setBillingYear(e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="" disabled>Select Year</option>
                    <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                    <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                  </Select>
                </div>

                <Textarea
                  label="Internal Remarks / Description"
                  rows={2}
                  placeholder="Provide details about cash hand-over..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />

                {/* Notifications & warnings */}
                <div className="flex items-start gap-2 p-3 bg-emerald-500/[0.05] border border-emerald-500/15 rounded-xl text-[10px] text-emerald-800 dark:text-emerald-300">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Recording a cash payment immediately finalizes the rent ledger and generates a receipt for the tenant.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="pt-4 border-t border-border dark:border-gray-800 flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={recordCollection.isPending || !selectedTenantId || !amount || !billingMonth || !billingYear}
                    isLoading={recordCollection.isPending}
                    className="flex items-center gap-2"
                  >
                    {!recordCollection.isPending && <Banknote className="h-4 w-4" />}
                    Record Cash Payment
                  </Button>
                </div>

              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

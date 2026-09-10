import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTenant360, useTenantMutations } from "../hooks/api/useTenant";
import { useTenantCurrentObligation } from "../../rent_collection/hooks/useRentCollection";
import {
  User,
  Home,
  ChevronRight,
  ArrowLeft,
  Edit3,
  ShieldAlert,
  FileText,
  Clock,
  IndianRupee,
  Zap,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  LogOut,
  DoorOpen,
  FileCheck,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Download,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@bhagirathi/utils";
import { Button, Spinner } from "@bhagirathi/ui";
import { TenantForm } from "../components/TenantForm";
import { DocumentUploader } from "../components/DocumentUploader";
import { TransferRoomDialog } from "../components/TransferRoomDialog";
import { CheckOutDialog } from "../components/CheckOutDialog";

export const TenantProfilePage: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();

  const { data: dossier, isLoading, isError, refetch } = useTenant360(tenantId);
  const { data: obligation, isLoading: isObligationLoading } = useTenantCurrentObligation(tenantId || null);
  const { updateTenant, deleteTenantDocument, updateTenantDocumentStatus, renewContract } = useTenantMutations();

  // Document Lightbox preview state
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  // Collapsible state
  const [openSections, setOpenSections] = useState({
    personal: true,
    room: true,
    contract: true,
    documents: true,
    timeline: true,
    payments: true,
    electricity: true,
    complaints: true,
    history: true
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);

  // Contract Renew local state
  const [renewEndDate, setRenewEndDate] = useState("");
  const [renewRent, setRenewRent] = useState("");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-[600px] text-secondaryText bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card select-none">
        <Spinner size="lg" className="mb-4 text-primary animate-spin" />
        <h4 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
          Loading 360° Tenant Dossier...
        </h4>
        <p className="text-xs text-muted dark:text-gray-500 mt-1">
          Aggregating profile details, room allocations, lease contracts, and document registry.
        </p>
      </div>
    );
  }

  if (isError || !dossier || !dossier.tenant) {
    return (
      <div className="p-8 text-center border border-danger/20 bg-danger/5 dark:bg-red-950/10 rounded-card space-y-4 select-none">
        <ShieldAlert className="h-10 w-10 text-danger mx-auto" />
        <div>
          <h3 className="font-extrabold text-base text-danger">Tenant Dossier Not Found</h3>
          <p className="text-xs text-muted dark:text-gray-400 mt-1">
            The requested tenant record could not be retrieved or has been unlinked.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate("/tenants")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Tenant Registry
          </Button>
          <Button onClick={() => refetch()}>
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  const {
    tenant,
    room,
    bed,
    hostel,
    active_contract,
    documents,
    timeline,
    payment_summary,
    electricity_summary
  } = dossier;


  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active_contract || !renewEndDate) return;
    try {
      await renewContract.mutateAsync({
        contractId: active_contract.id,
        data: {
          new_end_date: renewEndDate,
          new_monthly_rent: renewRent ? Number(renewRent) : undefined
        }
      });
      setIsRenewOpen(false);
      refetch();
    } catch (err: any) {
      alert("Failed to renew contract.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-16"
    >
      {/* 1. Header & Navigation */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 p-4.5 rounded-card shadow-card space-y-4 select-none">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondaryText dark:text-gray-400">
            <Home className="h-4 w-4 text-primary shrink-0" />
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link to="/tenants" className="hover:text-primary transition cursor-pointer">
              Tenant Registry
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-primary" />
            <span className="font-extrabold text-primary">{tenant.full_name}</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/tenants")}
              className="inline-flex items-center gap-1 font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center gap-1 font-bold"
            >
              <Edit3 className="h-3.5 w-3.5 text-primary" />
              <span>Edit Profile</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setIsDocOpen(true)}
              className="inline-flex items-center gap-1 font-bold"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Document</span>
            </Button>
          </div>
        </div>

        {/* Profile Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-gray-150 dark:border-gray-800">
          <div className="flex items-center gap-4">
            {tenant.photo_url ? (
              <img
                src={tenant.photo_url}
                alt={tenant.full_name}
                className="h-16 w-16 rounded-full object-cover border-2 border-primary shadow-sm shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-orange-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
                {(tenant?.full_name ?? "T").charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black text-primaryText dark:text-white tracking-tight">
                  {tenant.full_name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase border ${
                  tenant.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                    : "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:border-gray-700"
                }`}>
                  {tenant.status}
                </span>
              </div>
              <p className="text-xs text-muted dark:text-gray-400 mt-1 font-medium flex items-center gap-3 flex-wrap">
                <span>📱 {tenant.phone}</span>
                <span>&bull;</span>
                <span>✉️ {tenant.email}</span>
                {tenant.company_college && (
                  <>
                    <span>&bull;</span>
                    <span>🏛️ {tenant.company_college}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {tenant.room_id ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTransferOpen(true)}
                className="inline-flex items-center gap-1.5 font-bold"
              >
                <RefreshCw className="h-3.5 w-3.5 text-primary" />
                <span>Transfer Room</span>
              </Button>
            ) : null}

            {tenant.room_id ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCheckoutOpen(true)}
                className="inline-flex items-center gap-1.5 font-bold text-red-600 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Checkout</span>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* SECTION 1: PERSONAL INFORMATION */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
        <div
          onClick={() => toggleSection("personal")}
          className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-950/40 border-b border-border dark:border-gray-800 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
              👤 Personal & Contact Dossier
            </h3>
          </div>
          {openSections.personal ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
        </div>

        <AnimatePresence>
          {openSections.personal && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-5 space-y-4"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs select-none">
                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Full Name</span>
                  <span className="font-extrabold text-primaryText dark:text-white mt-0.5 block">{tenant.full_name}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Gender</span>
                  <span className="font-extrabold text-primaryText dark:text-white mt-0.5 block">{tenant.gender || "Not Listed"}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Date of Birth</span>
                  <span className="font-extrabold text-primaryText dark:text-white mt-0.5 block">{tenant.dob || "N/A"}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Aadhaar Number</span>
                  <span className="font-extrabold text-primaryText dark:text-white mt-0.5 block">{tenant.aadhaar_number || "Unverified"}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Blood Group</span>
                  <span className="font-extrabold text-red-600 dark:text-red-400 mt-0.5 block">{tenant.blood_group || "N/A"}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Joining Date</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{tenant.joining_date || "N/A"}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Guardian Name</span>
                  <span className="font-extrabold text-primaryText dark:text-white mt-0.5 block">{tenant.guardian_name || "N/A"}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Guardian Phone</span>
                  <span className="font-extrabold text-primaryText dark:text-white mt-0.5 block">{tenant.guardian_phone || "N/A"}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Emergency Contact</span>
                  <span className="font-extrabold text-primaryText dark:text-white mt-0.5 block">{tenant.emergency_contact || "N/A"}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Occupation</span>
                  <span className="font-extrabold text-primaryText dark:text-white mt-0.5 block">{tenant.occupation || "N/A"}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850 col-span-2">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">College / Company</span>
                  <span className="font-extrabold text-primaryText dark:text-white mt-0.5 block truncate">{tenant.company_college || "N/A"}</span>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs select-none pt-2">
                <div className="p-3.5 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850 space-y-1">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Permanent Address</span>
                  <p className="text-secondaryText dark:text-gray-300 font-medium">
                    {tenant.permanent_address || "No permanent address recorded."}
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850 space-y-1">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Current Address</span>
                  <p className="text-secondaryText dark:text-gray-300 font-medium">
                    {tenant.current_address || "No current address recorded."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 2: CURRENT ROOM & BED */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
        <div
          onClick={() => toggleSection("room")}
          className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-950/40 border-b border-border dark:border-gray-800 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-purple-600" />
            <h3 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
              🏠 Current Room & Bed Space
            </h3>
          </div>
          {openSections.room ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
        </div>

        <AnimatePresence>
          {openSections.room && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-5"
            >
              {!room ? (
                <div className="text-center py-6 text-xs text-muted dark:text-gray-500 select-none space-y-2">
                  <DoorOpen className="h-8 w-8 text-gray-300 mx-auto" />
                  <p className="font-bold">No Active Room Allocation</p>
                  <p className="text-xxs">This tenant is currently not allocated to any bed or room.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-center select-none">
                  <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                    <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Hostel</span>
                    <span className="font-extrabold text-primaryText dark:text-white mt-1 block truncate">{hostel?.name || "Bhagirathi"}</span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                    <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Room Number</span>
                    <span className="font-black text-primary text-sm mt-1 block">Room {room.room_number}</span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                    <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Bed Number</span>
                    <span className="font-black text-purple-600 dark:text-purple-400 text-sm mt-1 block">Bed {bed?.bed_number || "N/A"}</span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                    <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Monthly Rent</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{formatCurrency(room.room_rent).split(".00")[0]}</span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                    <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Capacity</span>
                    <span className="font-extrabold text-primaryText dark:text-white mt-1 block">{room.capacity} Beds</span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                    <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Split Rule</span>
                    <span className="font-extrabold text-purple-600 uppercase mt-1 block">{room.rent_split_type || "Equal"}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 3: LEASE CONTRACT DETAILS */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
        <div
          onClick={() => toggleSection("contract")}
          className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-950/40 border-b border-border dark:border-gray-800 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
              📜 Lease Contract Details
            </h3>
          </div>
          {openSections.contract ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
        </div>

        <AnimatePresence>
          {openSections.contract && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-5 space-y-4"
            >
              {!active_contract ? (
                <div className="text-center py-6 text-xs text-muted dark:text-gray-500 select-none">
                  No active lease contract record.
                </div>
              ) : (
                <div className="space-y-4 select-none">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-center">
                    <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                      <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Contract No.</span>
                      <span className="font-mono font-black text-xs text-primary mt-1 block">{active_contract.contract_number}</span>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                      <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Start Date</span>
                      <span className="font-extrabold text-primaryText dark:text-white mt-1 block">{active_contract.start_date}</span>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                      <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">End / Exp. Date</span>
                      <span className="font-extrabold text-primaryText dark:text-white mt-1 block">{active_contract.end_date || "Open"}</span>
                    </div>

                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded">
                      <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block">Monthly Rent</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
                        {isObligationLoading ? "..." : (obligation?.has_rent_config ? formatCurrency(obligation.configured_rent).split(".00")[0] : formatCurrency(active_contract.monthly_rent).split(".00")[0])}
                      </span>
                    </div>

                    <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 rounded">
                      <span className="text-[9px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest block">Security Deposit</span>
                      <span className="font-black text-purple-700 dark:text-purple-400 mt-1 block">{formatCurrency(active_contract.security_deposit).split(".00")[0]}</span>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded border border-border dark:border-gray-850">
                      <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Status</span>
                      <span className="font-black text-emerald-600 uppercase mt-1 block">{active_contract.status}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-150 dark:border-gray-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsRenewOpen(true)}
                      className="inline-flex items-center gap-1.5 font-bold text-xs"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-primary" />
                      <span>Renew / Extend Lease</span>
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 4: UPLOADED DOCUMENTS */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
        <div
          onClick={() => toggleSection("documents")}
          className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-950/40 border-b border-border dark:border-gray-800 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
              📁 Uploaded Verification Documents ({documents.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsDocOpen(true);
              }}
              className="inline-flex items-center gap-1 font-bold text-xs h-7.5 px-2.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Document</span>
            </Button>
            {openSections.documents ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
          </div>
        </div>

        <AnimatePresence>
          {openSections.documents && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-5 space-y-4"
            >
              {documents.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted dark:text-gray-500 select-none space-y-3">
                  <FileText className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto" />
                  <div>
                    <p className="font-bold text-sm text-primaryText dark:text-white">No Verification Documents Uploaded</p>
                    <p className="text-xs text-muted mt-0.5">Upload Aadhaar, PAN, College ID, Agreement PDF or Police Verification docs.</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsDocOpen(true)}
                    className="inline-flex items-center gap-1.5 font-bold text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Upload First Document</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {documents.map((doc: any) => {
                    const docUrl = doc.document_url || doc.file_path || "";
                    const isImage = docUrl.match(/\.(jpeg|jpg|png|webp)($|\?)/i);

                    const urlFilename = (() => {
                      try {
                        const parts = docUrl.split("/");
                        const raw = parts[parts.length - 1] || "";
                        return raw.split("?")[0] || "document";
                      } catch {
                        return "document";
                      }
                    })();

                    const docStatus = (doc.status || "PENDING").toUpperCase();
                    const statusConfig: Record<string, { label: string; cls: string }> = {
                      VERIFIED: { label: "VERIFIED", cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" },
                      REJECTED: { label: "REJECTED", cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30" },
                      SECURITY_HOLD: { label: "ON HOLD", cls: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30" },
                      PENDING: { label: "PENDING", cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30" },
                    };
                    const badge = statusConfig[docStatus] ?? statusConfig.PENDING;

                    return (
                      <div
                        key={doc.id}
                        className="p-4 border border-border dark:border-gray-800 rounded-card bg-gray-50/30 dark:bg-gray-950/20 space-y-3 select-none flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 text-primary shrink-0" />
                              <h4 className="font-extrabold text-xs text-primaryText dark:text-white uppercase truncate" title={doc.document_type}>
                                {doc.document_type?.replace(/_/g, " ")}
                              </h4>
                            </div>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border shrink-0 ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </div>

                          {/* Image Thumbnail Preview */}
                          {isImage ? (
                            <div
                              onClick={() => setPreviewDoc({ url: docUrl, title: doc.document_type?.replace(/_/g, " ") || "Document" })}
                              className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-850 cursor-pointer group border border-border dark:border-gray-800"
                            >
                              <img
                                src={docUrl}
                                alt={doc.document_type}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                                <Eye className="h-4 w-4" />
                                <span>Preview</span>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => window.open(docUrl, "_blank")}
                              className="h-24 w-full rounded-lg bg-red-50 dark:bg-red-955/15 border border-red-100 dark:border-red-900/20 flex flex-col items-center justify-center cursor-pointer hover:bg-red-100/50 transition group p-2 text-center"
                            >
                              <FileText className="h-8 w-8 text-red-600 mb-1 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-bold text-red-700 dark:text-red-400 truncate max-w-full">
                                PDF Document &bull; Click to open
                              </span>
                            </div>
                          )}

                          {/* Filename */}
                          <p className="text-[10px] text-muted dark:text-gray-500 font-mono truncate" title={urlFilename}>
                            {urlFilename}
                          </p>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="space-y-2 pt-2 border-t border-gray-150 dark:border-gray-850">
                          {/* Status quick toggle buttons */}
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-bold text-muted uppercase">Verification:</span>
                            <div className="flex gap-1">
                              {docStatus !== "VERIFIED" && (
                                <button
                                  onClick={async () => {
                                    await updateTenantDocumentStatus.mutateAsync({ tenantId: tenant.id, docId: doc.id, status: "VERIFIED" });
                                    refetch();
                                  }}
                                  className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 text-[9px] font-bold border border-emerald-200 dark:border-emerald-800 transition cursor-pointer flex items-center gap-0.5"
                                  title="Mark as Verified"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Approve</span>
                                </button>
                              )}
                              {docStatus !== "REJECTED" && (
                                <button
                                  onClick={async () => {
                                    await updateTenantDocumentStatus.mutateAsync({ tenantId: tenant.id, docId: doc.id, status: "REJECTED" });
                                    refetch();
                                  }}
                                  className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-955/30 text-red-700 dark:text-red-400 hover:bg-red-100 text-[9px] font-bold border border-red-200 dark:border-red-800 transition cursor-pointer flex items-center gap-0.5"
                                  title="Mark as Rejected"
                                >
                                  <X className="h-3 w-3" />
                                  <span>Reject</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  if (isImage) {
                                    setPreviewDoc({ url: docUrl, title: doc.document_type?.replace(/_/g, " ") || "Document" });
                                  } else {
                                    window.open(docUrl, "_blank");
                                  }
                                }}
                                className="p-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition cursor-pointer text-xs font-bold flex items-center gap-1"
                                title="Preview / Open"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>View</span>
                              </button>

                              <a
                                href={docUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 hover:text-white transition cursor-pointer text-xs font-bold flex items-center gap-1 no-underline text-inherit"
                                title="Download"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>Download</span>
                              </a>
                            </div>

                            <button
                              onClick={async () => {
                                if (confirm("Delete this document record?")) {
                                  await deleteTenantDocument.mutateAsync({ tenantId: tenant.id, docId: doc.id });
                                  refetch();
                                }
                              }}
                              className="text-red-600 hover:text-red-700 p-1 cursor-pointer"
                              title="Delete Document"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 5: CHRONOLOGICAL 360° TIMELINE */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
        <div
          onClick={() => toggleSection("timeline")}
          className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-950/40 border-b border-border dark:border-gray-800 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-info" />
            <h3 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
              📜 Chronological 360° Event Timeline ({timeline.length})
            </h3>
          </div>
          {openSections.timeline ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
        </div>

        <AnimatePresence>
          {openSections.timeline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-6"
            >
              <div className="relative pl-6 border-l-2 border-primary/20 space-y-6 select-none">
                {timeline.map((evt: any, idx: number) => (
                  <div key={evt.id || idx} className="relative group">
                    <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-white dark:bg-gray-900 border-2 border-primary group-hover:scale-125 transition-transform" />

                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-primaryText dark:text-white">
                          {evt.title}
                        </span>
                        <span className="text-[10px] text-muted dark:text-gray-500 font-mono">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-secondaryText dark:text-gray-400">
                        {evt.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 6 & 7: PAYMENT HISTORY & ELECTRICITY SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        {/* Payment Summary */}
        <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-5 shadow-card space-y-3">
          <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-emerald-600" />
              <h4 className="font-extrabold text-xs text-primaryText dark:text-white uppercase tracking-wider">
                Payment History &amp; Receipts ({payment_summary.payments?.length || 0})
              </h4>
            </div>
            <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 text-[9px] font-extrabold px-2 py-0.5 rounded">
              Total: {formatCurrency(payment_summary.collected_rent || 0).split(".00")[0]}
            </span>
          </div>

          {!payment_summary.payments || payment_summary.payments.length === 0 ? (
            <div className="p-4 border border-dashed border-gray-250 dark:border-gray-800 rounded-card text-center space-y-1">
              <IndianRupee className="h-6 w-6 text-emerald-600/40 mx-auto" />
              <span className="text-xs font-bold text-secondaryText dark:text-gray-400 block">
                No Payment Records Found
              </span>
              <p className="text-[10px] text-muted dark:text-gray-500">
                Payment submissions and transaction receipts will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {payment_summary.payments.map((p: any) => (
                <div
                  key={p.id}
                  className="p-3 bg-gray-50/50 dark:bg-gray-950/30 border border-border dark:border-gray-850 rounded-xl space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-black text-sm text-primaryText dark:text-white">
                        ₹{Number(p.total_amount || p.amount || 0).toLocaleString("en-IN")}
                      </span>
                      <p className="text-[10px] font-mono text-muted dark:text-gray-400 mt-0.5">
                        UTR: {p.transaction_id || p.utr || "N/A"}
                      </p>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase border ${
                      p.status === "Verified" || p.status === "PAID"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                    }`}>
                      {p.status || "Submitted"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-150 dark:border-gray-850 text-[10px]">
                    <span className="text-muted">
                      {p.submission_date || p.payment_date || (p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN") : "")}
                    </span>

                    <div className="flex gap-2">
                      {p.proof_image_url && (
                        <button
                          onClick={() => setPreviewDoc({ url: p.proof_image_url, title: `Payment Screenshot (${p.transaction_id || "Receipt"})` })}
                          className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          <span>View Proof</span>
                        </button>
                      )}
                      
                      {p.receipt_url && (
                        <a
                          href={p.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>View Receipt</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Electricity Summary */}
        <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-5 shadow-card space-y-3">
          <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <h4 className="font-extrabold text-xs text-primaryText dark:text-white uppercase tracking-wider">
                Electricity Billing Summary
              </h4>
            </div>
            <span className="bg-gray-100 dark:bg-gray-800 text-[9px] font-extrabold px-2 py-0.5 rounded text-muted">
              Live Reading
            </span>
          </div>

          <div className="p-4 border border-dashed border-gray-250 dark:border-gray-800 rounded-card text-center space-y-1">
            <Zap className="h-6 w-6 text-amber-500/40 mx-auto" />
            <span className="text-xs font-bold text-secondaryText dark:text-gray-400 block">
              {electricity_summary.status_message}
            </span>
            <p className="text-[10px] text-muted dark:text-gray-500">
              Sub-meter power readings and utility bill splits are tracked in the Electricity module.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Tenant Modal */}
      {isEditOpen && (
        <TenantForm
          isOpen={true}
          onClose={() => setIsEditOpen(false)}
          onSubmit={async (data) => {
            await updateTenant.mutateAsync({ id: tenant.id, data });
            setIsEditOpen(false);
            refetch();
          }}
          initialData={tenant}
          isLoading={updateTenant.isPending}
        />
      )}

      {/* Document Uploader Modal */}
      {isDocOpen && (
        <DocumentUploader
          isOpen={true}
          onClose={() => setIsDocOpen(false)}
          tenantId={tenant.id}
          onSuccess={() => refetch()}
        />
      )}

      {/* Transfer Room Modal */}
      {isTransferOpen && (
        <TransferRoomDialog
          isOpen={true}
          onClose={() => setIsTransferOpen(false)}
          onSubmit={async () => {
            setIsTransferOpen(false);
            refetch();
          }}
          tenantId={tenant.id}
          tenantName={tenant.full_name}
          isLoading={false}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckOutDialog
          isOpen={true}
          onClose={() => setIsCheckoutOpen(false)}
          onSubmit={async () => {
            setIsCheckoutOpen(false);
            refetch();
          }}
          tenantId={tenant.id}
          tenantName={tenant.full_name}
          isLoading={false}
        />
      )}


      {/* Contract Renew Modal */}
      {isRenewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-extrabold text-primaryText dark:text-white">
              Renew / Extend Lease Contract
            </h3>
            <form onSubmit={handleRenewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-secondaryText dark:text-gray-300 block mb-1">New End Date</label>
                <input
                  type="date"
                  required
                  value={renewEndDate}
                  onChange={(e) => setRenewEndDate(e.target.value)}
                  className="w-full p-2 border border-border dark:border-gray-800 rounded bg-gray-50 dark:bg-gray-950"
                />
              </div>

              <div>
                <label className="font-bold text-secondaryText dark:text-gray-300 block mb-1">New Monthly Rent (Optional)</label>
                <input
                  type="number"
                  placeholder="Leave empty to keep current rent"
                  value={renewRent}
                  onChange={(e) => setRenewRent(e.target.value)}
                  className="w-full p-2 border border-border dark:border-gray-800 rounded bg-gray-50 dark:bg-gray-950"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsRenewOpen(false)}>Cancel</Button>
                <Button type="submit">Renew Lease</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document & Receipt Lightbox Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-3xl w-full max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-gray-950 text-white">
                <span className="text-xs font-black uppercase tracking-wider">{previewDoc.title || "Document Preview"}</span>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50 min-h-[300px]">
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
                />
              </div>
              <div className="p-3 border-t border-white/10 bg-gray-950 flex justify-end gap-2">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 no-underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open in New Tab</span>
                </a>
                <a
                  href={previewDoc.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 no-underline"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TenantProfilePage;

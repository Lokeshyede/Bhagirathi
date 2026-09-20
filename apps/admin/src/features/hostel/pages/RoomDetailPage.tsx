import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRoomDossier, useRoomMutations } from "../hooks/api/useHostel";
import {
  Home,
  ChevronRight,
  DoorOpen,
  Bed as BedIcon,
  Users,
  IndianRupee,
  Zap,
  Clock,
  ArrowLeft,
  Edit3,
  Plus,
  AlertTriangle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@bhagirathi/utils";
import { Button, Spinner, PageHeader } from "@bhagirathi/ui";
import { RoomForm } from "../components/RoomForm";
import { BedForm } from "../components/BedForm";

export const RoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const { data: dossier, isLoading, isError, refetch } = useRoomDossier(roomId);
  const { updateRoom } = useRoomMutations();

  // Collapsible section state
  const [openSections, setOpenSections] = useState({
    info: true,
    beds: true,
    tenants: true,
    rentSplit: true,
    electricity: true,
    timeline: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Modal Dialog states
  const [editRoomOpen, setEditRoomOpen] = useState(false);
  const [addBedOpen, setAddBedOpen] = useState(false);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-[600px] text-secondaryText bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card select-none">
        <Spinner size="lg" className="mb-4 text-primary animate-spin" />
        <h4 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
          Loading Room Dossier & Analytics...
        </h4>
        <p className="text-xs text-muted dark:text-gray-500 mt-1">
          Synchronizing bed allocations, tenant details, and event timeline.
        </p>
      </div>
    );
  }

  if (isError || !dossier) {
    return (
      <div className="p-8 text-center border border-danger/20 bg-danger/5 dark:bg-red-950/10 rounded-card space-y-4 select-none">
        <AlertTriangle className="h-10 w-10 text-danger mx-auto" />
        <div>
          <h3 className="font-extrabold text-base text-danger">Failed to Load Room Dossier</h3>
          <p className="text-xs text-muted dark:text-gray-400 mt-1">
            The requested room could not be retrieved or has been removed.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate("/rooms")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Property Explorer
          </Button>
          <Button onClick={() => refetch()}>
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  const { room, hostel_name, building_name, floor_name, occupancy_percentage, beds, tenants, rent_split, electricity, timeline } = dossier;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-16"
    >
      {/* 1. Header & Breadcrumb Navigation */}
      <PageHeader
        title={`Room ${room.room_number} Dossier`}
        description={
          hostel_name || building_name || floor_name
            ? `Location: ${[hostel_name, building_name, floor_name].filter(Boolean).join(" • ")}`
            : "Complete room configuration, beds, active tenants, and utility split dossier"
        }
        breadcrumb={
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondaryText dark:text-gray-400">
            <Home className="h-4 w-4 text-primary shrink-0" />
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link to="/rooms" className="hover:text-primary transition cursor-pointer">
              Bhagirathi
            </Link>

            {hostel_name && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="text-primaryText dark:text-gray-300">{hostel_name}</span>
              </>
            )}

            {building_name && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="text-primaryText dark:text-gray-300">{building_name}</span>
              </>
            )}

            {floor_name && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="text-primaryText dark:text-gray-300">{floor_name}</span>
              </>
            )}

            <ChevronRight className="h-3 w-3 shrink-0 text-primary" />
            <span className="font-extrabold text-primary">Room {room.room_number}</span>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2 text-xs select-none">
            <div className="text-right mr-4 hidden sm:block">
              <span className="text-[10px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">
                Occupancy Rate
              </span>
              <span className="text-xl font-black text-primary dark:text-primaryText tabular-nums">
                {Math.round(occupancy_percentage)}%
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/rooms")}
              className="inline-flex items-center gap-1 font-bold h-9"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditRoomOpen(true)}
              className="inline-flex items-center gap-1 font-bold h-9"
            >
              <Edit3 className="h-3.5 w-3.5 text-primary" />
              <span>Edit Room</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setAddBedOpen(true)}
              className="inline-flex items-center gap-1 font-bold h-9"
            >
              <Plus className="h-4 w-4" />
              <span>Add Bed</span>
            </Button>
          </div>
        }
      />

      {/* SECTION 1: ROOM INFORMATION */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
        <div
          onClick={() => toggleSection("info")}
          className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-950/40 border-b border-border dark:border-gray-800 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-primary" />
            <h3 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
              Room Information
            </h3>
          </div>
          {openSections.info ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
        </div>

        <AnimatePresence>
          {openSections.info && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-5"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center select-none">
                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded-card border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Room Number</span>
                  <span className="text-sm font-black text-primaryText dark:text-white mt-1 block">{room.room_number}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded-card border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Monthly Rent</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{formatCurrency(Number(room.room_rent)).split(".00")[0]}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded-card border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Total Capacity</span>
                  <span className="text-sm font-black text-primaryText dark:text-white mt-1 block">{room.capacity} Beds</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded-card border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Occupied / Vacant</span>
                  <span className="text-sm font-black text-primary mt-1 block">{room.occupied_beds} / {room.vacant_beds}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded-card border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Status</span>
                  <span className="text-xs font-black text-primaryText dark:text-gray-200 uppercase tracking-wider mt-1 block">{room.status}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded-card border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Auto Split</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-1 block">{room.auto_split ? "Enabled" : "Disabled"}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded-card border border-border dark:border-gray-850">
                  <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Split Type</span>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider mt-1 block">{room.rent_split_type}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 2: BEDS SECTION */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
        <div
          onClick={() => toggleSection("beds")}
          className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-950/40 border-b border-border dark:border-gray-800 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <BedIcon className="h-5 w-5 text-purple-600" />
            <h3 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
              Beds Section ({beds.length} Total Beds)
            </h3>
          </div>
          {openSections.beds ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
        </div>

        <AnimatePresence>
          {openSections.beds && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-5"
            >
              {beds.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted dark:text-gray-500 select-none">
                  No beds configured for this room.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {beds.map((b: any) => (
                    <div
                      key={b.id}
                      className="p-4 border border-border dark:border-gray-800 rounded-card bg-gray-50/30 dark:bg-gray-950/20 space-y-2 select-none"
                    >

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <BedIcon className="h-4 w-4 text-gray-500" />
                          <h4 className="font-extrabold text-xs text-primaryText dark:text-white">
                            Bed {b.bed_number}
                          </h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                          b.occupancy_status === "OCCUPIED"
                            ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                            : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900"
                        }`}>
                          {b.occupancy_status}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-gray-150 dark:border-gray-850 text-xs">
                        <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Tenant Status</span>
                        {b.tenant_name ? (
                          <span className="font-extrabold text-primaryText dark:text-gray-200 block truncate" title={b.tenant_name}>
                            👤 {b.tenant_name}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                            Available for allocation
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 3: CURRENT TENANTS */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
        <div
          onClick={() => toggleSection("tenants")}
          className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-950/40 border-b border-border dark:border-gray-800 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
              Current Occupants & Tenants ({tenants.length})
            </h3>
          </div>
          {openSections.tenants ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
        </div>

        <AnimatePresence>
          {openSections.tenants && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-5"
            >
              {tenants.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted dark:text-gray-500 select-none">
                  No active occupants currently allocated to this room.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tenants.map((t: any) => (
                    <div
                      key={t.tenant_id}
                      className="p-4 border border-border dark:border-gray-800 rounded-card bg-gray-50/40 dark:bg-gray-950/20 flex items-start gap-4 select-none"
                    >

                      {t.photo_url ? (
                        <img src={t.photo_url} alt={t.full_name} className="h-12 w-12 rounded-full object-cover border border-border shrink-0" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-orange-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                          {t.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-1 text-xs">
                        <div className="flex justify-between items-start">
                          <h4 className="font-extrabold text-sm text-primaryText dark:text-white truncate" title={t.full_name}>
                            {t.full_name}
                          </h4>
                          {t.bed_number && (
                            <span className="bg-purple-50 text-purple-700 dark:bg-purple-950/30 text-[9px] font-bold px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 uppercase">
                              Bed {t.bed_number}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-secondaryText dark:text-gray-400">
                          <Phone className="h-3.5 w-3.5 text-muted shrink-0" />
                          <span>{t.phone}</span>
                        </div>

                        <div className="flex items-center gap-2 text-secondaryText dark:text-gray-400">
                          <Mail className="h-3.5 w-3.5 text-muted shrink-0" />
                          <span className="truncate">{t.email}</span>
                        </div>

                        <div className="pt-2 border-t border-gray-150 dark:border-gray-850 flex justify-between text-[10px] text-muted dark:text-gray-500 font-medium">
                          <span>Check-in: {t.check_in_date || "N/A"}</span>
                          <span>Checkout: {t.expected_checkout || "Open Contract"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 4: RENT SPLIT */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
        <div
          onClick={() => toggleSection("rentSplit")}
          className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-950/40 border-b border-border dark:border-gray-800 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
              Rent Split Breakdown ({rent_split.rent_split_type.toUpperCase()})
            </h3>
          </div>
          {openSections.rentSplit ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
        </div>

        <AnimatePresence>
          {openSections.rentSplit && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center select-none">
                <div className="p-4 bg-gray-50 dark:bg-gray-950/30 rounded-card border border-border dark:border-gray-850 space-y-1">
                  <span className="text-[10px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Base Room Rent</span>
                  <span className="text-lg font-black text-primaryText dark:text-white tabular-nums">
                    {formatCurrency(rent_split.room_rent).split(".00")[0]}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-950/30 rounded-card border border-border dark:border-gray-850 space-y-1">
                  <span className="text-[10px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Active Occupants</span>
                  <span className="text-lg font-black text-primaryText dark:text-white tabular-nums">
                    {rent_split.occupants_count} Occupants
                  </span>
                </div>

                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-card space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block">Each Tenant Share</span>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {formatCurrency(rent_split.per_tenant_share).split(".00")[0]} / mo
                  </span>
                </div>

                <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 rounded-card space-y-1">
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest block">Split Rule</span>
                  <span className="text-sm font-black text-purple-700 dark:text-purple-400 uppercase">
                    {rent_split.rent_split_type} (Equal)
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 5: ELECTRICITY SECTION */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
        <div
          onClick={() => toggleSection("electricity")}
          className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-950/40 border-b border-border dark:border-gray-800 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
              Electricity Meter & Utility Billing
            </h3>
          </div>
          {openSections.electricity ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
        </div>

        <AnimatePresence>
          {openSections.electricity && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-5"
            >
              {electricity.current_reading === null ? (
                <div className="p-6 text-center border border-dashed border-gray-250 dark:border-gray-800 rounded-card space-y-2 select-none">
                  <Zap className="h-8 w-8 text-amber-500/50 mx-auto" />
                  <h4 className="text-xs font-extrabold text-secondaryText dark:text-gray-400 uppercase tracking-wider">
                    {electricity.status_message}
                  </h4>
                  <p className="text-xxs text-muted dark:text-gray-500 max-w-sm mx-auto">
                    Electricity sub-meter readings and monthly utility bill statements will appear here once recorded.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center select-none">
                  <div className="p-4 bg-gray-50 dark:bg-gray-950/30 rounded-card border border-border dark:border-gray-850">
                    <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Current Reading</span>
                    <span className="text-lg font-black text-primaryText dark:text-white tabular-nums">{electricity.current_reading} kWh</span>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-950/30 rounded-card border border-border dark:border-gray-850">
                    <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Previous Reading</span>
                    <span className="text-lg font-black text-primaryText dark:text-white tabular-nums">{electricity.previous_reading || 0} kWh</span>
                  </div>

                  <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-card">
                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block">Current Bill</span>
                    <span className="text-lg font-black text-amber-700 dark:text-amber-400 tabular-nums">
                      {electricity.current_bill ? formatCurrency(electricity.current_bill) : "₹0"}
                    </span>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-950/30 rounded-card border border-border dark:border-gray-850">
                    <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block">Billing Month</span>
                    <span className="text-xs font-black text-primaryText dark:text-gray-300 uppercase mt-1 block">{electricity.billing_month || "Current"}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 6: CHRONOLOGICAL TIMELINE */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
        <div
          onClick={() => toggleSection("timeline")}
          className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-950/40 border-b border-border dark:border-gray-800 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-info" />
            <h3 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
              Chronological Event History & Audit Ledger ({timeline.length} Events)
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
              {timeline.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted dark:text-gray-500 select-none">
                  No historical room events recorded yet.
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-primary/20 space-y-6 select-none">
                  {timeline.map((evt: any, idx: number) => (
                    <div key={evt.id || idx} className="relative group">

                      {/* Node Bullet Dot */}
                      <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-white dark:bg-gray-900 border-2 border-primary group-hover:scale-125 transition-transform" />

                      <div className="space-y-1">
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
                        {evt.actor_name && (
                          <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-widest block pt-0.5">
                            Logged by: {evt.actor_name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Room Modal */}
      {editRoomOpen && (
        <RoomForm
          isOpen={true}
          onClose={() => setEditRoomOpen(false)}
          onSubmit={async (data) => {
            await updateRoom.mutateAsync({ id: room.id, data });
            setEditRoomOpen(false);
            refetch();
          }}
          floorId={room.floor_id}
          initialData={room}
          isLoading={updateRoom.isPending}
        />
      )}

      {/* Add Bed Modal */}
      {addBedOpen && (
        <BedForm
          isOpen={true}
          onClose={() => setAddBedOpen(false)}
          onSubmit={async () => {
            setAddBedOpen(false);
            refetch();
          }}
          roomId={room.id}
          isLoading={false}
        />
      )}
    </motion.div>
  );
};

export default RoomDetailPage;

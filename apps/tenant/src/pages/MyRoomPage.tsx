import React from "react";
import { useNavigate } from "react-router-dom";
import { useTenantRoom } from "../features/payment/hooks/useTenantDashboard";
import { Button } from "@bhagirathi/ui";
import { Home, Landmark, AlertTriangle, FileText, ShieldCheck, User, Check, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export const MyRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: room, isLoading, isError, refetch } = useTenantRoom();

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none max-w-4xl mx-auto">
        <div className="h-10 w-32 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-64 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
        <div className="h-44 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-3xl text-center shadow-sm select-none max-w-md mx-auto my-12">
        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-650 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h4 className="font-black text-sm text-stone-900 dark:text-white mb-2 uppercase tracking-wider">Failed to Load Room</h4>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
          There was an error accessing room assignment details. Make sure your check-in records are active.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="font-bold h-10 px-6 cursor-pointer text-stone-700 dark:text-stone-300">
          Retry Request
        </Button>
      </div>
    );
  }

  const isAllocated = !!room.room_number;

  const roomTypeLabel = room.room_type
    ? room.room_type.replace("_", " ").toLowerCase()
    : "Standard Sharing";

  // Visual layout of beds depending on room capacity
  const renderVisualBeds = () => {
    const capacity = room.room_capacity || 1;
    const beds = Array.from({ length: capacity }, (_, idx) => {
      const isMyBed = room.bed_number === String(idx + 1) || (idx === 0 && !room.bed_number);
      return (
        <div
          key={idx}
          className={`flex flex-col items-center justify-center p-5 border-2 rounded-2xl transition-all ${
            isMyBed
              ? "bg-red-50/20 border-red-600 text-red-600 scale-[1.01] shadow-sm font-bold dark:bg-red-950/10 dark:border-red-550"
              : "bg-slate-50/50 dark:bg-zinc-850/30 border-slate-200 dark:border-zinc-800 text-stone-400"
          }`}
        >
          <Home className={`h-6 w-6 ${isMyBed ? "text-red-600 animate-pulse" : "text-stone-300 dark:text-stone-700"}`} />
          <span className="text-[10px] font-black mt-2.5 uppercase tracking-wide">Bed {idx + 1}</span>
          <span className={`text-[8.5px] font-black uppercase tracking-wider mt-2 px-2.5 py-0.5 rounded-full border ${
            isMyBed
              ? "bg-red-600 text-white border-transparent"
              : "bg-slate-200/50 dark:bg-zinc-800 text-stone-500 dark:text-stone-400 border-transparent"
          }`}>
            {isMyBed ? "Your Bed" : "Occupied"}
          </span>
          {isMyBed && (
            <div className="flex items-center gap-1 mt-2 text-[8px] font-black uppercase text-red-600 dark:text-red-400 tracking-wider">
              <User className="h-3 w-3" /> <span>Assigned to You</span>
            </div>
          )}
        </div>
      );
    });

    return <div className="grid grid-cols-2 gap-4 mt-3">{beds}</div>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto pb-12"
    >
      {/* Header with Back button */}
      <div className="flex items-center gap-3 select-none">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
        >
          <ArrowLeft className="h-4.5 w-4.5 text-stone-700 dark:text-stone-300" />
        </button>
        <div>
          <h1 className="text-lg font-black text-stone-900 dark:text-white leading-tight uppercase tracking-wider">My Room &amp; Lodging</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
            Check your boarding config, bed references, and asset rules.
          </p>
        </div>
      </div>

      {isAllocated ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Room Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3 select-none">
                <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-955/20 text-red-650 flex items-center justify-center shrink-0">
                  <Landmark className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">Allocation Details</h3>
              </div>

              <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-xs">
                <div>
                  <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black block select-none tracking-wider">Hostel Name</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 mt-1 block text-wrap-safe">{room.hostel_name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black block select-none tracking-wider">Building &amp; Floor</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 mt-1 block text-wrap-safe">
                    {room.building_name || "-"} | Floor {room.floor_name || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black block select-none tracking-wider">Room Number</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 mt-1 block select-all">Room {room.room_number}</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black block select-none tracking-wider">Bed Reference</span>
                  <span className="font-black text-red-600 dark:text-red-500 mt-1 block select-all">Bed {room.bed_number}</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black block select-none tracking-wider">Joining Date</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 mt-1 block tabular-nums">
                    {room.joining_date ? new Date(room.joining_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black block select-none tracking-wider">Monthly Rent Rate</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 mt-1 block tabular-nums">
                    ₹{Number(room.monthly_rent || 0).toLocaleString("en-IN")} / month
                  </span>
                </div>
              </div>

              {/* Boarding Rules */}
              <div className="bg-slate-50 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-stone-850 dark:text-white select-none">
                  <ShieldCheck className="h-4.5 w-4.5 text-green-600 dark:text-green-500" />
                  <span>Room Boarding Rules</span>
                </div>
                <ul className="text-[10px] text-stone-500 dark:text-stone-400 space-y-1.5 pl-4 list-disc leading-relaxed font-semibold">
                  <li>No electrical appliances allowed without warden prior verification.</li>
                  <li>Ensure all light fittings, fans and geysers are turned off before vacating.</li>
                  <li>Guest visitation hours must be completed before 9:00 PM.</li>
                  <li>Room damage repairs will be charged based on hostel maintenance audits.</li>
                </ul>
              </div>

              {/* Room Amenities — ISSUE-003 fix */}
              <div className="bg-slate-50 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-stone-850 dark:text-white select-none">
                  <Home className="h-4.5 w-4.5 text-red-650" />
                  <span>Amenities Included</span>
                </div>
                {(() => {
                  let parsedAmenities: string[] = [];
                  try {
                    if (room.amenities) {
                      parsedAmenities = typeof room.amenities === "string" ? JSON.parse(room.amenities) : room.amenities;
                    }
                  } catch (e) {
                    // Try split if comma separated fallback
                    if (typeof room.amenities === "string") {
                      parsedAmenities = room.amenities.split(",").map((s: string) => s.trim());
                    }
                  }
                  
                  if (!parsedAmenities || parsedAmenities.length === 0) {
                    return (
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold italic">
                        No amenities configured
                      </p>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] font-black uppercase tracking-wider text-stone-600 dark:text-stone-300 select-none">
                      {parsedAmenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-lg p-2 shadow-sm">
                          <Check className="h-3.5 w-3.5 text-green-600 shrink-0" /> {amenity}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Right Column: Layout and Quick Support (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Bed Layout Visualizer */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-5">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 mb-3 select-none">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-955/20 text-red-650 flex items-center justify-center shrink-0">
                      <Landmark className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">Room Allocation Layout</h4>
                  </div>
                </div>
                
                <div className="flex justify-between items-center bg-slate-50 dark:bg-zinc-850 border border-slate-155 dark:border-zinc-800 p-3 rounded-2xl mb-4 text-xs select-none">
                  <div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black block">Room Type</span>
                    <span className="font-black text-stone-850 dark:text-white uppercase tracking-wider">{roomTypeLabel}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black block">Capacity</span>
                    <span className="font-black text-stone-850 dark:text-white">{room.room_capacity || 1} Sharing</span>
                  </div>
                </div>

                {renderVisualBeds()}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2 select-none">
                <Button
                  onClick={() => navigate("/complaints")}
                  className="btn-primary-tenant w-full flex items-center justify-center gap-2 font-black cursor-pointer h-10 text-xs rounded-xl"
                >
                  <FileText className="h-4 w-4" />
                  <span>Raise Room Ticket</span>
                </Button>
                <p className="text-[9.5px] text-stone-400 dark:text-stone-500 text-center font-black uppercase tracking-wider">
                  Report damaged assets, geysers, or plumbing issues.
                </p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm text-center select-none max-w-md mx-auto my-12">
          <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-650 flex items-center justify-center mb-4 animate-bounce">
            <Landmark className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-black text-stone-900 dark:text-white mb-2 uppercase tracking-wider">Room Allocation Pending</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mb-6 leading-relaxed">
            You have not been assigned to a Hostel Room, Building or Bed by the administration yet. Please contact the warden.
          </p>
          <Button onClick={() => navigate("/dashboard")} className="btn-primary-tenant font-black h-10 px-6 rounded-xl cursor-pointer">
            Return to Dashboard
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default MyRoomPage;

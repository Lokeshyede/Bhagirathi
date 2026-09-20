import React, { useState, useMemo } from "react";
import { useRoomAvailability } from "../hooks/api/useHostel";
import { PageHeader, Spinner, Input, Select } from "@bhagirathi/ui";
import { Building2, Search, BedDouble, Users, UserX, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function AvailabilityPage() {
  const { data: rooms = [], isLoading } = useRoomAvailability();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});

  const toggleExpand = (roomId: string) => {
    setExpandedRooms(prev => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room: any) => {
      const matchSearch = room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          room.beds.some((b: any) => b.tenant_name?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === "ALL" || 
                          (statusFilter === "EMPTY" && room.active_occupants === 0) ||
                          (statusFilter === "FULL" && room.status === "FULL") ||
                          (statusFilter === "PARTIAL" && room.active_occupants > 0 && room.status !== "FULL");
      return matchSearch && matchStatus;
    });
  }, [rooms, searchQuery, statusFilter]);

  // KPIs
  const totalRooms = rooms.length;
  const emptyRooms = rooms.filter((r: any) => r.active_occupants === 0).length;
  const fullRooms = rooms.filter((r: any) => r.status === "FULL").length;
  const partialRooms = totalRooms - emptyRooms - fullRooms;

  const occupiedBeds = rooms.reduce((acc: number, r: any) => acc + r.active_occupants, 0);
  const availableBeds = rooms.reduce((acc: number, r: any) => acc + r.available_beds, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Room & Bed Availability"
        description="Comprehensive overview of room occupancy, vacancy statuses, and tenant bed allocations."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-4">
           <div className="text-xs text-muted dark:text-gray-500 font-bold uppercase tracking-wider mb-1">Total Rooms</div>
           <div className="text-2xl font-black text-primaryText dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              {totalRooms}
           </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-4">
           <div className="text-xs text-muted dark:text-gray-500 font-bold uppercase tracking-wider mb-1">Empty</div>
           <div className="text-2xl font-black text-success dark:text-green-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success/50" />
              {emptyRooms}
           </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-4">
           <div className="text-xs text-muted dark:text-gray-500 font-bold uppercase tracking-wider mb-1">Partial</div>
           <div className="text-2xl font-black text-amber-500 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500/50" />
              {partialRooms}
           </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-4">
           <div className="text-xs text-muted dark:text-gray-500 font-bold uppercase tracking-wider mb-1">Full</div>
           <div className="text-2xl font-black text-danger flex items-center gap-2">
              <UserX className="w-5 h-5 text-danger/50" />
              {fullRooms}
           </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-4">
           <div className="text-xs text-muted dark:text-gray-500 font-bold uppercase tracking-wider mb-1">Occupied Beds</div>
           <div className="text-2xl font-black text-primaryText dark:text-white flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-gray-400" />
              {occupiedBeds}
           </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-4">
           <div className="text-xs text-muted dark:text-gray-500 font-bold uppercase tracking-wider mb-1">Avail. Beds</div>
           <div className="text-2xl font-black text-primary flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-primary/50" />
              {availableBeds}
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Room Number or Tenant Name..."
              className="pl-9"
            />
         </div>
         <div className="w-full md:w-64">
            <Select
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               options={[
                 { label: "All Statuses", value: "ALL" },
                 { label: "Empty", value: "EMPTY" },
                 { label: "Partial", value: "PARTIAL" },
                 { label: "Full", value: "FULL" },
               ]}
            />
         </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-border dark:border-gray-800">
            <tr>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted">Room</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted text-center">Capacity</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted text-center">Occupied</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted text-center">Available</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted">Status</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-gray-800">
            {filteredRooms.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-muted">No rooms found.</td></tr>
            ) : (
               filteredRooms.map((room: any) => (
                 <React.Fragment key={room.room_id}>
                   <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                     <td className="p-4 font-extrabold text-primaryText dark:text-gray-100">
                        {room.room_number}
                     </td>
                     <td className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">
                        {room.capacity}
                     </td>
                     <td className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">
                        {room.active_occupants}
                     </td>
                     <td className="p-4 text-center font-black text-primary">
                        {room.available_beds}
                     </td>
                     <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                           room.active_occupants === 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                           room.status === "FULL" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                           "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}>
                           {room.active_occupants === 0 ? "EMPTY" : room.status}
                        </span>
                     </td>
                     <td className="p-4 text-right">
                        <button onClick={() => toggleExpand(room.room_id)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer">
                           {expandedRooms[room.room_id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                     </td>
                   </tr>
                   
                   {expandedRooms[room.room_id] && (
                      <tr className="bg-gray-50/30 dark:bg-gray-800/30">
                        <td colSpan={6} className="p-0 border-b border-border dark:border-gray-800">
                           <div className="px-3 sm:pl-16 sm:pr-8 py-4 overflow-x-auto">
                              <table className="w-full text-sm">
                               <thead className="border-b border-border dark:border-gray-800">
                                 <tr>
                                   <th className="pb-2 text-xs font-bold uppercase tracking-wider text-muted">Bed Number</th>
                                   <th className="pb-2 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
                                   <th className="pb-2 text-xs font-bold uppercase tracking-wider text-muted">Tenant Name</th>
                                 </tr>
                               </thead>
                               <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                 {room.beds.map((bed: any) => (
                                   <tr key={bed.bed_id}>
                                     <td className="py-3 font-semibold text-gray-700 dark:text-gray-300">{bed.bed_number}</td>
                                     <td className="py-3">
                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md ${
                                           bed.status === "OCCUPIED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : 
                                           "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        }`}>
                                           {bed.status}
                                        </span>
                                     </td>
                                     <td className="py-3 text-gray-600 dark:text-gray-400 font-medium">
                                        {bed.status === "OCCUPIED" ? (
                                           <span className="flex items-center gap-2">
                                              <Users className="w-3.5 h-3.5 text-gray-400" />
                                              {bed.tenant_name || "Unknown Tenant"}
                                           </span>
                                        ) : (
                                           <span className="text-gray-400 italic">—</span>
                                        )}
                                     </td>
                                   </tr>
                                 ))}
                               </tbody>
                             </table>
                          </div>
                       </td>
                     </tr>
                   )}
                 </React.Fragment>
               ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

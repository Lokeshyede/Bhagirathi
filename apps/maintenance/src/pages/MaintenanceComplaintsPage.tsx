import React, { useState } from "react";
import {
  useAssignedComplaints,
  useComplaintDetails,
  useComplaintHistory,
  useUpdateStatusMutation,
  useUploadWorkPhotos
} from "../features/complaint/hooks/useMaintenanceComplaint";
import { ComplaintStatus, ComplaintPriority } from "@bhagirathi/constants";
import { Button, Drawer } from "@bhagirathi/ui";
import {
  ClipboardCheck, Eye, Clock, Wrench, CheckCircle, Play, ExternalLink,
  Upload, X, AlertOctagon, MapPin, CheckSquare
} from "lucide-react";
import { motion } from "framer-motion";

export const MaintenanceComplaintsPage: React.FC = () => {
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Queries
  const { data: complaints, isLoading, isError, refetch } = useAssignedComplaints({
    searchQuery,
    priorityFilter
  });
  const { data: activeDetails } = useComplaintDetails(selectedComplaintId);
  const { data: timeline } = useComplaintHistory(selectedComplaintId);

  // Mutations
  const updateStatusMutation = useUpdateStatusMutation();
  const uploadPhotosMutation = useUploadWorkPhotos();

  // Action state
  const [isCompleting, setIsCompleting] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [remarks, setRemarks] = useState("");
  const [photosFiles, setPhotosFiles] = useState<FileList | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Filter complaints based on the active tab
  const filteredTasks = (complaints ?? []).filter((c) => {
    if (activeTab === "ACTIVE") {
      return c.status === ComplaintStatus.OPEN || c.status === ComplaintStatus.IN_PROGRESS;
    } else {
      return c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED || c.status === ComplaintStatus.REJECTED;
    }
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (String(status || "").toUpperCase()) {
      case ComplaintStatus.OPEN:
        return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/15 dark:text-amber-400";
      case ComplaintStatus.ASSIGNED:
        return "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-905/10 dark:text-indigo-400 font-bold";
      case ComplaintStatus.IN_PROGRESS:
        return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 font-bold";
      case ComplaintStatus.RESOLVED:
        return "text-green-700 bg-green-50 border-green-200 dark:bg-green-905/20 dark:text-green-400 font-bold";
      case ComplaintStatus.CLOSED:
        return "text-stone-500 bg-stone-50 border-stone-200 dark:bg-zinc-800/40 dark:text-stone-400";
      case ComplaintStatus.REJECTED:
        return "text-red-700 bg-red-50 border-red-200 dark:bg-red-900/10";
      default:
        return "text-stone-500 bg-stone-50 border-slate-200";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (String(priority || "").toUpperCase()) {
      case ComplaintPriority.CRITICAL:
        return "text-red-700 bg-red-50 border-red-200 dark:bg-red-900/10 dark:text-red-400 animate-pulse font-black";
      case ComplaintPriority.HIGH:
        return "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/15 dark:text-orange-400 font-black";
      case ComplaintPriority.MEDIUM:
        return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/15 dark:text-blue-400 font-bold";
      default:
        return "text-stone-500 bg-stone-50 border-slate-200 dark:bg-zinc-800";
    }
  };

  const handleStartTask = async () => {
    if (!selectedComplaintId) return;
    try {
      setIsSubmittingAction(true);
      await updateStatusMutation.mutateAsync({
        id: selectedComplaintId,
        status: ComplaintStatus.IN_PROGRESS,
        remarks: "Maintenance work started."
      });
      refetch();
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintId) return;
    if (!resolutionNotes.trim()) {
      alert("Please provide resolution notes describing the fix.");
      return;
    }

    try {
      setIsSubmittingAction(true);
      
      // Update status to RESOLVED
      await updateStatusMutation.mutateAsync({
        id: selectedComplaintId,
        status: ComplaintStatus.RESOLVED,
        remarks: remarks || "Work marked resolved.",
        resolutionNotes
      });

      // Upload photographs if attached
      if (photosFiles && photosFiles.length > 0) {
        const fd = new FormData();
        for (let i = 0; i < photosFiles.length; i++) {
          fd.append("photos", photosFiles[i]);
        }
        await uploadPhotosMutation.mutateAsync({
          id: selectedComplaintId,
          formData: fd
        });
      }

      setResolutionNotes("");
      setRemarks("");
      setPhotosFiles(null);
      setIsCompleting(false);
      setSelectedComplaintId(null);
      alert("Repair request resolved successfully!");
      refetch();
    } catch (err) {
      alert("Failed to complete task.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const getTimelineIcon = (status: string) => {
    switch (String(status || "").toUpperCase()) {
      case ComplaintStatus.OPEN: return Clock;
      case ComplaintStatus.ASSIGNED: return Wrench;
      case ComplaintStatus.IN_PROGRESS: return Play;
      case ComplaintStatus.RESOLVED: return CheckCircle;
      case ComplaintStatus.CLOSED: return CheckCircle;
      default: return Clock;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Page Title */}
      <div className="select-none">
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight leading-tight uppercase tracking-wider">Tenant Complaints</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-semibold">
          Handle new tenant complaints and review history.
        </p>
      </div>

      {/* Tabs & Search Filter panel */}
      <div className="flex flex-col gap-3.5 bg-white dark:bg-zinc-900 p-4 border border-slate-205 dark:border-zinc-800 rounded-3xl shadow-sm select-none">
        {/* Tabs switcher */}
        <div className="flex bg-slate-50 dark:bg-zinc-950 p-1 rounded-2xl border border-slate-200/60 dark:border-zinc-800">
          <button
            onClick={() => { setActiveTab("ACTIVE"); setSelectedComplaintId(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer ${
              activeTab === "ACTIVE"
                ? "bg-white dark:bg-zinc-900 text-red-600 shadow-sm border border-slate-200 dark:border-zinc-800"
                : "text-stone-450 hover:text-stone-705"
            }`}
          >
            <Wrench className="h-4 w-4" /> <span>Active</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("HISTORY"); setSelectedComplaintId(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer ${
              activeTab === "HISTORY"
                ? "bg-white dark:bg-zinc-900 text-red-600 shadow-sm border border-slate-200 dark:border-zinc-800"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <Clock className="h-4 w-4" /> <span>History</span>
          </button>
        </div>

        {/* Filters and search row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="relative sm:col-span-2">
            <input
              type="text"
              className="h-10 w-full pl-4 pr-8 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-red-600 focus:bg-white dark:focus:bg-zinc-900 transition-all"
              placeholder="Search by details or Room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 w-full px-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value={ComplaintPriority.CRITICAL}>Critical</option>
              <option value={ComplaintPriority.HIGH}>High</option>
              <option value={ComplaintPriority.MEDIUM}>Medium</option>
              <option value={ComplaintPriority.LOW}>Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List Grid */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse select-none">
          <div className="h-32 rounded-3xl bg-slate-200 dark:bg-zinc-800" />
          <div className="h-32 rounded-3xl bg-slate-200 dark:bg-zinc-800" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-3xl text-center shadow-sm select-none">
          <AlertOctagon className="h-10 w-10 text-red-600 mb-3 animate-bounce" />
          <h3 className="text-base font-black text-stone-900 dark:text-white mb-2 uppercase tracking-wider">Failed to load complaints</h3>
          <Button onClick={() => refetch()} className="btn-primary-tenant font-black h-10 px-6 rounded-xl cursor-pointer text-white mt-4">
            Retry Request
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTasks.map((t, idx) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => { setSelectedComplaintId(t.id); setIsCompleting(false); }}
                  className={`p-5 bg-white dark:bg-zinc-900 border rounded-3xl shadow-xs cursor-pointer hover:border-red-600/30 transition flex flex-col justify-between ${
                    selectedComplaintId === t.id ? "border-red-600 ring-1 ring-red-600/20" : "border-slate-200 dark:border-zinc-800"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-mono text-[9px] font-bold text-stone-400 bg-slate-50 dark:bg-zinc-950 px-1.5 py-0.5 border border-slate-200 dark:border-zinc-800 rounded select-all select-none">
                        #{t.complaint_number}
                      </span>
                      <span className={`text-[8.5px] font-black py-0.5 px-2 border rounded-full uppercase tracking-wider select-none ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-stone-800 dark:text-white line-clamp-2 mb-2 text-wrap-safe">
                      {t.title}
                    </h4>

                    <div className="flex gap-2 select-none">
                      <span className={`text-[8.5px] font-black py-0.5 px-2 border rounded-md uppercase tracking-wider ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider mt-0.5 truncate max-w-[120px]">
                        {t.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-zinc-800 pt-3 mt-4 text-[10px] text-stone-400 select-none">
                    <span className="font-bold">Room {t.room_number || "Common Area"}</span>
                    <span className="font-bold text-red-600 inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> Details
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm text-center select-none py-12">
              <ClipboardCheck className="h-9 w-9 text-stone-300 dark:text-stone-700 mb-3 animate-pulse" />
              <h3 className="text-sm font-black text-stone-800 dark:text-white mb-1.5 uppercase tracking-wider">No active complaints</h3>
              <p className="text-xs text-stone-400 max-w-xs leading-relaxed font-semibold">
                There are no complaints matching your filter criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Task Operations Dossier Drawer */}
      <Drawer
        isOpen={!!selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
        title="Operations dossier"
      >
        {activeDetails && (
          <div className="space-y-6 pb-6 select-none">
            {/* Header Title block */}
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
              <span className="font-mono text-[9px] font-bold text-stone-400 bg-slate-50 dark:bg-zinc-950 border px-1.5 py-0.5 rounded select-all">
                #{activeDetails.complaint_number}
              </span>
              <h3 className="font-black text-base text-stone-900 dark:text-white mt-2 leading-snug text-wrap-safe">
                {activeDetails.title}
              </h3>
            </div>

            {/* Premium Location Context dossier */}
            <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-[18px] space-y-4">
              <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500">
                <MapPin className="h-4 w-4 text-red-600 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest block">WORK LOCATION</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-[9px] text-stone-400 uppercase block font-black">Hostel</span>
                  <span className="text-stone-800 dark:text-stone-200 mt-0.5 block truncate">{activeDetails.hostel_name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 uppercase block font-black">Room / Area</span>
                  <span className="text-stone-800 dark:text-stone-200 mt-0.5 block truncate">Room {activeDetails.room_number || "Common Area"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 uppercase block font-black">Priority</span>
                  <div className="mt-1">
                    <span className={`text-[8px] font-black py-0.5 px-2 border rounded-full uppercase tracking-wider ${getPriorityBadge(activeDetails.priority)}`}>
                      {activeDetails.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 uppercase block font-black">Status</span>
                  <div className="mt-1">
                    <span className={`text-[8px] font-black py-0.5 px-2 border rounded-full uppercase tracking-wider ${getStatusBadge(activeDetails.status)}`}>
                      {activeDetails.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resident submitter info */}
            <div className="grid grid-cols-2 gap-4 text-xs border-b pb-4 border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-[9px] text-stone-400 uppercase font-black block">Reported By</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 block mt-1 truncate">{activeDetails.tenant_name || "Resident"}</span>
              </div>
              <div>
                <span className="text-[9px] text-stone-400 uppercase font-black block">Reported Date</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 block mt-1 truncate">
                  {activeDetails.created_at ? new Date(activeDetails.created_at).toLocaleDateString("en-IN") : "N/A"}
                </span>
              </div>
            </div>

            {/* Problem description */}
            <div className="space-y-1">
              <span className="text-[9px] text-stone-400 uppercase font-black tracking-wider block">Problem Description</span>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-slate-50 dark:bg-zinc-950/20 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 font-semibold text-wrap-safe">
                {activeDetails.description}
              </p>
            </div>

            {/* Photo attachments upload list */}
            <div className="space-y-3">
              <span className="text-[9px] text-stone-400 uppercase font-black tracking-wider block">Reference Attachments</span>
              {activeDetails.images && (activeDetails.images ?? []).length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {(activeDetails.images ?? []).map((img: any) => {
                    const imgUrl = String(img.image_path || "").startsWith("http") ? img.image_path : `http://localhost:8000${img.image_path}`;
                    return (
                      <div
                        key={img.id}
                        onClick={() => setLightboxUrl(imgUrl)}
                        className="relative aspect-square border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden cursor-pointer bg-slate-50 dark:bg-zinc-950 flex items-center justify-center group"
                      >
                        <img src={imgUrl} alt="task proof" className="w-full h-full object-cover group-hover:scale-105 transition duration-150" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ExternalLink className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-stone-400 italic">No photographs uploaded by resident.</p>
              )}
            </div>

            {/* Resolution notes for resolved history */}
            {activeDetails.resolution_notes && (
              <div className="bg-green-50/50 dark:bg-green-950/15 border border-green-200/80 dark:border-green-900/30 rounded-2xl p-4 space-y-1">
                <span className="text-[9px] font-black text-green-700 dark:text-green-400 uppercase tracking-wider block">Resolution Summary</span>
                <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold leading-relaxed text-wrap-safe">{activeDetails.resolution_notes}</p>
              </div>
            )}

            {/* Status Workflow Action triggers */}
            {activeTab === "ACTIVE" && !isCompleting && (
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                {activeDetails.status === ComplaintStatus.OPEN && (
                  <Button
                    onClick={handleStartTask}
                    isLoading={isSubmittingAction}
                    className="w-full flex items-center justify-center gap-1.5 font-black h-11 text-white cursor-pointer bg-red-600 hover:bg-red-700 rounded-xl uppercase tracking-wider text-xs"
                  >
                    <Play className="h-[18px] w-[18px]" />
                    <span>Accept &amp; Start Work</span>
                  </Button>
                )}

                {activeDetails.status === ComplaintStatus.IN_PROGRESS && (
                  <Button
                    onClick={() => setIsCompleting(true)}
                    className="w-full flex items-center justify-center gap-1.5 font-black h-11 text-white cursor-pointer bg-green-600 hover:bg-green-700 rounded-xl uppercase tracking-wider text-xs"
                  >
                    <CheckCircle className="h-[18px] w-[18px]" />
                    <span>Mark Task as Completed</span>
                  </Button>
                )}
              </div>
            )}

            {/* Complete Resolution Form */}
            {isCompleting && (
              <form onSubmit={handleCompleteTask} className="space-y-4 border border-green-200 dark:border-green-900/30 bg-green-50/10 dark:bg-green-900/15 p-[18px] rounded-2xl">
                <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400 border-b border-green-200/40 pb-2">
                  <CheckSquare className="h-[18px] w-[18px] shrink-0" />
                  <h4 className="text-xs font-black uppercase tracking-wider">Submit Repair Evidence</h4>
                </div>
                
                <div>
                  <label className="block text-[9px] text-stone-400 uppercase font-black tracking-wider mb-1.5">
                    Resolution notes *
                  </label>
                  <textarea
                    required
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full min-h-[90px] p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-red-600 font-semibold leading-relaxed"
                    placeholder="Specify what repair work was completed..."
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-stone-400 uppercase font-black tracking-wider mb-1.5">
                    Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Additional logs comments..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="h-10 w-full px-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-stone-400 uppercase font-black tracking-wider mb-1.5">
                    Resolution Photo (Optional)
                  </label>
                  <div className="relative group border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-green-400 bg-white dark:bg-zinc-950 rounded-xl p-4 text-center cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setPhotosFiles(e.target.files)}
                    />
                    <Upload className="h-6 w-6 mx-auto text-stone-400 mb-1" />
                    <p className="text-[10px] font-bold text-stone-800 dark:text-stone-300">Click or tap to upload photo evidence</p>
                    {photosFiles && (
                      <p className="text-[9px] text-green-600 font-black mt-1">
                        {photosFiles.length} file(s) selected
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsCompleting(false)}
                    disabled={isSubmittingAction}
                    className="w-1/3 cursor-pointer font-black h-10 rounded-xl text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmittingAction}
                    className="w-2/3 cursor-pointer font-black bg-green-600 hover:bg-green-700 h-10 rounded-xl text-white text-xs uppercase tracking-wider"
                  >
                    Confirm Resolution
                  </Button>
                </div>
              </form>
            )}

            {/* Timeline logs */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
              <span className="text-[9px] text-stone-400 uppercase font-black tracking-wider block">Timeline Logs History</span>
              <div className="flow-root pl-2">
                <ul className="-mb-8">
                  {timeline?.map((item: any, idx) => {
                    const Icon = getTimelineIcon(item.status);
                    const isLast = idx === timeline.length - 1;
                    return (
                      <li key={item.id || idx}>
                        <div className="relative pb-8">
                          {!isLast && (
                            <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-100 dark:bg-zinc-800" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3">
                            <div className="shrink-0 select-none">
                              <span className="h-8 w-8 rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 flex items-center justify-center text-stone-400">
                                <Icon className="h-[18px] w-[18px]" />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                              <div className="flex justify-between items-start gap-4">
                                <p className="text-[10px] font-black text-stone-850 dark:text-white uppercase tracking-wider">{item.status}</p>
                                <time className="text-[9px] text-stone-400 font-bold tabular-nums">
                                  {new Date(item.action_at || item.created_at || "").toLocaleDateString("en-IN")}
                                </time>
                              </div>
                              {item.remarks && (
                                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 bg-slate-50/50 dark:bg-zinc-950/20 p-2.5 rounded border border-slate-200 dark:border-zinc-800 font-semibold leading-relaxed text-wrap-safe">
                                  {item.remarks}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Lightbox expanded proof preview */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setLightboxUrl(null)} />
          <div className="relative max-w-4xl w-full max-h-[80vh] bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl flex flex-col z-10">
            <div className="flex h-12 items-center justify-between px-4 bg-stone-950 border-b border-stone-800 select-none">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Expanded Attachment</span>
              <button onClick={() => setLightboxUrl(null)} className="p-1.5 text-stone-450 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              <img src={lightboxUrl} alt="Expanded Attachment" className="max-w-full max-h-[65vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MaintenanceComplaintsPage;

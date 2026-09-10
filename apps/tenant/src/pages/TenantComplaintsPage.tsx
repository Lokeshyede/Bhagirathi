import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import {
  useMyComplaints,
  useRaiseComplaintMutation,
  useComplaintHistory,
  useComplaintDetails,
  useUploadAdditionalPhoto,
  useUpdateComplaintStatusMutation
} from "../features/complaint/hooks/useTenantComplaint";
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from "@bhagirathi/constants";
import { Button, Drawer, Input } from "@bhagirathi/ui";
import {
  AlertCircle, HelpCircle, Plus, ClipboardList, Send, Upload, Eye, Clock, Wrench, CheckCircle,
  XCircle, Play, User, ExternalLink, X, ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";

const complaintFormSchema = zod.object({
  category: zod.string().min(1, "Please select an issue category"),
  priority: zod.string().min(1, "Please select priority level"),
  title: zod.string().min(4, "Title must be at least 4 characters long"),
  description: zod.string().min(10, "Description must be at least 10 characters long"),
  attachments: zod.any().optional()
});

export const TenantComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"list" | "raise">("list");
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: complaints, isLoading, isError, refetch } = useMyComplaints({});
  const { data: activeDetails } = useComplaintDetails(selectedComplaintId);
  const { data: timeline } = useComplaintHistory(selectedComplaintId);

  // Mutations
  const raiseComplaintMutation = useRaiseComplaintMutation();
  const uploadPhotoMutation = useUploadAdditionalPhoto();
  const updateStatusMutation = useUpdateComplaintStatusMutation();

  // Detail panel lightbox state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  interface ComplaintFormValues {
    category: string;
    priority: string;
    title: string;
    description: string;
    attachments?: any;
  }

  // Hook form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      category: "",
      priority: "MEDIUM",
      title: "",
      description: "",
      attachments: undefined
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setFormError(null);
      const fd = new FormData();
      fd.append("category", data.category);
      fd.append("priority", data.priority);
      fd.append("title", data.title);
      fd.append("description", data.description);

      if (data.attachments && data.attachments.length > 0) {
        for (let i = 0; i < data.attachments.length; i++) {
          fd.append("attachments", data.attachments[i]);
        }
      }

      await raiseComplaintMutation.mutateAsync(fd);
      reset();
      setActiveTab("list");
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to register complaint. Try again.");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedComplaintId || !e.target.files || e.target.files.length === 0) return;
    try {
      const fd = new FormData();
      for (let i = 0; i < e.target.files.length; i++) {
        fd.append("photos", e.target.files[i]);
      }
      await uploadPhotoMutation.mutateAsync({
        id: selectedComplaintId,
        formData: fd
      });
      alert("Additional photographs uploaded successfully!");
    } catch (err) {
      alert("Failed to upload photographs.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (String(status || "").toUpperCase()) {
      case ComplaintStatus.OPEN:
        return "text-red-700 bg-red-50 border-red-200 dark:bg-red-955/10 dark:text-red-400";
      case ComplaintStatus.ASSIGNED:
        return "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-955/10 dark:text-purple-400";
      case ComplaintStatus.IN_PROGRESS:
        return "text-blue-705 bg-blue-50 border-blue-200 dark:bg-blue-955/10 dark:text-blue-400";
      case ComplaintStatus.RESOLVED:
        return "text-green-700 bg-green-50 border-green-200 dark:bg-green-950/20 dark:text-green-400";
      case ComplaintStatus.CLOSED:
        return "text-stone-500 bg-slate-100 border-slate-200 dark:bg-zinc-800 dark:text-stone-400 dark:border-zinc-700";
      case ComplaintStatus.REJECTED:
        return "text-red-750 bg-red-50 border-red-200 dark:bg-red-955/10 dark:text-red-400";
      default:
        return "text-stone-600 bg-slate-50 border-slate-200 dark:bg-zinc-900";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (String(priority || "").toUpperCase()) {
      case ComplaintPriority.CRITICAL:
        return "text-red-700 bg-red-50 border-red-250 dark:bg-red-955/10 dark:text-red-400 animate-pulse";
      case ComplaintPriority.HIGH:
        return "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-955/15 dark:text-orange-400";
      case ComplaintPriority.MEDIUM:
        return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-955/15 dark:text-blue-400";
      default:
        return "text-stone-500 bg-slate-50 border-slate-200 dark:bg-zinc-850 dark:text-stone-400 dark:border-zinc-700";
    }
  };

  const getTimelineIcon = (status: string) => {
    switch (String(status || "").toUpperCase()) {
      case ComplaintStatus.OPEN: return Clock;
      case ComplaintStatus.ASSIGNED: return Wrench;
      case ComplaintStatus.IN_PROGRESS: return Play;
      case ComplaintStatus.RESOLVED: return CheckCircle;
      case ComplaintStatus.CLOSED: return CheckCircle;
      case ComplaintStatus.REJECTED: return XCircle;
      default: return Clock;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto pb-12"
    >
      {/* Header and Toggle Controls */}
      <div className="flex flex-col gap-5 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-stone-700 dark:text-stone-300" />
          </button>
          <div>
            <h1 className="text-lg font-black text-stone-900 dark:text-white uppercase tracking-wider leading-tight">PG Repair Helpdesk</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
              File maintenance issues, upload screenshots, and track status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-zinc-900/50 border border-slate-200/60 dark:border-zinc-800 rounded-2xl w-full max-w-md">
          <button
            onClick={() => { setActiveTab("list"); setSelectedComplaintId(null); }}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === "list"
                ? "bg-red-600 text-white shadow-sm"
                : "text-stone-605 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>My Tickets</span>
          </button>
          
          <button
            onClick={() => setActiveTab("raise")}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === "raise"
                ? "bg-red-600 text-white shadow-sm"
                : "text-stone-605 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Raise Ticket</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6 pb-12 animate-pulse select-none">
          <div className="h-32 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
          <div className="h-32 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center shadow-sm select-none max-w-md mx-auto my-12">
          <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-650 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-black text-stone-900 dark:text-white mb-2 uppercase tracking-wider">Failed to load complaints</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">Error communicating with PG support servers. Please check your network.</p>
          <Button onClick={() => refetch()} className="btn-primary-tenant font-black h-10 px-6 rounded-xl cursor-pointer">Retry Request</Button>
        </div>
      ) : activeTab === "raise" ? (
        /* Report Form */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm max-w-2xl mx-auto">
          <h3 className="font-black text-xs text-stone-850 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 mb-5 uppercase tracking-wider select-none">
            Report Lodging Issue
          </h3>

          {formError && (
            <div className="bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/35 text-red-750 rounded-xl p-4 flex gap-3 text-xs mb-4 font-bold select-none">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 select-none">
                <label className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Category *</label>
                <select
                  className="h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer transition-all"
                  {...register("category")}
                >
                  <option value="">-- Choose Category --</option>
                  <option value={ComplaintCategory.ELECTRICITY}>Electricity</option>
                  <option value={ComplaintCategory.WATER}>Water</option>
                  <option value={ComplaintCategory.CLEANING}>Cleaning</option>
                  <option value={ComplaintCategory.FURNITURE}>Furniture</option>
                  <option value={ComplaintCategory.INTERNET}>Internet</option>
                  <option value={ComplaintCategory.BATHROOM}>Bathroom</option>
                  <option value={ComplaintCategory.ROOM}>Room</option>
                  <option value={ComplaintCategory.SECURITY}>Security</option>
                  <option value={ComplaintCategory.OTHER}>Other</option>
                </select>
                {errors.category && (
                  <p className="text-[10px] text-red-600 font-bold">{(errors.category as any).message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5 select-none">
                <label className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Priority level *</label>
                <select
                  className="h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-955 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer transition-all"
                  {...register("priority")}
                >
                  <option value={ComplaintPriority.LOW}>Low</option>
                  <option value={ComplaintPriority.MEDIUM}>Medium</option>
                  <option value={ComplaintPriority.HIGH}>High</option>
                  <option value={ComplaintPriority.CRITICAL}>Critical</option>
                </select>
              </div>
            </div>

            <div>
              <Input
                label="Summary / Title *"
                type="text"
                placeholder="e.g. Geyser is not heating water"
                error={errors.title?.message}
                {...register("title")}
                className="rounded-xl border-slate-200 focus:ring-red-650"
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider mb-1.5 select-none">
                Detailed Description *
              </label>
              <textarea
                className="w-full min-h-[110px] p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-stone-800 dark:text-gray-300 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all font-semibold leading-relaxed"
                placeholder="Please describe the issue in detail so the technician is prepared..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-[10px] text-red-600 font-bold">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider mb-2 select-none">
                Upload Damage Photos (Optional)
              </label>
              <div className="relative border-2 border-dashed border-slate-250 dark:border-zinc-800 hover:border-red-600 rounded-2xl p-6 bg-slate-50 dark:bg-zinc-955/20 text-center cursor-pointer transition">
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  {...register("attachments")}
                />
                <Upload className="h-8 w-8 mx-auto text-stone-400 mb-2" />
                <p className="text-xs font-black text-stone-800 dark:text-gray-200">Click to upload photos</p>
                <p className="text-[10px] text-stone-400 mt-1 select-none">PNG, JPG, or WEBP up to 5MB</p>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="btn-primary-tenant w-full inline-flex items-center justify-center gap-1.5 font-bold h-10 text-xs rounded-xl mt-4"
            >
              <Send className="h-4 w-4" />
              <span>Submit Repair Request</span>
            </Button>
          </form>
        </div>
      ) : (
        /* Complaints List */
        <div className="space-y-4 max-w-2xl mx-auto">
          {complaints && (complaints ?? []).length > 0 ? (
            <div className="space-y-4">
              {(complaints ?? []).map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedComplaintId(c.id)}
                  className={`p-5 bg-white dark:bg-zinc-900 border rounded-3xl shadow-sm cursor-pointer hover:border-red-600/40 transition flex flex-col justify-between ${
                    selectedComplaintId === c.id ? "border-red-600/80 ring-1 ring-red-600/10" : "border-slate-200 dark:border-zinc-800"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-mono text-[9px] font-black text-stone-400 bg-slate-50 dark:bg-zinc-950 px-2 py-0.5 border border-slate-200 dark:border-zinc-800 rounded-lg select-all">
                        #{c.complaint_number}
                      </span>
                      <span className={`text-[9px] font-black py-0.5 px-2.5 border rounded-full uppercase tracking-wider select-none ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-stone-850 dark:text-white line-clamp-1 mb-1.5">
                      {c.title}
                    </h4>
                    <p className="text-[10px] text-stone-450 dark:text-stone-500 font-black select-none uppercase tracking-wide">
                      Category: {c.category} | Priority: {c.priority}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/80 pt-3 mt-4 text-[10px] text-stone-400 select-none">
                    <span>Submitted: {(c.created_at || c.createdAt) ? new Date(c.created_at || c.createdAt).toLocaleDateString("en-IN") : "N/A"}</span>
                    <span className="font-black text-red-650 inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> Details
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm text-center select-none max-w-sm mx-auto">
              <HelpCircle className="h-10 w-10 text-stone-300 dark:text-stone-700 mb-3" />
              <h3 className="text-sm font-black text-stone-850 dark:text-white mb-2 uppercase tracking-wider">No reported issues</h3>
              <p className="text-xs text-stone-450 dark:text-stone-500 leading-relaxed font-semibold max-w-[250px]">
                You have not raised any lodging repair or service tickets yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Slide-over Detail Drawer */}
      <Drawer
        isOpen={!!selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
        title="Complaint Details"
      >
        {activeDetails && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3 select-none">
              <div>
                <span className="font-mono text-[9px] font-black text-stone-400 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-2 py-0.5 rounded-lg select-all">
                  #{activeDetails.complaint_number}
                </span>
                <h3 className="font-black text-sm text-stone-850 dark:text-white mt-3">
                  {activeDetails.title}
                </h3>
              </div>
            </div>

            {/* Status grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl select-none">
              <div>
                <span className="text-[9px] text-stone-400 dark:text-stone-500 block uppercase font-black tracking-wider">Category</span>
                <span className="font-bold text-stone-850 dark:text-white mt-1.5 block">{activeDetails.category}</span>
              </div>
              <div>
                <span className="text-[9px] text-stone-400 dark:text-stone-500 block uppercase font-black tracking-wider">Priority</span>
                <div className="mt-1.5">
                  <span className={`text-[8.5px] font-black py-0.5 px-2 border rounded-full uppercase tracking-wider ${getPriorityBadge(activeDetails.priority)}`}>
                    {activeDetails.priority}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[9px] text-stone-400 dark:text-stone-500 block uppercase font-black tracking-wider">Status</span>
                <div className="mt-1.5">
                  <span className={`text-[8.5px] font-black py-0.5 px-2 border rounded-full uppercase tracking-wider ${getStatusBadge(activeDetails.status)}`}>
                    {activeDetails.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block mb-1.5 select-none">Issue Description</span>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-slate-50 dark:bg-zinc-950/20 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 font-semibold text-wrap-safe">
                {activeDetails.description}
              </p>
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <div className="flex justify-between items-center select-none">
                <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider">Complaint Photos</span>
                <label className="inline-flex items-center gap-1.5 text-[9px] font-black text-red-650 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors">
                  <Upload className="h-3.5 w-3.5" /> Add Photo
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>

              {activeDetails.images && (activeDetails.images ?? []).length > 0 ? (
                <div className="grid grid-cols-4 gap-2.5 select-none">
                  {(activeDetails.images ?? []).map((img) => {
                    const imgUrl = String(img.image_path || "").startsWith("http") ? img.image_path : `http://localhost:8000${img.image_path}`;
                    return (
                      <div
                        key={img.id}
                        onClick={() => setLightboxUrl(imgUrl)}
                        className="relative aspect-square border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden cursor-pointer bg-slate-50 dark:bg-zinc-950 flex items-center justify-center group"
                      >
                        <img src={imgUrl} alt="Screenshot proof" className="w-full h-full object-cover group-hover:scale-[1.02] transition" />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ExternalLink className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-stone-400 dark:text-stone-500 italic select-none">No attachments uploaded.</p>
              )}
            </div>

            {/* Resolution Note if status resolved */}
            {activeDetails.resolution_notes && (
              <div className="bg-green-50/50 dark:bg-green-950/15 border border-green-200 dark:border-green-900/30 rounded-2xl p-3.5 space-y-1.5 select-none">
                <span className="text-[9px] font-black text-green-700 dark:text-green-400 uppercase tracking-wider block">Resolution Notes</span>
                <p className="text-xs text-stone-605 dark:text-stone-300 leading-relaxed font-semibold">
                  {activeDetails.resolution_notes}
                </p>
              </div>
            )}

            {activeDetails.status !== "CLOSED" && activeDetails.status !== "RESOLVED" && (
              <div className="pt-2">
                <Button
                  onClick={async () => {
                    if (confirm("Are you sure you want to cancel/close this complaint?")) {
                      try {
                        await updateStatusMutation.mutateAsync({
                          id: selectedComplaintId!,
                          status: "CLOSED",
                          notes: "Cancelled/Closed by tenant."
                        });
                        alert("Complaint cancelled successfully!");
                      } catch (err) {
                        alert("Failed to cancel complaint.");
                      }
                    }
                  }}
                  isLoading={updateStatusMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-750 text-white font-black h-10 text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 border-none"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Cancel / Withdraw Complaint</span>
                </Button>
              </div>
            )}

            {/* Timeline */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
              <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Timeline History</span>
              <div className="flow-root pl-2">
                <ul className="-mb-8">
                  {timeline?.map((item, idx) => {
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
                              <span className="h-8 w-8 rounded-full bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-800 flex items-center justify-center text-stone-400">
                                <Icon className="h-4 w-4" />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                              <div className="flex justify-between items-start gap-4 select-none">
                                <p className="text-xs font-black text-stone-850 dark:text-white uppercase tracking-wider">{item.status}</p>
                                <time className="text-[10px] text-stone-400 dark:text-stone-550 font-semibold tabular-nums">
                                  {new Date(item.action_at || item.created_at || "").toLocaleDateString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                </time>
                              </div>
                              {item.remarks && (
                                <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-150 dark:border-zinc-800/80 font-semibold leading-relaxed">
                                  {item.remarks}
                                </p>
                              )}
                              {item.action_by_name && (
                                <div className="flex items-center gap-1 mt-1.5 text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider select-none">
                                  <User className="h-3.5 w-3.5 text-stone-450" />
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
            </div>
          </div>
        )}
      </Drawer>

      {/* Lightbox photo viewer */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/85 p-4">
          <div className="absolute inset-0" onClick={() => setLightboxUrl(null)} />
          <div className="relative max-w-4xl w-full max-h-[80vh] bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 animate-in fade-in duration-150">
            <div className="flex h-12 items-center justify-between px-4 bg-zinc-950 border-b border-zinc-800 select-none">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Attachment View</span>
              <button
                onClick={() => setLightboxUrl(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              <img src={lightboxUrl} alt="Expanded Attachment" className="max-w-full max-h-[60vh] object-contain rounded-2xl" />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TenantComplaintsPage;

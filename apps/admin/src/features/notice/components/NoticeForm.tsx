import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { X, Plus, Trash2, FileText, Target } from "lucide-react";
import { useNoticeDetails, useNoticeMutations } from "../hooks/api/useNotice";
import { useHostels, useBuildings, useFloors, useRooms } from "../../hostel/hooks/api/useHostel";
import { useTenants } from "../../tenant/hooks/api/useTenant";
import { Button, Spinner, Input } from "@bhagirathi/ui";
import { NoticeStatus, NoticePriority, NoticeTargetType } from "@bhagirathi/constants";

const noticeFormSchema = zod.object({
  title: zod.string().min(5, "Title must be at least 5 characters").max(150, "Title is too long"),
  content: zod.string().min(10, "Content must be at least 10 characters"),
  priority: zod.string().min(1, "Priority level is required"),
  status: zod.string().default("DRAFT"),
  publishImmediately: zod.boolean().default(true),
  publish_date: zod.string().optional().nullable(),
  expiry_date: zod.string().optional().nullable(),
  targets: zod.array(zod.object({
    target_type: zod.string(),
    target_id: zod.string().nullable().optional()
  })).min(1, "At least one target rule is required")
});

interface NoticeFormProps {
  isOpen: boolean;
  onClose: () => void;
  editId: string | null;
}

export const NoticeForm: React.FC<NoticeFormProps> = ({ isOpen, onClose, editId }) => {
  const { data: hostels } = useHostels();
  const { data: tenants } = useTenants();
  const { data: notice, isLoading: isNoticeLoading } = useNoticeDetails(editId);
  const { createNotice, updateNotice } = useNoticeMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      title: "",
      content: "",
      priority: NoticePriority.NORMAL,
      status: "DRAFT",
      publishImmediately: true,
      publish_date: "",
      expiry_date: "",
      targets: [{ target_type: NoticeTargetType.ALL, target_id: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "targets"
  });

  const watchPublishImmediately = watch("publishImmediately");

  // Load editing notice values
  useEffect(() => {
    if (notice && editId) {
      reset({
        title: notice.title,
        content: notice.content || "",
        priority: notice.priority as any,
        status: notice.status as any,
        publishImmediately: notice.status === NoticeStatus.PUBLISHED && !notice.publish_date,
        publish_date: notice.publish_date ? new Date(notice.publish_date).toISOString().slice(0, 16) : "",
        expiry_date: notice.expiry_date ? new Date(notice.expiry_date).toISOString().slice(0, 16) : "",
        targets: (notice.targets || []).map((t: any) => ({
           target_type: t.target_type as any,
           target_id: t.target_id || ""
        }))
      });
    } else if (!editId) {
      reset({
        title: "",
        content: "",
        priority: NoticePriority.NORMAL,
        status: "DRAFT",
        publishImmediately: true,
        publish_date: "",
        expiry_date: "",
        targets: [{ target_type: NoticeTargetType.ALL, target_id: "" }]
      });
    }
  }, [notice, editId, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      setSubmitError(null);
      const payload = {
        title: data.title,
        content: data.content,
        priority: data.priority,
        status: data.publishImmediately ? NoticeStatus.PUBLISHED : NoticeStatus.DRAFT,
        publish_date: data.publishImmediately ? null : (data.publish_date ? new Date(data.publish_date).toISOString() : null),
        expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString() : null,
        targets: data.targets.map((t: any) => ({
           target_type: t.target_type,
           target_id: t.target_id ? t.target_id : null
         }))
      };

      if (editId) {
        await updateNotice.mutateAsync({ id: editId, data: payload });
      } else {
        await createNotice.mutateAsync(payload);
      }
      reset();
      onClose();
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || "Failed to submit notice.");
    }
  };

  const sectionHeaderClass = "text-[10px] font-bold text-secondaryText dark:text-gray-400 uppercase tracking-widest border-b border-border dark:border-gray-800 pb-2 mb-3.5 flex items-center gap-2 select-none";

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative max-w-2xl w-full bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-6 bg-gray-50 dark:bg-gray-955 border-b border-border dark:border-gray-850 rounded-t-card">
          <div className="flex items-center gap-2 select-none">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm text-primaryText dark:text-white">
              {editId ? "Edit Notice" : "Draft New Notice"}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-primaryText cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {editId && isNoticeLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-secondaryText select-none">
            <Spinner size="sm" className="mb-2" />
            <span className="text-xs">Loading notice details...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto pr-2">
            
            {submitError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 text-danger text-xs p-3.5 rounded-card font-semibold select-none">
                {submitError}
              </div>
            )}

            {/* Section 1: Notice Info */}
            <div className="bg-gray-50/20 dark:bg-gray-950/20 border border-border dark:border-gray-855 rounded-card p-4">
              <h4 className={sectionHeaderClass}>
                <FileText className="h-4 w-4 text-primary" />
                <span>Notice Details</span>
              </h4>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Notice Title *"
                      type="text"
                      placeholder="e.g. Scheduled power cut this Sunday"
                      error={errors.title?.message}
                      {...register("title")}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 select-none">
                    <label className="text-xs font-bold text-secondaryText dark:text-gray-300">Priority level *</label>
                    <select
                      className="h-9.5 px-3 bg-white dark:bg-gray-950 border border-border dark:border-gray-800 rounded-input text-xs font-semibold text-primaryText dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all"
                      {...register("priority")}
                    >
                      <option value={NoticePriority.NORMAL}>Normal</option>
                      <option value={NoticePriority.IMPORTANT}>Important</option>
                      <option value={NoticePriority.URGENT}>Urgent</option>
                      <option value={NoticePriority.EMERGENCY}>Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-secondaryText dark:text-gray-300">Announcement body *</label>
                  <textarea
                    className="w-full min-h-[110px] p-3 bg-white dark:bg-gray-950 border border-border dark:border-gray-805 rounded text-xs text-primaryText placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary transition-all font-semibold leading-relaxed"
                    placeholder="Write the notice body content here..."
                    {...register("content")}
                  />
                  {errors.content && (
                    <p className="text-[10px] text-danger font-bold">{errors.content.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Scheduling Settings */}
            <div className="bg-gray-50/20 dark:bg-gray-950/20 border border-border dark:border-gray-855 rounded-card p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border dark:border-gray-800 pb-2 select-none">
                <div>
                  <span className="text-xs font-bold text-primaryText dark:text-white block">Publish Immediately</span>
                  <span className="text-[10px] text-muted block">Notice will go live directly upon saving</span>
                </div>
                <input
                  type="checkbox"
                  className="h-4.5 w-4.5 text-primary rounded border-gray-300 cursor-pointer focus:ring-primary"
                  {...register("publishImmediately")}
                />
              </div>

              {!watchPublishImmediately && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                  <div className="flex flex-col gap-1.5 select-none">
                    <label className="text-xs font-bold text-secondaryText dark:text-gray-300">Scheduled Date</label>
                    <input
                      type="datetime-local"
                      className="h-9.5 px-3 border border-border dark:border-gray-800 rounded bg-white dark:bg-gray-950 text-xs font-semibold text-primaryText focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all"
                      {...register("publish_date")}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 select-none">
                  <label className="text-xs font-bold text-secondaryText dark:text-gray-300">Expiry Date (Optional)</label>
                  <input
                    type="datetime-local"
                    className="h-9.5 px-3 border border-border dark:border-gray-800 rounded bg-white dark:bg-gray-950 text-xs font-semibold text-primaryText focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all"
                    {...register("expiry_date")}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Targeting Filter rules */}
            <div className="bg-gray-50/20 dark:bg-gray-950/20 border border-border dark:border-gray-855 rounded-card p-4 space-y-3">
              <div className="flex justify-between items-center select-none">
                <label className="text-xs font-bold text-primaryText dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Target Audience Filters *</span>
                </label>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ target_type: NoticeTargetType.ALL, target_id: "" })}
                  className="inline-flex items-center gap-1 h-8 text-[10px] px-2.5 font-bold cursor-pointer border-border dark:border-gray-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Filter Rule</span>
                </Button>
              </div>

              {errors.targets && (
                <p className="text-[10px] text-danger font-bold">{errors.targets.message}</p>
              )}

              <div className="space-y-3 pt-2">
                {fields.map((field, idx) => {
                  const watchType = watch(`targets.${idx}.target_type`);
                  return (
                    <TargetSelectorRow
                      key={field.id}
                      index={idx}
                      register={register}
                      watchType={watchType}
                      hostels={hostels || []}
                      tenants={tenants || []}
                      onRemove={() => remove(idx)}
                      showDelete={fields.length > 1}
                    />
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-gray-800 select-none">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
                className="cursor-pointer font-bold h-9.5 flex-1 sm:flex-none sm:px-6"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="cursor-pointer font-bold h-9.5 text-white flex-1 sm:flex-none sm:px-6"
              >
                Save Notice
              </Button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

interface TargetSelectorRowProps {
  index: number;
  register: any;
  watchType: string;
  hostels: any[];
  tenants: any[];
  onRemove: () => void;
  showDelete: boolean;
}

const TargetSelectorRow: React.FC<TargetSelectorRowProps> = ({
  index,
  register,
  watchType,
  hostels,
  tenants,
  onRemove,
  showDelete
}) => {
  const [selectedHostelId, setSelectedHostelId] = useState<string>("");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");

  const { data: buildings } = useBuildings(selectedHostelId || null);
  const { data: floors } = useFloors(selectedBuildingId || null);
  const { data: rooms } = useRooms(selectedFloorId || null);

  // Clear subselections if type resets
  useEffect(() => {
    setSelectedHostelId("");
    setSelectedBuildingId("");
    setSelectedFloorId("");
  }, [watchType]);

  return (
    <div className="flex items-center gap-3 p-3.5 bg-gray-50/50 dark:bg-gray-950/20 border border-border dark:border-gray-800 rounded-card relative animate-in slide-in-from-bottom-2 duration-150 flex-wrap sm:flex-nowrap">
      
      {/* Target Type Selector */}
      <div className="w-full sm:w-1/3">
        <label className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase tracking-wider block mb-1">Target Type</label>
        <select
          className="w-full h-8 px-2 bg-white dark:bg-gray-950 border border-border dark:border-gray-800 rounded text-xs font-semibold cursor-pointer"
          {...register(`targets.${index}.target_type`)}
        >
          <option value={NoticeTargetType.ALL}>All Tenants</option>
          <option value={NoticeTargetType.HOSTEL}>Specific Hostel</option>
          <option value={NoticeTargetType.BUILDING}>Specific Building</option>
          <option value={NoticeTargetType.FLOOR}>Specific Floor</option>
          <option value={NoticeTargetType.ROOM}>Specific Room</option>
          <option value={NoticeTargetType.TENANT}>Specific Tenant</option>
        </select>
      </div>

      {/* Target ID Select cascading logic */}
      <div className="w-full sm:w-2/3 flex gap-2 items-end flex-wrap sm:flex-nowrap">
        
        {watchType === NoticeTargetType.HOSTEL && (
          <div className="w-full">
            <label className="text-[9px] font-bold text-muted block mb-1">Select Hostel</label>
            <select
              className="w-full h-8 px-2 bg-white dark:bg-gray-950 border border-border dark:border-gray-800 rounded text-xs font-semibold cursor-pointer"
              {...register(`targets.${index}.target_id`)}
            >
              <option value="">-- Choose Hostel --</option>
              {hostels.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        )}

        {watchType === NoticeTargetType.BUILDING && (
          <div className="w-full flex gap-2">
            <div className="w-1/2">
              <label className="text-[9px] font-bold text-muted block mb-1">Hostel</label>
              <select
                className="w-full h-8 px-2 bg-white dark:bg-gray-950 border border-border dark:border-gray-800 rounded text-xs cursor-pointer"
                value={selectedHostelId}
                onChange={(e) => setSelectedHostelId(e.target.value)}
              >
                <option value="">-- Choose --</option>
                {hostels.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div className="w-1/2">
              <label className="text-[9px] font-bold text-muted block mb-1">Building</label>
              <select
                className="w-full h-8 px-2 bg-white dark:bg-gray-950 border border-border dark:border-gray-800 rounded text-xs cursor-pointer"
                {...register(`targets.${index}.target_id`)}
              >
                <option value="">-- Choose --</option>
                {buildings?.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {watchType === NoticeTargetType.FLOOR && (
          <div className="w-full flex gap-1.5 flex-wrap sm:flex-nowrap">
            <div className="w-1/3">
              <label className="text-[9px] font-bold text-muted block mb-1">Hostel</label>
              <select
                className="w-full h-8 px-2 bg-white dark:bg-gray-950 border border-border dark:border-gray-800 rounded text-xs cursor-pointer"
                value={selectedHostelId}
                onChange={(e) => setSelectedHostelId(e.target.value)}
              >
                <option value="">-- Choose --</option>
                {hostels.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div className="w-1/3">
              <label className="text-[9px] font-bold text-muted block mb-1">Building</label>
              <select
                className="w-full h-8 px-2 bg-white dark:bg-gray-950 border border-border dark:border-gray-800 rounded text-xs cursor-pointer"
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
              >
                <option value="">-- Choose --</option>
                {buildings?.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="w-1/3">
              <label className="text-[9px] font-bold text-muted block mb-1">Floor</label>
              <select
                className="w-full h-8 px-2 bg-white dark:bg-gray-955 border border-border dark:border-gray-800 rounded text-xs cursor-pointer"
                {...register(`targets.${index}.target_id`)}
              >
                <option value="">-- Choose --</option>
                {floors?.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {watchType === NoticeTargetType.ROOM && (
          <div className="w-full flex gap-1 flex-wrap sm:flex-nowrap">
            <div className="w-1/4">
              <select
                className="w-full h-8 px-1.5 bg-white dark:bg-gray-950 border border-border dark:border-gray-800 rounded text-xs cursor-pointer"
                value={selectedHostelId}
                onChange={(e) => setSelectedHostelId(e.target.value)}
              >
                <option value="">Hostel</option>
                {hostels.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div className="w-1/4">
              <select
                className="w-full h-8 px-1.5 bg-white dark:bg-gray-950 border border-border dark:border-gray-800 rounded text-xs cursor-pointer"
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
              >
                <option value="">Building</option>
                {buildings?.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="w-1/4">
              <select
                className="w-full h-8 px-1.5 bg-white dark:bg-gray-955 border border-border dark:border-gray-800 rounded text-xs cursor-pointer"
                value={selectedFloorId}
                onChange={(e) => setSelectedFloorId(e.target.value)}
              >
                <option value="">Floor</option>
                {floors?.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="w-1/4">
              <select
                className="w-full h-8 px-1.5 bg-white dark:bg-gray-955 border border-border dark:border-gray-800 rounded text-xs cursor-pointer"
                {...register(`targets.${index}.target_id`)}
              >
                <option value="">Room</option>
                {rooms?.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.room_number}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {watchType === NoticeTargetType.TENANT && (
          <div className="w-full">
            <label className="text-[9px] font-bold text-muted block mb-1">Select Tenant</label>
            <select
              className="w-full h-8 px-2 bg-white dark:bg-gray-955 border border-border dark:border-gray-800 rounded text-xs font-semibold cursor-pointer"
              {...register(`targets.${index}.target_id`)}
            >
              <option value="">-- Choose Tenant --</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.full_name} ({t.mobile})</option>
              ))}
            </select>
          </div>
        )}

        {/* Delete Row Icon */}
        {showDelete && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-muted hover:text-danger cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

      </div>

    </div>
  );
};

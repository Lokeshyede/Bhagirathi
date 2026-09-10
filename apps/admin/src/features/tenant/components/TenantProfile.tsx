import React, { useState } from "react";
import { Tenant } from "@bhagirathi/types";
import { DocumentUploader } from "./DocumentUploader";
import { AllocationTimeline } from "./AllocationTimeline";
import { formatDate } from "@bhagirathi/utils";
import {
  User,
  Phone,
  Mail,
  ArrowLeft,
  Upload,
  FileText,
  Eye,
  Download,
  Trash2,
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ExternalLink,
  Plus
} from "lucide-react";
import { Button, Badge } from "@bhagirathi/ui";
import { useTenantDocuments, useTenantMutations } from "../hooks/api/useTenant";
import { motion, AnimatePresence } from "framer-motion";

interface TenantProfileProps {
  tenant: Tenant;
  onBack: () => void;
}

export const TenantProfile: React.FC<TenantProfileProps> = ({ tenant, onBack }) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  const { data: documents, isLoading: isDocsLoading, refetch: refetchDocs } = useTenantDocuments(tenant.id);
  const { deleteTenantDocument, updateTenantDocumentStatus } = useTenantMutations();

  const formatDocType = (type: string) => {
    return (type || "").replace(/_/g, " ").toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "PENDING").toUpperCase();
    switch (s) {
      case "VERIFIED":
        return {
          label: "VERIFIED",
          icon: ShieldCheck,
          cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
        };
      case "REJECTED":
        return {
          label: "REJECTED",
          icon: ShieldAlert,
          cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
        };
      case "SECURITY_HOLD":
        return {
          label: "ON HOLD",
          icon: Clock,
          cls: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30"
        };
      default:
        return {
          label: "PENDING",
          icon: Clock,
          cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
        };
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm transition-colors space-y-8">
        {/* Header Back controls */}
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-500 hover:text-gray-800 dark:hover:text-white cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Tenant Profile Dossier</h4>
            <p className="text-xxs text-gray-400 mt-0.5">Explore check-in records, identities, and documentations</p>
          </div>
        </div>

        {/* Grid columns: left details block, right files block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Profile Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex flex-col items-center text-center p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-850 rounded-2xl select-none">
              <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-red-500 overflow-hidden flex items-center justify-center mb-3">
                {tenant.photo_url ? (
                  <img src={tenant.photo_url} alt={tenant.full_name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <h5 className="font-bold text-sm text-gray-900 dark:text-white">{tenant.full_name}</h5>
              <span className="text-xxs text-gray-400 mt-0.5 font-mono">{tenant.tenant_id}</span>
              <div className="mt-2">
                <Badge variant={tenant.status?.toLowerCase() as any} size="sm">
                  {(tenant?.status ?? "UNKNOWN").replace("_", " ")}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-bold text-gray-805 dark:text-gray-250 uppercase tracking-wider border-b pb-1">Particulars Details</h5>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-550 dark:text-gray-400">
                <div>
                  <span className="text-xxs text-gray-400 uppercase tracking-wider block">Gender</span>
                  <span className="text-gray-800 dark:text-white block mt-0.5">{tenant.gender}</span>
                </div>
                <div>
                  <span className="text-xxs text-gray-400 uppercase tracking-wider block">DOB</span>
                  <span className="text-gray-800 dark:text-white block mt-0.5">{formatDate(tenant.dob || "", false)}</span>
                </div>
                <div>
                  <span className="text-xxs text-gray-400 uppercase tracking-wider block">Blood Group</span>
                  <span className="text-gray-800 dark:text-white block mt-0.5">{tenant.blood_group || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xxs text-gray-400 uppercase tracking-wider block">Occupation</span>
                  <span className="text-gray-800 dark:text-white block mt-0.5">{tenant.occupation}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xxs text-gray-400 uppercase tracking-wider block">Company / College</span>
                  <span className="text-gray-800 dark:text-white block mt-0.5">{tenant.company_college || "N/A"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xxs text-gray-400 uppercase tracking-wider block">Aadhaar Card</span>
                  <span className="text-gray-800 dark:text-white block mt-0.5 font-mono">{tenant.aadhaar_number}</span>
                </div>
                <div className="col-span-2 border-t pt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-800 dark:text-white">{tenant.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-800 dark:text-white truncate" title={tenant.email}>{tenant.email}</span>
                  </div>
                </div>
                <div className="col-span-2 border-t pt-2">
                  <span className="text-xxs text-gray-400 uppercase tracking-wider block">Emergency Contact</span>
                  <div className="text-gray-850 dark:text-gray-200 mt-1 block">
                    <div>Guardian: <span className="font-bold text-gray-900 dark:text-white">{tenant.guardian_name}</span></div>
                    <div>Mobile: <span className="font-bold text-gray-900 dark:text-white">{tenant.guardian_mobile}</span></div>
                    {tenant.emergency_contact && <div>Alt: {tenant.emergency_contact}</div>}
                  </div>
                </div>
                <div className="col-span-2 border-t pt-2">
                  <span className="text-xxs text-gray-400 uppercase tracking-wider block">Permanent Address</span>
                  <span className="text-gray-700 dark:text-gray-300 block mt-1 font-normal leading-relaxed">{tenant.permanent_address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Uploader & History Panels (7 cols) */}
          <div className="lg:col-span-7 space-y-8 border-l border-gray-100 dark:border-gray-850 lg:pl-8">
            {/* Upload Documents section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-600" />
                  <h5 className="text-xs font-bold text-gray-805 dark:text-gray-250 uppercase tracking-wider">
                    Identity Documents ({documents?.length || 0})
                  </h5>
                </div>
                <Button
                  variant="outline"
                  className="h-8 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  onClick={() => setIsUploadOpen(true)}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Document
                </Button>
              </div>

              {/* Documents List / Cards */}
              {isDocsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
                  <div className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800" />
                  <div className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800" />
                </div>
              ) : !documents || documents.length === 0 ? (
                <div className="p-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-center space-y-2 select-none bg-gray-50/30 dark:bg-gray-950/20">
                  <FileText className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">No Documents Uploaded</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Upload Aadhaar, PAN, College ID, Agreement or Photo.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7.5 text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                    onClick={() => setIsUploadOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Upload Now</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {documents.map((doc: any) => {
                    const docUrl = doc.document_url || doc.file_path || "";
                    const isImage = docUrl.match(/\.(jpeg|jpg|png|webp)($|\?)/i);
                    const badge = getStatusBadge(doc.status);
                    const docStatus = (doc.status || "PENDING").toUpperCase();

                    return (
                      <div
                        key={doc.id}
                        className="p-3.5 border border-border dark:border-gray-800 rounded-xl bg-gray-50/40 dark:bg-gray-950/30 space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FileText className="h-3.5 w-3.5 text-red-600 shrink-0" />
                              <h6 className="font-bold text-xs text-primaryText dark:text-white uppercase truncate" title={doc.document_type}>
                                {formatDocType(doc.document_type)}
                              </h6>
                            </div>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </div>

                          {/* Image preview thumbnail */}
                          {isImage ? (
                            <div
                              onClick={() => setPreviewDoc({ url: docUrl, title: formatDocType(doc.document_type) })}
                              className="relative h-28 w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-850 cursor-pointer group border border-gray-200 dark:border-gray-800"
                            >
                              <img
                                src={docUrl}
                                alt={doc.document_type}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                <span>Preview</span>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => window.open(docUrl, "_blank")}
                              className="h-20 w-full rounded-lg bg-red-50 dark:bg-red-955/15 border border-red-100 dark:border-red-900/20 flex flex-col items-center justify-center cursor-pointer hover:bg-red-100/50 transition group p-2 text-center"
                            >
                              <FileText className="h-6 w-6 text-red-600 mb-1 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-bold text-red-700 dark:text-red-400">PDF File &bull; Click to open</span>
                            </div>
                          )}
                        </div>

                        {/* Card footer actions */}
                        <div className="space-y-1.5 pt-2 border-t border-gray-150 dark:border-gray-800">
                          {/* Approval / Rejection toggles */}
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[8px] font-bold text-gray-400 uppercase">Status:</span>
                            <div className="flex gap-1">
                              {docStatus !== "VERIFIED" && (
                                <button
                                  onClick={async () => {
                                    await updateTenantDocumentStatus.mutateAsync({ tenantId: tenant.id, docId: doc.id, status: "VERIFIED" });
                                    refetchDocs();
                                  }}
                                  className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 text-[8px] font-bold border border-emerald-200 dark:border-emerald-800 transition cursor-pointer flex items-center gap-0.5"
                                  title="Approve Document"
                                >
                                  <Check className="h-2.5 w-2.5" />
                                  <span>Verify</span>
                                </button>
                              )}
                              {docStatus !== "REJECTED" && (
                                <button
                                  onClick={async () => {
                                    await updateTenantDocumentStatus.mutateAsync({ tenantId: tenant.id, docId: doc.id, status: "REJECTED" });
                                    refetchDocs();
                                  }}
                                  className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-955/30 text-red-700 dark:text-red-400 hover:bg-red-100 text-[8px] font-bold border border-red-200 dark:border-red-800 transition cursor-pointer flex items-center gap-0.5"
                                  title="Reject Document"
                                >
                                  <X className="h-2.5 w-2.5" />
                                  <span>Reject</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  if (isImage) {
                                    setPreviewDoc({ url: docUrl, title: formatDocType(doc.document_type) });
                                  } else {
                                    window.open(docUrl, "_blank");
                                  }
                                }}
                                className="p-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-red-600 hover:text-white transition cursor-pointer text-xs font-bold"
                                title="View Document"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <a
                                href={docUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 hover:text-white transition cursor-pointer text-xs font-bold no-underline text-inherit"
                                title="Download Document"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </a>
                            </div>

                            <button
                              onClick={async () => {
                                if (confirm("Delete this document record?")) {
                                  await deleteTenantDocument.mutateAsync({ tenantId: tenant.id, docId: doc.id });
                                  refetchDocs();
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              title="Delete Document"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            <AllocationTimeline tenantId={tenant.id} />
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      {isUploadOpen && (
        <DocumentUploader
          isOpen={true}
          tenantId={tenant.id}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={() => {
            setIsUploadOpen(false);
            refetchDocs();
          }}
        />
      )}

      {/* Lightbox Preview Modal */}
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 no-underline"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TenantProfile;

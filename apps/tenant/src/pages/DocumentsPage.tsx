import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTenantDocumentsList, useUploadTenantDocumentMutation } from "../features/payment/hooks/useTenantDashboard";
import { Button } from "@bhagirathi/ui";
import {
  FileText,
  Download,
  Eye,
  AlertTriangle,
  ShieldCheck,
  User,
  ArrowLeft,
  Upload,
  Plus,
  X,
  AlertCircle,
  Clock,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DOCUMENT_TYPES = [
  { value: "AADHAAR_FRONT", label: "📄 Aadhaar Card (Front)" },
  { value: "AADHAAR_BACK", label: "📄 Aadhaar Card (Back)" },
  { value: "PAN", label: "💳 PAN Card" },
  { value: "COLLEGE_ID", label: "🎓 College ID" },
  { value: "COMPANY_ID", label: "🏢 Company Work ID" },
  { value: "AGREEMENT_PDF", label: "📜 Agreement Document" },
  { value: "TENANT_PHOTO", label: "👤 Profile Photo" },
];

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: documents, isLoading, isError, refetch } = useTenantDocumentsList();
  const uploadMutation = useUploadTenantDocumentMutation();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docType, setDocType] = useState("AADHAAR_FRONT");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const allowedExts = [".png", ".jpg", ".jpeg", ".webp", ".pdf"];
    if (!allowedExts.includes(ext)) {
      setValidationError("Unsupported file format. Please upload PNG, JPG, JPEG, WEBP or PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setValidationError("File size exceeds 10 MB limit.");
      return;
    }
    setValidationError(null);
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError("Please select a file to upload.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("document_type", docType);
      formData.append("file", selectedFile);
      await uploadMutation.mutateAsync(formData);
      setIsUploadOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setValidationError(null);
      refetch();
    } catch (err: any) {
      setValidationError(err?.response?.data?.detail || "Upload failed. Please check your file and try again.");
    }
  };

  const formatDocType = (type: string) => {
    return (type || "").replace(/_/g, " ").toUpperCase();
  };

  const getDocIcon = (type: string) => {
    switch ((type || "").toUpperCase()) {
      case "TENANT_PHOTO":
      case "PHOTO":
        return User;
      default:
        return FileText;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "PENDING").toUpperCase();
    switch (s) {
      case "VERIFIED":
        return {
          label: "Verified",
          icon: ShieldCheck,
          cls: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
        };
      case "REJECTED":
        return {
          label: "Rejected",
          icon: ShieldAlert,
          cls: "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
        };
      default:
        return {
          label: "Pending Review",
          icon: Clock,
          cls: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
        };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none max-w-3xl mx-auto">
        <div className="h-10 w-28 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 rounded-3xl bg-slate-200 dark:bg-zinc-800" />
          <div className="h-44 rounded-3xl bg-slate-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center shadow-sm select-none max-w-md mx-auto my-12">
        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-650 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h4 className="font-black text-sm text-stone-900 dark:text-white mb-2 uppercase tracking-wider">Failed to Load Documents</h4>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
          There was an error retrieving your identity verification files. Please try again.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="font-bold h-10 px-6 cursor-pointer text-stone-700 dark:text-stone-300">
          Retry Request
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-stone-700 dark:text-stone-300" />
          </button>
          <div>
            <h1 className="text-lg font-black text-stone-900 dark:text-white leading-tight uppercase tracking-wider">Verification Documents</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
              Manage your uploaded identity proofs, agreements, and profile photos.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider h-9.5 px-4 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Upload</span>
        </button>
      </div>

      {!documents || documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm text-center select-none max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600">
            <Upload className="h-8 w-8" />
          </div>
          <div>
            <h4 className="font-black text-sm text-stone-900 dark:text-white uppercase tracking-wider">No Documents Uploaded Yet</h4>
            <p className="text-xs text-stone-400 dark:text-stone-500 leading-relaxed font-semibold max-w-xs mt-1">
              Upload your Aadhaar Card, PAN Card, College ID or Rental Agreement to complete your verification.
            </p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider h-10 px-5 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {documents.map((doc: any) => {
            const Icon = getDocIcon(doc.document_type);
            const badge = getStatusBadge(doc.status);
            const BadgeIcon = badge.icon;
            const isImage = (doc.document_url || "").match(/\.(jpeg|jpg|png|webp)($|\?)/i);

            return (
              <div
                key={doc.id}
                className="flex flex-col justify-between p-4.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-3"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-red-50 dark:bg-red-955/20 rounded-xl text-red-600 shrink-0">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-stone-850 dark:text-white uppercase tracking-wider truncate">
                          {formatDocType(doc.document_type)}
                        </h4>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border mt-1 uppercase tracking-wide ${badge.cls}`}>
                          <BadgeIcon className="h-3 w-3" />
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail if image */}
                  {isImage && (
                    <div
                      onClick={() => {
                        setLightboxUrl(doc.document_url);
                        setLightboxTitle(formatDocType(doc.document_type));
                      }}
                      className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 cursor-pointer group border border-slate-200/60 dark:border-zinc-700/60"
                    >
                      <img
                        src={doc.document_url}
                        alt={doc.document_type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs gap-1">
                        <Eye className="h-4 w-4" />
                        <span>Enlarge</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800/80 select-none">
                  <span className="text-[10px] text-stone-400 font-mono">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString("en-IN") : ""}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (isImage) {
                          setLightboxUrl(doc.document_url);
                          setLightboxTitle(formatDocType(doc.document_type));
                        } else {
                          window.open(doc.document_url, "_blank");
                        }
                      }}
                      className="p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-stone-600 dark:text-stone-300 hover:text-red-600 transition cursor-pointer"
                      title="View Document"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <a
                      href={doc.document_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-stone-600 dark:text-stone-300 hover:text-red-600 transition cursor-pointer"
                      title="Download Document"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none"
            onClick={(e) => { if (e.target === e.currentTarget && !uploadMutation.isPending) setIsUploadOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-red-600" />
                  <h3 className="font-black text-sm text-stone-900 dark:text-white uppercase tracking-wider">
                    Upload Verification Document
                  </h3>
                </div>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  disabled={uploadMutation.isPending}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-white p-1 rounded-lg transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-stone-400 dark:text-stone-500 tracking-wider mb-1.5">
                    Document Category *
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    disabled={uploadMutation.isPending}
                    className="w-full h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 font-bold text-xs text-stone-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-600"
                  >
                    {DOCUMENT_TYPES.map((dt) => (
                      <option key={dt.value} value={dt.value}>{dt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-stone-400 dark:text-stone-500 tracking-wider mb-1.5">
                    Select File (PNG, JPG, PDF - Max 10 MB) *
                  </label>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-red-600/50 rounded-2xl p-5 text-center cursor-pointer transition-all bg-slate-50 dark:bg-zinc-950/40"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.pdf,image/*,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="space-y-2">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="h-24 object-contain mx-auto rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm" />
                        ) : (
                          <FileText className="h-10 w-10 text-red-600 mx-auto" />
                        )}
                        <p className="text-xs font-black text-stone-800 dark:text-gray-200 truncate">{selectedFile.name}</p>
                        <span className="text-[10px] text-stone-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB &bull; Click to change</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Upload className="h-7 w-7 text-stone-400 mx-auto" />
                        <p className="text-xs font-black text-stone-700 dark:text-gray-300">Click or Drag &amp; Drop to select file</p>
                        <p className="text-[9px] text-stone-400">PNG, JPG, JPEG, WEBP, PDF (Max 10 MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {validationError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUploadOpen(false)}
                    disabled={uploadMutation.isPending}
                    className="font-bold text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={uploadMutation.isPending}
                    disabled={!selectedFile || uploadMutation.isPending}
                    className="btn-primary-tenant font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Document</span>
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Screen Image Lightbox Modal */}
      <AnimatePresence>
        {lightboxUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none"
            onClick={() => setLightboxUrl(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl w-full max-h-[90vh] bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-zinc-950 text-white">
                <span className="text-xs font-black uppercase tracking-wider">{lightboxTitle || "Document Preview"}</span>
                <button
                  onClick={() => setLightboxUrl(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50">
                <img
                  src={lightboxUrl}
                  alt="Document Preview"
                  className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
                />
              </div>
              <div className="p-3 border-t border-white/10 bg-zinc-950 flex justify-end gap-2">
                <a
                  href={lightboxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Open in New Tab</span>
                </a>
                <a
                  href={lightboxUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
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

export default DocumentsPage;

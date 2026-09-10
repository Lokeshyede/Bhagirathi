import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Cloud, FileText, Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@bhagirathi/ui";
import { useTenantMutations } from "../hooks/api/useTenant";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".pdf"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const DOCUMENT_TYPES = [
  { value: "AADHAAR_FRONT", label: "📄 Aadhaar Card (Front)" },
  { value: "AADHAAR_BACK",  label: "📄 Aadhaar Card (Back)"  },
  { value: "PAN",           label: "💳 PAN Card"              },
  { value: "COLLEGE_ID",    label: "🎓 College ID"            },
  { value: "COMPANY_ID",    label: "🏢 Company Work ID"       },
  { value: "AGREEMENT_PDF", label: "📜 Agreement PDF"         },
  { value: "TENANT_PHOTO",  label: "👤 Tenant Photo"          },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

function validateFile(file: File): string | null {
  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return `Unsupported file type "${ext}". Please upload PNG, JPG, JPEG, WEBP or PDF.`;
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return `Unsupported file format (${file.type || "unknown"}). Please upload PNG, JPG, JPEG, WEBP or PDF.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File too large (${formatFileSize(file.size)}). Maximum size is 10 MB.`;
  }
  return null;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadState = "idle" | "selected" | "uploading" | "success" | "error";

interface DocumentUploaderProps {
  isOpen?: boolean;
  onClose?: () => void;
  tenantId: string;
  onSuccess?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  isOpen = false,
  onClose,
  tenantId,
  onSuccess,
}) => {
  const { uploadTenantDocument } = useTenantMutations();

  const [docType, setDocType] = useState<string>("AADHAAR_FRONT");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File selection ──────────────────────────────────────────────────────────

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadState("idle");
      return;
    }

    setValidationError(null);
    setServerError(null);
    setSelectedFile(file);
    setUploadState("selected");

    // Generate preview URL for images
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (isImageFile(file)) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so same file can be re-selected after removal
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError(null);
    setServerError(null);
    setUploadState("idle");
  };

  // ── Drag & Drop ─────────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // ── Upload ──────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile || uploadState === "uploading") return;

    setUploadState("uploading");
    setServerError(null);

    try {
      await uploadTenantDocument.mutateAsync({
        tenantId,
        documentType: docType,
        file: selectedFile,
      });
      setUploadState("success");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setServerError(
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail[0]?.msg ?? "Upload failed. Please try again."
          : "Upload failed. Please try again."
      );
      setUploadState("error");
    }
  };

  // ── Reset & close ────────────────────────────────────────────────────────────

  const handleClose = () => {
    if (uploadState === "uploading") return; // block close while uploading
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError(null);
    setServerError(null);
    setUploadState("idle");
    setDocType("AADHAAR_FRONT");
    if (onClose) onClose();
  };

  const handleReset = () => {
    handleRemoveFile();
    setUploadState("idle");
  };

  if (!isOpen) return null;

  const isUploading = uploadState === "uploading";
  const isSuccess = uploadState === "success";
  const canUpload = !!selectedFile && !isUploading && !isSuccess;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 select-none"
      onClick={(e) => { if (e.target === e.currentTarget && !isUploading) handleClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-6 w-full max-w-md space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            <h3 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">
              Upload Tenant Document
            </h3>
          </div>
          {onClose && !isUploading && (
            <button
              onClick={handleClose}
              className="text-muted hover:text-primaryText p-1 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Success State ── */}
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="font-extrabold text-sm text-primaryText dark:text-white">
              Document uploaded successfully!
            </p>
            <p className="text-xs text-muted">
              The document has been saved and is now visible in the tenant profile.
            </p>
            <Button
              variant="outline"
              className="mt-2 font-bold text-xs cursor-pointer"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* ── Document Category ── */}
            <div>
              <label className="font-bold text-xs text-secondaryText dark:text-gray-300 block mb-1.5">
                Document Category
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                disabled={isUploading}
                className="w-full h-10 px-3 border border-border dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950 font-bold text-xs text-primaryText dark:text-gray-200 cursor-pointer disabled:opacity-60"
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
            </div>

            {/* ── File Drop Zone / Selected File ── */}
            <div>
              <label className="font-bold text-xs text-secondaryText dark:text-gray-300 block mb-1.5">
                Select File
              </label>

              {!selectedFile ? (
                /* Drop zone */
                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                    ${isDragging
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-gray-50/50 dark:hover:bg-gray-850/30"
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className={`h-8 w-8 ${isDragging ? "text-primary" : "text-gray-300 dark:text-gray-600"}`} />
                    <p className="font-bold text-xs text-primaryText dark:text-gray-200">
                      {isDragging ? "Drop file here" : "Drop file here or"}
                    </p>
                    {!isDragging && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition">
                        Choose File
                      </span>
                    )}
                    <p className="text-[10px] text-muted mt-1">
                      PNG, JPG, JPEG, WEBP, PDF &nbsp;·&nbsp; Max 10 MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Selected file card */
                <div className="border border-border dark:border-gray-700 rounded-xl p-4 space-y-3 bg-gray-50/40 dark:bg-gray-950/30">
                  <div className="flex items-start gap-3">
                    {/* File type icon */}
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isImageFile(selectedFile)
                        ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600"
                        : "bg-red-50 dark:bg-red-955/20 text-red-600"
                    }`}>
                      {isImageFile(selectedFile)
                        ? <ImageIcon className="h-5 w-5" />
                        : <FileText className="h-5 w-5" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-primaryText dark:text-white truncate" title={selectedFile.name}>
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">
                        {formatFileSize(selectedFile.size)} &nbsp;·&nbsp; {getFileExtension(selectedFile.name).toUpperCase().slice(1)}
                      </p>
                    </div>

                    {/* Change / Remove */}
                    {!isUploading && (
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2 py-1 rounded text-[10px] font-bold text-primaryText dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                          title="Select a different file"
                        >
                          Change
                        </button>
                        <button
                          onClick={handleRemoveFile}
                          className="p-1 rounded text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-955/20 transition cursor-pointer"
                          title="Remove file"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Image thumbnail */}
                  {previewUrl && (
                    <div className="rounded-lg overflow-hidden border border-gray-150 dark:border-gray-800 max-h-32">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain max-h-32"
                      />
                    </div>
                  )}

                  {/* Hidden input for re-select */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* ── Validation Error ── */}
            {validationError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-955/15 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">{validationError}</p>
              </div>
            )}

            {/* ── Server Error ── */}
            {serverError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-955/15 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{serverError}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="shrink-0 text-xs font-bold underline cursor-pointer hover:opacity-80"
                >
                  Try again
                </button>
              </div>
            )}

            {/* ── Uploading Progress ── */}
            {isUploading && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400">
                <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                <p className="text-xs font-bold">Uploading to Cloudinary…</p>
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex justify-end gap-2 pt-1">
              {onClose && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isUploading}
                  className="font-bold text-xs cursor-pointer"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                onClick={handleUpload}
                disabled={!canUpload}
                isLoading={isUploading}
                className="font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                {!isUploading && <Upload className="h-3.5 w-3.5" />}
                {isUploading ? "Uploading…" : "Upload Document"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader;

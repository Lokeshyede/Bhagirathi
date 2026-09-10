import React, { useCallback, useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2, X, Loader2 } from "lucide-react";
import { useUploadBankStatement } from "../hooks/useBankStatement";

interface StatementUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (statementId: string) => void;
}

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".pdf"];
const MAX_SIZE_MB = 20;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const StatementUploadDialog: React.FC<StatementUploadDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useUploadBankStatement();

  const validateFile = (file: File): string | null => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ACCEPTED_EXTENSIONS.includes(`.${ext}`)) {
      return `Unsupported file type. Accepted: CSV, XLSX, PDF.`;
    }
    if (file.size === 0) return "The selected file is empty.";
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File size ${formatFileSize(file.size)} exceeds the 20 MB limit.`;
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const err = validateFile(file);
    setLocalError(err);
    setSelectedFile(err ? null : file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLocalError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    // Simulate progress bar since fetch doesn't natively report upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 10, 85));
    }, 200);

    try {
      const result = await uploadMutation.mutateAsync(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        onSuccess?.(result.id);
        handleClose();
      }, 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      const msg = err?.response?.data?.detail || "Upload failed. Please try again.";
      setLocalError(msg);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setLocalError(null);
    setUploadProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  const isLoading = uploadMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isLoading ? handleClose : undefined}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-border dark:border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border dark:border-gray-800">
          <div>
            <h2 className="text-base font-black text-primaryText dark:text-gray-100 tracking-tight">
              Upload Bank Statement
            </h2>
            <p className="text-xs text-muted mt-0.5 font-medium">
              CSV, Excel (.xlsx), or PDF · Max 20 MB
            </p>
          </div>
          {!isLoading && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Drop Zone */}
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`
              flex flex-col items-center justify-center gap-3 w-full min-h-[160px] rounded-xl border-2 border-dashed
              cursor-pointer transition-all duration-200 select-none
              ${dragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : selectedFile
                  ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                  : "border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-950 hover:border-primary/50 hover:bg-primary/3"
              }
            `}
          >
            <input
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(",")}
              className="sr-only"
              onChange={handleInputChange}
              disabled={isLoading}
            />

            {selectedFile ? (
              <>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/40">
                  <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-primaryText dark:text-gray-100 max-w-xs truncate px-4">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted mt-1 font-semibold">
                    {formatFileSize(selectedFile.size)} · {selectedFile.name.split(".").pop()?.toUpperCase()}
                  </p>
                  <p className="text-xs text-primary mt-1.5 font-bold">Click to replace</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                  <Upload className="h-7 w-7 text-muted" />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-bold text-primaryText dark:text-gray-200">
                    Drag & drop or <span className="text-primary">click to browse</span>
                  </p>
                  <p className="text-xs text-muted mt-1 font-medium">
                    Supports CSV, XLSX, PDF — Maximum 20 MB
                  </p>
                </div>
              </>
            )}
          </label>

          {/* Supported Formats */}
          <div className="flex gap-2 justify-center">
            {["CSV", "XLSX", "PDF"].map((fmt) => (
              <span
                key={fmt}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-muted"
              >
                <FileText className="h-3 w-3" />
                {fmt}
              </span>
            ))}
          </div>

          {/* Error Message */}
          {localError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg">
              <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
              <p className="text-xs text-danger font-semibold leading-relaxed">{localError}</p>
            </div>
          )}

          {/* Progress Bar */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted">Uploading statement...</span>
                <span className="text-xs font-black text-primary">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted text-center font-medium">
                Parsing will start in the background after upload completes.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 h-10 rounded-lg border border-border dark:border-gray-700 text-sm font-bold text-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="flex-1 h-10 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Statement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

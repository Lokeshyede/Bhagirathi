import React, { useState, useRef } from "react";
import { Upload, X, ShieldAlert } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  currentImageUrl: string | null;
  onFileSelect: (file: File | null) => void;
  maxSizeMB?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  currentImageUrl,
  onFileSelect,
  maxSizeMB = 2
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setErrorMsg(null);

    if (!file) {
      setPreviewUrl(null);
      onFileSelect(null);
      return;
    }

    // Type validation
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    // Size validation
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMsg(`Image size exceeds the ${maxSizeMB}MB limit.`);
      return;
    }

    // Set preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreviewUrl(null);
    setErrorMsg(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayUrl = previewUrl || (currentImageUrl ? (currentImageUrl.startsWith("http") ? currentImageUrl : `http://localhost:8000${currentImageUrl}`) : null);

  return (
    <div className="space-y-2">
      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        {label}
      </span>

      <div className="flex items-center gap-4">
        {displayUrl ? (
          <div className="relative h-20 w-20 rounded-xl border overflow-hidden bg-gray-50 dark:bg-gray-950 flex items-center justify-center group">
            <img src={displayUrl} alt="Preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-full transition opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-20 w-20 rounded-xl border border-dashed border-gray-300 dark:border-gray-800 hover:border-red-400 bg-gray-50/50 dark:bg-gray-955 flex flex-col items-center justify-center cursor-pointer transition"
          >
            <Upload className="h-5 w-5 text-gray-400" />
            <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Upload</span>
          </div>
        )}

        <div className="space-y-1">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 h-8 border border-gray-250 hover:bg-red-50/40 dark:border-gray-800 dark:hover:bg-gray-900 rounded-lg text-xxs font-bold text-gray-700 dark:text-gray-300 cursor-pointer transition"
          >
            Choose Image File
          </button>
          <p className="text-[10px] text-gray-400">PNG, JPG or WEBP. Max {maxSizeMB}MB.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 p-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-4xs font-bold uppercase tracking-wider border border-red-100 dark:border-red-950/30">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

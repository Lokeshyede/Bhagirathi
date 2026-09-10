import React, { useState } from "react";
import { X, Download, ExternalLink } from "lucide-react";
import { ComplaintImage } from "@bhagirathi/types";

interface PhotoGalleryProps {
  images: ComplaintImage[];
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images }) => {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-950 p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-center text-xs text-gray-400">
        No attachment photographs uploaded.
      </div>
    );
  }

  const getFullUrl = (path: string) => {
    return path.startsWith("http") ? path : `http://localhost:8000${path}`;
  };

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `complaint_photo_${Date.now()}.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {images.map((img) => {
          const url = getFullUrl(img.image_path);
          return (
            <div
              key={img.id}
              onClick={() => setActiveUrl(url)}
              className="relative group aspect-square border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden cursor-pointer bg-gray-50 dark:bg-gray-950/20 flex items-center justify-center"
            >
              <img
                src={url}
                alt="Complaint attachment"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-155"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-150">
                <ExternalLink className="h-4 w-4 text-white" />
              </div>
              <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/60 rounded text-[8px] text-white font-bold tracking-wide uppercase">
                {img.uploaded_by_role}
              </span>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activeUrl && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setActiveUrl(null)} />
          <div className="relative max-w-4xl w-full max-h-[85vh] bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col z-10">
            <div className="flex h-11 items-center justify-between px-4 bg-gray-950 border-b border-gray-850">
              <span className="text-3xs font-semibold text-gray-400">Expanded View</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(activeUrl)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                  title="Download File"
                >
                  <Download className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => setActiveUrl(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-900/50">
              <img
                src={activeUrl}
                alt="Full size attachment"
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default PhotoGallery;

import React, { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download, RotateCcw, ImageOff, FileText } from "lucide-react";

interface ScreenshotViewerProps {
  imageUrl?: string | null;
  title?: string;
}

export const ScreenshotViewer: React.FC<ScreenshotViewerProps> = ({ imageUrl, title = "Payment Proof" }) => {
  const [zoom, setZoom] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!imageUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 border border-dashed border-border dark:border-gray-800 rounded-card text-center min-h-[300px] select-none">
        <ImageOff className="h-10 w-10 text-muted mb-3" />
        <h4 className="font-extrabold text-xs text-primaryText dark:text-white uppercase tracking-wider">No Screenshot Uploaded</h4>
        <p className="text-xxs text-muted max-w-xs leading-normal mt-1">The resident has not submitted an image receipt with this transaction.</p>
      </div>
    );
  }

  const isPdf = imageUrl.toLowerCase().endsWith(".pdf") || imageUrl.includes("/raw/upload/");

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(prev - 0.25, 1);
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `payment_proof_${Date.now()}`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const controls = (
    <div className="flex items-center gap-1 bg-white/95 dark:bg-gray-900/95 border border-border dark:border-gray-800/80 rounded-card p-1.5 shadow-md">
      <button
        onClick={handleZoomIn}
        disabled={isPdf}
        className="p-1.5 text-text-secondary hover:text-primaryText dark:text-gray-400 dark:hover:text-white disabled:opacity-30 cursor-pointer"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        onClick={handleZoomOut}
        disabled={isPdf || zoom === 1}
        className="p-1.5 text-text-secondary hover:text-primaryText dark:text-gray-400 dark:hover:text-white disabled:opacity-30 cursor-pointer"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        onClick={handleReset}
        disabled={isPdf || (zoom === 1 && position.x === 0 && position.y === 0)}
        className="p-1.5 text-text-secondary hover:text-primaryText dark:text-gray-400 dark:hover:text-white disabled:opacity-30 cursor-pointer"
        title="Reset Zoom"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      <div className="h-4 w-px bg-border dark:bg-gray-800 mx-1" />
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="p-1.5 text-text-secondary hover:text-primaryText dark:text-gray-400 dark:hover:text-white cursor-pointer"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
      <button
        onClick={handleDownload}
        className="p-1.5 text-text-secondary hover:text-primaryText dark:text-gray-400 dark:hover:text-white cursor-pointer"
        title="Download File"
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <>
      {/* 1. Standard Inline Viewer */}
      <div className="flex flex-col border border-border dark:border-gray-800/80 rounded-card overflow-hidden bg-white dark:bg-gray-900 shadow-sm relative group">
        {/* Top Header details */}
        <div className="px-4 py-2 border-b border-border dark:border-gray-850 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
          <span className="text-[10px] font-black uppercase text-muted tracking-wider">{title}</span>
          {isPdf && (
            <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
              <FileText className="h-3 w-3" />
              PDF Document
            </span>
          )}
        </div>

        {/* Content Viewer Body */}
        <div
          className="relative flex items-center justify-center bg-gray-100 dark:bg-gray-950 overflow-hidden min-h-[360px] max-h-[500px]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
        >
          {isPdf ? (
            <iframe
              src={imageUrl}
              className="w-full h-[400px] border-none"
              title="PDF Proof Viewer"
            />
          ) : (
            <img
              src={imageUrl}
              alt="Payment proof screenshot"
              draggable={false}
              className="max-h-[380px] object-contain transition-transform duration-100 select-none pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              }}
            />
          )}
        </div>

        {/* Control bar overlay (visible on hover) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
          {controls}
        </div>
      </div>

      {/* 2. Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 select-none transition duration-150">
          {/* Fullscreen Header */}
          <div className="h-16 px-6 flex justify-between items-center border-b border-gray-900 bg-gray-950">
            <span className="text-xs font-bold text-white uppercase tracking-wider">{title}</span>
            <div className="flex items-center gap-4">
              {controls}
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3.5 py-1.5 border border-gray-800 hover:bg-gray-900 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {/* Fullscreen Viewer body */}
          <div
            className="flex-1 relative flex items-center justify-center overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
          >
            {isPdf ? (
              <iframe
                src={imageUrl}
                className="w-full h-full border-none"
                title="PDF Fullscreen Proof Viewer"
              />
            ) : (
              <img
                src={imageUrl}
                alt="Payment proof fullscreen"
                draggable={false}
                className="max-h-[85vh] object-contain transition-transform duration-100 select-none pointer-events-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

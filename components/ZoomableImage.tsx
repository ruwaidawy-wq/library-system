"use client";
import { useState } from "react";
import { X } from "lucide-react";

export default function ZoomableImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [zoomed, setZoomed] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setZoomed(true)} className="shrink-0">
        <img src={src} alt={alt} className={className} />
      </button>
      {zoomed && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setZoomed(false)}>
          <img src={src} alt={alt} className="max-w-full max-h-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          <button onClick={() => setZoomed(false)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg">
            <X size={20} />
          </button>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import ImageWithSkeleton from "./ImageWithSkeleton";

interface FileThumbProps {
  url?: string | null;
  label: string;
  alt: string;
  onOpen: (url: string) => void;
}

/**
 * One uploaded file as a small picture. A file that is missing, empty or not a picture says so, instead of showing a
 * broken-image icon, and offers the raw link so a PDF can still be opened.
 */
export default function FileThumb({ url, label, alt, onOpen }: FileThumbProps) {
  const [failed, setFailed] = useState(false);

  if (!url) {
    return (
      <div className="h-24 rounded border border-dashed border-[#E1E4EA] flex items-center justify-center px-2 text-center text-[11px] text-[#9CA3AF]">
        {label}: not uploaded
      </div>
    );
  }

  if (failed) {
    return (
      <div className="h-24 rounded border border-[#FECACA] bg-[#FEF2F2] flex flex-col items-center justify-center gap-0.5 px-2 text-center">
        <span className="text-[11px] text-[#991B1B]">{label}: the file cannot be shown (it may be empty or not a photo)</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#2563EB] underline py-1.5">
          Open file
        </a>
      </div>
    );
  }

  return (
    <div className="relative">
      <ImageWithSkeleton
        src={url}
        alt={alt}
        className="w-full h-24 object-cover rounded border border-[#E1E4EA] cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onOpen(url)}
        onError={() => setFailed(true)}
      />
      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">{label}</span>
    </div>
  );
}

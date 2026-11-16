"use client";

import { useState } from "react";

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  /** Size, shape and border of the picture; the grey placeholder takes the same box */
  className?: string;
  onClick?: () => void;
  onError?: () => void;
}

/**
 * A picture that shows a grey pulsing box until it has fully arrived. Big phone photos load top to bottom, which looks
 * like a half-drawn, broken picture; the box makes it clear the image is still coming.
 */
export default function ImageWithSkeleton({ src, alt, className = "", onClick, onError }: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className="relative block">
      {!loaded && <span className={`absolute inset-0 animate-pulse bg-[#E9ECF1] ${className}`} aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        decoding="async"
        className={`${className} ${loaded ? "" : "opacity-0"}`}
        onClick={onClick}
        onLoad={() => setLoaded(true)}
        onError={onError}
      />
    </span>
  );
}

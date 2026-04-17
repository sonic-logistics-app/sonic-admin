/**
 * LoadingStates Component
 * Compliant with UI Replication Guide Pattern 10
 */

"use client";

import React from "react";

interface LoadingStatesProps {
  type?: "full-page" | "table" | "card" | "inline" | "button";
  rows?: number;
  className?: string;
}

/**
 * LoadingStates with shimmer animation and proper sizing
 */
export default function LoadingStates({
  type = "inline",
  rows = 5,
  className = "",
}: LoadingStatesProps) {
  switch (type) {
    case "full-page":
      return (
        <div
          className={`flex flex-col items-center justify-center min-h-screen ${className}`}
        >
          <div className="w-12 h-12 border-4 border-[#E1E4EA] border-t-[#2563EB] rounded-full animate-spin" />
          <p className="mt-4 text-[13px] text-[#525866]">Loading...</p>
        </div>
      );

    case "table":
      return (
        <div className={`space-y-0 ${className}`}>
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-16 flex items-center gap-6 px-6 border-b border-[#E1E4EA]"
            >
              <div className="w-12 h-4 bg-gray-200 rounded-md animate-pulse" />
              <div className="w-48 h-4 bg-gray-200 rounded-md animate-pulse" />
              <div className="w-20 h-4 bg-gray-200 rounded-md animate-pulse" />
              <div className="w-24 h-4 bg-gray-200 rounded-md animate-pulse" />
              <div className="w-16 h-4 bg-gray-200 rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      );

    case "card":
      return (
        <div className={`rounded-2xl bg-gray-100 p-6 ${className}`}>
          {/* Header */}
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="w-32 h-4 bg-gray-200 rounded-md animate-pulse" />
              <div className="w-24 h-4 bg-gray-200 rounded-md animate-pulse" />
            </div>
          </div>
          {/* Content */}
          <div className="flex flex-col gap-3">
            <div className="w-full h-3 bg-gray-200 rounded-md animate-pulse" />
            <div className="w-full h-3 bg-gray-200 rounded-md animate-pulse" />
            <div className="w-2/3 h-3 bg-gray-200 rounded-md animate-pulse" />
          </div>
        </div>
      );

    case "button":
      return (
        <div
          className={`flex items-center justify-center gap-2 ${className}`}
        >
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      );

    case "inline":
    default:
      return (
        <div
          className={`flex items-center justify-center p-4 gap-3 ${className}`}
        >
          <div className="w-6 h-6 border-2 border-[#E1E4EA] border-t-[#2563EB] rounded-full animate-spin" />
          <span className="text-[13px] text-[#525866]">Loading...</span>
        </div>
      );
  }
}

/**
 * Text Skeleton Component
 */
export function TextSkeleton({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded-md animate-pulse ${
            i === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Stat Card Skeleton Component
 */
export function StatCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col justify-center gap-3 p-4 rounded-2xl border border-[#E1E4EA] bg-white ${className}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1 flex-1">
          <div className="w-24 h-3 bg-gray-200 rounded-md animate-pulse" />
          <div className="w-16 h-6 bg-gray-200 rounded-md animate-pulse" />
        </div>
        <div className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-full bg-gray-200 animate-pulse" />
      </div>
      <div className="w-20 h-3 bg-gray-200 rounded-md animate-pulse" />
    </div>
  );
}

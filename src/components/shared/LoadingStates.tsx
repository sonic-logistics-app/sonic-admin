/**
 * LoadingStates Component
 * Compliant with design specification
 */

"use client";

import React from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Skeleton } from "primereact/skeleton";

interface LoadingStatesProps {
  type?: "full-page" | "table" | "modal" | "inline" | "button";
  rows?: number;
  className?: string;
}

/**
 * LoadingStates with different types for various UI contexts
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
          className={`loading-full-page flex flex-col items-center justify-center min-h-screen ${className}`}
        >
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          <p className="mt-4 text-600">Loading...</p>
        </div>
      );

    case "table":
      return (
        <div className={`loading-table ${className}`}>
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="flex mb-3 p-3 border-1 border-200 border-round"
            >
              <Skeleton width="3rem" height="3rem" className="mr-3" />
              <div className="flex-1">
                <Skeleton width="60%" height="1.2rem" className="mb-2" />
                <Skeleton width="40%" height="1rem" />
              </div>
              <Skeleton width="4rem" height="2rem" />
            </div>
          ))}
        </div>
      );

    case "modal":
      return (
        <div className={`loading-modal p-4 ${className}`}>
          <div className="text-center">
            <ProgressSpinner style={{ width: "40px", height: "40px" }} />
            <p className="mt-3 text-600">Loading...</p>
          </div>
          <div className="mt-4 space-y-3">
            <Skeleton width="100%" height="2rem" />
            <Skeleton width="100%" height="2rem" />
            <Skeleton width="80%" height="2rem" />
          </div>
        </div>
      );

    case "button":
      return (
        <div
          className={`loading-button flex items-center justify-center ${className}`}
        >
          <ProgressSpinner style={{ width: "20px", height: "20px" }} />
          <span className="ml-2">Loading...</span>
        </div>
      );

    case "inline":
    default:
      return (
        <div
          className={`loading-inline flex items-center justify-center p-4 ${className}`}
        >
          <ProgressSpinner style={{ width: "30px", height: "30px" }} />
          <span className="ml-2 text-600">Loading...</span>
        </div>
      );
  }
}

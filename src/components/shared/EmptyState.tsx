/**
 * EmptyState Component
 * Compliant with UI Replication Guide Pattern 9
 */

"use client";

import React from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  className?: string;
}

/**
 * EmptyState with icon, title, description, and optional action button
 */
export default function EmptyState({
  icon = "pi pi-inbox",
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 min-h-[400px] bg-gray-50 rounded-2xl text-center ${className}`}
    >
      {/* Icon */}
      <div className="w-16 h-16 mb-4 flex items-center justify-center">
        <i className={`${icon} text-[64px] text-[#D0D5DD]`} />
      </div>

      {/* Title */}
      <h3 className="text-[16px] font-semibold text-[#111827] mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-[13px] text-[#525866] max-w-xs mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {/* CTA Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="h-10 px-6 rounded-[50px] bg-[#2563EB] text-white text-[13px] font-semibold hover:bg-[#1D4ED8] transition-colors flex items-center gap-2"
        >
          {action.icon && <i className={action.icon} />}
          {action.label}
        </button>
      )}
    </div>
  );
}

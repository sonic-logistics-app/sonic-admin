/**
 * EmptyState Component
 * Compliant with design specification
 */

"use client";

import React from "react";
import { Button } from "primereact/button";

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
    <div className={`empty-state text-center py-8 px-4 ${className}`}>
      <div className="mb-4">
        <i className={`${icon} text-6xl text-400`} />
      </div>

      <h3 className="text-xl font-semibold text-700 mb-2">{title}</h3>

      {description && (
        <p className="text-600 mb-4 max-w-md mx-auto">{description}</p>
      )}

      {action && (
        <Button
          label={action.label}
          icon={action.icon}
          onClick={action.onClick}
          className="p-button-primary"
        />
      )}
    </div>
  );
}

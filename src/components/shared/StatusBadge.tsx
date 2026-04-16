/**
 * StatusBadge Component
 * Compliant with design specification
 */

"use client";

import React from "react";
import { Badge } from "primereact/badge";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "outline";
  className?: string;
}

/**
 * StatusBadge with color-coded statuses and accessibility
 */
export default function StatusBadge({
  status,
  variant = "default",
  className = "",
}: StatusBadgeProps) {
  // Define status configurations
  const statusConfig = {
    // User statuses
    active: { severity: "success", label: "Active" },
    inactive: { severity: "secondary", label: "Inactive" },
    suspended: { severity: "warning", label: "Suspended" },
    banned: { severity: "danger", label: "Banned" },

    // Order statuses
    pending: { severity: "info", label: "Pending" },
    confirmed: { severity: "info", label: "Confirmed" },
    preparing: { severity: "warning", label: "Preparing" },
    ready: { severity: "success", label: "Ready" },
    picked_up: { severity: "success", label: "Picked Up" },
    delivered: { severity: "success", label: "Delivered" },
    cancelled: { severity: "danger", label: "Cancelled" },

    // Support statuses
    open: { severity: "info", label: "Open" },
    in_progress: { severity: "warning", label: "In Progress" },
    resolved: { severity: "success", label: "Resolved" },
    closed: { severity: "secondary", label: "Closed" },

    // Content statuses
    draft: { severity: "secondary", label: "Draft" },
    sent: { severity: "info", label: "Sent" },
    scheduled: { severity: "warning", label: "Scheduled" },
    flagged: { severity: "danger", label: "Flagged" },

    // Verification statuses
    verified: { severity: "success", label: "Verified" },
    unverified: { severity: "warning", label: "Unverified" },
    pending_verification: { severity: "info", label: "Pending" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    severity: "secondary",
    label: status.charAt(0).toUpperCase() + status.slice(1),
  };

  const baseClasses = "status-badge";
  const variantClasses = variant === "outline" ? "p-badge-outlined" : "";

  return (
    <Badge
      value={config.label}
      severity={config.severity as any}
      className={`${baseClasses} ${variantClasses} ${className}`}
    />
  );
}

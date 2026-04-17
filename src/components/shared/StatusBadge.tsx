/**
 * StatusBadge Component
 * Compliant with UI Replication Guide Pattern 5
 */

"use client";

import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * StatusBadge with pill shape, semantic colors, and status icons
 */
export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  // Handle undefined or null status
  if (!status) {
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-[50px] text-[12px] font-semibold ${className}`}
        style={{
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }}
      >
        <span>−</span>
        <span>Unknown</span>
      </span>
    );
  }

  // Normalize status to lowercase for matching
  const normalizedStatus = status.toLowerCase().replace(/_/g, "");

  // Define status configurations per UI Replication Guide Pattern 5
  const statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
    // User statuses
    active: { 
      bg: "#ECFDF3", 
      text: "#059669", 
      icon: "●", 
      label: "Active" 
    },
    inactive: { 
      bg: "#F3F4F6", 
      text: "#6B7280", 
      icon: "−", 
      label: "Inactive" 
    },
    suspended: { 
      bg: "#FEF3C7", 
      text: "#D97706", 
      icon: "−", 
      label: "Suspended" 
    },
    banned: { 
      bg: "#FEF2F2", 
      text: "#DC2626", 
      icon: "✗", 
      label: "Banned" 
    },

    // Order statuses
    pending: { 
      bg: "#FEF3C7", 
      text: "#D97706", 
      icon: "◐", 
      label: "Pending" 
    },
    inpayment: { 
      bg: "#FEF3C7", 
      text: "#D97706", 
      icon: "◐", 
      label: "In Payment" 
    },
    confirmed: { 
      bg: "#DBEAFE", 
      text: "#2563EB", 
      icon: "✓", 
      label: "Confirmed" 
    },
    accepted: { 
      bg: "#DBEAFE", 
      text: "#2563EB", 
      icon: "✓", 
      label: "Accepted" 
    },
    preparing: { 
      bg: "#FEF3C7", 
      text: "#D97706", 
      icon: "◐", 
      label: "Preparing" 
    },
    ready: { 
      bg: "#DBEAFE", 
      text: "#2563EB", 
      icon: "✓", 
      label: "Ready" 
    },
    pickup: { 
      bg: "#FEF3C7", 
      text: "#D97706", 
      icon: "◐", 
      label: "Pickup" 
    },
    intransit: { 
      bg: "#DBEAFE", 
      text: "#2563EB", 
      icon: "→", 
      label: "In Transit" 
    },
    delivered: { 
      bg: "#ECFDF3", 
      text: "#059669", 
      icon: "✓", 
      label: "Delivered" 
    },
    cancelled: { 
      bg: "#FEF2F2", 
      text: "#DC2626", 
      icon: "✗", 
      label: "Cancelled" 
    },
    drivercancelled: { 
      bg: "#FEF2F2", 
      text: "#DC2626", 
      icon: "✗", 
      label: "Driver Cancelled" 
    },
    rejected: { 
      bg: "#FEF2F2", 
      text: "#DC2626", 
      icon: "✗", 
      label: "Rejected" 
    },
    paid: { 
      bg: "#ECFDF3", 
      text: "#059669", 
      icon: "✓", 
      label: "Paid" 
    },
    unpaid: { 
      bg: "#FEF3C7", 
      text: "#D97706", 
      icon: "◐", 
      label: "Unpaid" 
    },
    refunded: { 
      bg: "#DBEAFE", 
      text: "#2563EB", 
      icon: "↶", 
      label: "Refunded" 
    },

    // Support statuses
    open: { 
      bg: "#DBEAFE", 
      text: "#2563EB", 
      icon: "◐", 
      label: "Open" 
    },
    inprogress: { 
      bg: "#FEF3C7", 
      text: "#D97706", 
      icon: "◐", 
      label: "In Progress" 
    },
    resolved: { 
      bg: "#ECFDF3", 
      text: "#059669", 
      icon: "✓", 
      label: "Resolved" 
    },
    closed: { 
      bg: "#F3F4F6", 
      text: "#6B7280", 
      icon: "−", 
      label: "Closed" 
    },

    // Content statuses
    draft: { 
      bg: "#F3F4F6", 
      text: "#6B7280", 
      icon: "−", 
      label: "Draft" 
    },
    sent: { 
      bg: "#DBEAFE", 
      text: "#2563EB", 
      icon: "✓", 
      label: "Sent" 
    },
    scheduled: { 
      bg: "#DBEAFE", 
      text: "#2563EB", 
      icon: "◐", 
      label: "Scheduled" 
    },

    // Verification statuses
    verified: { 
      bg: "#ECFDF3", 
      text: "#059669", 
      icon: "✓", 
      label: "Verified" 
    },
    unverified: { 
      bg: "#FEF3C7", 
      text: "#D97706", 
      icon: "◐", 
      label: "Unverified" 
    },
    pendingverification: { 
      bg: "#FEF3C7", 
      text: "#D97706", 
      icon: "◐", 
      label: "Pending" 
    },

    // Additional statuses
    approved: { 
      bg: "#ECFDF3", 
      text: "#059669", 
      icon: "✓", 
      label: "Approved" 
    },
  };

  // Get config or use default
  const config = statusConfig[normalizedStatus] || {
    bg: "#F3F4F6",
    text: "#6B7280",
    icon: "−",
    label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " "),
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-[50px] text-[12px] font-semibold ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

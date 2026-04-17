"use client";

import { useState } from "react";

interface SystemHealthData {
  activeDrivers: number;
  activeVendors: number;
  verifiedUsers: number;
  activeUsers30d: number;
}

interface SystemHealthProps {
  system: SystemHealthData;
  loading: boolean;
}

export default function SystemHealth({ system, loading }: SystemHealthProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const metrics = [
    {
      label: "Active Drivers",
      value: system.activeDrivers,
      icon: "pi-users",
      color: "#0891B2",
      bgColor: "#CFFAFE",
    },
    {
      label: "Active Vendors",
      value: system.activeVendors,
      icon: "pi-shop",
      color: "#7C3AED",
      bgColor: "#EDE9FE",
    },
    {
      label: "Verified Users",
      value: system.verifiedUsers,
      icon: "pi-verified",
      color: "#059669",
      bgColor: "#D1FAE5",
    },
    {
      label: "Active (30d)",
      value: system.activeUsers30d,
      icon: "pi-chart-bar",
      color: "#2563EB",
      bgColor: "#DBEAFE",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#E1E4EA] bg-white overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">
            <i className="pi pi-server text-[#525866] text-sm" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#111827]">System Health</h3>
        </div>
        <i
          className={`pi ${
            isExpanded ? "pi-chevron-up" : "pi-chevron-down"
          } text-[#525866] text-sm transition-transform`}
        />
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[#E1E4EA]">
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{ backgroundColor: metric.bgColor + "20" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: metric.bgColor }}
                >
                  <i className={`pi ${metric.icon} text-sm`} style={{ color: metric.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#525866] font-medium">{metric.label}</p>
                  <p className="text-[18px] font-bold text-[#111827]">
                    {loading ? "..." : metric.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

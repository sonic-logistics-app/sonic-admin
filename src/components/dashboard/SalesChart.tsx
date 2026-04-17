"use client";

import { Chart } from "primereact/chart";
import { useMemo } from "react";

interface SalesChartProps {
  data?: any;
  loading?: boolean;
}

export default function SalesChart({ data, loading = false }: SalesChartProps) {
  // Transform data to use dual Y-axis with design system colors
  const chartData = useMemo(() => {
    if (!data) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const datasets = data.datasets?.map((dataset: any) => ({
      ...dataset,
      yAxisID: dataset.label === "Revenue" ? "y-revenue" : "y-orders",
      borderColor: dataset.label === "Revenue" ? "#2563EB" : "#059669",
      backgroundColor: dataset.label === "Revenue" ? "#2563EB" : "#059669",
      tension: 0.4,
      fill: false,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: "#FFFFFF",
      pointBorderWidth: 2,
    }));

    return {
      labels: data.labels || [],
      datasets: datasets || [],
    };
  }, [data]);

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 10,
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        align: "end" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 13,
            family: "system-ui, -apple-system, sans-serif",
            weight: "500",
          },
          color: "#525866",
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#FFFFFF",
        titleColor: "#111827",
        bodyColor: "#525866",
        borderColor: "#E1E4EA",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label === "Revenue") {
                label += "₦" + context.parsed.y.toLocaleString();
              } else {
                label += context.parsed.y.toLocaleString();
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: true,
          color: "#E1E4EA",
        },
        ticks: {
          color: "#525866",
          font: {
            size: 12,
            family: "system-ui, -apple-system, sans-serif",
          },
          padding: 10,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      "y-revenue": {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: {
          color: "#F3F4F6",
          drawBorder: false,
        },
        border: {
          display: false,
        },
        title: {
          display: true,
          text: "Revenue (₦)",
          color: "#525866",
          font: {
            size: 12,
            family: "system-ui, -apple-system, sans-serif",
            weight: "600",
          },
          padding: { bottom: 10 },
        },
        ticks: {
          color: "#525866",
          font: {
            size: 11,
            family: "system-ui, -apple-system, sans-serif",
          },
          padding: 10,
          callback: function (value: any) {
            if (value >= 1000000) {
              return "₦" + (value / 1000000).toFixed(1) + "M";
            } else if (value >= 1000) {
              return "₦" + (value / 1000).toFixed(0) + "K";
            }
            return "₦" + value;
          },
        },
      },
      "y-orders": {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
        border: {
          display: false,
        },
        title: {
          display: true,
          text: "Orders",
          color: "#525866",
          font: {
            size: 12,
            family: "system-ui, -apple-system, sans-serif",
            weight: "600",
          },
          padding: { bottom: 10 },
        },
        ticks: {
          color: "#525866",
          font: {
            size: 11,
            family: "system-ui, -apple-system, sans-serif",
          },
          padding: 10,
          callback: function (value: any) {
            return value.toLocaleString();
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#E1E4EA] bg-white p-6">
        <h2 className="text-[18px] font-semibold text-[#111827] mb-6">Sales Overview</h2>
        <div className="flex items-center justify-center w-full relative" style={{ height: "420px" }}>
          <div className="text-center">
            <i className="pi pi-spinner pi-spin text-[#2563EB] text-3xl mb-2" />
            <p className="text-[13px] text-[#525866]">Loading chart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E1E4EA] bg-white p-6">
        <h2 className="text-[18px] font-semibold text-[#111827] mb-6">Sales Overview</h2>
        <div className="flex items-center justify-center w-full relative" style={{ height: "420px" }}>
          <div className="text-center">
            <i className="pi pi-chart-line text-[#E1E4EA] text-5xl mb-3" />
            <p className="text-[13px] text-[#525866]">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E1E4EA] bg-white p-6">
      <h2 className="text-[18px] font-semibold text-[#111827] mb-6">Sales Overview</h2>
      <div className="w-full relative" style={{ height: "420px" }}>
        <div className="absolute inset-0">
          <Chart type="line" data={chartData} options={chartOptions} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}

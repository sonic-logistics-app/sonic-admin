"use client";

interface SecondaryMetricsData {
  totalRevenue: number;
  revenueGrowth: number;
  avgOrderValue: number;
  completionRate: number;
  deliveredToday: number;
}

interface SecondaryMetricsProps {
  metrics: SecondaryMetricsData;
  loading: boolean;
}

export default function SecondaryMetrics({ metrics, loading }: SecondaryMetricsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₦${(value / 1000).toFixed(0)}K`;
    }
    return `₦${value.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
      {/* Total Revenue */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E1E4EA] bg-white">
        <div className="w-10 h-10 rounded-full bg-[#ECFDF3] flex items-center justify-center flex-shrink-0">
          <i className="pi pi-dollar text-[#059669] text-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-[#525866] uppercase tracking-wide font-medium">
            Revenue
          </p>
          <p className="text-[16px] font-bold text-[#111827] truncate">
            {loading ? "..." : formatCurrency(metrics.totalRevenue)}
          </p>
          <p className="text-[10px] text-[#525866]">
            <span
              className={`font-semibold ${
                metrics.revenueGrowth >= 0 ? "text-[#059669]" : "text-[#DC2626]"
              }`}
            >
              {metrics.revenueGrowth >= 0 && "+"}
              {metrics.revenueGrowth.toFixed(1)}%
            </span>
          </p>
        </div>
      </div>

      {/* Avg Order Value */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E1E4EA] bg-white">
        <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
          <i className="pi pi-chart-line text-[#D97706] text-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-[#525866] uppercase tracking-wide font-medium">
            Avg Order
          </p>
          <p className="text-[16px] font-bold text-[#111827] truncate">
            {loading ? "..." : formatCurrency(metrics.avgOrderValue)}
          </p>
          <p className="text-[10px] text-[#525866]">per order</p>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E1E4EA] bg-white">
        <div className="w-10 h-10 rounded-full bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
          <i className="pi pi-check-circle text-[#2563EB] text-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-[#525866] uppercase tracking-wide font-medium">
            Completion
          </p>
          <p className="text-[16px] font-bold text-[#111827] truncate">
            {loading ? "..." : `${metrics.completionRate.toFixed(1)}%`}
          </p>
          <p className="text-[10px] text-[#525866]">success rate</p>
        </div>
      </div>

      {/* Delivered Today */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E1E4EA] bg-white">
        <div className="w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
          <i className="pi pi-box text-[#7C3AED] text-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-[#525866] uppercase tracking-wide font-medium">
            Today
          </p>
          <p className="text-[16px] font-bold text-[#111827] truncate">
            {loading ? "..." : metrics.deliveredToday}
          </p>
          <p className="text-[10px] text-[#525866]">delivered</p>
        </div>
      </div>
    </div>
  );
}

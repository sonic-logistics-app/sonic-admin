"use client";

interface DashboardStatsData {
  totalOrder: number;
  totalCustomer: number;
  totalDriver: number;
  totalVendor: number;
  orderDifference: number;
  orderGrowthRate: number;
  customerLastWeek: number;
  driverLastWeek: number;
  vendorLastWeek: number;
}

interface DashboardStatsProps {
  stats: DashboardStatsData;
  loading: boolean;
  error: string;
}

export default function DashboardStats({ stats, loading, error }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-3 w-full">
      {/* Total Orders Card */}
      <div className="flex flex-col justify-center gap-3 p-4 rounded-2xl border border-[#E1E4EA] bg-white hover:border-[#2563EB] transition-colors cursor-pointer">
        <div className="flex justify-between items-center gap-2">
          <div className="flex flex-col gap-1 flex-1 overflow-hidden">
            <h3 className="text-[#525866] text-[11px] font-medium uppercase tracking-wider">
              TOTAL ORDERS
            </h3>
            <p className="text-[20px] md:text-[24px] font-bold text-[#111827] truncate">
              {loading ? "..." : error ? "Error" : stats.totalOrder.toLocaleString()}
            </p>
          </div>
          <div className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-full bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
            <i className="pi pi-truck w-5 h-5 text-[#2563EB]" />
          </div>
        </div>
        <p className="text-[#525866] text-[11px]">
          <span
            className={`font-semibold ${
              stats.orderDifference > 0
                ? "text-[#059669]"
                : stats.orderDifference < 0
                ? "text-[#DC2626]"
                : "text-[#525866]"
            }`}
          >
            {stats.orderDifference > 0 && "+"}
            {stats.orderGrowthRate.toFixed(1)}%
          </span>{" "}
          since last week
        </p>
      </div>

      {/* Customers Card */}
      <div className="flex flex-col justify-center gap-3 p-4 rounded-2xl border border-[#E1E4EA] bg-white hover:border-[#2563EB] transition-colors cursor-pointer">
        <div className="flex justify-between items-center gap-2">
          <div className="flex flex-col gap-1 flex-1 overflow-hidden">
            <h3 className="text-[#525866] text-[11px] font-medium uppercase tracking-wider">
              CUSTOMERS
            </h3>
            <p className="text-[20px] md:text-[24px] font-bold text-[#111827] truncate">
              {loading ? "..." : error ? "Error" : stats.totalCustomer.toLocaleString()}
            </p>
          </div>
          <div className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-full bg-[#D1FAE5] flex items-center justify-center flex-shrink-0">
            <i className="pi pi-user w-5 h-5 text-[#059669]" />
          </div>
        </div>
        <p className="text-[#525866] text-[11px]">
          <span className="font-semibold text-[#059669]">
            {stats.customerLastWeek}
          </span>{" "}
          new this week
        </p>
      </div>

      {/* Drivers Card */}
      <div className="flex flex-col justify-center gap-3 p-4 rounded-2xl border border-[#E1E4EA] bg-white hover:border-[#2563EB] transition-colors cursor-pointer">
        <div className="flex justify-between items-center gap-2">
          <div className="flex flex-col gap-1 flex-1 overflow-hidden">
            <h3 className="text-[#525866] text-[11px] font-medium uppercase tracking-wider">
              DRIVERS
            </h3>
            <p className="text-[20px] md:text-[24px] font-bold text-[#111827] truncate">
              {loading ? "..." : error ? "Error" : stats.totalDriver.toLocaleString()}
            </p>
          </div>
          <div className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-full bg-[#CFFAFE] flex items-center justify-center flex-shrink-0">
            <i className="pi pi-users w-5 h-5 text-[#0891B2]" />
          </div>
        </div>
        <p className="text-[#525866] text-[11px]">
          <span className="font-semibold text-[#059669]">
            {stats.driverLastWeek}
          </span>{" "}
          new this week
        </p>
      </div>

      {/* Vendors Card */}
      <div className="flex flex-col justify-center gap-3 p-4 rounded-2xl border border-[#E1E4EA] bg-white hover:border-[#2563EB] transition-colors cursor-pointer">
        <div className="flex justify-between items-center gap-2">
          <div className="flex flex-col gap-1 flex-1 overflow-hidden">
            <h3 className="text-[#525866] text-[11px] font-medium uppercase tracking-wider">
              VENDORS
            </h3>
            <p className="text-[20px] md:text-[24px] font-bold text-[#111827] truncate">
              {loading ? "..." : error ? "Error" : stats.totalVendor.toLocaleString()}
            </p>
          </div>
          <div className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-full bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
            <i className="pi pi-shop w-5 h-5 text-[#7C3AED]" />
          </div>
        </div>
        <p className="text-[#525866] text-[11px]">
          <span className="font-semibold text-[#059669]">
            {stats.vendorLastWeek}
          </span>{" "}
          new this week
        </p>
      </div>
    </div>
  );
}

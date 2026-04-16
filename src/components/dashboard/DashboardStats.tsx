"use client";

interface DashboardStatsData {
  totalOrder: number;
  totalCustomer: number;
  totalDriver: number;
  orderDifference: number;
  orderGrowthRate: number;
  customerLastWeek: number;
  driverLastWeek: number;
}

interface DashboardStatsProps {
  stats: DashboardStatsData;
  loading: boolean;
  error: string;
}

export default function DashboardStats({ stats, loading, error }: DashboardStatsProps) {
  return (
    <>
      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">
                Total Orders All Time
              </span>
              <div className="text-900 font-medium text-xl">
                {loading ? "Loading..." : error ? "Error" : stats.totalOrder}
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-blue-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-truck text-blue-500 text-xl" />
            </div>
          </div>
          <span
            className={`font-medium ${
              stats.orderDifference > 0
                ? "text-green-500"
                : stats.orderDifference < 0
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {stats.orderDifference > 0 && "+"}
            {stats.orderGrowthRate.toFixed(1)}%
          </span>
          <span className="text-500"> since last week</span>
        </div>
      </div>

      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">Customers</span>
              <div className="text-900 font-medium text-xl">
                {loading ? "Loading..." : error ? "Error" : stats.totalCustomer}
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-orange-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-user text-orange-500 text-xl" />
            </div>
          </div>
          <span className="text-green-500 font-medium">
            {stats.customerLastWeek}
          </span>
          <span className="text-500"> newly registered in the last week</span>
        </div>
      </div>

      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">Drivers</span>
              <div className="text-900 font-medium text-xl">
                {loading ? "Loading..." : error ? "Error" : stats.totalDriver}
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-cyan-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-users text-cyan-500 text-xl" />
            </div>
          </div>
          <span className="text-green-500 font-medium">
            {stats.driverLastWeek}
          </span>
          <span className="text-500"> newly registered in the last week</span>
        </div>
      </div>

      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">Vendors</span>
              <div className="text-900 font-medium text-xl">0</div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-purple-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-shop text-purple-500 text-xl" />
            </div>
          </div>
          <span className="text-gray-500 font-medium">Coming soon</span>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Chart } from "primereact/chart";
import { useRouter } from "next/navigation";
import DashboardService from "@/services/DashboardService";

interface OrderStatus {
  status: string;
  total: number;
}

interface DashboardStats {
  totalOrder: number;
  totalCustomer: number;
  totalDriver: number;
  ordersByStatus: OrderStatus[];
  orderLastWeek: number;
  orderThisWeek: number;
  orderDifference: number;
  orderGrowthRate: number;
  customerLastWeek: number;
  driverLastWeek: number;
}

interface RecentOrder {
  id: number;
  order_id: string;
  status: string;
  total_payment: number;
  package_category: string;
  fullname_customer: string;
  fullname_driver: string;
}

const statusConfig: Record<string, any> = {
  PENDING: {
    label: "Pending",
    icon: "pi pi-clock",
    bgColor: "bg-yellow-100",
    borderColor: "border-orange-500",
    textColor: "text-orange-500",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: "pi pi-check",
    bgColor: "bg-green-100",
    borderColor: "border-green-500",
    textColor: "text-green-500",
  },
  IN_TRANSIT: {
    label: "In Transit",
    icon: "pi pi-truck",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-500",
    textColor: "text-blue-500",
  },
  PICKUP: {
    label: "Ready for Pickup",
    icon: "pi pi-box",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-500",
    textColor: "text-purple-500",
  },
  DELIVERED: {
    label: "Delivered",
    icon: "pi pi-check",
    bgColor: "bg-green-100",
    borderColor: "border-green-500",
    textColor: "text-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: "pi pi-times",
    bgColor: "bg-red-100",
    borderColor: "border-red-500",
    textColor: "text-red-500",
  },
  IN_PAYMENT: {
    label: "In Payment",
    icon: "pi pi-credit-card",
    bgColor: "bg-indigo-100",
    borderColor: "border-indigo-500",
    textColor: "text-indigo-500",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalOrder: 0,
    totalCustomer: 0,
    totalDriver: 0,
    ordersByStatus: [],
    orderLastWeek: 0,
    orderThisWeek: 0,
    orderDifference: 0,
    orderGrowthRate: 0,
    customerLastWeek: 0,
    driverLastWeek: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const dashboardService = new DashboardService();

  const lineData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Revenue",
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        backgroundColor: "#2f4860",
        borderColor: "#2f4860",
        tension: 0.4,
      },
      {
        label: "Sales",
        data: [28, 48, 40, 19, 86, 27, 90],
        fill: false,
        backgroundColor: "#00bb7e",
        borderColor: "#00bb7e",
        tension: 0.4,
      },
    ],
  };

  useEffect(() => {
    loadStats();
    loadRecentOrders();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");

      const stats = await dashboardService.getDashboardStats();

      if (!stats || !stats.order || !stats.order.status) {
        throw new Error("Invalid data structure from API");
      }

      const statusOrder = [
        "PENDING",
        "CONFIRMED",
        "IN_TRANSIT",
        "PICKUP",
        "DELIVERED",
        "CANCELLED",
        "IN_PAYMENT",
      ];

      const statusMap: Record<string, number> = {};
      stats.order.status.forEach((item: any) => {
        statusMap[item.order_status] = item.total;
      });

      const orderedStatusTotals = statusOrder.map((status) => ({
        status: status,
        total: statusMap[status] || 0,
      }));

      const orderLastWeek = stats.order?.total_last_week || 0;
      const orderThisWeek = stats.order?.total_this_week || 0;
      const orderDifference = orderThisWeek - orderLastWeek;
      const orderGrowthRate =
        orderLastWeek > 0
          ? (orderDifference / orderLastWeek) * 100
          : orderThisWeek > 0
          ? 100
          : 0;

      setDashboardStats({
        totalOrder: stats.order?.total || 0,
        totalCustomer: stats.user?.total || 0,
        totalDriver: stats.driver?.total || 0,
        ordersByStatus: orderedStatusTotals,
        orderLastWeek,
        orderThisWeek,
        orderDifference,
        orderGrowthRate,
        customerLastWeek: stats.user?.total_this_week || 0,
        driverLastWeek: stats.driver?.total_this_week || 0,
      });
    } catch (err: any) {
      setError("Failed to load dashboard stats");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const orders = await dashboardService.getRecentOrders();
      const formattedOrders = orders.map((order: any) => ({
        id: order.id,
        order_id: order.order_id,
        status: order.order_status,
        total_payment: order.price_fees,
        package_category: order.package?.delivery_type ?? "-",
        fullname_customer: `${order.user?.first_name ?? ""} ${
          order.user?.last_name ?? ""
        }`.trim(),
        fullname_driver: `${order.driver?.first_name ?? ""} ${
          order.driver?.last_name ?? ""
        }`.trim(),
      }));
      setRecentOrders(formattedOrders);
    } catch (err) {
      console.error("Failed to load recent orders:", err);
    }
  };

  const formatCurrency = (value: number) => {
    if (typeof value !== "number") return "";
    const price = value
      .toLocaleString("en-NG", { style: "currency", currency: "NGN" })
      .split("");
    price.splice(1, 0, " ");
    return price.join("");
  };

  const getSeverity = (status: string): "success" | "info" | "warning" | "danger" | undefined => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "CONFIRMED":
        return "info";
      case "IN_TRANSIT":
        return "info";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "danger";
      case "IN_PAYMENT":
        return "info";
      case "PICKUP":
        return "warning";
      default:
        return undefined;
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return "pi pi-exclamation-triangle";
      case "CONFIRMED":
        return "pi pi-info-circle";
      case "IN_TRANSIT":
        return "pi pi-spinner";
      case "DELIVERED":
        return "pi pi-check";
      case "CANCELLED":
        return "pi pi-times";
      case "IN_PAYMENT":
        return "pi pi-credit-card";
      case "PICKUP":
        return "pi pi-box";
      default:
        return "pi pi-info-circle";
    }
  };

  const onRowClick = (event: any) => {
    router.push(`/order/${event.data.id}`);
  };

  return (
    <div className="grid">
      {/* Stats Cards */}
      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">
                Total Orders All Time
              </span>
              <div className="text-900 font-medium text-xl">
                {loading ? "Loading..." : error ? "Error" : dashboardStats.totalOrder}
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
              dashboardStats.orderDifference > 0
                ? "text-green-500"
                : dashboardStats.orderDifference < 0
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {dashboardStats.orderDifference > 0 && "+"}
            {dashboardStats.orderGrowthRate.toFixed(1)}%
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
                {loading ? "Loading..." : error ? "Error" : dashboardStats.totalCustomer}
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
            {dashboardStats.customerLastWeek}
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
                {loading ? "Loading..." : error ? "Error" : dashboardStats.totalDriver}
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
            {dashboardStats.driverLastWeek}
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

      {/* Recent Orders & Order Status */}
      <div className="col-12 xl:col-8">
        <div className="card">
          <h5>Recent Orders</h5>
          <DataTable
            value={recentOrders}
            rows={5}
            paginator
            responsiveLayout="scroll"
            loading={loading}
            rowHover
            dataKey="id"
            onRowClick={onRowClick}
            className="cursor-pointer"
          >
            <Column field="fullname_customer" header="Customer" style={{ width: "25%" }} />
            <Column field="fullname_driver" header="Driver" style={{ width: "25%" }} />
            <Column
              field="total_payment"
              header="Total Payment"
              body={(rowData) => formatCurrency(rowData.total_payment)}
              style={{ width: "20%" }}
            />
            <Column
              field="status"
              header="Status"
              body={(rowData) => (
                <Tag
                  value={rowData.status}
                  severity={getSeverity(rowData.status)}
                  icon={getIcon(rowData.status)}
                />
              )}
              style={{ width: "15%" }}
            />
            <Column
              field="package_category"
              header="Package Category"
              style={{ width: "15%" }}
            />
          </DataTable>
        </div>

        <div className="card">
          <h5>Sales Overview</h5>
          <Chart type="line" data={lineData} />
        </div>
      </div>

      {/* Order Status Sidebar */}
      <div className="col-12 xl:col-4">
        <div className="card">
          <div className="flex justify-content-between align-items-center mb-2">
            <h5>Order Status</h5>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <i className="pi pi-spinner pi-spin text-2xl" />
              <p className="mt-2">Loading order status...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <i className="pi pi-exclamation-triangle text-red-500 text-2xl" />
              <p className="mt-2 text-red-500">{error}</p>
            </div>
          ) : (
            <ul className="list-none p-0 m-0">
              {dashboardStats.ordersByStatus.map((statusItem) => {
                const config = statusConfig[statusItem.status];
                return (
                  <li
                    key={statusItem.status}
                    className={`flex flex-column py-3 px-4 border-left-3 border-round-lg md:flex-row md:align-items-center md:justify-content-between mb-3 ${
                      config?.bgColor || "bg-gray-100"
                    } ${config?.borderColor || "border-gray-500"}`}
                  >
                    <div>
                      <span className="text-700 font-regular mr-2 mb-1 md:mb-0">
                        {config?.label || statusItem.status}
                      </span>
                      <div className="mt-1 text-2xl font-semibold">
                        {statusItem.total}
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0 flex align-items-center">
                      <span
                        className={`ml-3 font-medium ${
                          config?.textColor || "text-gray-500"
                        }`}
                      >
                        <i
                          className={config?.icon || "pi pi-info-circle"}
                          style={{ fontSize: "1.5rem" }}
                        />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

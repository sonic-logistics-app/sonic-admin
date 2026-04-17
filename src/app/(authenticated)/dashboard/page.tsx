"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardService from "@/services/DashboardService";
import DashboardStats from "@/components/dashboard/DashboardStats";
import SecondaryMetrics from "@/components/dashboard/SecondaryMetrics";
import RecentOrders from "@/components/dashboard/RecentOrders";
import SalesChart from "@/components/dashboard/SalesChart";
import OrderStatusSidebar from "@/components/dashboard/OrderStatusSidebar";
import SystemHealth from "@/components/dashboard/SystemHealth";

interface OrderStatus {
  status: string;
  total: number;
}

interface DashboardStatsData {
  totalOrder: number;
  totalCustomer: number;
  totalDriver: number;
  totalVendor: number;
  ordersByStatus: OrderStatus[];
  orderLastWeek: number;
  orderThisWeek: number;
  orderDifference: number;
  orderGrowthRate: number;
  customerLastWeek: number;
  driverLastWeek: number;
  vendorLastWeek: number;
  // New metrics
  totalRevenue: number;
  revenueThisWeek: number;
  revenueLastWeek: number;
  revenueGrowth: number;
  completionRate: number;
  avgOrderValue: number;
  deliveredToday: number;
  activeDrivers: number;
  activeVendors: number;
  verifiedUsers: number;
  activeUsers30d: number;
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

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsData>({
    totalOrder: 0,
    totalCustomer: 0,
    totalDriver: 0,
    totalVendor: 0,
    ordersByStatus: [],
    orderLastWeek: 0,
    orderThisWeek: 0,
    orderDifference: 0,
    orderGrowthRate: 0,
    customerLastWeek: 0,
    driverLastWeek: 0,
    vendorLastWeek: 0,
    totalRevenue: 0,
    revenueThisWeek: 0,
    revenueLastWeek: 0,
    revenueGrowth: 0,
    completionRate: 0,
    avgOrderValue: 0,
    deliveredToday: 0,
    activeDrivers: 0,
    activeVendors: 0,
    verifiedUsers: 0,
    activeUsers30d: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  const dashboardService = new DashboardService();

  useEffect(() => {
    loadStats();
    loadRecentOrders();
    loadChartData();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");

      const stats = await dashboardService.getDashboardStats();

      // Handle missing or invalid data gracefully
      if (!stats) {
        console.warn("No stats data received from API");
        setDashboardStats({
          totalOrder: 0,
          totalCustomer: 0,
          totalDriver: 0,
          totalVendor: 0,
          ordersByStatus: [],
          orderLastWeek: 0,
          orderThisWeek: 0,
          orderDifference: 0,
          orderGrowthRate: 0,
          customerLastWeek: 0,
          driverLastWeek: 0,
          vendorLastWeek: 0,
          totalRevenue: 0,
          revenueThisWeek: 0,
          revenueLastWeek: 0,
          revenueGrowth: 0,
          completionRate: 0,
          avgOrderValue: 0,
          deliveredToday: 0,
          activeDrivers: 0,
          activeVendors: 0,
          verifiedUsers: 0,
          activeUsers30d: 0,
        });
        return;
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

      // Build status map from API data
      const statusMap: Record<string, number> = {};
      if (stats.order?.status && Array.isArray(stats.order.status)) {
        stats.order.status.forEach((item: any) => {
          if (item.order_status && typeof item.total === 'number') {
            statusMap[item.order_status] = item.total;
          }
        });
      }

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
        totalVendor: stats.vendor?.total || 0,
        ordersByStatus: orderedStatusTotals,
        orderLastWeek,
        orderThisWeek,
        orderDifference,
        orderGrowthRate,
        customerLastWeek: stats.user?.total_this_week || 0,
        driverLastWeek: stats.driver?.total_this_week || 0,
        vendorLastWeek: stats.vendor?.total_this_week || 0,
        totalRevenue: stats.revenue?.total || 0,
        revenueThisWeek: stats.revenue?.this_week || 0,
        revenueLastWeek: stats.revenue?.last_week || 0,
        revenueGrowth: stats.revenue?.growth_percentage || 0,
        completionRate: stats.performance?.completion_rate || 0,
        avgOrderValue: stats.performance?.avg_order_value || 0,
        deliveredToday: stats.performance?.delivered_today || 0,
        activeDrivers: stats.system?.active_drivers || 0,
        activeVendors: stats.system?.active_vendors || 0,
        verifiedUsers: stats.system?.verified_users || 0,
        activeUsers30d: stats.system?.active_users_30d || 0,
      });
    } catch (err: any) {
      setError("Failed to load dashboard stats");
      console.error("Dashboard stats error:", err);
      // Set default values on error
      setDashboardStats({
        totalOrder: 0,
        totalCustomer: 0,
        totalDriver: 0,
        totalVendor: 0,
        ordersByStatus: [],
        orderLastWeek: 0,
        orderThisWeek: 0,
        orderDifference: 0,
        orderGrowthRate: 0,
        customerLastWeek: 0,
        driverLastWeek: 0,
        vendorLastWeek: 0,
        totalRevenue: 0,
        revenueThisWeek: 0,
        revenueLastWeek: 0,
        revenueGrowth: 0,
        completionRate: 0,
        avgOrderValue: 0,
        deliveredToday: 0,
        activeDrivers: 0,
        activeVendors: 0,
        verifiedUsers: 0,
        activeUsers30d: 0,
      });
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

  const loadChartData = async () => {
    try {
      const data = await dashboardService.getChartData("6months");
      console.log("📊 Chart Data from Backend:", JSON.stringify(data, null, 2));
      setChartData(data);
    } catch (err) {
      console.error("Failed to load chart data:", err);
    }
  };

  const onRowClick = (event: any) => {
    router.push(`/order/${event.data.id}`);
  };

  return (
    <div className="w-full">
      {/* Primary Stats */}
      <div className="mb-4">
        <DashboardStats stats={dashboardStats} loading={loading} error={error} />
      </div>

      {/* Secondary Metrics */}
      <div className="mb-6">
        <SecondaryMetrics
          metrics={{
            totalRevenue: dashboardStats.totalRevenue,
            revenueGrowth: dashboardStats.revenueGrowth,
            avgOrderValue: dashboardStats.avgOrderValue,
            completionRate: dashboardStats.completionRate,
            deliveredToday: dashboardStats.deliveredToday,
          }}
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 w-full">
        <div className="xl:col-span-2 w-full space-y-4">
          <RecentOrders orders={recentOrders} loading={loading} onRowClick={onRowClick} />
          <SalesChart data={chartData} loading={loading} />
        </div>

        <div className="xl:col-span-1 w-full space-y-4">
          <OrderStatusSidebar
            ordersByStatus={dashboardStats.ordersByStatus}
            loading={loading}
            error={error}
          />
          <SystemHealth
            system={{
              activeDrivers: dashboardStats.activeDrivers,
              activeVendors: dashboardStats.activeVendors,
              verifiedUsers: dashboardStats.verifiedUsers,
              activeUsers30d: dashboardStats.activeUsers30d,
            }}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

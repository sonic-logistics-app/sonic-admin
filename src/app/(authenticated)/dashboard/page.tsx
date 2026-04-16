"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardService from "@/services/DashboardService";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentOrders from "@/components/dashboard/RecentOrders";
import SalesChart from "@/components/dashboard/SalesChart";
import OrderStatusSidebar from "@/components/dashboard/OrderStatusSidebar";

interface OrderStatus {
  status: string;
  total: number;
}

interface DashboardStatsData {
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

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsData>({
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

  const onRowClick = (event: any) => {
    router.push(`/order/${event.data.id}`);
  };

  return (
    <div className="grid">
      <DashboardStats stats={dashboardStats} loading={loading} error={error} />

      <div className="col-12 xl:col-8">
        <RecentOrders orders={recentOrders} loading={loading} onRowClick={onRowClick} />
        <SalesChart />
      </div>

      <OrderStatusSidebar
        ordersByStatus={dashboardStats.ordersByStatus}
        loading={loading}
        error={error}
      />
    </div>
  );
}

/**
 * Dashboard API Service
 * Compliant with design specification
 */

import { apiClient } from "../client";
import {
  DashboardStats,
  ActivityItem,
  ChartData,
  ApiResponse,
} from "../../types/admin";

/**
 * Dashboard service for stats, activity, and charts
 */
export class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get("/dashboard/stats");
    return response.data || response;
  }

  /**
   * Get recent activity feed
   */
  async getActivity(limit = 10): Promise<ActivityItem[]> {
    const response = await apiClient.get(`/dashboard/activity?limit=${limit}`);
    return response.data || response;
  }

  /**
   * Get chart data for trends
   */
  async getCharts(period = "30d"): Promise<ChartData> {
    const response = await apiClient.get(`/dashboard/charts?period=${period}`);
    return response.data || response;
  }

  /**
   * Get combined dashboard data
   */
  async getDashboardData(): Promise<{
    stats: DashboardStats;
    activity: ActivityItem[];
    charts: ChartData;
  }> {
    const [stats, activity, charts] = await Promise.all([
      this.getStats(),
      this.getActivity(),
      this.getCharts(),
    ]);

    return { stats, activity, charts };
  }
}

export default new DashboardService();

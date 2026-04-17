import BaseApiService from './BaseApiService';

export default class DashboardService extends BaseApiService {
  async getDashboardStats() {
    const response = await this.apiCall<any>('/dashboard/stats', {
      method: 'GET',
      headers: this.getAuthHeaders(),
      enableCache: true,
      cacheTTL: 60000 // Cache for 1 minute
    });
    return response.data;
  }

  async getRecentOrders() {
    const response = await this.apiCall<any>('/dashboard/latest-order', {
      method: 'GET',
      headers: this.getAuthHeaders(),
      enableCache: true,
      cacheTTL: 30000 // Cache for 30 seconds
    });
    return response.data || [];
  }

  async getChartData(period: string = '6months') {
    const response = await this.apiCall<any>(`/dashboard/chart-data?period=${period}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      enableCache: true,
      cacheTTL: 300000 // Cache for 5 minutes
    });
    return response.data;
  }

  // Load all dashboard data in parallel
  async getAllDashboardData(period: string = '6months') {
    return this.parallelCalls({
      stats: () => this.getDashboardStats(),
      orders: () => this.getRecentOrders(),
      chartData: () => this.getChartData(period)
    });
  }
}

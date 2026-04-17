import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
const authService = new AuthService();

export default class DashboardService {
  getDashboardStats() {
    return fetch(`${apiUrl}/dashboard/stats`, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { success, message, data: {user, driver, order} }
        return d.data;
      });
  }

  getRecentOrders() {
    return fetch(`${apiUrl}/dashboard/latest-order`, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { success, message, data: [...] }
        return d.data || [];
      });
  }

  getChartData(period: string = '6months') {
    return fetch(`${apiUrl}/dashboard/chart-data?period=${period}`, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { success, message, data: {labels, datasets} }
        return d.data;
      });
  }
}

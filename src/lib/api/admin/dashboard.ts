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
        // Backend returns: { message, stats: {...} }
        return d.stats;
      });
  }

  getRecentOrders() {
    return fetch(`${apiUrl}/dashboard/latest-order`, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { message, orders: [...] }
        return d.orders || [];
      });
  }
}

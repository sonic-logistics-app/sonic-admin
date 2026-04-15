const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost/api/admin';

export default class DashboardService {
  getDashboardStats() {
    return fetch(`${apiUrl}/dashboard/stats`)
      .then(res => res.json())
      .then((d) => {
        return d.data;
      });
  }

  getRecentOrders() {
    return fetch(`${apiUrl}/dashboard/latest-order`)
      .then(res => res.json())
      .then((d) => {
        return d.data;
      });
  }
}

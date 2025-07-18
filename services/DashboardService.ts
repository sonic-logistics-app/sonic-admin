const config = useRuntimeConfig();
const apiUrl = config.public.BACKEND_URL;

export default class DashboardService {
  getDashboardStats() {
    return fetch(`${apiUrl}/admin/dashboard/stats`)
      .then(res => res.json())
      .then((d) => {
        return d.data;
      });
  }

  getRecentOrders() {
    return fetch(`${apiUrl}/admin/dashboard/latest-order`)
      .then(res => res.json())
      .then((d) => {
        return d.data;
      });
  }
}

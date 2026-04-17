import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
const authService = new AuthService();

export interface SeedStatus {
  test_users: number;
  test_drivers: number;
  test_vendors: number;
  test_orders: number;
  test_payments: number;
  has_test_data: boolean;
}

export interface SeedResult {
  users: number;
  drivers: number;
  vendors: number;
  orders: number;
  payments: number;
  delivered_orders: number;
  total_revenue: number;
  vouchers: number;
  faqs: number;
}

export default class SeedService {
  getSeedStatus() {
    return fetch(`${apiUrl}/seed/status`, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        console.log("🔍 RAW SEED STATUS RESPONSE:", JSON.stringify(d, null, 2));
        return d.data;
      });
  }

  runFullSeed() {
    return fetch(`${apiUrl}/seed/full`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({}),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((d) => {
        console.log("🔍 SEED FULL RESPONSE:", JSON.stringify(d, null, 2));
        return d.data;
      });
  }

  cleanupTestData() {
    return fetch(`${apiUrl}/seed/cleanup`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((d) => {
        console.log("🔍 CLEANUP RESPONSE:", JSON.stringify(d, null, 2));
        return d;
      });
  }
}

import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
const authService = new AuthService();

export interface SeedJob {
  status: 'idle' | 'running' | 'done' | 'failed';
  step: string | null;
  startedAt: string | null;
  completedAt: string | null;
  result: Record<string, number> | null;
  error: string | null;
}

export interface SeedStatus {
  test_users: number;
  test_drivers: number;
  test_vendors: number;
  test_orders: number;
  test_payments: number;
  has_test_data: boolean;
  job: SeedJob;
}

export default class SeedService {
  getSeedStatus(): Promise<SeedStatus> {
    return fetch(`${apiUrl}/seed/status`, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then(d => d.data);
  }

  runFullSeed(): Promise<{ status: number; data: { startedAt: string } }> {
    return fetch(`${apiUrl}/seed/full`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({}),
    }).then(async res => {
      const data = await res.json();
      return { status: res.status, data: data.data };
    });
  }

  cleanupTestData() {
    return fetch(`${apiUrl}/seed/cleanup`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      });
  }
}

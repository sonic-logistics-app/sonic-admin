import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
const authService = new AuthService();

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export default class CustomerService {
  getAllCustomers(params?: PaginationParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${apiUrl}/user?${queryString}` : `${apiUrl}/user`;
    
    return fetch(url, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { message, users: [...] }
        return d.users || [];
      });
  }

  verifyCustomer(user_id: number) {
    return fetch(`${apiUrl}/user/verify`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ user_id: user_id.toString() })
    }).then(res => res.json());
  }

  deleteCustomer(user_id: number) {
    return fetch(`${apiUrl}/user`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ user_id: user_id.toString() })
    }).then(res => res.json());
  }

  getCustomersSmall() {
    return fetch('/data/customers-small.json').then(res => res.json()).then(d => d.data);
  }

  getCustomersMedium() {
    return fetch('/data/customers-medium.json').then(res => res.json()).then(d => d.data);
  }

  getCustomersLarge() {
    return fetch('/data/customers-large.json').then(res => res.json()).then(d => d.data);
  }

  getCustomersXLarge() {
    return fetch('/data/customers-xlarge.json').then(res => res.json()).then(d => d.data);
  }

  getCustomers(params: { [x: string]: string | number | boolean }) {
    const queryParams = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`).join('&');
    return fetch(`https://www.primefaces.org/data/customers?${queryParams}`).then(res => res.json());
  }
}

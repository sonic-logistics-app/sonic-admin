import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
const authService = new AuthService();

export interface UserFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  is_verified?: boolean;
  provider?: string;
  otp_verified?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password?: string;
  is_verified?: boolean;
  provider?: string;
  otp_verified?: boolean;
  profile_image?: File;
}

export default class CustomerService {
  getAllCustomers(params?: UserFilterParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.is_verified !== undefined) queryParams.append('is_verified', params.is_verified.toString());
    if (params?.provider) queryParams.append('provider', params.provider);
    if (params?.otp_verified !== undefined) queryParams.append('otp_verified', params.otp_verified.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${apiUrl}/user?${queryString}` : `${apiUrl}/user`;
    
    return fetch(url, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { success, message, data: { users: [...] }, meta: {...} }
        return d.data?.users || [];
      });
  }

  createUser(userData: CreateUserData) {
    const formData = new FormData();
    
    // Required fields
    formData.append('first_name', userData.first_name);
    formData.append('last_name', userData.last_name);
    formData.append('email', userData.email);
    formData.append('phone', userData.phone);
    
    // Optional fields
    if (userData.password) formData.append('password', userData.password);
    if (userData.is_verified !== undefined) formData.append('is_verified', userData.is_verified.toString());
    if (userData.provider) formData.append('provider', userData.provider);
    if (userData.otp_verified !== undefined) formData.append('otp_verified', userData.otp_verified.toString());
    if (userData.profile_image) formData.append('profile_image', userData.profile_image);

    return fetch(`${apiUrl}/user/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
      body: formData,
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((d) => {
        return d;
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

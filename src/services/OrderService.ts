import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
const authService = new AuthService();

export interface OrderFilterParams {
  status?: string;
  order_type?: string;
  payment_status?: string;
  vendor_id?: string;
  driver_id?: number;
  user_id?: number;
  dispatch_status?: string;
  date_from?: string;
  date_to?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export default class OrderService {
  getAllOrders(params?: OrderFilterParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.order_type) queryParams.append('order_type', params.order_type);
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params?.vendor_id) queryParams.append('vendor_id', params.vendor_id);
    if (params?.driver_id) queryParams.append('driver_id', params.driver_id.toString());
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.dispatch_status) queryParams.append('dispatch_status', params.dispatch_status);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params?.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${apiUrl}/order?${queryString}` : `${apiUrl}/order`;
    
    return fetch(url, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { success, message, data: { orders: [...] }, meta: {...} }
        return d.data?.orders || [];
      });
  }

  getOrderById(id: number) {
    return fetch(`${apiUrl}/order/${id}`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(d => {
        // Backend returns: { success, message, data: {...} }
        return d.data || d;
      })
      .catch(error => {
        throw error;
      });
  }
}

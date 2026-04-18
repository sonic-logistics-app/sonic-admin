import AuthService from "../../../services/AuthService";

const apiUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";
const authService = new AuthService();

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  order_type?: string;
  payment_status?: string;
  dispatch_status?: string;
  vendor_id?: string;
  driver_id?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  min_price?: string;
  max_price?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
}

export default class OrderService {
  getAllOrders(params?: PaginationParams): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();

    queryParams.append("page", (params?.page ?? 1).toString());
    queryParams.append("limit", (params?.limit ?? 20).toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.order_type) queryParams.append("order_type", params.order_type);
    if (params?.payment_status) queryParams.append("payment_status", params.payment_status);
    if (params?.dispatch_status) queryParams.append("dispatch_status", params.dispatch_status);
    if (params?.vendor_id) queryParams.append("vendor_id", params.vendor_id);
    if (params?.driver_id) queryParams.append("driver_id", params.driver_id);
    if (params?.user_id) queryParams.append("user_id", params.user_id);
    if (params?.date_from) queryParams.append("date_from", params.date_from);
    if (params?.date_to) queryParams.append("date_to", params.date_to);
    if (params?.min_price) queryParams.append("min_price", params.min_price);
    if (params?.max_price) queryParams.append("max_price", params.max_price);

    return fetch(`${apiUrl}/order?${queryParams.toString()}`, {
      headers: authService.getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => {
        const orders = d.data?.orders || d.orders || [];
        const meta = d.meta || { total: orders.length, page: params?.page ?? 1, limit: params?.limit ?? 20 };
        return { data: orders, meta };
      });
  }

  getOrderDetails(orderId: number) {
    return fetch(`${apiUrl}/order/${orderId}`, {
      headers: authService.getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => {
        // Backend returns: { message, order: {...} }
        return d.order;
      });
  }

  generateOrderCode(orderId: number) {
    // Note: Backend expects order_id (string), not id (number)
    // You may need to pass the order_id string instead
    return fetch(`${apiUrl}/order/${orderId}/generate-code`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
    }).then((res) => res.json());
  }
}

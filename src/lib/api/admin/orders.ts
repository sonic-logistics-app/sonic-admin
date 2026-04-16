import AuthService from "../../../services/AuthService";

const apiUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";
const authService = new AuthService();

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export default class OrderService {
  getAllOrders(params?: PaginationParams) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${apiUrl}/order?${queryString}`
      : `${apiUrl}/order`;

    return fetch(url, {
      headers: authService.getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => {
        // Backend returns: { message, orders: [...] }
        return d.orders || [];
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

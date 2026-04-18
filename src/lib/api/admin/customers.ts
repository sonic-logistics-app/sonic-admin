import AuthService from "../../../services/AuthService";

const apiUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";
const authService = new AuthService();

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  is_verified?: string;
  otp_verified?: string;
  provider?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export default class CustomerService {
  getAllCustomers(params?: PaginationParams): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();

    queryParams.append("page", (params?.page ?? 1).toString());
    queryParams.append("limit", (params?.limit ?? 20).toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.is_verified) queryParams.append("is_verified", params.is_verified);
    if (params?.otp_verified) queryParams.append("otp_verified", params.otp_verified);
    if (params?.provider) queryParams.append("provider", params.provider);
    if (params?.status) queryParams.append("status", params.status);

    const url = `${apiUrl}/user?${queryParams.toString()}`;

    return fetch(url, {
      headers: authService.getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => {
        const users = d.data?.users || d.users || [];
        const meta = d.meta || {
          total: users.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        };
        return { data: users, meta };
      });
  }

  verifyCustomer(user_id: number) {
    return fetch(`${apiUrl}/user/verify`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ user_id: user_id.toString() }),
    }).then((res) => res.json());
  }

  deleteCustomer(user_id: number) {
    return fetch(`${apiUrl}/user`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ user_id: user_id.toString() }),
    }).then((res) => res.json());
  }

  getCustomersSmall() {
    return fetch("/data/customers-small.json")
      .then((res) => res.json())
      .then((d) => d.data);
  }

  getCustomersMedium() {
    return fetch("/data/customers-medium.json")
      .then((res) => res.json())
      .then((d) => d.data);
  }

  getCustomersLarge() {
    return fetch("/data/customers-large.json")
      .then((res) => res.json())
      .then((d) => d.data);
  }

  getCustomersXLarge() {
    return fetch("/data/customers-xlarge.json")
      .then((res) => res.json())
      .then((d) => d.data);
  }

  getCustomers(params: { [x: string]: string | number | boolean }) {
    const queryParams = Object.keys(params)
      .map(
        (k) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`,
      )
      .join("&");
    return fetch(
      `https://www.primefaces.org/data/customers?${queryParams}`,
    ).then((res) => res.json());
  }
}

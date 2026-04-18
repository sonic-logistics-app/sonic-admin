import AuthService from "../../../services/AuthService";

const apiUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";
const authService = new AuthService();

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  min_amount?: string;
  max_amount?: string;
  expiry_type?: string;
  has_code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
}

export interface Voucher {
  id: string;
  name: string;
  amount: number;
  code: string;
  expiry_type: string;
  used?: number;
  created_at: string;
  updated_at?: string;
}

export interface VoucherFormData {
  name: string;
  amount: number;
  code: string;
  expiry_type: string;
}

export default class VoucherService {
  // Get all vouchers
  getAllVouchers(params?: PaginationParams): Promise<PaginatedResponse<Voucher>> {
    const queryParams = new URLSearchParams();

    queryParams.append("page", (params?.page ?? 1).toString());
    queryParams.append("limit", (params?.limit ?? 20).toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.min_amount) queryParams.append("min_amount", params.min_amount);
    if (params?.max_amount) queryParams.append("max_amount", params.max_amount);
    if (params?.expiry_type) queryParams.append("expiry_type", params.expiry_type);
    if (params?.has_code) queryParams.append("has_code", params.has_code);

    return fetch(`${apiUrl}/voucher?${queryParams.toString()}`, {
      headers: authService.getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => {
        const vouchers = d.data?.vouchers || d.vouchers || [];
        const meta = d.meta || { total: vouchers.length, page: params?.page ?? 1, limit: params?.limit ?? 20 };
        return { data: vouchers, meta };
      });
  }

  // Get voucher by ID
  getVoucherById(voucherId: number | string) {
    return fetch(`${apiUrl}/voucher/${voucherId}`, {
      headers: authService.getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => {
        // Backend returns: { message, voucher: {...} }
        return d.voucher;
      });
  }

  // Create new voucher
  createVoucher(voucherData: VoucherFormData) {
    return fetch(`${apiUrl}/voucher`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(voucherData),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  }

  // Update voucher
  updateVoucher(
    voucherId: number | string,
    voucherData: Partial<VoucherFormData>,
  ) {
    return fetch(`${apiUrl}/voucher/${voucherId}`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(voucherData),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  }

  // Delete voucher
  deleteVoucher(voucherId: number | string) {
    return fetch(`${apiUrl}/voucher`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ voucher_id: voucherId.toString() }),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
  }
}

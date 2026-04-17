import AuthService from "./AuthService";

const apiUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";
const authService = new AuthService();

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface Voucher {
  id: string;
  name: string;
  amount: number;
  code: string;
  expiry_type: string;
  created_at: string;
  updated_at: string;
  used: number;
}

export interface VoucherFormData {
  code: string;
  name: string;
  amount: number;
  expiry_type: string;
}

export default class VoucherService {
  // Get all vouchers
  getAllVouchers(params?: PaginationParams) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${apiUrl}/voucher?${queryString}`
      : `${apiUrl}/voucher`;

    return fetch(url, {
      headers: authService.getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => {
        console.log("🔍 RAW VOUCHER LIST RESPONSE:", JSON.stringify(d, null, 2));
        console.log("🔍 Number of vouchers:", d.data?.vouchers?.length || 0);
        if (d.data?.vouchers && d.data.vouchers.length > 0) {
          console.log("🔍 First voucher sample:", JSON.stringify(d.data.vouchers[0], null, 2));
          console.log("🔍 Voucher keys:", Object.keys(d.data.vouchers[0]));
        }
        // Backend returns: { success, message, data: { vouchers: [...] }, meta: {...} }
        return d.data?.vouchers || [];
      });
  }

  // Get voucher by ID
  getVoucherById(voucherId: number | string) {
    return fetch(`${apiUrl}/voucher/${voucherId}`, {
      headers: authService.getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => {
        console.log("🔍 RAW VOUCHER DETAIL RESPONSE:", JSON.stringify(d, null, 2));
        if (d.data) {
          console.log("🔍 Voucher keys:", Object.keys(d.data));
        }
        // Backend returns: { success, message, data: {...} }
        return d.data;
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

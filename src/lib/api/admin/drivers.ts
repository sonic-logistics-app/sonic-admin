import AuthService from "../../../services/AuthService";

const apiUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";
const authService = new AuthService();

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  kyc_status?: string;
  is_verified?: string;
  is_rejected?: string;
  provider?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
}

export default class DriverService {
  getAllDrivers(params?: PaginationParams): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();

    queryParams.append("page", (params?.page ?? 1).toString());
    queryParams.append("limit", (params?.limit ?? 20).toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.kyc_status) queryParams.append("kyc_status", params.kyc_status);
    if (params?.is_verified) queryParams.append("is_verified", params.is_verified);
    if (params?.is_rejected) queryParams.append("is_rejected", params.is_rejected);
    if (params?.provider) queryParams.append("provider", params.provider);

    return fetch(`${apiUrl}/driver?${queryParams.toString()}`, {
      headers: authService.getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((d) => {
        const drivers = d.data?.drivers || d.drivers || [];
        const meta = d.meta || { total: drivers.length, page: params?.page ?? 1, limit: params?.limit ?? 20 };
        return { data: drivers, meta };
      });
  }

  getDriverById(id: string) {
    return fetch(`${apiUrl}/driver/${id}`, {
      method: "GET",
      headers: authService.getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((d) => {
        // Backend returns: { message, driver: {...} }
        return d.driver || d;
      })
      .catch((error) => {
        console.error("Error fetching driver:", error);
        throw error;
      });
  }

  verifyDriver(driverId: number, verificationData: any) {
    const requestBody = {
      driver_id: driverId.toString(),
      ...verificationData,
    };

    return fetch(`${apiUrl}/driver/verify`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .catch((error) => {
        console.error("Error verifying driver:", error);
        throw error;
      });
  }

  rejectDriver(driverId: number, rejectionData: any) {
    const requestBody = {
      driver_id: driverId.toString(),
      ...rejectionData,
    };

    return fetch(`${apiUrl}/driver/reject`, {
      method: "PUT",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .catch((error) => {
        console.error("Error rejecting driver:", error);
        throw error;
      });
  }

  deleteDriver(driverId: number) {
    const requestBody = {
      driver_id: driverId.toString(),
    };

    return fetch(`${apiUrl}/driver`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .catch((error) => {
        console.error("Error deleting driver:", error);
        throw error;
      });
  }
}

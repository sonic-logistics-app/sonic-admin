import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
const authService = new AuthService();

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export default class DriverService {
  getAllDrivers(params?: PaginationParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${apiUrl}/driver?${queryString}` : `${apiUrl}/driver`;
    
    return fetch(url, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { message, drivers: [...] }
        return d.drivers || [];
      });
  }

  getDriverById(id: string) {
    return fetch(`${apiUrl}/driver/${id}`, {
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
        // Backend returns: { message, driver: {...} }
        return d.driver || d;
      })
      .catch(error => {
        console.error('Error fetching driver:', error);
        throw error;
      });
  }

  verifyDriver(driverId: number, verificationData: any) {
    const requestBody = {
      driver_id: driverId.toString(),
      ...verificationData
    };

    return fetch(`${apiUrl}/driver/verify`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(requestBody)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .catch(error => {
        console.error('Error verifying driver:', error);
        throw error;
      });
  }

  rejectDriver(driverId: number, rejectionData: any) {
    const requestBody = {
      driver_id: driverId.toString(),
      ...rejectionData
    };

    return fetch(`${apiUrl}/driver/reject`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(requestBody)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .catch(error => {
        console.error('Error rejecting driver:', error);
        throw error;
      });
  }

  deleteDriver(driverId: number) {
    const requestBody = {
      driver_id: driverId.toString()
    };

    return fetch(`${apiUrl}/driver`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(requestBody)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .catch(error => {
        console.error('Error deleting driver:', error);
        throw error;
      });
  }
}

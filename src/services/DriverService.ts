import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
const authService = new AuthService();

export interface DriverFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  kyc_status?: string;
  is_verified?: boolean;
  is_rejected?: boolean;
  provider?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateDriverData {
  // Required fields
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  
  // Optional basic info
  password?: string;
  is_verified?: boolean;
  status?: string;
  kyc_status?: string;
  
  // Document fields
  national_id_number?: string;
  bank_verification?: string;
  
  // Vehicle info
  vehicle_type?: string;
  brand_name?: string;
  model_name?: string;
  model_year?: string;
  model_color?: string;
  model_plate_number?: string;
  model_seat_capacity?: string;
  nin_name?: string;
  bvn_number?: string;
  
  // Bank account
  account_holder_name?: string;
  bank_name?: string;
  bank_code?: string;
  account_type?: string;
  account_number?: string;
  
  // File uploads
  profile_image?: File;
  national_id_image?: File;
  driver_license_image?: File;
  vehicle_image?: File;
  vehicle_certificate?: File;
  selfie_image?: File;
}

export default class DriverService {
  createDriver(driverData: CreateDriverData) {
    const formData = new FormData();
    
    // Required fields
    formData.append('first_name', driverData.first_name);
    formData.append('last_name', driverData.last_name);
    formData.append('email', driverData.email);
    formData.append('phone', driverData.phone);
    
    // Optional basic info
    if (driverData.password) formData.append('password', driverData.password);
    if (driverData.is_verified !== undefined) formData.append('is_verified', driverData.is_verified.toString());
    if (driverData.status) formData.append('status', driverData.status);
    if (driverData.kyc_status) formData.append('kyc_status', driverData.kyc_status);
    
    // Document fields
    if (driverData.national_id_number) formData.append('national_id_number', driverData.national_id_number);
    if (driverData.bank_verification) formData.append('bank_verification', driverData.bank_verification);
    
    // Vehicle info
    if (driverData.vehicle_type) formData.append('vehicle_type', driverData.vehicle_type);
    if (driverData.brand_name) formData.append('brand_name', driverData.brand_name);
    if (driverData.model_name) formData.append('model_name', driverData.model_name);
    if (driverData.model_year) formData.append('model_year', driverData.model_year);
    if (driverData.model_color) formData.append('model_color', driverData.model_color);
    if (driverData.model_plate_number) formData.append('model_plate_number', driverData.model_plate_number);
    if (driverData.model_seat_capacity) formData.append('model_seat_capacity', driverData.model_seat_capacity);
    if (driverData.nin_name) formData.append('nin_name', driverData.nin_name);
    if (driverData.bvn_number) formData.append('bvn_number', driverData.bvn_number);
    
    // Bank account
    if (driverData.account_holder_name) formData.append('account_holder_name', driverData.account_holder_name);
    if (driverData.bank_name) formData.append('bank_name', driverData.bank_name);
    if (driverData.bank_code) formData.append('bank_code', driverData.bank_code);
    if (driverData.account_type) formData.append('account_type', driverData.account_type);
    if (driverData.account_number) formData.append('account_number', driverData.account_number);
    
    // File uploads
    if (driverData.profile_image) formData.append('profile_image', driverData.profile_image);
    if (driverData.national_id_image) formData.append('national_id_image', driverData.national_id_image);
    if (driverData.driver_license_image) formData.append('driver_license_image', driverData.driver_license_image);
    if (driverData.vehicle_image) formData.append('vehicle_image', driverData.vehicle_image);
    if (driverData.vehicle_certificate) formData.append('vehicle_certificate', driverData.vehicle_certificate);
    if (driverData.selfie_image) formData.append('selfie_image', driverData.selfie_image);

    return fetch(`${apiUrl}/driver/create`, {
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

  getAllDrivers(params?: DriverFilterParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.kyc_status) queryParams.append('kyc_status', params.kyc_status);
    if (params?.is_verified !== undefined) queryParams.append('is_verified', params.is_verified.toString());
    if (params?.is_rejected !== undefined) queryParams.append('is_rejected', params.is_rejected.toString());
    if (params?.provider) queryParams.append('provider', params.provider);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${apiUrl}/driver?${queryString}` : `${apiUrl}/driver`;
    
    return fetch(url, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { success, message, data: { drivers: [...] }, meta: {...} }
        return d.data?.drivers || [];
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
        // Backend returns: { success, message, driver: {...} }
        return d.driver || d;
      })
      .catch(error => {
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
        throw error;
      });
  }
}

import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
const authService = new AuthService();

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  business_type: string;
  description?: string;
  commission_rate?: number;
  minimum_order?: number;
  latitude?: number;
  longitude?: number;
  status: string;
  kyc_status: string;
  is_accepting_orders: boolean;
  is_open: boolean;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VendorFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  business_type: string;
  description?: string;
  business_registration_number?: string;
  tax_identification_number?: string;
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  bank_code?: string;
  commission_rate?: number;
  minimum_order?: number;
  latitude?: number;
  longitude?: number;
  status?: string;
  kyc_status?: string;
  is_accepting_orders?: boolean;
  is_open?: boolean;
  onboarding_completed?: boolean;
  timezone?: string;
}

export default class VendorService {
  // Get all vendors
  getAllVendors(params?: PaginationParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${apiUrl}/vendor?${queryString}` : `${apiUrl}/vendor`;
    
    return fetch(url, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { message, vendors: [...] }
        return d.vendors || [];
      });
  }

  // Get vendor by ID
  getVendorById(id: string | number) {
    return fetch(`${apiUrl}/vendor/${id}`, {
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
        // Backend returns: { message, vendor: {...} }
        return d.vendor;
      })
      .catch(error => {
        console.error('Error fetching vendor:', error);
        throw error;
      });
  }

  // Create new vendor
  createVendor(vendorData: VendorFormData) {
    return fetch(`${apiUrl}/vendor`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(vendorData)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .catch(error => {
        console.error('Error creating vendor:', error);
        throw error;
      });
  }

  // Update vendor
  updateVendor(vendorId: number | string, vendorData: Partial<VendorFormData>) {
    return fetch(`${apiUrl}/vendor/${vendorId}`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(vendorData)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .catch(error => {
        console.error('Error updating vendor:', error);
        throw error;
      });
  }

  // Approve vendor
  approveVendor(vendorId: number | string, approvalData?: any) {
    return fetch(`${apiUrl}/vendor/${vendorId}/approve`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(approvalData || {})
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .catch(error => {
        console.error('Error approving vendor:', error);
        throw error;
      });
  }

  // Reject vendor
  rejectVendor(vendorId: number | string, rejectionData: { reason: string }) {
    const requestBody = {
      vendor_id: vendorId.toString(),
      ...rejectionData
    };

    return fetch(`${apiUrl}/vendor/reject`, {
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
        console.error('Error rejecting vendor:', error);
        throw error;
      });
  }

  // Suspend vendor
  suspendVendor(vendorId: number | string, suspensionData: { reason: string }) {
    const requestBody = {
      vendor_id: vendorId.toString(),
      ...suspensionData
    };

    return fetch(`${apiUrl}/vendor/suspend`, {
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
        console.error('Error suspending vendor:', error);
        throw error;
      });
  }

  // Activate vendor
  activateVendor(vendorId: number | string) {
    const requestBody = {
      vendor_id: vendorId.toString()
    };

    return fetch(`${apiUrl}/vendor/activate`, {
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
        console.error('Error activating vendor:', error);
        throw error;
      });
  }

  // Delete vendor (soft delete)
  deleteVendor(vendorId: number | string) {
    return fetch(`${apiUrl}/vendor/${vendorId}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .catch(error => {
        console.error('Error deleting vendor:', error);
        throw error;
      });
  }
}

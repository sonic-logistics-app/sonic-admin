import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
const authService = new AuthService();

export interface VendorFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  kyc_status?: string;
  is_accepting_orders?: boolean;
  is_open?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateVendorData {
  // Required fields
  name: string;
  email: string;
  phone: string;
  address: string;
  business_type: string;
  
  // Optional vendor info
  description?: string;
  status?: string;
  kyc_status?: string;
  latitude?: string;
  longitude?: string;
  minimum_order?: string;
  commission_rate?: string;
  is_accepting_orders?: boolean;
  is_open?: boolean;
  onboarding_completed?: boolean;
  
  // Business details
  business_registration_number?: string;
  tax_identification_number?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  bank_code?: string;
  
  // Owner account
  owner_first_name?: string;
  owner_last_name?: string;
  owner_email?: string;
  owner_password?: string;
  owner_role?: string;
  
  // Menu categories (JSON string)
  menu_categories?: string;
  
  // File uploads
  logo_image?: File;
  cover_image?: File;
  business_registration_doc?: File;
  tax_id_doc?: File;
  owner_id_doc?: File;
  bank_verification_doc?: File;
  owner_profile_image?: File;
}

export default class VendorService {
  getAllVendors(params?: VendorFilterParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.kyc_status) queryParams.append('kyc_status', params.kyc_status);
    if (params?.is_accepting_orders !== undefined) queryParams.append('is_accepting_orders', params.is_accepting_orders.toString());
    if (params?.is_open !== undefined) queryParams.append('is_open', params.is_open.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${apiUrl}/vendor?${queryString}` : `${apiUrl}/vendor`;
    
    return fetch(url, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { success, message, data: { vendors: [...] }, meta: {...} }
        return d.data?.vendors || [];
      });
  }

  getVendorById(id: string) {
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
        // Backend returns: { success, message, data: {...} }
        console.log("🔍 RAW VENDOR DETAIL RESPONSE:", JSON.stringify(d, null, 2));
        return d.data || d;
      })
      .catch(error => {
        console.error('Error fetching vendor:', error);
        throw error;
      });
  }

  approveVendor(vendorId: string) {
    return fetch(`${apiUrl}/vendor/${vendorId}/approve`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
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

  rejectVendor(vendorId: string, reason?: string) {
    const requestBody = reason ? { reason } : {};

    return fetch(`${apiUrl}/vendor/${vendorId}/reject`, {
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

  suspendVendor(vendorId: string, reason?: string) {
    const requestBody = reason ? { reason } : {};

    return fetch(`${apiUrl}/vendor/${vendorId}/suspend`, {
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

  activateVendor(vendorId: string) {
    return fetch(`${apiUrl}/vendor/${vendorId}/activate`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({})
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

  deleteVendor(vendorId: string) {
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

  createVendor(vendorData: CreateVendorData) {
    const formData = new FormData();
    
    // Required fields
    formData.append('name', vendorData.name);
    formData.append('email', vendorData.email);
    formData.append('phone', vendorData.phone);
    formData.append('address', vendorData.address);
    formData.append('business_type', vendorData.business_type);
    
    // Optional vendor info
    if (vendorData.description) formData.append('description', vendorData.description);
    if (vendorData.status) formData.append('status', vendorData.status);
    if (vendorData.kyc_status) formData.append('kyc_status', vendorData.kyc_status);
    if (vendorData.latitude) formData.append('latitude', vendorData.latitude);
    if (vendorData.longitude) formData.append('longitude', vendorData.longitude);
    if (vendorData.minimum_order) formData.append('minimum_order', vendorData.minimum_order);
    if (vendorData.commission_rate) formData.append('commission_rate', vendorData.commission_rate);
    if (vendorData.is_accepting_orders !== undefined) formData.append('is_accepting_orders', vendorData.is_accepting_orders.toString());
    if (vendorData.is_open !== undefined) formData.append('is_open', vendorData.is_open.toString());
    if (vendorData.onboarding_completed !== undefined) formData.append('onboarding_completed', vendorData.onboarding_completed.toString());
    
    // Business details
    if (vendorData.business_registration_number) formData.append('business_registration_number', vendorData.business_registration_number);
    if (vendorData.tax_identification_number) formData.append('tax_identification_number', vendorData.tax_identification_number);
    if (vendorData.bank_name) formData.append('bank_name', vendorData.bank_name);
    if (vendorData.account_name) formData.append('account_name', vendorData.account_name);
    if (vendorData.account_number) formData.append('account_number', vendorData.account_number);
    if (vendorData.bank_code) formData.append('bank_code', vendorData.bank_code);
    
    // Owner account
    if (vendorData.owner_first_name) formData.append('owner_first_name', vendorData.owner_first_name);
    if (vendorData.owner_last_name) formData.append('owner_last_name', vendorData.owner_last_name);
    if (vendorData.owner_email) formData.append('owner_email', vendorData.owner_email);
    if (vendorData.owner_password) formData.append('owner_password', vendorData.owner_password);
    if (vendorData.owner_role) formData.append('owner_role', vendorData.owner_role);
    
    // Menu categories
    if (vendorData.menu_categories) formData.append('menu_categories', vendorData.menu_categories);
    
    // File uploads
    if (vendorData.logo_image) formData.append('logo_image', vendorData.logo_image);
    if (vendorData.cover_image) formData.append('cover_image', vendorData.cover_image);
    if (vendorData.business_registration_doc) formData.append('business_registration_doc', vendorData.business_registration_doc);
    if (vendorData.tax_id_doc) formData.append('tax_id_doc', vendorData.tax_id_doc);
    if (vendorData.owner_id_doc) formData.append('owner_id_doc', vendorData.owner_id_doc);
    if (vendorData.bank_verification_doc) formData.append('bank_verification_doc', vendorData.bank_verification_doc);
    if (vendorData.owner_profile_image) formData.append('owner_profile_image', vendorData.owner_profile_image);

    return fetch(`${apiUrl}/vendor/create`, {
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
        console.log("🔍 CREATE VENDOR RESPONSE:", JSON.stringify(d, null, 2));
        return d;
      });
  }
}

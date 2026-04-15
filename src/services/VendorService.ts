const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost/api/admin';

export interface Vendor {
  id: number;
  business_name: string;
  category: string;
  contact_name: string;
  phone_number: string;
  email: string;
  business_address: string;
  store_logo?: string;
  cover_image?: string;
  opening_hours?: string;
  closing_hours?: string;
  delivery_radius?: number;
  bank_details?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'DELETED';
  created_at?: string;
  updated_at?: string;
  orders_count?: number;
  rating?: number;
}

export interface VendorFormData {
  business_name: string;
  category: string;
  contact_name: string;
  phone_number: string;
  email: string;
  password?: string;
  business_address: string;
  store_logo?: string;
  cover_image?: string;
  opening_hours?: string;
  closing_hours?: string;
  delivery_radius?: number;
  bank_details?: string;
}

export default class VendorService {
  // Get all vendors
  getAllVendors() {
    return fetch(`${apiUrl}/vendor`)
      .then(res => res.json())
      .then((d) => {
        console.log('Vendors:', d.vendors);
        return d.vendors;
      });
  }

  // Get vendor by ID
  getVendorById(id: string | number) {
    return fetch(`${apiUrl}/vendor/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(d => {
        console.log('Vendor details:', d);
        return d.data;
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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vendorData)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Vendor created:', data);
        return data;
      })
      .catch(error => {
        console.error('Error creating vendor:', error);
        throw error;
      });
  }

  // Update vendor
  updateVendor(vendorId: number, vendorData: Partial<VendorFormData>) {
    return fetch(`${apiUrl}/vendor/${vendorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vendorData)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Vendor updated:', data);
        return data;
      })
      .catch(error => {
        console.error('Error updating vendor:', error);
        throw error;
      });
  }

  // Approve vendor
  approveVendor(vendorId: number, approvalData?: any) {
    const requestBody = {
      vendor_id: parseInt(String(vendorId)),
      ...approvalData
    };

    return fetch(`${apiUrl}/vendor/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Vendor approved:', data);
        return data;
      })
      .catch(error => {
        console.error('Error approving vendor:', error);
        throw error;
      });
  }

  // Reject vendor
  rejectVendor(vendorId: number, rejectionData: { reason: string }) {
    const requestBody = {
      vendor_id: parseInt(String(vendorId)),
      ...rejectionData
    };

    return fetch(`${apiUrl}/vendor/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Vendor rejected:', data);
        return data;
      })
      .catch(error => {
        console.error('Error rejecting vendor:', error);
        throw error;
      });
  }

  // Suspend vendor
  suspendVendor(vendorId: number, suspensionData: { reason: string }) {
    const requestBody = {
      vendor_id: parseInt(String(vendorId)),
      ...suspensionData
    };

    return fetch(`${apiUrl}/vendor/suspend`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Vendor suspended:', data);
        return data;
      })
      .catch(error => {
        console.error('Error suspending vendor:', error);
        throw error;
      });
  }

  // Activate vendor
  activateVendor(vendorId: number) {
    const requestBody = {
      vendor_id: parseInt(String(vendorId))
    };

    return fetch(`${apiUrl}/vendor/activate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Vendor activated:', data);
        return data;
      })
      .catch(error => {
        console.error('Error activating vendor:', error);
        throw error;
      });
  }

  // Delete vendor (soft delete)
  deleteVendor(vendorId: number) {
    const requestBody = {
      vendor_id: parseInt(String(vendorId))
    };

    return fetch(`${apiUrl}/vendor`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Vendor deleted:', data);
        return data;
      })
      .catch(error => {
        console.error('Error deleting vendor:', error);
        throw error;
      });
  }
}

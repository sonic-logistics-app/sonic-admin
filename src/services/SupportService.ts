import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
const authService = new AuthService();

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  city: string;
  businessHours: string;
  saturdayHours: string;
  sundayHours: string;
}

export default class SupportService {
  // Get contact info
  getContactInfo() {
    return fetch(`${apiUrl}/support/contact-info`, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        // Backend returns: { message, contactInfo: {...} }
        return d.contactInfo;
      });
  }

  // Update contact info
  updateContactInfo(contactData: ContactInfo) {
    return fetch(`${apiUrl}/support/contact-info`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(contactData)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      });
  }
}

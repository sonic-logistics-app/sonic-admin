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
  getContactInfo() {
    return fetch(`${apiUrl}/support/contact-info`, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        console.log("🔍 RAW CONTACT INFO RESPONSE:", JSON.stringify(d, null, 2));
        if (d.data) {
          console.log("🔍 Contact info keys:", Object.keys(d.data));
        }
        return d.data;
      });
  }

  updateContactInfo(contactData: Partial<ContactInfo>) {
    return fetch(`${apiUrl}/support/contact-info`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(contactData),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((d) => {
        console.log("🔍 UPDATE CONTACT INFO RESPONSE:", JSON.stringify(d, null, 2));
        return d.data;
      });
  }
}

import AuthService from './AuthService';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
const authService = new AuthService();

export interface AdminProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export default class ProfileService {
  getProfile() {
    return fetch(`${apiUrl}/profile`, {
      headers: authService.getAuthHeaders(),
    })
      .then(res => res.json())
      .then((d) => {
        console.log("🔍 RAW PROFILE RESPONSE:", JSON.stringify(d, null, 2));
        if (d.data) {
          console.log("🔍 Profile keys:", Object.keys(d.data));
        }
        return d.data;
      });
  }

  updateProfile(profileData: UpdateProfileData) {
    return fetch(`${apiUrl}/profile`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(profileData),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((d) => {
        console.log("🔍 UPDATE PROFILE RESPONSE:", JSON.stringify(d, null, 2));
        return d.data;
      });
  }

  changePassword(passwordData: ChangePasswordData) {
    return fetch(`${apiUrl}/change-password`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(passwordData),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((d) => {
        console.log("🔍 CHANGE PASSWORD RESPONSE:", JSON.stringify(d, null, 2));
        return d;
      });
  }
}

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';

// Response time monitoring
const monitorResponseTime = (startTime: number) => {
  const responseTime = Date.now() - startTime;
  
  // Dispatch custom event for connection status monitoring
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('connection-status-update', {
      detail: { responseTime }
    }));
  }
  
  return responseTime;
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  message: string;
  admin?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

export interface StatusResponse {
  hasAdmin: boolean;
}

export interface ProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export default class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const startTime = Date.now();
    
    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    monitorResponseTime(startTime);
    const data = await response.json();
    
    // Backend returns: { message, admin: { id, email, accessToken, refreshToken } }
    if (data.admin?.accessToken) {
      localStorage.setItem('admin_token', data.admin.accessToken);
      localStorage.setItem('admin_user', JSON.stringify({
        id: data.admin.id,
        email: data.admin.email,
        first_name: data.admin.first_name || '',
        last_name: data.admin.last_name || '',
      }));
      
      if (data.admin.refreshToken) {
        localStorage.setItem('admin_refresh_token', data.admin.refreshToken);
      }

      // Set cookie so middleware can read it server-side (localStorage is not accessible in middleware)
      document.cookie = `admin_token=${data.admin.accessToken}; path=/; SameSite=Lax`;
    }

    return data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    // Backend returns: { message, admin: { id, email, first_name, last_name } }
    // Note: Register doesn't return tokens, need to login after
    return data;
  }

  async checkStatus(): Promise<StatusResponse> {
    const url = `${apiUrl}/status`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      // Backend returns: { hasAdmin: true/false }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getProfile(): Promise<ProfileData> {
    const response = await fetch(`${apiUrl}/profile`, {
      headers: this.getAuthHeaders(),
    });
    const data = await response.json();
    
    // Backend returns: { message, admin: {...} }
    return data.admin;
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<AuthResponse> {
    const response = await fetch(`${apiUrl}/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    const data = await response.json();
    
    // Backend returns: { message, admin: {...} }
    if (data.admin) {
      localStorage.setItem('admin_user', JSON.stringify(data.admin));
    }

    return data;
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await fetch(`${apiUrl}/change-password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });

    return response.json();
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${apiUrl}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();
    
    // Backend returns: { message, accessToken, refreshToken }
    if (data.accessToken) {
      localStorage.setItem('admin_token', data.accessToken);
      
      if (data.refreshToken) {
        localStorage.setItem('admin_refresh_token', data.refreshToken);
      }
    }

    return data;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${apiUrl}/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
    } finally {
      this.clearLocalStorage();
    }
  }

  clearLocalStorage(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    // Clear the auth cookie
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_refresh_token');
  }

  getUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }
}

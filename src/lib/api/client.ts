/**
 * API Client with authentication and error handling
 * Compliant with design specification
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = localStorage.getItem("admin_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefreshToken();
    const newToken = await this.refreshPromise;
    this.refreshPromise = null;
    return newToken;
  }

  private async doRefreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem("admin_refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${this.baseURL}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Clear tokens on refresh failure
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("admin_user");
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    const newToken = data.accessToken;

    localStorage.setItem("admin_token", newToken);
    if (data.refreshToken) {
      localStorage.setItem("admin_refresh_token", data.refreshToken);
    }

    return newToken;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Try to refresh token
      try {
        await this.refreshToken();
        // Retry the request with new token
        const newHeaders = await this.getAuthHeaders();
        const retryResponse = await fetch(response.url, {
          ...response,
          headers: newHeaders,
        });
        return this.handleResponse(retryResponse);
      } catch (error) {
        // Refresh failed, redirect to login
        window.location.href = "/login";
        throw new Error("Authentication failed");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T = any>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers,
    });
    return this.handleResponse<T>(response);
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const headersWithAuth = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PATCH",
      headers: headersWithAuth,
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

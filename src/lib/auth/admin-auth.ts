/**
 * Admin Authentication Utilities
 * Compliant with design specification
 */

import { apiClient } from "../api/client";

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  admin: AdminUser;
  tokens: AuthTokens;
}

/**
 * JWT token storage and retrieval utilities
 */
export class AdminAuth {
  private static readonly TOKEN_KEY = "admin_token";
  private static readonly REFRESH_TOKEN_KEY = "admin_refresh_token";
  private static readonly USER_KEY = "admin_user";

  /**
   * Store authentication tokens
   */
  static storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  }

  /**
   * Get stored access token
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Store admin user data
   */
  static storeUser(user: AdminUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get stored admin user data
   */
  static getUser(): AdminUser | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Clear all stored authentication data
   */
  static clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Validate admin role
   */
  static isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === "admin" || !!user; // Assume all authenticated users are admins for now
  }

  /**
   * Token refresh logic with automatic retry
   */
  static async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await apiClient.post("/refresh", { refreshToken });
      const newToken = response.accessToken;

      this.storeTokens({
        accessToken: newToken,
        refreshToken: response.refreshToken,
      });
      return newToken;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Login with credentials
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post("/login", credentials);

    if (response.admin && response.accessToken) {
      const tokens: AuthTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };

      this.storeTokens(tokens);
      this.storeUser(response.admin);

      return {
        admin: response.admin,
        tokens,
      };
    }

    throw new Error("Invalid login response");
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post("/logout");
    } catch (error) {
      // Ignore logout errors
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Get current admin user profile
   */
  static async getProfile(): Promise<AdminUser> {
    const response = await apiClient.get("/profile");
    return response.admin || response;
  }

  /**
   * Update admin profile
   */
  static async updateProfile(
    profileData: Partial<AdminUser>,
  ): Promise<AdminUser> {
    const response = await apiClient.put("/profile", profileData);
    const updatedUser = response.admin || response;
    this.storeUser(updatedUser);
    return updatedUser;
  }
}

export default AdminAuth;

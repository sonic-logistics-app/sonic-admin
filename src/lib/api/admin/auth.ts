/**
 * Admin Authentication API Service
 * Compliant with design specification
 */

import { apiClient } from "../client";
import AdminAuth from "../../auth/admin-auth";
import {
  LoginCredentials,
  AuthResponse,
  AdminUser,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "../../types/admin";

/**
 * Authentication service for admin operations
 */
export class AuthService {
  /**
   * Login admin user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post("/login", credentials);

    if (response.admin && response.accessToken) {
      AdminAuth.storeTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      AdminAuth.storeUser(response.admin);
    }

    return response;
  }

  /**
   * Register new admin user
   */
  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post("/register", userData);
    return response;
  }

  /**
   * Logout current admin user
   */
  async logout(): Promise<void> {
    await AdminAuth.logout();
  }

  /**
   * Check if admin setup is complete
   */
  async checkAdminStatus(): Promise<{ hasAdmin: boolean }> {
    const response = await apiClient.get("/status");
    return response;
  }

  /**
   * Get current admin profile
   */
  async getProfile(): Promise<AdminUser> {
    return await AdminAuth.getProfile();
  }

  /**
   * Update admin profile
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<AdminUser> {
    return await AdminAuth.updateProfile(profileData);
  }

  /**
   * Change admin password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await apiClient.put("/profile/password", passwordData);
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string> {
    return await AdminAuth.refreshToken();
  }
}

export default new AuthService();

import { create } from "zustand";
import AuthService, {
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/services/AuthService";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  register: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  checkAdminStatus: () => Promise<{ hasAdmin: boolean }>;
  updateProfile: (
    profileData: UpdateProfileRequest,
  ) => Promise<{ success: boolean; message: string }>;
  changePassword: (
    passwordData: ChangePasswordRequest,
  ) => Promise<{ success: boolean; message: string }>;
  refreshToken: () => Promise<{ success: boolean; message: string }>;
}

const authService = new AuthService();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authService.login({ email, password });

      // Backend returns: { message, admin: { id, email, accessToken, refreshToken } }
      if (response.admin?.accessToken) {
        set({
          user: {
            id: parseInt(response.admin.id),
            email: response.admin.email,
            first_name: response.admin.first_name || "",
            last_name: response.admin.last_name || "",
          },
          token: response.admin.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true, message: response.message };
      } else {
        set({ isLoading: false });
        return { success: false, message: response.message || "Login failed" };
      }
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, message: error.message || "Login failed" };
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await authService.register(userData);

      // Backend returns: { message, admin: { id, email, first_name, last_name } }
      // Note: No tokens returned, need to login after registration
      if (response.admin) {
        set({ isLoading: false });
        // Auto-login after registration
        return get().login(userData.email, userData.password);
      } else {
        set({ isLoading: false });
        return {
          success: false,
          message: response.message || "Registration failed",
        };
      }
    } catch (error: any) {
      set({ isLoading: false });
      return {
        success: false,
        message: error.message || "Registration failed",
      };
    }
  },

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  checkAuth: () => {
    const token = authService.getToken();
    const user = authService.getUser();

    if (token && user) {
      set({
        user,
        token,
        isAuthenticated: true,
      });
    }
  },

  checkAdminStatus: async () => {
    try {
      const response = await authService.checkStatus();

      // Backend returns { hasAdmin: true } directly
      const hasAdmin = response.hasAdmin ?? false;

      return { hasAdmin };
    } catch (error) {
      return { hasAdmin: false };
    }
  },

  updateProfile: async (profileData: UpdateProfileRequest) => {
    set({ isLoading: true });
    try {
      const response = await authService.updateProfile(profileData);

      // Backend returns: { message, admin: {...} }
      if (response.admin) {
        set({
          user: {
            id: parseInt(response.admin.id),
            email: response.admin.email,
            first_name: response.admin.first_name || "",
            last_name: response.admin.last_name || "",
          },
          isLoading: false,
        });
        return { success: true, message: response.message };
      } else {
        set({ isLoading: false });
        return { success: false, message: response.message || "Update failed" };
      }
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, message: error.message || "Update failed" };
    }
  },

  changePassword: async (passwordData: ChangePasswordRequest) => {
    set({ isLoading: true });
    try {
      const response = await authService.changePassword(passwordData);
      set({ isLoading: false });

      // Backend returns: { message }
      return { success: true, message: response.message };
    } catch (error: any) {
      set({ isLoading: false });
      return {
        success: false,
        message: error.message || "Password change failed",
      };
    }
  },

  refreshToken: async () => {
    try {
      const response = await authService.refreshToken();

      // Backend returns: { message, accessToken, refreshToken }
      if (response.accessToken) {
        set({
          token: response.accessToken,
        });
        return { success: true, message: response.message };
      } else {
        return {
          success: false,
          message: response.message || "Token refresh failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Token refresh failed",
      };
    }
  },
}));

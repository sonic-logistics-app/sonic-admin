import AuthService from '@/services/AuthService';

const authService = new AuthService();
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

/**
 * Enhanced fetch wrapper with automatic token refresh on 401
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Add auth headers
  const token = authService.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Make the request
  let response = await fetch(url, { ...options, headers });

  // Handle 401 - Token expired
  if (response.status === 401) {
    if (isRefreshing) {
      // Wait for the token refresh to complete
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          // Retry the original request with new token
          const newToken = authService.getToken();
          const newHeaders = {
            'Content-Type': 'application/json',
            ...(newToken && { Authorization: `Bearer ${newToken}` }),
            ...options.headers,
          };
          return fetch(url, { ...options, headers: newHeaders });
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    isRefreshing = true;

    try {
      // Attempt to refresh the token
      await authService.refreshToken();
      isRefreshing = false;
      processQueue();

      // Retry the original request with new token
      const newToken = authService.getToken();
      const newHeaders = {
        'Content-Type': 'application/json',
        ...(newToken && { Authorization: `Bearer ${newToken}` }),
        ...options.headers,
      };
      response = await fetch(url, { ...options, headers: newHeaders });
    } catch (error) {
      isRefreshing = false;
      processQueue(error);
      
      // Refresh failed, clear auth and redirect to login
      authService.clearLocalStorage();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw error;
    }
  }

  return response;
}

/**
 * Check if token is expired (client-side check)
 * This is a basic check - the server will do the real validation
 */
export function isTokenExpired(): boolean {
  const token = authService.getToken();
  if (!token) return true;

  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration (exp is in seconds, Date.now() is in milliseconds)
    if (payload.exp) {
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      // Consider token expired if it expires in less than 1 minute
      return expirationTime - currentTime < 60000;
    }
    
    return false;
  } catch (error) {
    // If we can't decode the token, consider it expired
    return true;
  }
}

/**
 * Proactively refresh token if it's about to expire
 */
export async function refreshTokenIfNeeded(): Promise<void> {
  if (isTokenExpired() && authService.getRefreshToken()) {
    try {
      await authService.refreshToken();
    } catch (error) {
      // Refresh failed, clear auth and redirect to login
      authService.clearLocalStorage();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isTokenExpired, refreshTokenIfNeeded } from '@/lib/api/interceptor';
import AuthService from '@/services/AuthService';

const authService = new AuthService();

/**
 * Component that validates token on mount and periodically
 * Prevents the app from getting stuck with expired tokens
 */
export default function TokenValidator({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      // Skip validation on login page
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        setIsValidating(false);
        setIsValid(true);
        return;
      }

      const token = authService.getToken();
      
      // No token, redirect to login
      if (!token) {
        authService.clearLocalStorage();
        router.push('/login');
        return;
      }

      // Check if token is expired
      if (isTokenExpired()) {
        try {
          // Try to refresh
          await refreshTokenIfNeeded();
          setIsValid(true);
        } catch (error) {
          // Refresh failed, redirect to login
          authService.clearLocalStorage();
          router.push('/login');
          return;
        }
      } else {
        setIsValid(true);
      }

      setIsValidating(false);
    };

    validateToken();

    // Set up periodic token validation (every 5 minutes)
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        refreshTokenIfNeeded().catch(() => {
          authService.clearLocalStorage();
          router.push('/login');
        });
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [router]);

  // Show loading while validating
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[13px] text-[#525866]">Validating session...</p>
        </div>
      </div>
    );
  }

  // Only render children if token is valid
  return isValid ? <>{children}</> : null;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check auth from localStorage immediately
    checkAuth();
    setIsInitialized(true);
  }, [checkAuth]);

  useEffect(() => {
    // Only redirect after we've checked localStorage
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Don't render anything until we've checked localStorage
  // This prevents the flash of login page
  if (!isInitialized) {
    return null;
  }

  // If not authenticated after initialization, show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

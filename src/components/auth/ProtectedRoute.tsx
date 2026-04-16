"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminAuth from "@/lib/auth/admin-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const isAuth = AdminAuth.isAuthenticated();
      setIsInitialized(true);

      if (!isAuth) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Don't render anything until we've checked authentication
  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
}

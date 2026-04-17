"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthService from "@/services/AuthService";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const authService = new AuthService();
    if (authService.isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FBFBFB]">
      <i className="pi pi-spinner pi-spin text-[#2563EB] text-4xl" />
    </div>
  );
}

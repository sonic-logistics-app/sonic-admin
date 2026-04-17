"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";
import Toast, { ToastRef } from "@/components/shared/Toast";

export default function LoginPage() {
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const { login, register, checkAuth, checkAdminStatus, isAuthenticated, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Registration form fields
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Check auth immediately on mount
    checkAuth();
    
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push("/dashboard");
      return;
    }

    setCheckingAuth(false);
    
    // Check if admin account exists
    setCheckingStatus(true);
    setStatusError("");
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
    
    checkAdminStatus().then(({ hasAdmin }) => {
      setNeedsSetup(!hasAdmin);
      setCheckingStatus(false);
    }).catch((error) => {
      setStatusError(`Failed to connect to backend at ${backendUrl}`);
      // If check fails, assume we need setup
      setNeedsSetup(true);
      setCheckingStatus(false);
    });
  }, []);

  // Don't render login page while checking if user is already authenticated
  if (checkingAuth || isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FBFBFB]">
        <i className="pi pi-spinner pi-spin text-[#2563EB] text-4xl" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please fill in all fields",
        life: 3000,
      });
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Login successful",
        life: 3000,
      });
      router.push("/dashboard");
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Login Failed",
        detail: result.message,
        life: 3000,
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!regEmail || !regPassword || !regFirstName || !regLastName) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please fill in all fields",
        life: 3000,
      });
      return;
    }

    const result = await register({
      email: regEmail,
      password: regPassword,
      first_name: regFirstName,
      last_name: regLastName,
    });
    
    if (result.success) {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Admin account created successfully",
        life: 3000,
      });
      setShowRegister(false);
      setNeedsSetup(false);
      router.push("/dashboard");
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Registration Failed",
        detail: result.message,
        life: 3000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FBFBFB]">
      <Toast ref={toast} />
      
      <div className="bg-white p-8 shadow-lg rounded-2xl w-full max-w-md border border-[#E1E4EA]">
        <div className="text-center mb-6">
          <Image
            src="/sonic-logo.svg"
            alt="Sonic Logo"
            width={200}
            height={100}
            className="mb-3 mx-auto"
          />
          <div className="text-[#111827] text-2xl font-semibold mb-3">
            Sonic Admin
          </div>
          <span className="text-[#525866] font-medium text-[13px]">
            {needsSetup ? "Create your admin account" : "Sign in to continue"}
          </span>
        </div>

        {needsSetup && (
          <div className="p-3 mb-4 bg-[#FEF3C7] border-l-4 border-[#F59E0B] rounded">
            <div className="flex items-center gap-2">
              <i className="pi pi-info-circle text-[#D97706]"></i>
              <span className="text-[#92400E] text-[12px]">
                No admin account found. Please create the first admin account.
              </span>
            </div>
          </div>
        )}

        {checkingStatus && (
          <div className="p-3 mb-4 bg-[#DBEAFE] border-l-4 border-[#2563EB] rounded">
            <div className="flex items-center gap-2">
              <i className="pi pi-spinner pi-spin text-[#2563EB]"></i>
              <span className="text-[#1E40AF] text-[12px]">
                Checking backend connection...
              </span>
            </div>
          </div>
        )}

        {statusError && (
          <div className="p-3 mb-4 bg-[#FEE2E2] border-l-4 border-[#DC2626] rounded">
            <div className="flex items-start gap-2">
              <i className="pi pi-exclamation-triangle text-[#DC2626] mt-0.5"></i>
              <div className="text-[#991B1B] text-[12px]">
                <div className="font-semibold mb-1">Backend Connection Error</div>
                <div>{statusError}</div>
                <div className="mt-2">
                  Check browser console (F12) for details.
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-[#111827] font-medium mb-2 text-[13px]">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-[#111827] font-medium mb-2 text-[13px]">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525866] hover:text-[#111827]"
              >
                <i className={`pi ${showPassword ? "pi-eye-slash" : "pi-eye"}`}></i>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <input
                id="rememberme"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#E1E4EA] text-[#2563EB] cursor-pointer"
              />
              <label htmlFor="rememberme" className="text-[13px] text-[#525866] cursor-pointer">
                Remember me
              </label>
            </div>
            <a
              className="font-medium no-underline text-[#2563EB] text-right cursor-pointer text-[13px] hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <i className="pi pi-spinner pi-spin"></i>
                Signing in...
              </>
            ) : (
              <>
                <i className="pi pi-user"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-[#525866] font-medium text-[13px]">
            {needsSetup ? (
              <>
                Need to create the first admin account?{" "}
                <a
                  className="font-medium no-underline cursor-pointer text-[#2563EB] hover:underline"
                  onClick={() => setShowRegister(true)}
                >
                  Create Account
                </a>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <a
                  className="font-medium no-underline cursor-pointer text-[#2563EB] hover:underline"
                >
                  Contact Administrator
                </a>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowRegister(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl border border-[#E1E4EA] w-full max-w-md shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E1E4EA]">
              <h2 className="text-[18px] font-semibold text-[#111827]">
                Create Admin Account
              </h2>
              <button
                onClick={() => setShowRegister(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <i className="pi pi-times text-[#525866]" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div>
                <label htmlFor="regFirstName" className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  First Name *
                </label>
                <input
                  id="regFirstName"
                  type="text"
                  placeholder="First Name"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="regLastName" className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Last Name *
                </label>
                <input
                  id="regLastName"
                  type="text"
                  placeholder="Last Name"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="regEmail" className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Email *
                </label>
                <input
                  id="regEmail"
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="regPassword" className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="regPassword"
                    type={regShowPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowPassword(!regShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525866] hover:text-[#111827]"
                  >
                    <i className={`pi ${regShowPassword ? "pi-eye-slash" : "pi-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E1E4EA]">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <i className="pi pi-spinner pi-spin"></i>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="pi pi-check"></i>
                      Create Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

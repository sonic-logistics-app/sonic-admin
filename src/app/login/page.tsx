"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const { login, register, checkAuth, checkAdminStatus, isAuthenticated, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Registration form fields
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");

  useEffect(() => {
    // Check auth immediately on mount
    checkAuth();
    setCheckingAuth(false);
    
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push("/");
      return;
    }
    
    // Check if admin account exists
    setCheckingStatus(true);
    setStatusError("");
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
    console.log('Backend URL:', backendUrl);
    console.log('Checking admin status...');
    
    checkAdminStatus().then(({ hasAdmin }) => {
      console.log('Admin status response:', { hasAdmin });
      setNeedsSetup(!hasAdmin);
      setCheckingStatus(false);
    }).catch((error) => {
      console.error('Error checking admin status:', error);
      setStatusError(`Failed to connect to backend at ${backendUrl}`);
      // If check fails, assume we need setup
      setNeedsSetup(true);
      setCheckingStatus(false);
    });
  }, [isAuthenticated, checkAuth, checkAdminStatus, router]);

  // Don't render login page while checking if user is already authenticated
  if (checkingAuth || isAuthenticated) {
    return null;
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
      router.push("/");
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
      router.push("/");
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
    <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
      <Toast ref={toast} />
      
      <div className="surface-card p-4 shadow-2 border-round w-full lg:w-4">
        <div className="text-center mb-5">
          <Image
            src="/images/logo-dark.svg"
            alt="Sonic Logo"
            width={80}
            height={60}
            className="mb-3"
          />
          <div className="text-900 text-3xl font-medium mb-3">
            Sonic Admin
          </div>
          <span className="text-600 font-medium line-height-3">
            {needsSetup ? "Create your admin account" : "Sign in to continue"}
          </span>
        </div>

        {needsSetup && (
          <div className="p-3 mb-4 bg-yellow-50 border-left-3 border-yellow-500">
            <div className="flex align-items-center">
              <i className="pi pi-info-circle text-yellow-600 mr-2"></i>
              <span className="text-yellow-800">
                No admin account found. Please create the first admin account.
              </span>
            </div>
          </div>
        )}

        {checkingStatus && (
          <div className="p-3 mb-4 bg-blue-50 border-left-3 border-blue-500">
            <div className="flex align-items-center">
              <i className="pi pi-spinner pi-spin text-blue-600 mr-2"></i>
              <span className="text-blue-800">
                Checking backend connection...
              </span>
            </div>
          </div>
        )}

        {statusError && (
          <div className="p-3 mb-4 bg-red-50 border-left-3 border-red-500">
            <div className="flex align-items-center">
              <i className="pi pi-exclamation-triangle text-red-600 mr-2"></i>
              <div className="text-red-800">
                <div className="font-semibold mb-1">Backend Connection Error</div>
                <div className="text-sm">{statusError}</div>
                <div className="text-sm mt-2">
                  Check browser console (F12) for details.
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="email" className="block text-900 font-medium mb-2">
              Email
            </label>
            <InputText
              id="email"
              type="email"
              placeholder="Email address"
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password" className="block text-900 font-medium mb-2">
              Password
            </label>
            <Password
              id="password"
              placeholder="Password"
              className="w-full"
              inputClassName="w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
              required
            />
          </div>

          <div className="flex align-items-center justify-content-between mb-6">
            <div className="flex align-items-center">
              <Checkbox
                id="rememberme"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.checked || false)}
                className="mr-2"
              />
              <label htmlFor="rememberme">Remember me</label>
            </div>
            <a
              className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer"
              style={{ color: "var(--primary-color)" }}
            >
              Forgot password?
            </a>
          </div>

          <Button
            label="Sign In"
            icon="pi pi-user"
            className="w-full"
            type="submit"
            loading={isLoading}
          />
        </form>

        <div className="text-center mt-4">
          <span className="text-600 font-medium line-height-3">
            {needsSetup ? (
              <>
                Need to create the first admin account?{" "}
                <a
                  className="font-medium no-underline cursor-pointer"
                  style={{ color: "var(--primary-color)" }}
                  onClick={() => setShowRegister(true)}
                >
                  Create Account
                </a>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <a
                  className="font-medium no-underline cursor-pointer"
                  style={{ color: "var(--primary-color)" }}
                >
                  Contact Administrator
                </a>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog
        header="Create Admin Account"
        visible={showRegister}
        style={{ width: "450px" }}
        onHide={() => setShowRegister(false)}
        modal
      >
        <form onSubmit={handleRegister}>
          <div className="field">
            <label htmlFor="regFirstName" className="block text-900 font-medium mb-2">
              First Name
            </label>
            <InputText
              id="regFirstName"
              placeholder="First Name"
              className="w-full"
              value={regFirstName}
              onChange={(e) => setRegFirstName(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="regLastName" className="block text-900 font-medium mb-2">
              Last Name
            </label>
            <InputText
              id="regLastName"
              placeholder="Last Name"
              className="w-full"
              value={regLastName}
              onChange={(e) => setRegLastName(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="regEmail" className="block text-900 font-medium mb-2">
              Email
            </label>
            <InputText
              id="regEmail"
              type="email"
              placeholder="Email address"
              className="w-full"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="regPassword" className="block text-900 font-medium mb-2">
              Password
            </label>
            <Password
              id="regPassword"
              placeholder="Password"
              className="w-full"
              inputClassName="w-full"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              toggleMask
              required
            />
          </div>

          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              outlined
              onClick={() => setShowRegister(false)}
              type="button"
            />
            <Button
              label="Create Account"
              icon="pi pi-check"
              type="submit"
              loading={isLoading}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}

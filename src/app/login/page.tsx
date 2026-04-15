"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login - replace with actual authentication
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 1000);
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
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
            Sign in to continue
          </span>
        </div>

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
            loading={loading}
          />
        </form>

        <div className="text-center mt-4">
          <span className="text-600 font-medium line-height-3">
            Don't have an account?{" "}
            <a
              className="font-medium no-underline cursor-pointer"
              style={{ color: "var(--primary-color)" }}
            >
              Contact Administrator
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

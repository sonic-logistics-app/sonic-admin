"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/api/admin/ops";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    try {
      setSending(true);
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-[#E1E4EA] p-8 space-y-5">
        <Image src="/sonic-logo.png" alt="Sonic" width={120} height={36} priority />

        {sent ? (
          <div className="space-y-4">
            <h1 className="text-[22px] font-bold text-[#111827]">Check your email</h1>
            <p className="text-[14px] text-[#525866]">
              If an admin account exists for <strong>{email.trim()}</strong>, a link to reset the password is on its way. It works once and expires in 1 hour.
            </p>
            <p className="text-[13px] text-[#9CA3AF]">Nothing in your inbox? Check spam, or wait a minute and try again.</p>
            <Link href="/login" className="inline-block text-[14px] text-[#2563EB] hover:underline">Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <h1 className="text-[22px] font-bold text-[#111827]">Forgot your password?</h1>
              <p className="text-[14px] text-[#525866]">Enter your admin email and we will send you a link to choose a new one.</p>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[#525866]" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                className="w-full px-3 py-2.5 border border-[#E1E4EA] rounded-lg text-[14px]"
              />
            </div>
            {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
            <button
              type="submit"
              disabled={sending || !email}
              className="w-full py-2.5 rounded-full bg-[#2563EB] text-white text-[14px] font-semibold disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send reset link"}
            </button>
            <Link href="/login" className="block text-center text-[14px] text-[#2563EB] hover:underline">Back to sign in</Link>
          </form>
        )}
      </div>
    </div>
  );
}

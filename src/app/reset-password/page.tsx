"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { checkPasswordReset, resetPassword } from "@/lib/api/admin/ops";

function ResetPassword() {
  const token = useSearchParams().get("token") || "";
  const [who, setWho] = useState<{ email: string; first_name: string } | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setProblem("This reset link is missing its code. Open the link from your email again.");
      return;
    }
    checkPasswordReset(token)
      .then(setWho)
      .catch((e: Error) => setProblem(e.message));
  }, [token]);

  const strong = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!strong) return setError("Use at least 8 characters with a letter and a number.");
    if (password !== confirm) return setError("The two passwords do not match.");
    try {
      setSaving(true);
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-[#E1E4EA] p-8 space-y-5">
        <Image src="/sonic-logo.png" alt="Sonic" width={120} height={36} priority />

        {done ? (
          <div className="space-y-4">
            <h1 className="text-[22px] font-bold text-[#111827]">Password updated</h1>
            <p className="text-[14px] text-[#525866]">Sign in with {who?.email} and your new password. Other devices are signed out.</p>
            <Link href="/login" className="inline-block px-5 py-2.5 rounded-full bg-[#2563EB] text-white text-[14px] font-semibold no-underline">
              Go to sign in
            </Link>
          </div>
        ) : problem ? (
          <div className="space-y-3">
            <h1 className="text-[22px] font-bold text-[#111827]">This link cannot be used</h1>
            <p className="text-[14px] text-[#525866]">{problem}</p>
            <Link href="/forgot-password" className="block text-[14px] text-[#2563EB] hover:underline">Request a new link</Link>
            <Link href="/login" className="block text-[14px] text-[#2563EB] hover:underline">Back to sign in</Link>
          </div>
        ) : !who ? (
          <p className="text-[14px] text-[#525866]">Checking your link…</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <h1 className="text-[22px] font-bold text-[#111827]">Choose a new password</h1>
              <p className="text-[14px] text-[#525866]">
                For <strong>{who.email}</strong>.
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[#525866]" htmlFor="pw">New password</label>
              <div className="flex">
                <input id="pw" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
                  className="flex-1 px-3 py-2.5 border border-[#E1E4EA] rounded-l-lg text-[14px]" />
                <button type="button" onClick={() => setShow(!show)} className="px-3 border border-l-0 border-[#E1E4EA] rounded-r-lg text-[12px] text-[#525866]">
                  {show ? "Hide" : "Show"}
                </button>
              </div>
              <p className={`text-[12px] ${password && !strong ? "text-[#DC2626]" : "text-[#9CA3AF]"}`}>At least 8 characters, with a letter and a number.</p>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[#525866]" htmlFor="pw2">Confirm password</label>
              <input id="pw2" type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password"
                className="w-full px-3 py-2.5 border border-[#E1E4EA] rounded-lg text-[14px]" />
            </div>
            {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
            <button type="submit" disabled={saving || !password || !confirm}
              className="w-full py-2.5 rounded-full bg-[#2563EB] text-white text-[14px] font-semibold disabled:opacity-50">
              {saving ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}

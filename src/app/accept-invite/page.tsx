"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { acceptAdminInvite, checkAdminInvite } from "@/lib/api/admin/ops";

type Invite = { email: string; first_name: string; role: keyof typeof ROLE_LABELS };

function AcceptInvite() {
  const token = useSearchParams().get("token") || "";
  const [invite, setInvite] = useState<Invite | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setProblem("This invitation link is missing its code. Open the link from your email again.");
      return;
    }
    checkAdminInvite(token)
      .then(setInvite)
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
      await acceptAdminInvite(token, password);
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
            <h1 className="text-[22px] font-bold text-[#111827]">You are all set</h1>
            <p className="text-[14px] text-[#525866]">Your password is saved. Sign in with {invite?.email}.</p>
            <Link href="/login" className="inline-block px-5 py-2.5 rounded-full bg-[#2563EB] text-white text-[14px] font-semibold no-underline">
              Go to sign in
            </Link>
          </div>
        ) : problem ? (
          <div className="space-y-3">
            <h1 className="text-[22px] font-bold text-[#111827]">This link cannot be used</h1>
            <p className="text-[14px] text-[#525866]">{problem}</p>
            <Link href="/login" className="text-[14px] text-[#2563EB] hover:underline">Back to sign in</Link>
          </div>
        ) : !invite ? (
          <p className="text-[14px] text-[#525866]">Checking your invitation…</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <h1 className="text-[22px] font-bold text-[#111827]">Welcome, {invite.first_name}</h1>
              <p className="text-[14px] text-[#525866]">
                Set a password for <strong>{invite.email}</strong>. You are joining as <strong>{ROLE_LABELS[invite.role]}</strong>.
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[#525866]" htmlFor="pw">Password</label>
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
              {saving ? "Saving…" : "Set password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInvite />
    </Suspense>
  );
}

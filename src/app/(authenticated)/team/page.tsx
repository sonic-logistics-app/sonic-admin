"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/shared/Button";
import CellStack from "@/components/shared/CellStack";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DataTable from "@/components/shared/DataTable";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import Toast, { ToastRef } from "@/components/shared/Toast";
import { ROLE_LABELS, usePermissions } from "@/lib/auth/permissions";
import {
  TeamAdmin,
  changeAdminRole,
  getTeam,
  inviteAdmin,
  resendAdminInvite,
  revokeAdminInvite,
  setAdminDisabled,
} from "@/lib/api/admin/ops";

const ROLES: { value: TeamAdmin["role"]; label: string; hint: string }[] = [
  { value: "super_admin", label: "Super Admin", hint: "Everything, including deleting accounts, business partner categories and managing this team." },
  { value: "operations", label: "Operations", hint: "Works the queues: approve and reject business partners, verify movers and users, suspend, vouchers, FAQ. Cannot delete or manage the team." },
  { value: "support", label: "Support", hint: "Reads everything and handles support tickets. Cannot change accounts." },
];

const STATUS_STYLE: Record<TeamAdmin["status"], string> = {
  active: "bg-[#D1FAE5] text-[#065F46]",
  pending: "bg-[#FEF3C7] text-[#92400E]",
  disabled: "bg-[#FEE2E2] text-[#991B1B]",
};

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—");

const myId = () => {
  try {
    return JSON.parse(localStorage.getItem("admin_user") || "null")?.id as string | undefined;
  } catch {
    return undefined;
  }
};

export default function TeamPage() {
  const { can, loaded } = usePermissions();
  const toast = useRef<ToastRef>(null);
  const [admins, setAdmins] = useState<TeamAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<string | undefined>();
  const [inviting, setInviting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", role: "operations" as TeamAdmin["role"] });
  const [confirm, setConfirm] = useState<{ title: string; message: string; variant: "danger" | "primary"; run: () => Promise<void> } | null>(null);

  const load = useCallback(() => getTeam().then(({ data }) => setAdmins(data.admins)).catch((e: Error) => setError(e.message)), []);

  useEffect(() => {
    setMe(myId());
    load();
  }, [load]);

  const act = async (work: () => Promise<unknown>, success: string) => {
    try {
      setSaving(true);
      await work();
      toast.current?.show({ severity: "success", summary: success, detail: "Done", life: 3500 });
      await load();
    } catch (e: any) {
      toast.current?.show({ severity: "error", summary: "Could not complete", detail: e.message, life: 5000 });
    } finally {
      setSaving(false);
    }
  };

  const sendInvite = async () => {
    try {
      setSaving(true);
      const { data } = await inviteAdmin(form);
      toast.current?.show({
        severity: data.email_sent ? "success" : "warn",
        summary: data.email_sent ? "Invitation sent" : "Admin created, email not sent",
        detail: data.email_sent ? `${form.email} has until ${day(data.expires_at)} to set a password.` : "Use Resend invite to try again.",
        life: 5000,
      });
      setInviting(false);
      setForm({ email: "", first_name: "", last_name: "", role: "operations" });
      await load();
    } catch (e: any) {
      toast.current?.show({ severity: "error", summary: "Could not invite", detail: e.message, life: 5000 });
    } finally {
      setSaving(false);
    }
  };

  if (loaded && !can("admin.manage")) {
    return <p className="text-[14px] text-[#525866] py-10 text-center">Only a Super Admin can manage the team.</p>;
  }
  if (error) return <p className="text-[14px] text-[#DC2626] py-10 text-center">{error}</p>;
  if (!admins) return <SkeletonLoader type="table" rows={5} />;

  const columns = [
    {
      field: "email",
      header: "Admin",
      body: (a: TeamAdmin) => (
        <CellStack
          primary={
            <>
              {a.first_name} {a.last_name}
              {a.id === me && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-semibold">You</span>}
            </>
          }
          secondary={a.email}
        />
      ),
    },
    {
      field: "role",
      header: "Role",
      body: (a: TeamAdmin) =>
        a.id === me || a.status === "pending" ? (
          <span className="text-[13px] text-[#111827]">{ROLE_LABELS[a.role]}</span>
        ) : (
          <select
            value={a.role}
            disabled={saving}
            onChange={(e) =>
              setConfirm({
                title: "Change role",
                message: `Make ${a.first_name} ${a.last_name} ${ROLE_LABELS[e.target.value as TeamAdmin["role"]]}? It takes effect straight away.`,
                variant: "primary",
                run: () => act(() => changeAdminRole(a.id, e.target.value as TeamAdmin["role"]), "Role updated"),
              })
            }
            className="px-3 py-1.5 border border-[#E1E4EA] rounded-lg text-[13px] bg-white"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        ),
    },
    {
      field: "status",
      header: "Status",
      body: (a: TeamAdmin) => (
        <div className="flex flex-col items-start gap-1">
          <span className={`text-[11px] px-2 py-1 rounded-full font-semibold capitalize ${STATUS_STYLE[a.status]}`}>{a.status}</span>
          {a.status === "pending" && (
            <span className="text-[11px] text-[#525866]">{a.invite_expired ? "Invite expired" : `Invite expires ${day(a.invite_expires_at)}`}</span>
          )}
        </div>
      ),
    },
    { field: "created_at", header: "Added", body: (a: TeamAdmin) => day(a.created_at) },
    {
      field: "actions",
      header: "Actions",
      body: (a: TeamAdmin) => {
        if (a.id === me) return <span className="text-[12px] text-[#9CA3AF]">—</span>;
        const link = "hover:underline text-[13px] font-semibold";
        return (
          <div className="flex items-center gap-3">
            {a.status === "pending" && (
              <>
                <button className={`text-[#2563EB] ${link}`} disabled={saving} onClick={() => act(() => resendAdminInvite(a.id), "Invitation resent")}>
                  Resend invite
                </button>
                <button
                  className={`text-[#DC2626] ${link}`}
                  onClick={() =>
                    setConfirm({
                      title: "Revoke invitation",
                      message: `Withdraw the invitation for ${a.email}? The link stops working.`,
                      variant: "danger",
                      run: () => act(() => revokeAdminInvite(a.id), "Invitation revoked"),
                    })
                  }
                >
                  Revoke
                </button>
              </>
            )}
            {a.status === "active" && (
              <button
                className={`text-[#DC2626] ${link}`}
                onClick={() =>
                  setConfirm({
                    title: "Disable admin",
                    message: `${a.first_name} ${a.last_name} is signed out and cannot sign in until you enable them again.`,
                    variant: "danger",
                    run: () => act(() => setAdminDisabled(a.id, true), "Admin disabled"),
                  })
                }
              >
                Disable
              </button>
            )}
            {a.status === "disabled" && (
              <button className={`text-[#059669] ${link}`} disabled={saving} onClick={() => act(() => setAdminDisabled(a.id, false), "Admin enabled")}>
                Enable
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Toast ref={toast} />
      <ConfirmDialog
        visible={!!confirm}
        onHide={() => setConfirm(null)}
        onConfirm={() => {
          const run = confirm?.run;
          setConfirm(null);
          run?.();
        }}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? ""}
        confirmVariant={confirm?.variant ?? "primary"}
        icon="pi-exclamation-triangle"
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-[#111827]">Team</h1>
          <p className="text-[13px] text-[#525866]">Who can sign in to this admin, and what their role lets them do.</p>
        </div>
        <Button onClick={() => setInviting(true)}>
          <i className="pi pi-plus mr-2" />
          Invite admin
        </Button>
      </div>

      {inviting && (
        <div className="border border-[#E1E4EA] rounded-lg p-4 bg-white space-y-3">
          <h2 className="text-[15px] font-semibold text-[#111827]">Invite an admin</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="First name" className="px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px]" />
            <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Last name" className="px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px]" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ROLES.map((r) => (
              <label key={r.value} className={`border rounded-lg p-3 cursor-pointer ${form.role === r.value ? "border-[#2563EB] bg-[#F8FAFF]" : "border-[#E1E4EA]"}`}>
                <input type="radio" name="role" className="mr-2" checked={form.role === r.value} onChange={() => setForm({ ...form, role: r.value })} />
                <span className="text-[13px] font-semibold text-[#111827]">{r.label}</span>
                <p className="text-[12px] text-[#525866] mt-1">{r.hint}</p>
              </label>
            ))}
          </div>
          <p className="text-[12px] text-[#525866]">They get an email with a link to set their password. The link works once and expires in 48 hours.</p>
          <div className="flex gap-2">
            <Button loading={saving} disabled={!form.email.trim() || !form.first_name.trim() || !form.last_name.trim()} onClick={sendInvite}>Send invitation</Button>
            <Button variant="ghost" onClick={() => setInviting(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <DataTable data={admins} columns={columns} loading={false} emptyMessage="No admins yet" />
    </div>
  );
}

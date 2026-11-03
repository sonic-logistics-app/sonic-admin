"use client";

import { create } from "zustand";

/**
 * What the signed-in admin's role may do. This only hides or disables controls. The server
 * checks the same permission on every request, so a hidden button is never the only guard.
 * The names match ADMIN_PERMISSIONS in the backend.
 */
export type AdminPermission =
  | "vendor.review"
  | "vendor.decide"
  | "vendor.edit"
  | "vendor.categories"
  | "account.create"
  | "account.edit"
  | "account.verify"
  | "account.suspend"
  | "account.delete"
  | "order.manage"
  | "refund.manage"
  | "voucher.manage"
  | "faq.manage"
  | "contact.manage"
  | "ticket.handle"
  | "audit.read"
  | "admin.manage";

export type AdminRole = "super_admin" | "operations" | "support";

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  operations: "Operations",
  support: "Support",
};

const STORAGE_KEY = "admin_access";
const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";

interface Access {
  role: AdminRole | null;
  permissions: AdminPermission[];
}

const readStored = (): Access => {
  if (typeof window === "undefined") return { role: null, permissions: [] };
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (parsed?.role) return { role: parsed.role, permissions: parsed.permissions ?? [] };
  } catch {}
  return { role: null, permissions: [] };
};

interface PermissionState extends Access {
  loaded: boolean;
  set: (access: Access) => void;
  clear: () => void;
}

export const usePermissionStore = create<PermissionState>((set) => ({
  ...readStored(),
  loaded: false,
  set: (access) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(access));
    set({ ...access, loaded: true });
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ role: null, permissions: [], loaded: false });
  },
}));

/** Remember the role returned at sign-in. */
export const storeAccess = (role: AdminRole, permissions: AdminPermission[]) => usePermissionStore.getState().set({ role, permissions });

/** Re-read the role from the server, so a role change shows up without signing in again. */
export const refreshPermissions = async () => {
  const token = typeof window === "undefined" ? null : localStorage.getItem("admin_token");
  if (!token) return;
  try {
    const res = await fetch(`${apiUrl}/profile`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
    if (!res.ok) return;
    const body = await res.json();
    if (body?.data?.role) usePermissionStore.getState().set({ role: body.data.role, permissions: body.data.permissions ?? [] });
  } catch {}
};

/** `can("vendor.decide")` for hiding or disabling controls. */
export function usePermissions() {
  const { role, permissions, loaded } = usePermissionStore();
  return {
    role,
    loaded,
    can: (permission: AdminPermission) => permissions.includes(permission),
  };
}

export const REASON_FOR_DENIED = "Your role does not allow this action.";

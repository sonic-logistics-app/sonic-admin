"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import { AdminPermission, ROLE_LABELS, usePermissions } from "@/lib/auth/permissions";

interface Props {
  permission: AdminPermission;
  /** What the page is for, used in the message ("Only Operations and Super Admin can create business partners"). */
  what: string;
  children: React.ReactNode;
}

/**
 * Shows a page only to roles that hold the permission. Anyone else sees a plain explanation and a way back.
 * The server refuses the same actions regardless, so this is about a clear screen, not security.
 */
export default function PermissionGate({ permission, what, children }: Props) {
  const router = useRouter();
  const { can, role, loaded } = usePermissions();

  // The role is read from sign-in storage straight away; until it is known show nothing, not a flash of "not allowed"
  if (!role && !loaded) return null;
  if (can(permission)) return <>{children}</>;

  return (
    <div className="max-w-md mx-auto text-center py-20 space-y-3">
      <i className="pi pi-lock text-[28px] text-[#9CA3AF]" />
      <h1 className="text-[18px] font-semibold text-[#111827]">Not available for your role</h1>
      <p className="text-[13px] text-[#525866]">
        {role ? `You are signed in as ${ROLE_LABELS[role]}. ` : ""}Your role cannot {what}. Ask a Super Admin if you need access.
      </p>
      <Button variant="outline" onClick={() => router.back()}>
        Go back
      </Button>
    </div>
  );
}

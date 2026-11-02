"use client";

// TEMPORARY clean-up page. Remove together with the backend kyc-cleanup controller once
// the mismatched vendors are fixed. It is not linked from the menu: open /kyc-cleanup directly.

import { useState, useEffect, useRef, useCallback } from "react";
import VendorService, { KycMismatchVendor } from "@/services/VendorService";
import Button from "@/components/shared/Button";
import StatusBadge from "@/components/shared/StatusBadge";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import SkeletonLoader from "@/components/shared/SkeletonLoader";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

export default function KycCleanupPage() {
  const toast = useRef<ToastRef>(null);
  const service = useRef(new VendorService()).current;

  const [vendors, setVendors] = useState<KycMismatchVendor[]>([]);
  const [checked, setChecked] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await service.listKycMismatches();
      setVendors(data.vendors);
      setChecked(data.checked);
      setSelected(new Set());
    } catch (error: any) {
      toast.current?.show({ severity: "error", summary: "Error", detail: error.message || "Failed to load vendors", life: 4000 });
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    load();
  }, [load]);

  const allSelected = vendors.length > 0 && selected.size === vendors.length;
  const activeSelected = vendors.filter((v) => selected.has(v.id) && v.status === "active").length;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(vendors.map((v) => v.id)));

  const doReset = async () => {
    try {
      setResetting(true);
      const result = await service.resetKycMismatches(Array.from(selected));
      toast.current?.show({
        severity: "success",
        summary: "KYC reset",
        detail: `${result.reset} vendor(s) reset to pending${result.skipped ? `, ${result.skipped} skipped (already fixed)` : ""}`,
        life: 4000,
      });
      await load();
    } catch (error: any) {
      toast.current?.show({ severity: "error", summary: "Reset failed", detail: error.message || "Could not reset", life: 4000 });
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={confirmOpen}
        onHide={() => setConfirmOpen(false)}
        onConfirm={doReset}
        title="Reset KYC status"
        message={`Set KYC status to "pending" for ${selected.size} vendor(s)? This only changes the status label. It does not change their account status, so active vendors stay active.${
          activeSelected > 0 ? ` ${activeSelected} of them are already active.` : ""
        }`}
        confirmLabel="Reset to pending"
        confirmVariant="danger"
        icon="pi-exclamation-triangle"
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-[#111827]">KYC status clean-up</h1>
            <p className="text-[13px] text-[#525866] max-w-3xl">
              Temporary tool. These vendors have KYC marked <strong>completed</strong> but no BVN or NIN on file, so the
              status is not backed by any identity data and they cannot be approved. Resetting sets the status back to
              <strong> pending</strong> so the vendor can verify properly in the vendor app.
            </p>
          </div>
          <Button variant="outline" icon="pi pi-refresh" onClick={load} disabled={loading || resetting}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <SkeletonLoader type="table" rows={6} />
        ) : vendors.length === 0 ? (
          <div className="border border-[#E1E4EA] rounded-lg bg-white p-10 text-center">
            <i className="pi pi-check-circle text-green-600 text-3xl mb-2" />
            <p className="text-[14px] text-[#111827] font-semibold">No mismatched vendors</p>
            <p className="text-[13px] text-[#525866]">Checked {checked} vendor(s) marked completed. All have a BVN or NIN.</p>
          </div>
        ) : (
          <div className="border border-[#E1E4EA] rounded-lg bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E1E4EA]">
              <p className="text-[13px] text-[#525866]">
                <strong className="text-[#111827]">{vendors.length}</strong> of {checked} completed vendor(s) have no BVN/NIN.{" "}
                {selected.size} selected.
              </p>
              <Button
                variant="danger"
                icon="pi pi-undo"
                disabled={selected.size === 0 || resetting}
                loading={resetting}
                onClick={() => setConfirmOpen(true)}
              >
                Reset selected to pending
              </Button>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#525866] bg-[#F9FAFB]">
                  <th className="px-4 py-2 w-10">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
                  </th>
                  <th className="px-4 py-2">Vendor</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Account status</th>
                  <th className="px-4 py-2">KYC status</th>
                  <th className="px-4 py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id} className="border-t border-[#E1E4EA]">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(v.id)}
                        onChange={() => toggle(v.id)}
                        aria-label={`Select ${v.name}`}
                      />
                    </td>
                    <td className="px-4 py-2 font-medium text-[#111827]">{v.name}</td>
                    <td className="px-4 py-2">{v.email || "N/A"}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={v.kyc_status} />
                    </td>
                    <td className="px-4 py-2">{formatDate(v.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import DeletedAccountsService, { DeletedAccount, DeletedKind } from "@/lib/api/admin/deleted";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import Button from "@/components/shared/Button";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import { useDebounce } from "@/hooks/useDebounce";

const TABS: { kind: DeletedKind; label: string; singular: string }[] = [
  { kind: "vendors", label: "Vendors", singular: "vendor" },
  { kind: "users", label: "Customers", singular: "customer" },
  { kind: "drivers", label: "Drivers", singular: "driver" },
];

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "N/A";

export default function DeletedAccountsPage() {
  const toast = useRef<ToastRef>(null);
  const service = useRef(new DeletedAccountsService()).current;

  const [kind, setKind] = useState<DeletedKind>("vendors");
  const [rows, setRows] = useState<DeletedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [confirm, setConfirm] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: "danger" | "success";
    onConfirm: () => void;
  }>({ visible: false, title: "", message: "", confirmLabel: "Confirm", variant: "success", onConfirm: () => {} });

  const tab = TABS.find((t) => t.kind === kind)!;

  const load = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        const result = await service.list(kind, { page, limit: 20, search: debouncedSearch || undefined });
        setRows(result.data);
        setPagination((prev) => ({ ...prev, page, total: result.meta.total }));
      } catch (error: any) {
        toast.current?.show({ severity: "error", summary: "Error", detail: error.message || "Failed to load deleted accounts", life: 3000 });
      } finally {
        setInitialLoad(false);
        setLoading(false);
      }
    },
    [kind, debouncedSearch, service],
  );

  // A new tab or a new search starts from page 1
  useEffect(() => {
    load(1);
  }, [load]);

  const changePage = (next: { page: number; limit: number; total: number }) => {
    if (next.page !== pagination.page) load(next.page);
  };

  const askRestore = (account: DeletedAccount) =>
    setConfirm({
      visible: true,
      title: `Restore ${tab.singular}`,
      message:
        kind === "vendors"
          ? `Restore ${account.name}? They come back as inactive and closed, so you must activate them before they go live.`
          : `Restore ${account.name}? They will be able to sign in again.`,
      confirmLabel: "Restore",
      variant: "success",
      onConfirm: async () => {
        try {
          await service.restore(kind, account.id);
          toast.current?.show({ severity: "success", summary: "Restored", detail: `${account.name} has been restored`, life: 3000 });
          load(pagination.page);
        } catch (error: any) {
          toast.current?.show({ severity: "error", summary: "Restore failed", detail: error.message || "Could not restore", life: 4000 });
        }
      },
    });

  const askDeleteForever = (account: DeletedAccount) =>
    setConfirm({
      visible: true,
      title: `Delete ${tab.singular} forever`,
      message: `Permanently delete ${account.name}? This removes the account from the database and cannot be undone.`,
      confirmLabel: "Delete forever",
      variant: "danger",
      onConfirm: async () => {
        try {
          await service.deleteForever(kind, account.id);
          toast.current?.show({ severity: "success", summary: "Deleted", detail: `${account.name} was permanently deleted`, life: 3000 });
          load(pagination.page);
        } catch (error: any) {
          toast.current?.show({ severity: "error", summary: "Delete failed", detail: error.message || "Could not delete", life: 4000 });
        }
      },
    });

  const columns = [
    { field: "name", header: "Name", body: (r: DeletedAccount) => <span className="font-medium text-[#111827]">{r.name}</span> },
    { field: "short_code", header: "Code", body: (r: DeletedAccount) => <span className="font-mono text-[12px]">{r.short_code || "—"}</span> },
    { field: "email", header: "Email", body: (r: DeletedAccount) => r.email || "N/A" },
    { field: "phone", header: "Phone", body: (r: DeletedAccount) => r.phone || "N/A" },
    { field: "deleted_at", header: "Deleted on", body: (r: DeletedAccount) => formatDate(r.deleted_at) },
    {
      field: "actions",
      header: "Actions",
      body: (r: DeletedAccount) => (
        <div className="flex items-center gap-2">
          <Button variant="success" size="sm" icon="pi pi-replay" onClick={() => askRestore(r)}>
            Restore
          </Button>
          <Button variant="danger" size="sm" icon="pi pi-trash" onClick={() => askDeleteForever(r)}>
            Delete forever
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={confirm.visible}
        onHide={() => setConfirm((prev) => ({ ...prev, visible: false }))}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        confirmVariant={confirm.variant}
        icon={confirm.variant === "danger" ? "pi-exclamation-triangle" : "pi-check-circle"}
      />

      <div className="flex flex-col gap-4 h-full min-h-0">
        <div>
          <h1 className="text-[24px] font-bold text-[#111827]">Deleted accounts</h1>
          <p className="text-[13px] text-[#525866]">Accounts removed with a soft delete. Restore them or delete them permanently.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div role="tablist" aria-label="Account type" className="inline-flex rounded-lg border border-[#E1E4EA] bg-white p-1">
            {TABS.map((t) => (
              <button
                key={t.kind}
                role="tab"
                aria-selected={kind === t.kind}
                onClick={() => {
                  setKind(t.kind);
                  setSearchQuery("");
                }}
                className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  kind === t.kind ? "bg-[#2563EB] text-white" : "text-[#525866] hover:text-[#111827]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex-1 min-w-[250px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`Search deleted ${tab.label.toLowerCase()} by name, code, email or phone...`}
            />
          </div>
        </div>

        {initialLoad && loading ? (
          <SkeletonLoader type="table" rows={8} />
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPaginationChange={changePage}
            emptyMessage={`No deleted ${tab.label.toLowerCase()}`}
            className="flex-1 min-h-0"
          />
        )}
      </div>
    </>
  );
}

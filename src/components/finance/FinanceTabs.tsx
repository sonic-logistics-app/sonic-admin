"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import StatusBadge from "@/components/shared/StatusBadge";
import Toast, { ToastRef } from "@/components/shared/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import { Payout, WalletRow, getPayouts, getWallets } from "@/lib/api/admin/ops";

const naira = (value: number) => `₦${value.toLocaleString("en-NG")}`;
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—");

/** Vendor payouts, read only. Nothing here pays or retries a payout. */
export function PayoutsTab() {
  const toast = useRef<ToastRef>(null);
  const [rows, setRows] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<{ status: string; count: number; net_amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 500);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const load = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        const result = await getPayouts({ page, limit: 20, status: status || undefined, search: debounced || undefined });
        setRows(result.data.payouts);
        setSummary(result.data.summary);
        setPagination((prev) => ({ ...prev, page, total: result.meta?.total ?? 0 }));
      } catch (error: any) {
        toast.current?.show({ severity: "error", summary: "Error", detail: error.message || "Failed to load payouts", life: 4000 });
      } finally {
        setLoading(false);
      }
    },
    [status, debounced],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const columns = [
    { field: "vendor_name", header: "Vendor", body: (r: Payout) => <span className="font-medium text-[#111827]">{r.vendor_name || "Unknown"}</span> },
    { field: "period", header: "Period", body: (r: Payout) => `${day(r.period_start_date)} to ${day(r.period_end_date)}` },
    { field: "orders_count", header: "Orders" },
    { field: "gross_amount", header: "Gross", body: (r: Payout) => naira(r.gross_amount) },
    { field: "fees", header: "Fees", body: (r: Payout) => naira(r.commission_amount + r.processing_fee) },
    { field: "net_amount", header: "Net", body: (r: Payout) => <span className="font-semibold">{naira(r.net_amount)}</span> },
    {
      field: "status",
      header: "Status",
      body: (r: Payout) => (
        <div>
          <StatusBadge status={r.status} />
          {r.failure_reason && <p className="text-[11px] text-[#DC2626] mt-1 max-w-[220px]">{r.failure_reason}</p>}
        </div>
      ),
    },
    { field: "processed_date", header: "Paid on", body: (r: Payout) => day(r.processed_date) },
    { field: "provider_reference", header: "Provider reference", body: (r: Payout) => <span className="font-mono text-[11px]">{r.provider_reference || "—"}</span> },
  ];

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <Toast ref={toast} />
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {summary.map((s) => (
          <button
            key={s.status}
            type="button"
            onClick={() => setStatus(status === s.status ? "" : s.status)}
            className={`text-left border rounded-lg p-3 ${status === s.status ? "border-[#2563EB] bg-[#F8FAFF]" : "border-[#E1E4EA] bg-white"}`}
          >
            <p className="text-[11px] uppercase tracking-wider text-[#525866]">{s.status} ({s.count})</p>
            <p className="text-[16px] font-bold text-[#111827]">{naira(s.net_amount)}</p>
          </button>
        ))}
      </div>
      <div className="flex-1 min-w-[250px]">
        <SearchBar value={search} onChange={setSearch} placeholder="Search payouts by vendor name..." />
      </div>
      <DataTable
        data={rows}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPaginationChange={(next) => next.page !== pagination.page && load(next.page)}
        emptyMessage="No payouts found"
        className="flex-1 min-h-0"
      />
    </div>
  );
}

/** Wallet balances for vendors and drivers, read only. */
export function WalletsTab() {
  const toast = useRef<ToastRef>(null);
  const [type, setType] = useState<"vendor" | "driver">("vendor");
  const [rows, setRows] = useState<WalletRow[]>([]);
  const [totals, setTotals] = useState({ wallets: 0, total_balance: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 500);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const load = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        const result = await getWallets({ type, page, limit: 20, search: debounced || undefined });
        setRows(result.data.wallets);
        setTotals(result.data.summary);
        setPagination((prev) => ({ ...prev, page, total: result.meta?.total ?? 0 }));
      } catch (error: any) {
        toast.current?.show({ severity: "error", summary: "Error", detail: error.message || "Failed to load wallets", life: 4000 });
      } finally {
        setLoading(false);
      }
    },
    [type, debounced],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const columns = [
    { field: "owner_name", header: type === "vendor" ? "Vendor" : "Driver", body: (r: WalletRow) => <span className="font-medium text-[#111827]">{r.owner_name}</span> },
    { field: "owner_email", header: "Email", body: (r: WalletRow) => r.owner_email || "N/A" },
    { field: "balance", header: "Balance", body: (r: WalletRow) => <span className="font-semibold">{naira(r.balance)}</span> },
    { field: "updated_at", header: "Last updated", body: (r: WalletRow) => day(r.updated_at) },
  ];

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <Toast ref={toast} />
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Wallet type" className="inline-flex rounded-lg border border-[#E1E4EA] bg-white p-1">
          {(["vendor", "driver"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={type === t}
              onClick={() => {
                setType(t);
                setSearch("");
              }}
              className={`px-4 py-1.5 rounded-md text-[13px] font-medium capitalize ${type === t ? "bg-[#2563EB] text-white" : "text-[#525866] hover:text-[#111827]"}`}
            >
              {t} wallets
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[250px]">
          <SearchBar value={search} onChange={setSearch} placeholder={`Search ${type} wallets by name...`} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="border border-[#E1E4EA] rounded-lg p-3 bg-white">
          <p className="text-[11px] uppercase tracking-wider text-[#525866]">Wallets</p>
          <p className="text-[18px] font-bold text-[#111827]">{totals.wallets}</p>
        </div>
        <div className="border border-[#E1E4EA] rounded-lg p-3 bg-white">
          <p className="text-[11px] uppercase tracking-wider text-[#525866]">Money held (owed out)</p>
          <p className="text-[18px] font-bold text-[#111827]">{naira(totals.total_balance)}</p>
        </div>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPaginationChange={(next) => next.page !== pagination.page && load(next.page)}
        emptyMessage="No wallets found"
        className="flex-1 min-h-0"
      />
    </div>
  );
}

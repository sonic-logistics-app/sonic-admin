"use client";

import StatCards from "@/components/shared/StatCards";
import { useCallback, useEffect, useRef, useState } from "react";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import StatusBadge from "@/components/shared/StatusBadge";
import { displayTerm } from "@/lib/terms";
import CellStack from "@/components/shared/CellStack";
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
      } catch (error) {
        toast.current?.show({ severity: "error", summary: "Error", detail: (error as Error).message || "Failed to load payouts", life: 4000 });
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
    {
      field: "vendor_name",
      header: "Business Partner / period",
      body: (r: Payout) => (
        <CellStack primary={r.vendor_name || "Unknown"} secondary={`${day(r.period_start_date)} to ${day(r.period_end_date)}`} />
      ),
    },
    {
      field: "gross_amount",
      header: "Orders / gross",
      body: (r: Payout) => (
        <CellStack
          primary={naira(r.gross_amount)}
          secondary={`${r.orders_count} orders`}
          tertiary={`Fees ${naira(r.commission_amount + r.processing_fee)}`}
        />
      ),
    },
    { field: "net_amount", header: "Net", body: (r: Payout) => <span className="font-semibold">{naira(r.net_amount)}</span> },
    {
      field: "status",
      header: "Status / paid on",
      body: (r: Payout) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={r.status} />
          <span className="text-[11px] text-[#525866]">{r.processed_date ? `Paid ${day(r.processed_date)}` : "Not paid yet"}</span>
          {r.failure_reason && <p className="text-[11px] text-[#DC2626] max-w-[220px]">{r.failure_reason}</p>}
        </div>
      ),
    },
    { field: "provider_reference", header: "Provider reference", body: (r: Payout) => <span className="font-mono text-[11px]">{r.provider_reference || "—"}</span> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Toast ref={toast} />
      <h1 className="text-[24px] font-bold text-[#111827]">Business Partner Payouts</h1>
      <StatCards
        cards={summary.map((s) => ({
          key: s.status,
          label: `${s.status} (${s.count})`,
          text: naira(s.net_amount),
          active: status === s.status,
          onClick: () => setStatus(status === s.status ? "" : s.status),
        }))}
      />
      <div className="flex-1 min-w-[250px]">
        <SearchBar value={search} onChange={setSearch} placeholder="Search payouts by business partner name..." />
      </div>
      <DataTable
        data={rows}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPaginationChange={(next) => next.page !== pagination.page && load(next.page)}
        emptyMessage="No payouts found"
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
      } catch (error) {
        toast.current?.show({ severity: "error", summary: "Error", detail: (error as Error).message || "Failed to load wallets", life: 4000 });
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
    {
      field: "owner_name",
      header: displayTerm(type),
      body: (r: WalletRow) => <CellStack primary={r.owner_name} secondary={r.owner_email || "N/A"} />,
    },
    {
      field: "balance",
      header: "Balance / updated",
      body: (r: WalletRow) => <CellStack primary={naira(r.balance)} secondary={`Updated ${day(r.updated_at)}`} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Toast ref={toast} />
      <h1 className="text-[24px] font-bold text-[#111827]">Wallets</h1>
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
              className={`px-4 py-2.5 lg:py-1.5 rounded-md text-[13px] font-medium ${type === t ? "bg-[#2563EB] text-white" : "text-[#525866] hover:text-[#111827]"}`}
            >
              {displayTerm(t)} wallets
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[250px]">
          <SearchBar value={search} onChange={setSearch} placeholder={`Search ${displayTerm(type).toLowerCase()} wallets by name...`} />
        </div>
      </div>
      <StatCards
        cards={[
          { key: "wallets", label: "Wallets", value: totals.wallets },
          { key: "held", label: "Money held (owed out)", text: naira(totals.total_balance) },
        ]}
      />
      <DataTable
        data={rows}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPaginationChange={(next) => next.page !== pagination.page && load(next.page)}
        emptyMessage="No wallets found"
      />
    </div>
  );
}

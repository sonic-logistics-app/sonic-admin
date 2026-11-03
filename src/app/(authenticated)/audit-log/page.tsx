"use client";

import PermissionGate from "@/components/auth/PermissionGate";
import { displayAction, displayTerm } from "@/lib/terms";
import { useState, useEffect, useRef, useCallback } from "react";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import Toast, { ToastRef } from "@/components/shared/Toast";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import { useDebounce } from "@/hooks/useDebounce";
import { AuditLog, getAuditLogs } from "@/lib/api/admin/ops";

const ENTITY_TYPES = ["vendor", "user", "driver", "order", "voucher", "faq", "refund", "seed", "support", "tickets"];

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Africa/Lagos" });

const actionLabel = displayAction;

function AuditLogPageInner() {
  const toast = useRef<ToastRef>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [entityType, setEntityType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0 });
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        const result = await getAuditLogs({
          page,
          limit: 25,
          search: debouncedSearch || undefined,
          entity_type: entityType || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        });
        setLogs(result.data.logs);
        setPagination((prev) => ({ ...prev, page, total: result.meta?.total ?? result.data.logs.length }));
      } catch (error) {
        toast.current?.show({ severity: "error", summary: "Error", detail: (error as Error).message || "Failed to load audit log", life: 4000 });
      } finally {
        setInitialLoad(false);
        setLoading(false);
      }
    },
    [debouncedSearch, entityType, dateFrom, dateTo],
  );

  // A new filter starts from page 1
  useEffect(() => {
    load(1);
  }, [load]);

  const columns = [
    { field: "created_at", header: "When (Lagos)", body: (r: AuditLog) => <span className="whitespace-nowrap">{when(r.created_at)}</span> },
    { field: "admin_email", header: "Admin", body: (r: AuditLog) => r.admin_email || "Unknown" },
    {
      field: "action",
      header: "Action",
      body: (r: AuditLog) => <span className="text-[12px] px-2 py-1 rounded-full bg-[#EEF2FF] text-[#3730A3] font-semibold capitalize">{actionLabel(r.action)}</span>,
    },
    {
      field: "entity_id",
      header: "Target",
      body: (r: AuditLog) => (
        <div>
          <p className="text-[13px] text-[#111827]">{r.entity_name || displayTerm(r.entity_type)}</p>
          {r.entity_id && <p className="text-[11px] font-mono text-[#9CA3AF]">{r.entity_id}</p>}
        </div>
      ),
    },
    {
      field: "reason",
      header: "Reason / details",
      body: (r: AuditLog) => (
        <div className="max-w-[360px]">
          <p className="text-[13px] text-[#525866]">{r.reason || "—"}</p>
          {r.metadata && Object.keys(r.metadata).length > 0 && (
            <button
              type="button"
              className="text-[11px] text-[#2563EB] hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setOpenId(openId === r.id ? null : r.id);
              }}
            >
              {openId === r.id ? "Hide request details" : "Show request details"}
            </button>
          )}
          {openId === r.id && (
            <pre className="mt-2 p-2 bg-[#F9FAFB] rounded text-[11px] text-[#525866] whitespace-pre-wrap break-all">
              {JSON.stringify(r.metadata, null, 2)}
            </pre>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Toast ref={toast} />
      <div className="flex flex-col gap-4 h-full min-h-0">
        <div>
          <h1 className="text-[24px] font-bold text-[#111827]">Audit log</h1>
          <p className="text-[13px] text-[#525866]">
            Every change an admin makes, with who did it and when. Sensitive values (passwords, tokens, BVN, NIN, account numbers) are never stored.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[250px]">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by action, admin email, reason or id..." />
          </div>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] bg-white focus:outline-none focus:border-[#2563EB]"
          >
            <option value="">All areas</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>{displayTerm(t)}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-[12px] text-[#525866]">
            From
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] bg-white" />
          </label>
          <label className="flex items-center gap-2 text-[12px] text-[#525866]">
            To
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] bg-white" />
          </label>
        </div>

        {initialLoad && loading ? (
          <SkeletonLoader type="table" rows={10} />
        ) : (
          <DataTable
            data={logs}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPaginationChange={(next) => next.page !== pagination.page && load(next.page)}
            emptyMessage="No admin actions recorded yet. Actions taken from now on appear here."
            className="flex-1 min-h-0"
          />
        )}
      </div>
    </>
  );
}

export default function AuditLogPage() {
  return (
    <PermissionGate permission="audit.read" what="open the audit log">
      <AuditLogPageInner />
    </PermissionGate>
  );
}

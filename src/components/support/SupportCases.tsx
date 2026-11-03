"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/shared/Button";
import SearchBar from "@/components/shared/SearchBar";
import Toast, { ToastRef } from "@/components/shared/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Ticket,
  TicketList,
  TicketPriority,
  TicketStatus,
  addTicketNote,
  getTicket,
  getTickets,
  replyToTicket,
  updateTicket,
} from "@/lib/api/admin/ops";

const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const STATUS_STYLE: Record<TicketStatus, string> = {
  OPEN: "bg-[#FEE2E2] text-[#991B1B]",
  IN_PROGRESS: "bg-[#FEF3C7] text-[#92400E]",
  RESOLVED: "bg-[#D1FAE5] text-[#065F46]",
  CLOSED: "bg-[#F3F4F6] text-[#525866]",
};

const PRIORITY_STYLE: Record<TicketPriority, string> = {
  LOW: "text-[#525866]",
  MEDIUM: "text-[#2563EB]",
  HIGH: "text-[#D97706]",
  URGENT: "text-[#DC2626]",
};

const label = (value: string) => value.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

const duration = (minutes: number | null) => {
  if (minutes === null) return "—";
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 60 * 48) return `${Math.round(minutes / 60)} h`;
  return `${Math.round(minutes / 1440)} days`;
};

export default function SupportCases() {
  const toast = useRef<ToastRef>(null);
  const [data, setData] = useState<TicketList | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [assignee, setAssignee] = useState<string>("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [sending, setSending] = useState(false);
  const [assignDraft, setAssignDraft] = useState("");

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getTickets({
        limit: 50,
        status: status || undefined,
        priority: priority || undefined,
        assigned_to: assignee || undefined,
        search: debouncedSearch || undefined,
      });
      setData(result.data);
    } catch (error: any) {
      toast.current?.show({ severity: "error", summary: "Error", detail: error.message || "Failed to load cases", life: 4000 });
    } finally {
      setLoading(false);
    }
  }, [status, priority, assignee, debouncedSearch]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const open = async (id: string) => {
    try {
      const { data: detail } = await getTicket(id);
      setSelected(detail.ticket);
      setAssignDraft(detail.ticket.assigned_to ?? "");
      setMessage("");
      setMode("reply");
    } catch (error: any) {
      toast.current?.show({ severity: "error", summary: "Error", detail: error.message, life: 4000 });
    }
  };

  const change = async (body: Parameters<typeof updateTicket>[1]) => {
    if (!selected) return;
    try {
      await updateTicket(selected.id, body);
      await open(selected.id);
      loadList();
    } catch (error: any) {
      toast.current?.show({ severity: "error", summary: "Could not update", detail: error.message, life: 4000 });
    }
  };

  const send = async () => {
    if (!selected || !message.trim()) return;
    try {
      setSending(true);
      if (mode === "reply") await replyToTicket(selected.id, message);
      else await addTicketNote(selected.id, message);
      setMessage("");
      await open(selected.id);
      loadList();
    } catch (error: any) {
      toast.current?.show({ severity: "error", summary: "Could not send", detail: error.message, life: 4000 });
    } finally {
      setSending(false);
    }
  };

  const summary = data?.summary;

  return (
    <div className="flex flex-col gap-4">
      <Toast ref={toast} />

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(status === s ? "" : s)}
              className={`text-left border rounded-lg p-3 ${status === s ? "border-[#2563EB] bg-[#F8FAFF]" : "border-[#E1E4EA] bg-white"}`}
            >
              <p className="text-[11px] uppercase tracking-wider text-[#525866]">{label(s)}</p>
              <p className="text-[20px] font-bold text-[#111827]">{summary.by_status[s]}</p>
            </button>
          ))}
          <div className="border border-[#E1E4EA] rounded-lg p-3 bg-white">
            <p className="text-[11px] uppercase tracking-wider text-[#525866]">Avg first reply</p>
            <p className="text-[20px] font-bold text-[#111827]">{duration(summary.avg_first_response_minutes)}</p>
          </div>
          <div className="border border-[#E1E4EA] rounded-lg p-3 bg-white">
            <p className="text-[11px] uppercase tracking-wider text-[#525866]">Avg resolution</p>
            <p className="text-[20px] font-bold text-[#111827]">{duration(summary.avg_resolution_minutes)}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by subject, description or business..." />
        </div>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#525866] bg-white">
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{label(p)}</option>
          ))}
        </select>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#525866] bg-white">
          <option value="">Anyone</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 border border-[#E1E4EA] rounded-lg bg-white overflow-hidden max-h-[640px] overflow-y-auto">
          {loading && !data ? (
            <p className="p-4 text-[13px] text-[#525866]">Loading cases...</p>
          ) : data && data.tickets.length > 0 ? (
            data.tickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => open(t.id)}
                className={`w-full text-left px-4 py-3 border-b border-[#E1E4EA] hover:bg-[#F9FAFB] ${selected?.id === t.id ? "bg-[#F8FAFF]" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-[#111827] truncate">{t.subject}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${STATUS_STYLE[t.status]}`}>{label(t.status)}</span>
                </div>
                <p className="text-[12px] text-[#525866] truncate">{t.vendor.name}</p>
                <p className="text-[11px] text-[#9CA3AF]">
                  <span className={`font-semibold ${PRIORITY_STYLE[t.priority]}`}>{label(t.priority)}</span> · {t.message_count ?? 0} messages ·{" "}
                  {t.assigned_to ? `Assigned to ${t.assigned_to}` : "Unassigned"} · {when(t.updated_at)}
                </p>
              </button>
            ))
          ) : (
            <p className="p-6 text-center text-[13px] text-[#525866]">No cases match.</p>
          )}
        </div>

        <div className="lg:col-span-3 border border-[#E1E4EA] rounded-lg bg-white p-4 min-h-[300px]">
          {!selected ? (
            <p className="text-[13px] text-[#525866] text-center py-16">Select a case to read it and reply.</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-[16px] font-semibold text-[#111827]">{selected.subject}</h3>
                <p className="text-[12px] text-[#525866]">
                  {selected.vendor.name}
                  {selected.vendor.email ? ` · ${selected.vendor.email}` : ""}
                  {selected.vendor.phone ? ` · ${selected.vendor.phone}` : ""} · opened {when(selected.created_at)}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 items-end">
                <label className="text-[11px] uppercase tracking-wider text-[#525866]">
                  Status
                  <select value={selected.status} onChange={(e) => change({ status: e.target.value as TicketStatus })} className="block mt-1 px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] bg-white normal-case">
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{label(s)}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[11px] uppercase tracking-wider text-[#525866]">
                  Priority
                  <select value={selected.priority} onChange={(e) => change({ priority: e.target.value as TicketPriority })} className="block mt-1 px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] bg-white normal-case">
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{label(p)}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[11px] uppercase tracking-wider text-[#525866]">
                  Assigned to
                  <span className="flex gap-2 mt-1">
                    <input
                      value={assignDraft}
                      onChange={(e) => setAssignDraft(e.target.value)}
                      placeholder="Name or email"
                      className="px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] bg-white normal-case w-44"
                    />
                    <Button size="sm" variant="outline" disabled={assignDraft === (selected.assigned_to ?? "")} onClick={() => change({ assigned_to: assignDraft })}>
                      Save
                    </Button>
                  </span>
                </label>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto border-t border-[#E1E4EA] pt-3">
                <div className="bg-[#F3F4F6] rounded-lg p-3">
                  <p className="text-[11px] text-[#525866] mb-1">Original request</p>
                  <p className="text-[13px] text-[#111827] whitespace-pre-wrap">{selected.description}</p>
                </div>
                {(selected.messages ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-lg p-3 ${
                      m.sender === "internal" ? "bg-[#FFFBEB] border border-[#FDE68A]" : m.sender === "support" ? "bg-[#EEF2FF] ml-8" : "bg-[#F3F4F6] mr-8"
                    }`}
                  >
                    <p className="text-[11px] text-[#525866] mb-1">
                      {m.sender === "internal" ? "Internal note (business partner cannot see this)" : m.sender === "support" ? "Support reply" : "Vendor"} · {when(m.created_at)}
                    </p>
                    <p className="text-[13px] text-[#111827] whitespace-pre-wrap">{m.message}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E1E4EA] pt-3 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button size="sm" variant={mode === "reply" ? "primary" : "ghost"} onClick={() => setMode("reply")}>Reply to business partner</Button>
                  <Button size="sm" variant={mode === "note" ? "primary" : "ghost"} onClick={() => setMode("note")}>Internal note</Button>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  disabled={selected.status === "CLOSED" && mode === "reply"}
                  placeholder={mode === "reply" ? "Write a reply the business partner will see..." : "Write a note only your team can see..."}
                  className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]"
                />
                <div>
                  <Button size="sm" disabled={!message.trim() || sending} loading={sending} onClick={send}>
                    {mode === "reply" ? "Send reply" : "Save note"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

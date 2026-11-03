"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/shared/Button";
import { usePermissions } from "@/lib/auth/permissions";
import Toast, { ToastRef } from "@/components/shared/Toast";
import {
  VendorReview,
  VendorReviewEvent,
  addVendorNote,
  flagVendor,
  getVendorReview,
  requestVendorCorrection,
  resolveVendorReviewEvent,
} from "@/lib/api/admin/ops";

const CORRECTION_FIELDS: { value: string; label: string }[] = [
  { value: "business_profile", label: "Business profile" },
  { value: "owner_identity", label: "Owner identity" },
  { value: "bvn_nin", label: "BVN / NIN" },
  { value: "cac_registration", label: "CAC registration" },
  { value: "location_photos", label: "Location photos" },
  { value: "bank_details", label: "Bank details" },
  { value: "logo", label: "Logo" },
  { value: "catalogue", label: "Catalogue" },
  { value: "business_classification", label: "Business classification" },
];

const fieldLabel = (value: string) => CORRECTION_FIELDS.find((f) => f.value === value)?.label ?? value;

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

const TYPE_STYLE: Record<string, { label: string; className: string }> = {
  FLAG: { label: "Suspicion flag", className: "bg-[#FEE2E2] text-[#991B1B]" },
  CORRECTION_REQUEST: { label: "Correction request", className: "bg-[#FEF3C7] text-[#92400E]" },
  NOTE: { label: "Note", className: "bg-[#E0E7FF] text-[#3730A3]" },
};

type Form = "correction" | "flag" | "note" | null;

interface Props {
  vendorId: string;
  /** Called after anything changes so the page can refresh its own counts. */
  onChanged: () => void;
}

export default function VendorReviewPanel({ vendorId, onChanged }: Props) {
  const { can } = usePermissions();
  const toast = useRef<ToastRef>(null);
  const [review, setReview] = useState<VendorReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form>(null);
  const [saving, setSaving] = useState(false);
  const [reason, setReason] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [notify, setNotify] = useState(false);
  const [resolving, setResolving] = useState<{ id: string; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setReview((await getVendorReview(vendorId)).data);
    } catch (error: any) {
      toast.current?.show({ severity: "error", summary: "Error", detail: error.message || "Failed to load review", life: 4000 });
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    load();
  }, [load]);

  const closeForm = () => {
    setForm(null);
    setReason("");
    setFields([]);
    setDueDate("");
    setNotify(false);
  };

  const submit = async () => {
    try {
      setSaving(true);
      let detail = "Review updated";
      if (form === "correction") {
        const { data } = await requestVendorCorrection(vendorId, { fields, reason, due_date: dueDate || undefined, notify });
        if (data.notified) {
          detail = `Saved. Email ${data.notified.email ? "sent" : "could not be sent"}, in-app notice ${data.notified.in_app ? "sent" : "could not be sent"}.`;
        }
      } else if (form === "flag") await flagVendor(vendorId, reason);
      else if (form === "note") await addVendorNote(vendorId, reason);
      toast.current?.show({ severity: "success", summary: "Saved", detail, life: 4000 });
      closeForm();
      await load();
      onChanged();
    } catch (error: any) {
      toast.current?.show({ severity: "error", summary: "Could not save", detail: error.message, life: 4000 });
    } finally {
      setSaving(false);
    }
  };

  const resolve = async () => {
    if (!resolving) return;
    try {
      setSaving(true);
      await resolveVendorReviewEvent(vendorId, resolving.id, resolving.text);
      toast.current?.show({ severity: "success", summary: "Resolved", detail: "Marked as resolved", life: 3000 });
      setResolving(null);
      await load();
      onChanged();
    } catch (error: any) {
      toast.current?.show({ severity: "error", summary: "Could not resolve", detail: error.message, life: 4000 });
    } finally {
      setSaving(false);
    }
  };

  const toggleField = (value: string) => setFields((prev) => (prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]));

  const canSubmit = reason.trim().length > 0 && (form !== "correction" || fields.length > 0);

  const renderEvent = (event: VendorReviewEvent) => {
    const style = TYPE_STYLE[event.type];
    return (
      <div key={event.id} className="border border-[#E1E4EA] rounded-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${style.className}`}>{style.label}</span>
            {event.type !== "NOTE" && (
              <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${event.status === "open" ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#D1FAE5] text-[#065F46]"}`}>
                {event.status === "open" ? "Open" : "Resolved"}
              </span>
            )}
            <span className="text-[11px] text-[#525866]">{when(event.created_at)}</span>
          </div>
          {event.type !== "NOTE" && event.status === "open" && can("vendor.review") && (
            <Button size="sm" variant="outline" onClick={() => setResolving({ id: event.id, text: "" })}>
              Resolve
            </Button>
          )}
        </div>
        <p className="text-[13px] text-[#111827] mt-2">{event.reason}</p>
        {event.fields.length > 0 && (
          <p className="text-[12px] text-[#525866] mt-1">
            Business Partner must fix: <strong>{event.fields.map(fieldLabel).join(", ")}</strong>
            {event.due_date ? ` by ${new Date(event.due_date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}` : ""}
          </p>
        )}
        {event.resolution && <p className="text-[12px] text-[#065F46] mt-2">Resolution: {event.resolution}</p>}
        {resolving?.id === event.id && (
          <div className="mt-3 flex flex-col gap-2">
            <textarea
              value={resolving.text}
              onChange={(e) => setResolving({ id: event.id, text: e.target.value })}
              placeholder="What was checked or fixed? (required)"
              rows={2}
              className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="success" disabled={!resolving.text.trim() || saving} loading={saving} onClick={resolve}>
                Mark resolved
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setResolving(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Toast ref={toast} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">Review actions</h3>
          <p className="text-[13px] text-[#525866]">
            Corrections and notes are recorded here. A correction request only reaches the business partner if you tick "Notify the business partner" when saving it.
          </p>
        </div>
        {!can("vendor.review") && <p className="text-[12px] text-[#525866]">Your role can read the review history but not add to it.</p>}
        <div className={`flex gap-2 ${can("vendor.review") ? "" : "hidden"}`}>
          <Button size="sm" variant="outline" onClick={() => setForm("correction")}>Request corrections</Button>
          <Button size="sm" variant="danger" onClick={() => setForm("flag")}>Flag as suspicious</Button>
          <Button size="sm" variant="ghost" onClick={() => setForm("note")}>Add note</Button>
        </div>
      </div>

      {review && review.open_flags > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-[13px] text-red-800">
          {review.open_flags} unresolved suspicion flag{review.open_flags > 1 ? "s" : ""}. <strong>Approval is blocked until each flag is resolved.</strong>
        </div>
      )}

      {form && (
        <div className="border border-[#2563EB] rounded-lg p-4 bg-[#F8FAFF] space-y-3">
          <h4 className="text-[14px] font-semibold text-[#111827]">
            {form === "correction" ? "Request corrections" : form === "flag" ? "Flag as suspicious or duplicate" : "Add a review note"}
          </h4>
          {form === "correction" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CORRECTION_FIELDS.map((f) => (
                  <label key={f.value} className="flex items-center gap-2 text-[13px] text-[#111827]">
                    <input type="checkbox" checked={fields.includes(f.value)} onChange={() => toggleField(f.value)} />
                    {f.label}
                  </label>
                ))}
              </div>
              <label className="flex items-start gap-2 text-[13px] text-[#111827]">
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="mt-1" />
                <span>
                  Notify the business partner now by email and in the app
                  <span className="block text-[11px] text-[#525866]">Leave unticked to record the request only.</span>
                </span>
              </label>
              <label className="block text-[12px] text-[#525866]">
                Due date (optional)
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="block mt-1 px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] bg-white"
                />
              </label>
            </>
          )}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={
              form === "correction" ? "What exactly must the business partner fix? (required)" : form === "flag" ? "Why is this account suspicious or a duplicate? (required)" : "Note (required)"
            }
            className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB] bg-white"
          />
          <div className="flex gap-2">
            <Button size="sm" variant={form === "flag" ? "danger" : "primary"} disabled={!canSubmit || saving} loading={saving} onClick={submit}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={closeForm}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-[15px] font-semibold text-[#111827]">Corrections, flags and notes</h3>
        {loading ? (
          <p className="text-[13px] text-[#525866]">Loading...</p>
        ) : review && review.events.length > 0 ? (
          review.events.map(renderEvent)
        ) : (
          <div className="text-center py-8 bg-[#F9FAFB] rounded-lg text-[13px] text-[#525866]">No corrections, flags or notes yet</div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-[15px] font-semibold text-[#111827]">Decision history</h3>
        {review && review.history.length > 0 ? (
          <ol className="border-l-2 border-[#E1E4EA] ml-2 space-y-3">
            {review.history.map((entry) => (
              <li key={entry.id} className="pl-4 relative">
                <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#2563EB]" />
                <p className="text-[13px] text-[#111827]">
                  <strong>{entry.action.replace("vendor.", "").replace(/-/g, " ")}</strong> by {entry.admin_email ?? "an admin"}
                </p>
                {entry.reason && <p className="text-[12px] text-[#525866]">{entry.reason}</p>}
                <p className="text-[11px] text-[#9CA3AF]">{when(entry.created_at)} (Lagos time)</p>
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-center py-8 bg-[#F9FAFB] rounded-lg text-[13px] text-[#525866]">
            No recorded admin actions for this business partner yet. Actions taken from now on appear here.
          </div>
        )}
      </div>
    </div>
  );
}

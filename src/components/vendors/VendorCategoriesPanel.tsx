"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/shared/Button";
import { BUSINESS_TYPE_OPTIONS, businessTypeLabel } from "@/lib/businessTypes";
import { usePermissions } from "@/lib/auth/permissions";
import { VendorCategories, getVendorCategories, saveVendorCategories } from "@/lib/api/admin/ops";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const names = (list: string[] | undefined) => (list && list.length ? list.map(businessTypeLabel).join(", ") : "none");

interface Props {
  vendorId: string;
  onChanged?: () => void;
}

/**
 * A vendor's primary category plus up to a few extras. The vendor sets the primary one; only a
 * Super Admin changes the extras. The customer app lists the vendor under every one of them.
 */
export default function VendorCategoriesPanel({ vendorId, onChanged }: Props) {
  const { can } = usePermissions();
  const canEdit = can("vendor.categories");
  const [data, setData] = useState<VendorCategories | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<string[] | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const load = useCallback(
    () =>
      getVendorCategories(vendorId)
        .then(({ data: d }) => setData(d))
        .catch((e: Error) => setError(e.message)),
    [vendorId],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="text-[13px] text-[#DC2626]">Categories unavailable: {error}</p>;
  if (!data) return <div className="h-24 rounded-lg border border-[#E1E4EA] bg-white animate-pulse" />;

  const editing = draft !== null;
  const extras = draft ?? data.additional;
  const available = BUSINESS_TYPE_OPTIONS.filter((o) => o.value !== data.primary && !extras.includes(o.value));
  const changed = editing && (draft!.length !== data.additional.length || draft!.some((c) => !data.additional.includes(c)));
  const everywhere = [data.primary, ...extras].filter(Boolean) as string[];

  const save = async () => {
    try {
      setSaving(true);
      setSaveError("");
      await saveVendorCategories(vendorId, draft!, reason.trim());
      setDraft(null);
      setReason("");
      await load();
      onChanged?.();
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-[#E1E4EA] rounded-lg p-5 bg-white space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">Categories</h3>
          <p className="text-[13px] text-[#525866]">
            The user app shows this business partner under its primary category and under each additional one.
          </p>
        </div>
        {canEdit && !editing && (
          <Button size="sm" variant="outline" onClick={() => setDraft([...data.additional])}>
            Edit additional
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-[#525866]">Primary</span>
        <span className="text-[12px] px-2.5 py-1 rounded-full bg-[#2563EB] text-white font-semibold">{businessTypeLabel(data.primary)}</span>
        <span className="text-[12px] text-[#525866] ml-3">Additional</span>
        {extras.length === 0 && <span className="text-[12px] text-[#9CA3AF]">none</span>}
        {extras.map((c) => (
          <span key={c} className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-medium">
            {businessTypeLabel(c)}
            {editing && (
              <button type="button" aria-label={`Remove ${businessTypeLabel(c)}`} onClick={() => setDraft(draft!.filter((x) => x !== c))}>
                <i className="pi pi-times text-[10px]" />
              </button>
            )}
          </span>
        ))}
      </div>

      {editing && (
        <div className="space-y-3 border-t border-[#E1E4EA] pt-3">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value=""
              disabled={extras.length >= data.max_additional || available.length === 0}
              onChange={(e) => e.target.value && setDraft([...draft!, e.target.value])}
              className="px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] bg-white disabled:opacity-50"
            >
              <option value="">{extras.length >= data.max_additional ? `Limit of ${data.max_additional} reached` : "Add a category…"}</option>
              {available.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="text-[12px] text-[#525866]">Up to {data.max_additional} additional categories.</span>
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Why are the categories changing? (required, saved in the audit log)"
            className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px]"
          />
          {changed && (
            <p className="text-[12px] text-[#525866]">
              {names(data.additional)} <i className="pi pi-arrow-right text-[10px] mx-1" /> {names(draft!)}. After saving, the business partner shows under: {everywhere.map(businessTypeLabel).join(", ")}.
              {!data.live_in_customer_app && " It is not live in the user app yet, so nothing changes for users until it is."}
            </p>
          )}
          {saveError && <p className="text-[13px] text-[#DC2626]">{saveError}</p>}
          <div className="flex gap-2">
            <Button size="sm" loading={saving} disabled={!changed || !reason.trim() || saving} onClick={save}>Save categories</Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft(null);
                setReason("");
                setSaveError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!canEdit && <p className="text-[12px] text-[#9CA3AF]">Only a Super Admin can change a business partner&apos;s additional categories.</p>}

      {data.history.length > 0 && (
        <div className="border-t border-[#E1E4EA] pt-3">
          <h4 className="text-[12px] uppercase tracking-wider text-[#525866] mb-2">Category changes</h4>
          <ul className="space-y-2">
            {data.history.map((h) => (
              <li key={h.id} className="text-[13px] text-[#111827]">
                {names(h.before?.additional)} <i className="pi pi-arrow-right text-[10px] mx-1 text-[#9CA3AF]" /> {names(h.after?.additional)}
                <span className="block text-[12px] text-[#525866]">
                  {h.reason} · {h.admin_email ?? "unknown admin"} · {when(h.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

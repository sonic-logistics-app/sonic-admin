"use client";

import { useEffect, useState } from "react";
import Button from "@/components/shared/Button";
import {
  BroadcastApiError,
  BroadcastConfig,
  BroadcastRecord,
  RetryPreview,
  previewRetry,
  retryBroadcast,
} from "@/lib/api/admin/broadcast";
import { channelLabel, formatNaira } from "@/lib/broadcast";

interface Props {
  /** The broadcast to retry; null keeps the dialog closed */
  record: BroadcastRecord | null;
  config: BroadcastConfig | null;
  onClose: () => void;
  onStarted: (record: BroadcastRecord) => void;
}

const people = (n: number) => `${n.toLocaleString("en-NG")} ${n === 1 ? "person" : "people"}`;

/**
 * Sends the same message again, but only to the people it failed for, and only on the channel it failed on.
 * Same rules as a first send: fresh numbers, the SMS charge spelled out and ticked.
 */
export default function RetryFailedModal({ record, config, onClose, onStarted }: Props) {
  const [preview, setPreview] = useState<RetryPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [smsAck, setSmsAck] = useState(false);
  const [sending, setSending] = useState(false);

  const open = !!record;

  useEffect(() => {
    if (!record) return;
    setPreview(null);
    setError(null);
    setNotice(null);
    setSmsAck(false);
    setLoading(true);
    let cancelled = false;
    previewRetry(record.id)
      .then((res) => !cancelled && setPreview(res.data))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [record]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !sending && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, sending, onClose]);

  if (!record) return null;

  const wantsSms = (preview?.counts.sms ?? 0) > 0;
  const smsOverLimit = !!config && (preview?.counts.sms ?? 0) > config.max_sms_recipients;
  const nothing = !!preview && preview.channels.length === 0;
  const canSend = !!preview && !loading && !sending && !nothing && !smsOverLimit && (!wantsSms || smsAck);

  const submit = async () => {
    if (!preview || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await retryBroadcast(record.id, {
        confirm: { ...preview.counts, sms_segments: preview.sms?.total_segments },
        confirm_sms: wantsSms && smsAck,
        attempt: preview.attempt,
      });
      onStarted(res.data);
    } catch (e) {
      if (e instanceof BroadcastApiError && e.code === "AUDIENCE_CHANGED" && e.counts) {
        setPreview((prev) =>
          prev
            ? {
                ...prev,
                counts: e.counts!,
                channels: (["email", "sms", "in_app"] as const).filter((c) => e.counts![c] > 0),
                sms: prev.sms && e.smsSegments !== undefined ? { ...prev.sms, total_segments: e.smsSegments } : prev.sms,
              }
            : prev,
        );
        setSmsAck(false);
        setNotice("The people to retry changed while you were reviewing. Check the new numbers below and confirm again. Nothing was sent.");
      } else {
        setError((e as Error).message);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="retry-title">
      <div className="absolute inset-0 bg-black/40" onClick={() => !sending && onClose()} />
      <div className="relative bg-white rounded-2xl border border-[#E1E4EA] w-full max-w-lg max-h-[92vh] flex flex-col shadow-xl">
        <div className="flex items-center gap-3 p-5 border-b border-[#E1E4EA]">
          <i className="pi pi-replay text-2xl text-[#2563EB]" />
          <h2 id="retry-title" className="text-[18px] font-semibold text-[#111827]">
            Retry the ones that failed
          </h2>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-[13px] text-[#525866]">
            “{record.title}” will be sent again <b>only to the people it failed for</b>, and only the way it failed. Everyone who already received it is left alone.
          </p>

          {loading && <p className="text-[13px] text-[#525866]">Checking who it failed for…</p>}
          {error && (
            <div role="alert" className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-[13px] text-[#B91C1C]">
              {error}
            </div>
          )}
          {notice && (
            <div role="alert" className="rounded-lg border border-[#FCD34D] bg-[#FFFBEB] p-3 text-[13px] text-[#92400E]">
              {notice}
            </div>
          )}

          {preview && !nothing && (
            <ul className="rounded-xl border border-[#E1E4EA] divide-y divide-[#F2F4F7]" aria-label="Who will be retried">
              {preview.channels.map((c) => (
                <li key={c} className="flex items-center justify-between px-4 py-2 text-[14px]">
                  <span className="text-[#111827]">{channelLabel(c, record.audience)}</span>
                  <span className={`font-semibold ${c === "sms" ? "text-[#B91C1C]" : "text-[#111827]"}`} data-testid={`retry-count-${c}`}>
                    {people(preview.counts[c])}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {preview && nothing && <p className="text-[13px] font-semibold text-[#B91C1C]">Nobody is left to retry. They may have been deleted or no longer have contact details.</p>}

          {preview && wantsSms && (
            <div className="rounded-xl border-2 border-[#FCA5A5] bg-[#FEF2F2] p-4 space-y-2" data-testid="retry-sms-warning">
              <p className="text-[14px] font-semibold text-[#B91C1C]">
                <i className="pi pi-exclamation-triangle mr-2" />
                SMS costs money
              </p>
              {preview.sms && (
                <p className="text-[13px] text-[#7F1D1D]">
                  {people(preview.counts.sms)} × {preview.sms.segments_per_message} message part = <b data-testid="retry-sms-total">{preview.sms.total_segments.toLocaleString("en-NG")} billable SMS</b>.{" "}
                  {preview.sms.estimated_cost_ngn !== null ? (
                    <>
                      Estimated cost: <b>{formatNaira(preview.sms.estimated_cost_ngn)}</b>.
                    </>
                  ) : (
                    <>No price is set on this server, so no estimate is shown.</>
                  )}
                </p>
              )}
              <p className="text-[12px] text-[#7F1D1D]">
                These messages were rejected the first time, so they should not have been charged. If one did arrive after an error reply, that person may get it twice.
              </p>
              {smsOverLimit && config && (
                <p className="text-[13px] font-semibold text-[#B91C1C]">More than the safety limit of {config.max_sms_recipients.toLocaleString("en-NG")} SMS.</p>
              )}
              <label className="flex items-start gap-2 text-[13px] text-[#7F1D1D] cursor-pointer pt-1">
                <input type="checkbox" checked={smsAck} onChange={(e) => setSmsAck(e.target.checked)} className="mt-1 h-4 w-4" data-testid="retry-sms-ack" />
                <span>I understand these SMS messages will be sent and charged, and I want to retry them.</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E1E4EA]">
          <Button variant="outline" onClick={onClose} disabled={sending} className="px-4 py-2">
            Cancel
          </Button>
          <Button variant={wantsSms ? "danger" : "primary"} onClick={submit} disabled={!canSend} loading={sending} className="px-4 py-2" data-testid="retry-confirm">
            {preview && !nothing ? `Retry ${people(Math.max(...preview.channels.map((c) => preview.counts[c])))}` : "Retry"}
          </Button>
        </div>
      </div>
    </div>
  );
}

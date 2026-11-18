"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/shared/Button";
import {
  BroadcastApiError,
  BroadcastConfig,
  BroadcastRecord,
  Draft,
  PreviewResult,
  previewBroadcast,
  sendBroadcast,
} from "@/lib/api/admin/broadcast";
import { AUDIENCE_LABELS, channelLabel, formatNaira, newIdempotencyKey, paragraphs, renderTemplate, startsWithGreeting } from "@/lib/broadcast";

interface Props {
  open: boolean;
  draft: Draft;
  config: BroadcastConfig | null;
  onClose: () => void;
  onSent: (record: BroadcastRecord) => void;
}

const plural = (n: number, word: string) => `${n.toLocaleString("en-NG")} ${word}${n === 1 ? "" : "s"}`;
const people = (n: number) => `${n.toLocaleString("en-NG")} ${n === 1 ? "person" : "people"}`;

/**
 * Last stop before anything is sent. It asks the server for fresh numbers, shows exactly what goes
 * to how many people on which channel, and makes SMS (which is charged) an explicit, separate tick.
 */
export default function ConfirmSendModal({ open, draft, config, onClose, onSent }: Props) {
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [smsAck, setSmsAck] = useState(false);
  const [sending, setSending] = useState(false);
  // One key per opening of this dialog: a double click or a retry can never send twice
  const idempotencyKey = useRef<string>("");

  const wantsSms = draft.channels.includes("sms");

  useEffect(() => {
    if (!open) return;
    idempotencyKey.current = newIdempotencyKey();
    setSmsAck(false);
    setError(null);
    setNotice(null);
    setPreview(null);
    setLoading(true);
    let cancelled = false;
    previewBroadcast(draft)
      .then((res) => !cancelled && setPreview(res.data))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // The numbers are fetched once per opening; the draft cannot change while the dialog is open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !sending && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, sending, onClose]);

  if (!open) return null;

  const counts = preview?.counts;
  const channelCount = (c: "email" | "sms" | "in_app") => counts?.[c] ?? 0;
  const reached = draft.channels.reduce((max, c) => Math.max(max, channelCount(c)), 0);
  const smsOverLimit = !!config && channelCount("sms") > config.max_sms_recipients && wantsSms;
  const nothingToSend = !!counts && draft.channels.every((c) => channelCount(c) === 0);
  const canSend = !!preview && !loading && !sending && !nothingToSend && !smsOverLimit && (!wantsSms || smsAck);

  const submit = async () => {
    if (!preview || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await sendBroadcast({
        ...draft,
        confirm: { ...preview.counts, sms_segments: preview.sms?.total_segments },
        confirm_sms: wantsSms && smsAck,
        idempotency_key: idempotencyKey.current,
      });
      onSent(res.data);
    } catch (e) {
      if (e instanceof BroadcastApiError && e.code === "AUDIENCE_CHANGED" && e.counts) {
        // Numbers moved while this dialog was open: show the new ones and ask again
        setPreview((prev) =>
          prev
            ? {
                ...prev,
                counts: e.counts!,
                sms: prev.sms && e.smsSegments !== undefined ? { ...prev.sms, total_segments: e.smsSegments } : prev.sms,
              }
            : prev,
        );
        setSmsAck(false);
        setNotice("The number of people changed while you were reviewing. Check the new numbers below and confirm again. Nothing was sent.");
      } else {
        setError((e as Error).message);
      }
    } finally {
      setSending(false);
    }
  };

  const sampleName = "Ada";
  const smsText = renderTemplate(draft.sms_text ?? "", sampleName);
  const title = renderTemplate(draft.title, sampleName);
  const body = renderTemplate(draft.message, sampleName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-send-title">
      <div className="absolute inset-0 bg-black/40" onClick={() => !sending && onClose()} />
      <div className="relative bg-white rounded-2xl border border-[#E1E4EA] w-full max-w-2xl max-h-[92vh] flex flex-col shadow-xl">
        <div className="flex items-center gap-3 p-5 border-b border-[#E1E4EA]">
          <i className="pi pi-send text-2xl text-[#2563EB]" />
          <h2 id="confirm-send-title" className="text-[18px] font-semibold text-[#111827]">
            Confirm before sending
          </h2>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {loading && <p className="text-[13px] text-[#525866]">Checking how many people this will reach…</p>}
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
          {config?.dry_run && (
            <div className="rounded-lg border border-[#93C5FD] bg-[#EFF6FF] p-3 text-[13px] text-[#1D4ED8]">
              Dry run is on for this server: the steps run but <b>nothing is actually sent or charged</b>.
            </div>
          )}

          {preview && (
            <>
              <div className="rounded-xl border border-[#E1E4EA] p-4">
                <p className="text-[13px] text-[#525866]">You are about to send to</p>
                <p className="text-[16px] font-semibold text-[#111827]">
                  {AUDIENCE_LABELS[draft.audience]} <span className="font-normal text-[#525866]">·</span>{" "}
                  <span className="font-medium">{config?.audiences[draft.audience]?.segments[draft.segment] ?? draft.segment}</span>
                </p>
                <p className="text-[12px] text-[#9CA3AF] mt-1">{plural(preview.total_accounts, "account")} match this group.</p>

                <ul className="mt-3 divide-y divide-[#F2F4F7]" aria-label="Recipients per channel">
                  {draft.channels.map((c) => (
                    <li key={c} className="flex items-center justify-between py-2 text-[14px]">
                      <span className="flex items-center gap-2 text-[#111827]">
                        <i className={`pi ${c === "email" ? "pi-envelope" : c === "sms" ? "pi-mobile" : "pi-bell"} text-[#525866]`} />
                        {channelLabel(c, draft.audience)}
                      </span>
                      <span className={`font-semibold ${c === "sms" ? "text-[#B91C1C]" : "text-[#111827]"}`} data-testid={`count-${c}`}>
                        {people(channelCount(c))}
                      </span>
                    </li>
                  ))}
                </ul>
                {draft.channels.length > 1 && new Set(draft.channels.map((c) => channelCount(c))).size > 1 && (
                  <p className="text-[12px] text-[#525866] mt-1">Counts differ because not everyone has an email address or a phone number on file.</p>
                )}
              </div>

              {draft.audience === "movers" && draft.channels.includes("in_app") && !config?.mover_inbox && (
                <p className="text-[12px] text-[#525866] rounded-lg bg-[#F9FAFB] border border-[#E1E4EA] px-3 py-2">
                  For movers, the in-app message is delivered as a <b>push notification</b>. The Mover app’s notification list cannot show custom messages yet, so nothing is saved there. Movers without push turned on will not see it.
                </p>
              )}

              {wantsSms && (
                <div className="rounded-xl border-2 border-[#FCA5A5] bg-[#FEF2F2] p-4 space-y-2" data-testid="sms-warning">
                  <p className="text-[14px] font-semibold text-[#B91C1C]">
                    <i className="pi pi-exclamation-triangle mr-2" />
                    SMS costs money
                  </p>
                  {preview.sms ? (
                    <p className="text-[13px] text-[#7F1D1D]">
                      {people(channelCount("sms"))} × {plural(preview.sms.segments_per_message, "message part")} ={" "}
                      <b data-testid="sms-total">{preview.sms.total_segments.toLocaleString("en-NG")} billable SMS</b>.{" "}
                      {preview.sms.estimated_cost_ngn !== null ? (
                        <>
                          Estimated cost: <b>{formatNaira(preview.sms.estimated_cost_ngn)}</b>.
                        </>
                      ) : (
                        <>Your SMS provider charges per part; no price is set on this server, so no estimate is shown.</>
                      )}
                    </p>
                  ) : null}
                  {smsOverLimit && config && (
                    <p className="text-[13px] font-semibold text-[#B91C1C]">
                      This is more than the safety limit of {config.max_sms_recipients.toLocaleString("en-NG")} SMS per broadcast. Choose a smaller group.
                    </p>
                  )}
                  <label className="flex items-start gap-2 text-[13px] text-[#7F1D1D] cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={smsAck}
                      onChange={(e) => setSmsAck(e.target.checked)}
                      className="mt-1 h-4 w-4"
                      data-testid="sms-ack"
                    />
                    <span>I understand these SMS messages will be sent and charged, and I want to send them.</span>
                  </label>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#525866]">Message (shown with the name “{sampleName}”)</p>
                {(draft.channels.includes("email") || draft.channels.includes("in_app")) && (
                  <div className="rounded-xl border border-[#E1E4EA] p-4">
                    <p className="text-[13px] font-semibold text-[#111827]">{title}</p>
                    <div className="mt-2 space-y-2 text-[13px] text-[#525866]">
                      {draft.channels.includes("email") && !startsWithGreeting(body) && <p>Hi {sampleName},</p>}
                      {paragraphs(body).map((p, i) => (
                        <p key={i} className="whitespace-pre-line">
                          {p}
                        </p>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] text-[#9CA3AF]">
                      Used for: {draft.channels.filter((c) => c !== "sms").map((c) => channelLabel(c, draft.audience)).join(", ")}
                    </p>
                  </div>
                )}
                {wantsSms && (
                  <div className="rounded-xl border border-[#E1E4EA] p-4">
                    <p className="text-[13px] text-[#525866] whitespace-pre-line">{smsText}</p>
                    <p className="mt-2 text-[11px] text-[#9CA3AF]">Used for: SMS</p>
                  </div>
                )}
              </div>

              {nothingToSend && <p className="text-[13px] font-semibold text-[#B91C1C]">Nobody in this group can be reached this way, so there is nothing to send.</p>}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E1E4EA]">
          <Button variant="outline" onClick={onClose} disabled={sending} className="px-4 py-2">
            Cancel
          </Button>
          <Button
            variant={wantsSms ? "danger" : "primary"}
            onClick={submit}
            disabled={!canSend}
            loading={sending}
            className="px-4 py-2"
            data-testid="confirm-send"
          >
            {preview ? (draft.channels.length === 1 ? `Send to ${people(reached)}` : "Send now") : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}

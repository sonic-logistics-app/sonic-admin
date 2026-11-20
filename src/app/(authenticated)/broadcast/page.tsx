"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PermissionGate from "@/components/auth/PermissionGate";
import Button from "@/components/shared/Button";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmSendModal from "@/components/broadcast/ConfirmSendModal";
import RetryFailedModal from "@/components/broadcast/RetryFailedModal";
import {
  BroadcastConfig,
  BroadcastRecord,
  PreviewResult,
  getBroadcast,
  getBroadcastConfig,
  listBroadcasts,
  previewBroadcast,
  sendTestBroadcast,
} from "@/lib/api/admin/broadcast";
import {
  AUDIENCE_LABELS,
  Audience,
  CHANNEL_LABELS,
  Channel,
  channelLabel,
  emailFailureReasons,
  MESSAGE_MAX,
  SMS_MAX_SEGMENTS,
  TEMPLATES,
  TITLE_MAX,
  moverInboxOn,
  setMoverInbox,
  paragraphs,
  renderTemplate,
  smsLength,
  startsWithGreeting,
} from "@/lib/broadcast";

const AUDIENCES: { id: Audience; icon: string; hint: string }[] = [
  { id: "movers", icon: "pi-car", hint: "Drivers on the Mover app" },
  { id: "users", icon: "pi-user", hint: "Customers on the User app" },
  { id: "businesses", icon: "pi-shop", hint: "Business Partners" },
];

const CHANNEL_META: Record<Channel, { icon: string; hint: string }> = {
  email: { icon: "pi-envelope", hint: "Free to send" },
  sms: { icon: "pi-mobile", hint: "Charged per message" },
  in_app: { icon: "pi-bell", hint: "Notification inside the app" },
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

const STATUS_STYLE: Record<BroadcastRecord["status"], string> = {
  sending: "bg-[#EFF6FF] text-[#1D4ED8]",
  done: "bg-[#ECFDF3] text-[#027A48]",
  dry_run: "bg-[#F4F3FF] text-[#5925DC]",
  failed: "bg-[#FEF2F2] text-[#B91C1C]",
};
const STATUS_LABEL: Record<BroadcastRecord["status"], string> = {
  sending: "Sending…",
  done: "Sent",
  dry_run: "Dry run (nothing sent)",
  failed: "Failed",
};

const inputClass =
  "w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[14px] text-[#111827] bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]";

function BroadcastPageInner() {
  const toast = useRef<ToastRef>(null);
  const [config, setConfig] = useState<BroadcastConfig | null>(null);

  const [audience, setAudience] = useState<Audience>("movers");
  const [segment, setSegment] = useState("not_approved");
  const [channels, setChannels] = useState<Channel[]>(["in_app"]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [smsText, setSmsText] = useState("");
  const [templateId, setTemplateId] = useState("");

  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<Channel>("in_app");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [retryTarget, setRetryTarget] = useState<BroadcastRecord | null>(null);
  const [active, setActive] = useState<BroadcastRecord | null>(null);
  const [history, setHistory] = useState<BroadcastRecord[]>([]);

  const [testChannel, setTestChannel] = useState<"email" | "sms">("email");
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);

  const wantsSms = channels.includes("sms");
  const segments = useMemo(() => config?.audiences[audience]?.segments ?? {}, [config, audience]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await listBroadcasts(1, 10);
      setHistory(res.data.broadcasts);
    } catch {
      // history is secondary; the compose form still works
    }
  }, []);

  useEffect(() => {
    getBroadcastConfig()
      .then((res) => {
        setMoverInbox(res.data.mover_inbox);
        setConfig(res.data);
      })
      .catch((e: Error) => toast.current?.show({ severity: "error", summary: "Could not load", detail: e.message, life: 5000 }));
    loadHistory();
  }, [loadHistory]);

  // A group that does not exist for the chosen audience resets to the first one
  useEffect(() => {
    if (config && !segments[segment]) setSegment(Object.keys(segments)[0] ?? "all");
  }, [config, segments, segment]);

  // Keep the preview tab on a channel that is actually selected
  useEffect(() => {
    if (!channels.includes(previewTab) && channels.length > 0) setPreviewTab(channels[0]);
  }, [channels, previewTab]);

  // Live "who will this reach" numbers
  const draft = useMemo(
    () => ({ audience, segment, channels, title, message, sms_text: wantsSms ? smsText : null }),
    [audience, segment, channels, title, message, smsText, wantsSms],
  );

  useEffect(() => {
    if (!config || !segments[segment] || channels.length === 0) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    setPreviewing(true);
    setPreviewError(null);
    const t = setTimeout(() => {
      previewBroadcast(draft)
        .then((res) => !cancelled && setPreview(res.data))
        .catch((e: Error) => !cancelled && (setPreview(null), setPreviewError(e.message)))
        .finally(() => !cancelled && setPreviewing(false));
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // Only who/how matters for the numbers; typing the message should not refetch them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, audience, segment, channels.join(","), wantsSms ? smsText : ""]);

  // Follow a running broadcast until it finishes
  useEffect(() => {
    if (!active || active.status !== "sending") return;
    const timer = setInterval(async () => {
      try {
        const res = await getBroadcast(active.id);
        setActive(res.data);
        if (res.data.status !== "sending") {
          clearInterval(timer);
          loadHistory();
          toast.current?.show({
            severity: res.data.status === "failed" ? "error" : "success",
            summary: res.data.status === "failed" ? "Broadcast failed" : res.data.status === "dry_run" ? "Dry run finished" : "Broadcast finished",
            detail: res.data.status === "failed" ? "Some messages may not have gone out. Check the counts." : "",
            life: 5000,
          });
        }
      } catch {
        // keep trying; a blip should not stop progress updates
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [active, loadHistory]);

  const toggleChannel = (c: Channel) =>
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    if ((title || message || smsText) && !window.confirm("Replace what you have typed with this template?")) return;
    if (t.audience !== "any") {
      setAudience(t.audience);
      setSegment(t.segment ?? (t.audience === "movers" ? "not_approved" : t.audience === "businesses" ? "incomplete" : "all"));
    }
    setTitle(t.title);
    setMessage(t.message);
    setSmsText(t.sms);
  };

  const sms = useMemo(() => smsLength(smsText), [smsText]);
  const smsTooLong = wantsSms && sms.segments > SMS_MAX_SEGMENTS;

  const problems: string[] = [];
  if (channels.length === 0) problems.push("Choose at least one way to send.");
  if (!title.trim()) problems.push("Add a title.");
  if (!message.trim()) problems.push("Write a message.");
  if (wantsSms && !smsText.trim()) problems.push("Write the SMS text.");
  if (smsTooLong) problems.push(`The SMS is too long: it would be sent as ${sms.segments} messages. Keep it to ${SMS_MAX_SEGMENTS} or fewer.`);
  if (preview && channels.every((c) => preview.counts[c] === 0)) problems.push("Nobody in this group can be reached this way.");
  const canReview = problems.length === 0 && !!preview && !previewing;

  const runTest = async () => {
    if (!testTo.trim()) return;
    if (testChannel === "sms" && !window.confirm("This sends 1 real SMS to the number you typed, and it is charged. Continue?")) return;
    setTesting(true);
    try {
      const res = await sendTestBroadcast({ channel: testChannel, to: testTo.trim(), title: title || "Test message", message: message || "Test message", sms_text: smsText });
      toast.current?.show({
        severity: res.data.sent ? "success" : "info",
        summary: res.data.dry_run ? "Dry run: nothing was sent" : res.data.sent ? "Test sent" : "The test could not be sent",
        detail: "",
        life: 4000,
      });
    } catch (e) {
      toast.current?.show({ severity: "error", summary: "Test not sent", detail: (e as Error).message, life: 5000 });
    } finally {
      setTesting(false);
    }
  };

  const onSent = (record: BroadcastRecord) => {
    setConfirmOpen(false);
    setActive(record);
    loadHistory();
    toast.current?.show({
      severity: "success",
      summary: record.status === "sending" ? "Sending started" : "Already started",
      detail: "You can follow the progress below.",
      life: 4000,
    });
  };

  const onRetryStarted = (record: BroadcastRecord) => {
    setRetryTarget(null);
    setActive(record);
    loadHistory();
    toast.current?.show({ severity: "success", summary: "Retry started", detail: "Only the people it failed for are being sent to.", life: 4000 });
  };

  // ---- previews
  const sampleName = "Ada";
  const previewTitle = renderTemplate(title || "Your title", sampleName);
  const previewBody = renderTemplate(message || "Your message appears here.", sampleName);

  return (
    <>
      <Toast ref={toast} />
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-[24px] font-bold text-[#111827]">Broadcast</h1>
          <p className="text-[13px] text-[#525866]">
            Send one message to movers, users or businesses by email, SMS or in-app notification. You review the exact message and the number of people before anything is sent.
          </p>
        </div>

        {config?.dry_run && (
          <div className="rounded-lg border border-[#93C5FD] bg-[#EFF6FF] px-4 py-3 text-[13px] text-[#1D4ED8]">
            <b>Dry run is on.</b> Everything works as normal but nothing is actually sent or charged.
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          {/* ------------------------------------------------ compose */}
          <div className="xl:col-span-3 space-y-5">
            <section className="bg-white border border-[#E1E4EA] rounded-2xl p-5 space-y-4" aria-labelledby="who">
              <h2 id="who" className="text-[15px] font-semibold text-[#111827]">
                1. Who should get it?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Audience">
                {AUDIENCES.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={audience === a.id}
                    onClick={() => setAudience(a.id)}
                    className={`text-left rounded-xl border p-3 transition-colors ${
                      audience === a.id ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E1E4EA] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <i className={`pi ${a.icon} text-[#2563EB]`} />
                    <p className="text-[14px] font-semibold text-[#111827] mt-1">{AUDIENCE_LABELS[a.id]}</p>
                    <p className="text-[12px] text-[#525866]">{a.hint}</p>
                  </button>
                ))}
              </div>
              <label className="block text-[13px] font-medium text-[#525866]">
                Which {AUDIENCE_LABELS[audience].toLowerCase()}?
                <select value={segment} onChange={(e) => setSegment(e.target.value)} className={`${inputClass} mt-1`} aria-label="Group">
                  {Object.entries(segments).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-[12px] text-[#9CA3AF]">Deleted and suspended accounts, and accounts that never verified their phone, are always left out.</p>
            </section>

            <section className="bg-white border border-[#E1E4EA] rounded-2xl p-5 space-y-3" aria-labelledby="how">
              <h2 id="how" className="text-[15px] font-semibold text-[#111827]">
                2. How should it be sent?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.keys(CHANNEL_LABELS) as Channel[]).map((c) => {
                  const on = channels.includes(c);
                  return (
                    <label
                      key={c}
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                        on ? (c === "sms" ? "border-[#DC2626] bg-[#FEF2F2]" : "border-[#2563EB] bg-[#EFF6FF]") : "border-[#E1E4EA] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      <input type="checkbox" checked={on} onChange={() => toggleChannel(c)} className="mt-1 h-4 w-4" aria-label={CHANNEL_LABELS[c]} />
                      <span>
                        <span className="flex items-center gap-2 text-[14px] font-semibold text-[#111827]">
                          <i className={`pi ${CHANNEL_META[c].icon}`} />
                          {channelLabel(c, audience)}
                        </span>
                        <span className={`block text-[12px] ${c === "sms" ? "text-[#B91C1C] font-medium" : "text-[#525866]"}`}>
                          {c === "in_app" && audience === "movers" && !moverInboxOn() ? "Pop-up on their phone (not kept in the app yet)" : CHANNEL_META[c].hint}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="rounded-lg bg-[#F9FAFB] border border-[#E1E4EA] px-4 py-3 min-h-[52px]" aria-live="polite" data-testid="reach">
                {previewing && <p className="text-[13px] text-[#525866]">Counting…</p>}
                {!previewing && previewError && <p className="text-[13px] text-[#B91C1C]">{previewError}</p>}
                {!previewing && !previewError && preview && (
                  <p className="text-[13px] text-[#111827]">
                    This group has <b>{preview.total_accounts.toLocaleString("en-NG")}</b> {preview.total_accounts === 1 ? "account" : "accounts"}. It would reach{" "}
                    {channels.map((c, i) => (
                      <span key={c}>
                        {i > 0 && (i === channels.length - 1 ? " and " : ", ")}
                        <b className={c === "sms" ? "text-[#B91C1C]" : ""}>
                          {preview.counts[c].toLocaleString("en-NG")} by {c === "in_app" ? (audience === "movers" && !moverInboxOn() ? "push notification" : "in-app notification") : CHANNEL_LABELS[c]}
                        </b>
                      </span>
                    ))}
                    .
                  </p>
                )}
                {!previewing && !previewError && !preview && <p className="text-[13px] text-[#9CA3AF]">Choose a way to send to see how many people it reaches.</p>}
              </div>
            </section>

            <section className="bg-white border border-[#E1E4EA] rounded-2xl p-5 space-y-4" aria-labelledby="what">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="what" className="text-[15px] font-semibold text-[#111827]">
                  3. What should it say?
                </h2>
                <select value={templateId} onChange={(e) => applyTemplate(e.target.value)} className="px-3 py-1.5 border border-[#E1E4EA] rounded-lg text-[13px] bg-white" aria-label="Start from a template">
                  <option value="">Start from a template…</option>
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="block text-[13px] font-medium text-[#525866]">
                Title <span className="font-normal text-[#9CA3AF]">(email subject and notification title)</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={TITLE_MAX} className={`${inputClass} mt-1`} placeholder="Update your Sonic Mover app" aria-label="Title" />
                <span className="text-[11px] text-[#9CA3AF]">{title.length}/{TITLE_MAX}</span>
              </label>

              <label className="block text-[13px] font-medium text-[#525866]">
                Message <span className="font-normal text-[#9CA3AF]">(email and in-app notification)</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={MESSAGE_MAX}
                  rows={7}
                  className={`${inputClass} mt-1`}
                  placeholder={"Hi {{first_name}},\n\nWrite your message here. Leave a blank line between paragraphs."}
                  aria-label="Message"
                />
                <span className="text-[11px] text-[#9CA3AF]">
                  {message.length}/{MESSAGE_MAX} · Type <code className="bg-[#F2F4F7] px-1 rounded">{"{{first_name}}"}</code> to use each person’s first name.
                </span>
              </label>

              {wantsSms && (
                <label className="block text-[13px] font-medium text-[#525866]">
                  SMS text <span className="font-normal text-[#B91C1C]">(short: you are charged for every 160 characters)</span>
                  <textarea
                    value={smsText}
                    onChange={(e) => setSmsText(e.target.value)}
                    rows={3}
                    className={`${inputClass} mt-1 ${smsTooLong ? "border-[#DC2626]" : ""}`}
                    placeholder="Hi {{first_name}}, please update your Sonic Mover app and complete your profile."
                    aria-label="SMS text"
                  />
                  <span className={`text-[12px] ${smsTooLong ? "text-[#B91C1C] font-semibold" : "text-[#525866]"}`} data-testid="sms-counter">
                    {sms.characters} characters · {sms.segments} SMS part{sms.segments === 1 ? "" : "s"} per person · {sms.encoding}
                    {sms.encoding === "Unicode" && " (emoji or special characters like ₦ make each part shorter and cost more)"}
                  </span>
                </label>
              )}
            </section>

            <section className="bg-white border border-[#E1E4EA] rounded-2xl p-5 space-y-3" aria-labelledby="test">
              <h2 id="test" className="text-[15px] font-semibold text-[#111827]">
                Send yourself a test first <span className="font-normal text-[#9CA3AF]">(optional)</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                <select value={testChannel} onChange={(e) => setTestChannel(e.target.value as "email" | "sms")} className="px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] bg-white" aria-label="Test channel">
                  <option value="email">Email</option>
                  <option value="sms">SMS (1 message, charged)</option>
                </select>
                <input
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder={testChannel === "email" ? "you@example.com" : "08012345678"}
                  className={`${inputClass} flex-1 min-w-[200px]`}
                  aria-label="Send test to"
                />
                <Button variant="outline" onClick={runTest} loading={testing} disabled={!testTo.trim() || !title.trim() || !message.trim() || (testChannel === "sms" && !smsText.trim())}>
                  Send test
                </Button>
              </div>
              {testChannel === "sms" && (
                <p className="text-[12px] text-[#525866]">Type the number the way you normally write it: 0814…, 0903…, 234814… or +234814… all work.</p>
              )}
            </section>

            <div className="flex flex-col items-end gap-2">
              {problems.length > 0 && (title || message || smsText) && (
                <ul className="text-[12px] text-[#B91C1C] self-start list-disc pl-5" role="alert">
                  {problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
              <Button variant={wantsSms ? "danger" : "primary"} icon="pi pi-send" disabled={!canReview} onClick={() => setConfirmOpen(true)} data-testid="review-send">
                Review and send
              </Button>
            </div>
          </div>

          {/* ------------------------------------------------ preview + progress */}
          <div className="xl:col-span-2 space-y-5">
            <section className="bg-white border border-[#E1E4EA] rounded-2xl p-5 space-y-3 xl:sticky xl:top-4" aria-labelledby="look">
              <h2 id="look" className="text-[15px] font-semibold text-[#111827]">
                How it will look
              </h2>
              {channels.length === 0 ? (
                <p className="text-[13px] text-[#9CA3AF]">Choose a way to send to see a preview.</p>
              ) : (
                <>
                  <div className="flex gap-1 border-b border-[#E1E4EA]" role="tablist">
                    {channels.map((c) => (
                      <button
                        key={c}
                        role="tab"
                        aria-selected={previewTab === c}
                        onClick={() => setPreviewTab(c)}
                        className={`px-3 py-2 text-[13px] font-medium -mb-px border-b-2 ${previewTab === c ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#525866]"}`}
                      >
                        {channelLabel(c, audience)}
                      </button>
                    ))}
                  </div>

                  {previewTab === "email" && (
                    <div className="rounded-xl border border-[#E1E4EA] overflow-hidden text-[13px]" data-testid="preview-email">
                      <div className="bg-[#F9FAFB] px-4 py-2 border-b border-[#E1E4EA]">
                        <p className="text-[11px] text-[#9CA3AF]">Subject</p>
                        <p className="font-semibold text-[#111827]">{previewTitle}</p>
                      </div>
                      <div className="p-4 space-y-3 bg-[#FFF7F3]">
                        <p className="text-[10px] font-bold tracking-widest text-[#FC951C]">SONIC MEGA</p>
                        <p className="text-[18px] font-bold text-[#111827]">{previewTitle}</p>
                        <p className="text-[#525866]">A message from the Sonic team.</p>
                      </div>
                      <div className="p-4 space-y-2 text-[#525866]">
                        {!startsWithGreeting(previewBody) && (
                          <p>
                            Hi <b className="text-[#111827]">{sampleName}</b>,
                          </p>
                        )}
                        {paragraphs(previewBody).map((p, i) => (
                          <p key={i} className="whitespace-pre-line">
                            {p}
                          </p>
                        ))}
                        <p className="text-[12px] text-[#9CA3AF] pt-2">Need help? Contact us at support@sonicmega.com.</p>
                      </div>
                    </div>
                  )}

                  {previewTab === "sms" && (
                    <div className="rounded-xl bg-[#F2F4F7] p-4" data-testid="preview-sms">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white border border-[#E1E4EA] px-3 py-2 text-[13px] text-[#111827] whitespace-pre-line">
                        {renderTemplate(smsText || "Your SMS text appears here.", sampleName)}
                      </div>
                      <p className="text-[11px] text-[#525866] mt-2">
                        {sms.segments} part{sms.segments === 1 ? "" : "s"} per person · {sms.encoding}
                      </p>
                    </div>
                  )}

                  {previewTab === "in_app" && (
                    <div className="rounded-xl bg-[#F2F4F7] p-4" data-testid="preview-in-app">
                      <div className="rounded-xl bg-white border border-[#E1E4EA] px-3 py-3 flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                          <i className="pi pi-bell text-[#2563EB] text-[14px]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#111827] truncate">{previewTitle}</p>
                          <p className="text-[12px] text-[#525866] line-clamp-3 whitespace-pre-line">{previewBody}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#525866] mt-2">
                        {audience === "movers"
                          ? moverInboxOn()
                            ? "Saved in the Mover app’s notification list (first line is the title) and sent as a push notification."
                            : "Shown as a push notification on the mover’s phone. It is not saved in the Mover app’s notification list yet."
                          : audience === "businesses"
                            ? "Saved in the Business Partner portal (first line is the title) and sent as a push notification."
                            : "Saved in the app’s notification list and sent as a push notification."}
                      </p>
                    </div>
                  )}
                </>
              )}
            </section>

            {active && <ProgressCard record={active} onRetry={() => setRetryTarget(active)} />}
          </div>
        </div>

        {/* ------------------------------------------------ history */}
        <section className="bg-white border border-[#E1E4EA] rounded-2xl p-5" aria-labelledby="hist">
          <h2 id="hist" className="text-[15px] font-semibold text-[#111827] mb-3">
            Recent broadcasts
          </h2>
          {history.length === 0 ? (
            <p className="text-[13px] text-[#9CA3AF]">Nothing sent yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[12px] text-[#525866] border-b border-[#E1E4EA]">
                    <th className="py-2 pr-3 font-medium">When (Lagos)</th>
                    <th className="py-2 pr-3 font-medium">Sent by</th>
                    <th className="py-2 pr-3 font-medium">To</th>
                    <th className="py-2 pr-3 font-medium">Title</th>
                    <th className="py-2 pr-3 font-medium">Results</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((b) => (
                    <tr key={b.id} className="border-b border-[#F2F4F7] align-top">
                      <td className="py-2 pr-3 whitespace-nowrap">{when(b.created_at)}</td>
                      <td className="py-2 pr-3">{b.admin_email || "Unknown"}</td>
                      <td className="py-2 pr-3">{AUDIENCE_LABELS[b.audience]}</td>
                      <td className="py-2 pr-3 max-w-[240px] truncate" title={b.title}>
                        {b.title}
                      </td>
                      <td className="py-2 pr-3 text-[12px] text-[#525866]">
                        {b.channels.map((c) => (
                          <div key={c}>
                            {channelLabel(c, b.audience)}: {b.counts?.[c]?.sent ?? 0}/{b.counts?.[c]?.targeted ?? 0}
                            {(b.counts?.[c]?.failed ?? 0) > 0 && <span className="text-[#B91C1C]"> ({b.counts[c].failed} failed)</span>}
                            {c === "email" &&
                              emailFailureReasons(b.counts?.email?.reasons).map((text) => (
                                <div key={text} className="text-[11px] text-[#B91C1C] max-w-[320px]">
                                  {text}
                                </div>
                              ))}
                          </div>
                        ))}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-[12px] font-semibold ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                      </td>
                      <td className="py-2 pl-3 whitespace-nowrap">
                        {canRetry(b) && (
                          <button type="button" onClick={() => setRetryTarget(b)} className="text-[12px] font-semibold text-[#2563EB] hover:underline" data-testid={`history-retry-${b.id}`}>
                            Retry failed ({retryTotal(b)})
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ConfirmSendModal open={confirmOpen} draft={draft} config={config} onClose={() => setConfirmOpen(false)} onSent={onSent} />
      <RetryFailedModal record={retryTarget} config={config} onClose={() => setRetryTarget(null)} onStarted={onRetryStarted} />
    </>
  );
}

const retryTotal = (b: BroadcastRecord) => (b.retryable?.email ?? 0) + (b.retryable?.sms ?? 0) + (b.retryable?.in_app ?? 0);
const canRetry = (b: BroadcastRecord) => (b.status === "done" || b.status === "failed") && retryTotal(b) > 0;

function ProgressCard({ record, onRetry }: { record: BroadcastRecord; onRetry: () => void }) {
  return (
    <section className="bg-white border border-[#E1E4EA] rounded-2xl p-5 space-y-3" aria-labelledby="prog" data-testid="progress">
      <div className="flex items-center justify-between">
        <h2 id="prog" className="text-[15px] font-semibold text-[#111827]">
          {record.status === "sending" ? "Sending…" : STATUS_LABEL[record.status]}
        </h2>
        <span className={`px-2 py-1 rounded-full text-[12px] font-semibold ${STATUS_STYLE[record.status]}`}>{STATUS_LABEL[record.status]}</span>
      </div>
      <p className="text-[12px] text-[#525866] truncate">{record.title}</p>
      {record.channels.map((c) => {
        const r = record.counts?.[c];
        const targeted = r?.targeted ?? 0;
        const done = (r?.sent ?? 0) + (r?.failed ?? 0);
        const pct = targeted === 0 ? 100 : Math.min(100, Math.round((done / targeted) * 100));
        return (
          <div key={c}>
            <div className="flex justify-between text-[12px] text-[#525866] mb-1">
              <span>{channelLabel(c, record.audience)}</span>
              <span>
                {r?.sent ?? 0} sent{(r?.failed ?? 0) > 0 && <span className="text-[#B91C1C]"> · {r?.failed} failed</span>} of {targeted}
              </span>
            </div>
            {c === "email" &&
              emailFailureReasons(record.counts?.email?.reasons).map((text) => (
                <p key={text} className="text-[11px] text-[#B91C1C] mt-1">
                  {text}
                </p>
              ))}
            {c === "in_app" && (record.counts?.in_app?.opted_out ?? 0) > 0 && (
              <p className="text-[11px] text-[#525866] mt-1">{record.counts.in_app.opted_out} turned off these notifications in their settings, so they were skipped.</p>
            )}
            {c === "in_app" && (record.counts?.in_app?.no_device ?? 0) > 0 && (
              <p className="text-[11px] text-[#525866] mt-1">{record.counts.in_app.no_device} had no phone registered for push, so no pop-up could be delivered.</p>
            )}
            <div className="h-2 rounded-full bg-[#F2F4F7] overflow-hidden">
              <div className={`h-full ${c === "sms" ? "bg-[#DC2626]" : "bg-[#2563EB]"}`} style={{ width: `${record.status === "dry_run" ? 100 : pct}%` }} />
            </div>
          </div>
        );
      })}
      {canRetry(record) && (
        <div className="pt-1 border-t border-[#F2F4F7]">
          <p className="text-[12px] text-[#525866] mt-2 mb-2">
            {record.retryable.sms > 0 && `${record.retryable.sms} SMS`}
            {record.retryable.sms > 0 && record.retryable.email > 0 && ", "}
            {record.retryable.email > 0 && `${record.retryable.email} email`}
            {(record.retryable.sms > 0 || record.retryable.email > 0) && record.retryable.in_app > 0 && ", "}
            {record.retryable.in_app > 0 && `${record.retryable.in_app} in-app`} did not go through.
          </p>
          <Button variant="outline" icon="pi pi-replay" onClick={onRetry} data-testid="retry-failed">
            Retry failed ({retryTotal(record)})
          </Button>
        </div>
      )}
    </section>
  );
}

export default function BroadcastPage() {
  return (
    <PermissionGate permission="broadcast.send" what="send broadcast messages">
      <BroadcastPageInner />
    </PermissionGate>
  );
}

/**
 * Helpers for the Broadcast page. The SMS length rules must match the backend
 * (src/utils/broadcast-template.ts) so the numbers shown in the confirm screen are the numbers billed.
 */

export type Audience = "movers" | "users" | "businesses";
export type Channel = "email" | "sms" | "in_app";

export const CHANNEL_LABELS: Record<Channel, string> = {
  email: "Email",
  sms: "SMS",
  in_app: "In-app notification",
};

let moverInbox = false;
/** Set from the server settings. When off, movers cannot get a saved notification (the Mover app cannot show one yet). */
export const setMoverInbox = (on: boolean) => {
  moverInbox = on;
};
export const moverInboxOn = () => moverInbox;

/** For movers, "in-app" is only a push notification until the Mover app can show saved messages. */
export const channelLabel = (channel: Channel, audience: Audience): string =>
  channel === "in_app" && audience === "movers" && !moverInbox ? "Push notification" : CHANNEL_LABELS[channel];

export const AUDIENCE_LABELS: Record<Audience, string> = {
  movers: "Movers",
  users: "Users",
  businesses: "Businesses",
};

export const TITLE_MAX = 120;
export const MESSAGE_MAX = 2000;
export const SMS_MAX_SEGMENTS = 3;

/** Replace {{first_name}}. Unknown variables stay as typed so a typo is visible. */
export const renderTemplate = (text: string, firstName: string): string =>
  text.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, name: string) =>
    name.toLowerCase() === "first_name" ? (firstName.trim() ? firstName.trim() : "there") : match,
  );

const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\u001bÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_EXTENDED = "^{}\\[~]|€\f";

export interface SmsLength {
  characters: number;
  slots: number;
  encoding: "GSM-7" | "Unicode";
  /** Billable messages for one recipient */
  segments: number;
  /** Characters allowed in the current segment before another is billed */
  perSegment: number;
}

export function smsLength(text: string): SmsLength {
  const chars = Array.from(text);
  let gsmSlots = 0;
  let isGsm = true;
  for (const ch of chars) {
    if (GSM_BASIC.includes(ch)) gsmSlots += 1;
    else if (GSM_EXTENDED.includes(ch)) gsmSlots += 2;
    else {
      isGsm = false;
      break;
    }
  }
  if (isGsm) {
    const segments = gsmSlots === 0 ? 0 : gsmSlots <= 160 ? 1 : Math.ceil(gsmSlots / 153);
    return { characters: chars.length, slots: gsmSlots, encoding: "GSM-7", segments, perSegment: segments > 1 ? 153 : 160 };
  }
  const slots = text.length;
  const segments = slots === 0 ? 0 : slots <= 70 ? 1 : Math.ceil(slots / 67);
  return { characters: chars.length, slots, encoding: "Unicode", segments, perSegment: segments > 1 ? 67 : 70 };
}

/** Same rule as the backend: the email adds "Hi <name>," unless the message already opens with a greeting. */
export const startsWithGreeting = (message: string): boolean => {
  const firstLine = message.trim().split("\n")[0] ?? "";
  return firstLine.length <= 60 && /^(hi|hello|hey|dear|good\s+(morning|afternoon|evening))\b/i.test(firstLine);
};

export const paragraphs = (message: string): string[] =>
  message
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

export interface Template {
  id: string;
  label: string;
  audience: Audience | "any";
  /** The group to pick with this template (defaults to the audience's usual one) */
  segment?: string;
  title: string;
  message: string;
  sms: string;
}

export const TEMPLATES: Template[] = [
  {
    id: "movers-update-profile",
    label: "Movers: update the app and complete your profile",
    audience: "movers",
    title: "Update your Sonic Mover app",
    message:
      "We have released an update to the Sonic Mover app. Please update it from the Play Store or App Store.\n\nPlease also complete your profile (documents, vehicle details and bank account) so you can start receiving deliveries.\n\nThank you,\nThe Sonic team",
    sms: "Hi {{first_name}}, update your Sonic Mover app and complete your profile to start receiving deliveries and earning with Sonic!",
  },
  {
    id: "businesses-finish-setup",
    label: "Businesses: finish setting up your store",
    audience: "businesses",
    title: "Finish setting up your Sonic store",
    message:
      "Your Sonic business account is not live yet. Log in to the Business Partner portal to finish your setup so customers can start ordering from you.\n\nThank you,\nThe Sonic team",
    sms: "Hi {{first_name}}, finish setting up your Sonic business account so customers can order from you. Log in at vendor.sonicmega.com",
  },
  {
    id: "businesses-add-products",
    label: "Businesses: your store is empty, add your products",
    audience: "businesses",
    segment: "no_products",
    title: "Your Sonic store is waiting",
    message:
      "Your Sonic store is set up, but it does not have any products or services yet.\n\nLog in to the Business Partner portal and add your products or services so customers can start ordering from you.\n\nThank you,\nThe Sonic team",
    sms: "Hi {{first_name}}, your Sonic store is waiting! Log in and add your products or services to get ready to receive customer orders.",
  },
  {
    id: "users-update-app",
    label: "Users: update the app",
    audience: "users",
    title: "Update your Sonic app",
    message:
      "A new version of the Sonic app is available with improvements and fixes. Please update it from the Play Store or App Store.\n\nThank you,\nThe Sonic team",
    sms: "Hi {{first_name}}, a new version of the Sonic app is available. Please update it from your app store.",
  },
  { id: "blank", label: "Start from blank", audience: "any", title: "", message: "", sms: "" },
];

export type EmailFailureReason = "quota" | "rate_limited" | "invalid" | "other";

const REASON_TEXT: Record<EmailFailureReason, string> = {
  quota: "your email provider's sending limit was reached (it resets daily or monthly, or upgrade the plan), then retry",
  rate_limited: "the email provider was too busy, retry in a few minutes",
  invalid: "the address was rejected, check it",
  other: "a temporary email provider error, retry",
};

/** "150: your email provider's sending limit was reached..." for each reason that happened, biggest first. */
export function emailFailureReasons(reasons?: Partial<Record<EmailFailureReason, number>>): string[] {
  return (Object.entries(reasons ?? {}) as [EmailFailureReason, number][])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, n]) => n + " " + (n === 1 ? "email" : "emails") + ": " + REASON_TEXT[reason]);
}

export interface BroadcastCounts {
  email: { targeted: number; sent: number; failed: number; reasons?: Partial<Record<EmailFailureReason, number>> };
  sms: { targeted: number; sent: number; failed: number };
  in_app: { targeted: number; sent: number; failed: number; push_sent?: number; no_device?: number; opted_out?: number };
}

export const formatNaira = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(value);

export const newIdempotencyKey = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `bk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

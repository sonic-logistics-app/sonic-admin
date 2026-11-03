/**
 * The words people read for the two account types. Stored values and routes keep the old names
 * (`vendor`, `driver`); only what appears on screen uses these.
 */
export const TERMS = {
  mover: "Mover",
  movers: "Movers",
  businessPartner: "Business Partner",
  businessPartners: "Business Partners",
} as const;

const DISPLAY: Record<string, string> = {
  vendor: TERMS.businessPartner,
  vendors: TERMS.businessPartners,
  driver: TERMS.mover,
  drivers: TERMS.movers,
};

/** Turns a stored name such as "vendor" or "drivers" into what a person should read. Other words pass through. */
export const displayTerm = (stored: string) => DISPLAY[stored.toLowerCase()] ?? stored;

/** Reads an audit-log action such as "vendor.approve" as "Business Partner · approve". */
export const displayAction = (action: string) => {
  const [first, ...rest] = action.split(".");
  return [displayTerm(first), ...rest].join(" · ").replace(/-/g, " ");
};

/**
 * Vendor business types as shown in admin. Values are the backend `business_type` enum.
 * Labels match the tiles on the user app home screen ("shop" is the Retail tile).
 */
export const BUSINESS_TYPE_OPTIONS = [
  { value: "restaurant", label: "Food" },
  { value: "grocery", label: "Grocery" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "gadget", label: "Gadget" },
  { value: "flowers", label: "Flowers" },
  { value: "baby", label: "Baby" },
  { value: "personal_care", label: "Personal care" },
  { value: "beverages", label: "Beverage" },
  { value: "shop", label: "Retail" },
] as const;

const LABELS: Record<string, string> = Object.fromEntries(
  BUSINESS_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

export function businessTypeLabel(value?: string | null): string {
  if (!value) return "-";
  return LABELS[value] ?? value.replace(/_/g, " ");
}

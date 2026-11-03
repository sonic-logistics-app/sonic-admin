"use client";

import { useEffect, useState } from "react";
import { CatalogueItem, getVendorCatalogue } from "@/lib/api/admin/ops";

const naira = (value: number) => `₦${value.toLocaleString("en-NG")}`;

/** Menu items with their images, so a reviewer can see missing or broken product images at a glance. */
export default function VendorCataloguePanel({ vendorId }: { vendorId: string }) {
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, missing_images: 0, out_of_stock: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    getVendorCatalogue(vendorId)
      .then(({ data }) => {
        if (cancelled) return;
        setItems(data.items);
        setSummary(data.summary);
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [vendorId]);

  if (loading) return <p className="text-[13px] text-[#525866]">Loading catalogue...</p>;
  if (error) return <p className="text-[13px] text-[#DC2626]">{error}</p>;

  const stats = [
    { label: "Products", value: summary.total, tone: summary.total === 0 ? "text-[#DC2626]" : "text-[#111827]" },
    { label: "Active", value: summary.active, tone: "text-[#111827]" },
    { label: "Missing image", value: summary.missing_images, tone: summary.missing_images > 0 ? "text-[#D97706]" : "text-[#111827]" },
    { label: "Broken image", value: broken.size, tone: broken.size > 0 ? "text-[#DC2626]" : "text-[#111827]" },
    { label: "Out of stock", value: summary.out_of_stock, tone: "text-[#111827]" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-[#E1E4EA] rounded-lg p-4">
            <p className="text-[11px] uppercase tracking-wider text-[#525866]">{s.label}</p>
            <p className={`text-[22px] font-bold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 bg-[#F9FAFB] rounded-lg text-[13px] text-[#525866]">
          This vendor has not added any products yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const missing = !item.image_url || !item.image_url.trim();
            const isBroken = broken.has(item.id);
            return (
              <div key={item.id} className="border border-[#E1E4EA] rounded-lg overflow-hidden">
                <div className="h-36 bg-[#F3F4F6] flex items-center justify-center">
                  {missing || isBroken ? (
                    <span className={`text-[12px] font-semibold ${isBroken ? "text-[#DC2626]" : "text-[#D97706]"}`}>
                      {isBroken ? "Image failed to load" : "No image"}
                    </span>
                  ) : (
                    <img
                      src={item.image_url as string}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={() => setBroken((prev) => new Set(prev).add(item.id))}
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[13px] font-semibold text-[#111827] truncate">{item.name}</p>
                  <p className="text-[12px] text-[#525866]">
                    {naira(item.price)}
                    {item.category ? ` · ${item.category}` : ""}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {!item.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#525866] font-semibold">Inactive</span>}
                    {!item.in_stock && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] font-semibold">Out of stock</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

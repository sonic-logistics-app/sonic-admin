"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RefundService, { RefundSummary } from "@/lib/api/admin/refunds";

export default function RefundSummaryWidget() {
  const router = useRouter();
  const refundService = new RefundService();
  const [summary, setSummary] = useState<RefundSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRefundSummary();
  }, []);

  const loadRefundSummary = async () => {
    try {
      const result = await refundService.getRefundSummary();
      setSummary(result.data);
    } catch (error) {
      console.error("Failed to load refund summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const hasRefunds = summary.pending_refunds > 0 || summary.completed_refunds > 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-semibold text-[#111827]">Refund Status</h3>
        <button
          onClick={() => router.push("/order/refund")}
          className="text-[12px] text-[#2563EB] hover:underline font-semibold"
        >
          View All
        </button>
      </div>

      {hasRefunds ? (
        <div className="space-y-4">
          {/* Pending Refunds */}
          {summary.pending_refunds > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#FEF3C7] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D97706] flex items-center justify-center">
                  <i className="pi pi-clock text-white text-sm" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111827]">
                    {summary.pending_refunds} Pending
                  </p>
                  <p className="text-[11px] text-[#525866]">
                    Awaiting processing
                  </p>
                </div>
              </div>
              {summary.pending_refund_amount && (
                <p className="text-[12px] font-semibold text-[#D97706]">
                  {formatCurrency(summary.pending_refund_amount)}
                </p>
              )}
            </div>
          )}

          {/* Completed Refunds */}
          {summary.completed_refunds > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#ECFDF3] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#059669] flex items-center justify-center">
                  <i className="pi pi-check text-white text-sm" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111827]">
                    {summary.completed_refunds} Completed
                  </p>
                  <p className="text-[11px] text-[#525866]">
                    Successfully processed
                  </p>
                </div>
              </div>
              {summary.completed_refund_amount && (
                <p className="text-[12px] font-semibold text-[#059669]">
                  {formatCurrency(summary.completed_refund_amount)}
                </p>
              )}
            </div>
          )}

          {/* Total */}
          <div className="pt-3 border-t border-[#E1E4EA]">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold text-[#525866]">
                Total Refunds
              </p>
              <p className="text-[14px] font-bold text-[#111827]">
                {formatCurrency(summary.total_refund_amount)}
              </p>
            </div>
          </div>

          {/* Quick Action */}
          {summary.pending_refunds > 0 && (
            <button
              onClick={() => router.push("/order/refund")}
              className="w-full mt-3 px-3 py-2 bg-[#2563EB] text-white rounded-lg text-[12px] font-semibold hover:bg-[#1d4ed8] transition-colors"
            >
              Sync Pending Refunds
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-3">
            <i className="pi pi-check-circle text-[#9CA3AF] text-lg" />
          </div>
          <p className="text-[13px] text-[#525866]">No refunds to process</p>
          <p className="text-[11px] text-[#9CA3AF] mt-1">All refunds are up to date</p>
        </div>
      )}
    </div>
  );
}
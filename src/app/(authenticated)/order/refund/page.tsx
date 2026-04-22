"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import RefundService, { RefundSummary, RefundSyncResponse, RefundDebugResponse } from "@/lib/api/admin/refunds";
import Toast, { ToastRef } from "@/components/shared/Toast";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonLoader from "@/components/shared/SkeletonLoader";

export default function RefundManagementPage() {
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const refundService = new RefundService();

  const [summary, setSummary] = useState<RefundSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<RefundSyncResponse | null>(null);
  const [showSyncResults, setShowSyncResults] = useState(false);
  const [debugOrderId, setDebugOrderId] = useState("");
  const [debugResults, setDebugResults] = useState<RefundDebugResponse | null>(null);
  const [showDebugResults, setShowDebugResults] = useState(false);
  const [debugging, setDebugging] = useState(false);

  useEffect(() => {
    loadRefundSummary();
  }, []);

  const loadRefundSummary = async () => {
    try {
      setLoading(true);
      const result = await refundService.getRefundSummary();
      setSummary(result.data);
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to load refund summary",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncRefunds = async () => {
    try {
      setSyncing(true);
      const result = await refundService.syncRefunds();
      setSyncResults(result);
      setShowSyncResults(true);
      
      // Refresh summary after sync
      await loadRefundSummary();

      toast.current?.show({
        severity: result.data.updated > 0 ? "success" : "info",
        summary: "Sync Complete",
        detail: `${result.data.updated} refunds updated, ${result.data.errors} errors`,
        life: 5000,
      });
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Sync Failed",
        detail: error.message || "Failed to sync refunds",
        life: 3000,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDebugRefund = async () => {
    if (!debugOrderId.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please enter an order ID to debug",
        life: 3000,
      });
      return;
    }

    try {
      setDebugging(true);
      const result = await refundService.debugRefund(debugOrderId.trim());
      setDebugResults(result);
      setShowDebugResults(true);

      toast.current?.show({
        severity: "info",
        summary: "Debug Complete",
        detail: `Debug results for order ${debugOrderId}`,
        life: 3000,
      });
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Debug Failed",
        detail: error.message || "Failed to debug refund",
        life: 3000,
      });
    } finally {
      setDebugging(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-[24px] font-bold text-[#111827]">Refund Management</h1>
        <SkeletonLoader type="card" rows={3} />
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-[#111827]">Refund Management</h1>
            <p className="text-[13px] text-[#525866] mt-1">
              Monitor and sync refund statuses with Flutterwave
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/transaction?type=payment&status=REFUNDED")}
              className="px-4 py-2 border border-[#DC2626] text-[#DC2626] rounded-lg text-[13px] font-semibold hover:bg-[#DC2626] hover:text-white transition-colors flex items-center gap-2"
            >
              <i className="pi pi-list" />
              View Refunded Transactions
            </button>
            <button
              onClick={handleSyncRefunds}
              disabled={syncing}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <i className="pi pi-refresh" />
                  Sync Refunds
                </>
              )}
            </button>
          </div>
        </div>

        {/* Debug Section */}
        <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
          <h2 className="text-[16px] font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <i className="pi pi-search text-[#D97706]" />
            Debug Refund Detection
          </h2>
          <p className="text-[13px] text-[#525866] mb-4">
            Test refund detection for a specific order to see what Flutterwave is returning and why a refund might not be detected.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={debugOrderId}
                onChange={(e) => setDebugOrderId(e.target.value)}
                placeholder="Enter Order ID (e.g., f8qiusaggpf1twt1zqhoeih)"
                className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <button
              onClick={handleDebugRefund}
              disabled={debugging || !debugOrderId.trim()}
              className="px-4 py-2 bg-[#D97706] text-white rounded-lg text-[13px] font-semibold hover:bg-[#B45309] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {debugging ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Debugging...
                </>
              ) : (
                <>
                  <i className="pi pi-search" />
                  Debug Order
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">
                    Pending Refunds
                  </p>
                  <p className="text-[24px] font-bold text-[#D97706] mt-1">
                    {summary.pending_refunds}
                  </p>
                  {summary.pending_refund_amount && (
                    <p className="text-[11px] text-[#525866] mt-1">
                      {formatCurrency(summary.pending_refund_amount)}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                  <i className="pi pi-clock text-[#D97706] text-lg" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">
                    Completed Refunds
                  </p>
                  <p className="text-[24px] font-bold text-[#059669] mt-1">
                    {summary.completed_refunds}
                  </p>
                  {summary.completed_refund_amount && (
                    <p className="text-[11px] text-[#525866] mt-1">
                      {formatCurrency(summary.completed_refund_amount)}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-[#ECFDF3] flex items-center justify-center">
                  <i className="pi pi-check-circle text-[#059669] text-lg" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">
                    Total Refund Amount
                  </p>
                  <p className="text-[20px] font-bold text-[#111827] mt-1">
                    {formatCurrency(summary.total_refund_amount)}
                  </p>
                  <p className="text-[11px] text-[#525866] mt-1">
                    All time refunds
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                  <i className="pi pi-chart-bar text-[#2563EB] text-lg" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* How It Works */}
          <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4 flex items-center gap-2">
              <i className="pi pi-info-circle text-[#2563EB]" />
              How Refund Sync Works
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ECFDF3] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-[#059669]">1</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111827]">Automatic Webhook</p>
                  <p className="text-[12px] text-[#525866]">
                    Flutterwave sends instant notifications when refunds complete
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#DBEAFE] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-[#2563EB]">2</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111827]">Background Job</p>
                  <p className="text-[12px] text-[#525866]">
                    Automated sync runs every 30 minutes as backup
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-[#D97706]">3</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111827]">Manual Sync</p>
                  <p className="text-[12px] text-[#525866]">
                    Use the sync button for immediate status updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Integration */}
          <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4 flex items-center gap-2">
              <i className="pi pi-credit-card text-[#DC2626]" />
              Refund Visibility
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-[#FEF2F2] rounded-lg border border-[#FCA5A5]">
                <p className="text-[13px] font-semibold text-[#111827] mb-2">
                  Refunds in Transaction List
                </p>
                <p className="text-[12px] text-[#525866] mb-3">
                  All refunded payments appear in the transaction list with status "REFUNDED" and are clearly marked.
                </p>
                <button
                  onClick={() => router.push("/transaction?type=payment&status=REFUNDED")}
                  className="w-full px-3 py-2 bg-[#DC2626] text-white rounded-lg text-[12px] font-semibold hover:bg-[#B91C1C] transition-colors"
                >
                  View All Refunded Transactions
                </button>
              </div>
              
              <div className="space-y-2">
                <p className="text-[12px] font-semibold text-[#111827]">What You'll See:</p>
                <ul className="text-[11px] text-[#525866] space-y-1">
                  <li>• Status shows as "REFUNDED" instead of "SUCCESS"</li>
                  <li>• Original payment amount with strikethrough</li>
                  <li>• Complete customer and order details</li>
                  <li>• Voucher information if applicable</li>
                  <li>• Full audit trail and transaction history</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Results Modal */}
        {showSyncResults && syncResults && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowSyncResults(false)}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl border border-[#E1E4EA] w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#E1E4EA]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#ECFDF3] flex items-center justify-center">
                    <i className="pi pi-check-circle text-[#059669] text-lg" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#111827]">
                      Sync Results
                    </h2>
                    <p className="text-[13px] text-[#525866]">
                      {syncResults.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSyncResults(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <i className="pi pi-times text-[#525866]" />
                </button>
              </div>

              {/* Summary */}
              <div className="p-6 border-b border-[#E1E4EA]">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-[20px] font-bold text-[#111827]">
                      {syncResults.data.checked}
                    </p>
                    <p className="text-[12px] text-[#525866]">Checked</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[20px] font-bold text-[#059669]">
                      {syncResults.data.updated}
                    </p>
                    <p className="text-[12px] text-[#525866]">Updated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[20px] font-bold text-[#DC2626]">
                      {syncResults.data.errors}
                    </p>
                    <p className="text-[12px] text-[#525866]">Errors</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <h3 className="text-[15px] font-semibold text-[#111827] mb-4">
                  Detailed Results
                </h3>
                {syncResults.data.details.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {syncResults.data.details.map((detail, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          detail.status === "updated"
                            ? "bg-[#ECFDF3] border-[#059669]/20"
                            : detail.status === "error"
                            ? "bg-[#FEF2F2] border-[#DC2626]/20"
                            : "bg-[#F9FAFB] border-[#E1E4EA]"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-[13px] font-semibold text-[#111827] font-mono">
                              {detail.order_id}
                            </p>
                            <p className="text-[12px] text-[#525866] mt-1">
                              {detail.message}
                            </p>
                            {detail.error && (
                              <p className="text-[12px] text-[#DC2626] mt-1">
                                Error: {detail.error}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {detail.refund_amount && (
                              <span className="text-[12px] font-semibold text-[#111827]">
                                {formatCurrency(detail.refund_amount)}
                              </span>
                            )}
                            <div
                              className={`w-2 h-2 rounded-full ${
                                detail.status === "updated"
                                  ? "bg-[#059669]"
                                  : detail.status === "error"
                                  ? "bg-[#DC2626]"
                                  : "bg-[#9CA3AF]"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#525866] text-center py-8">
                    No refunds needed updating
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-[#E1E4EA]">
                <button
                  onClick={() => setShowSyncResults(false)}
                  className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#111827] hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Debug Results Modal */}
        {showDebugResults && debugResults && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowDebugResults(false)}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl border border-[#E1E4EA] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#E1E4EA]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                    <i className="pi pi-search text-[#D97706] text-lg" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#111827]">
                      Debug Results
                    </h2>
                    <p className="text-[13px] text-[#525866]">
                      Order ID: {debugResults.data.order_id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDebugResults(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <i className="pi pi-times text-[#525866]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Detection Results */}
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4 flex items-center gap-2">
                    <i className="pi pi-cog text-[#2563EB]" />
                    Refund Detection Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E1E4EA]">
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Current Status
                      </label>
                      <StatusBadge status={debugResults.data.current_status} />
                    </div>
                    <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E1E4EA]">
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Is Refunded
                      </label>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          debugResults.data.detection_results.is_refunded ? "bg-[#059669]" : "bg-[#DC2626]"
                        }`} />
                        <span className={`text-[13px] font-semibold ${
                          debugResults.data.detection_results.is_refunded ? "text-[#059669]" : "text-[#DC2626]"
                        }`}>
                          {debugResults.data.detection_results.is_refunded ? "YES" : "NO"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E1E4EA]">
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Amount Charged
                      </label>
                      <p className="text-[15px] font-semibold text-[#111827]">
                        {formatCurrency(debugResults.data.detection_results.amount_charged)}
                      </p>
                    </div>
                    <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E1E4EA]">
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Amount Settled
                      </label>
                      <p className={`text-[15px] font-semibold ${
                        debugResults.data.detection_results.amount_settled === 0 ? "text-[#DC2626]" : "text-[#111827]"
                      }`}>
                        {formatCurrency(debugResults.data.detection_results.amount_settled)}
                      </p>
                    </div>
                    {debugResults.data.detection_results.refund_reason && (
                      <div className="md:col-span-2 p-4 bg-[#F9FAFB] rounded-lg border border-[#E1E4EA]">
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                          Refund Reason
                        </label>
                        <p className="text-[13px] text-[#111827]">
                          {debugResults.data.detection_results.refund_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Flutterwave Response */}
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4 flex items-center gap-2">
                    <i className="pi pi-code text-[#D97706]" />
                    Raw Flutterwave Response
                  </h3>
                  <div className="bg-[#1F2937] rounded-lg p-4 overflow-x-auto">
                    <pre className="text-[12px] text-[#F9FAFB] font-mono whitespace-pre-wrap">
                      {JSON.stringify(debugResults.data.flutterwave_response, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Detection Logic Explanation */}
                <div className="p-4 bg-[#EFF6FF] rounded-lg border border-[#BFDBFE]">
                  <h4 className="text-[14px] font-semibold text-[#1E40AF] mb-3 flex items-center gap-2">
                    <i className="pi pi-info-circle" />
                    How Refund Detection Works
                  </h4>
                  <div className="space-y-2 text-[12px] text-[#1E40AF]">
                    <p>• <strong>Full Refund:</strong> Amount settled = 0</p>
                    <p>• <strong>Partial Refund:</strong> Amount settled &lt; Amount charged</p>
                    <p>• <strong>Status Check:</strong> Flutterwave status fields indicate refund</p>
                    <p>• <strong>Current Result:</strong> {
                      debugResults.data.detection_results.is_refunded 
                        ? "Refund detected based on the above criteria" 
                        : "No refund detected - transaction appears successful"
                    }</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-[#E1E4EA]">
                <button
                  onClick={() => setShowDebugResults(false)}
                  className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#111827] hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import OrderService from "@/lib/api/admin/orders";
import RefundService from "@/lib/api/admin/refunds";
import StatusBadge from "@/components/shared/StatusBadge";
import Toast, { ToastRef } from "@/components/shared/Toast";

interface Order {
  id: number;
  order_id: string;
  public_id?: string;
  order_status: string;
  order_type: string;
  payment_status: string;
  dispatch_status?: string;
  currency: string;
  price_fees: number;
  discount: number;
  delivery_fee?: number;
  items_subtotal?: number;
  service_fee?: number;
  tax?: number;
  refund_amount?: number | null;
  price_breakdown?: {
    gross: number;
    commission_rate: number;
    commission: number;
    vendor_share: number;
    service_fee: number;
    tax: number;
    total: number;
  };
  verification_code?: string;
  cancel_reason?: string | null;
  rejection_reason?: string | null;
  rejection_notes?: string | null;
  vendor_notes?: string | null;
  proof_delivery?: string;
  dispatch_fail_reason?: string | null;
  dispatch_attempt_count?: number;
  dispatch_radius_m?: number;
  prep_time_minutes?: number;
  vendor_rating?: number;
  vendor_review?: string;
  cancel_by?: string | null;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  accepted_at?: string;
  preparing_at?: string;
  ready_at?: string;
  vendor_accepted_at?: string;
  vendor_ready_at?: string;
  driver_assigned_at?: string;
  delivered_at?: string;
  paid_at?: string;
  firebase_dispatched_at?: string;
  dispatch_last_attempt_at?: string;
  receiver_address: {
    id: number;
    public_id: string;
    receiver_label: string;
    receiver_name: string;
    receiver_phone: string;
    dropoff_address: string;
    landmark_address: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    user_id: number;
    location_id: number;
  } | string;
  sender_address: string | null;
  delivery_address?: string;
  package: string | null;
  user: {
    id: number;
    public_id?: string;
    first_name: string | null;
    last_name: string | null;
    email?: string;
    phone: string | null;
    picture: string | null;
  };
  driver: {
    id: number;
    public_id?: string;
    first_name: string | null;
    last_name: string | null;
    email?: string;
    phone: string | null;
    picture: string | null;
    status?: string;
  } | null;
  vendor?: {
    id: string;
    name: string;
    email?: string;
    phone: string | null;
    address?: string;
    business_type?: string;
  };
  // New voucher and refund aware fields
  payment_details?: {
    tx_ref: string;
    amount_paid: number;
    discount_applied: number;
    payment_method: string;
    paid_at: string;
    voucher_used?: {
      code: string;
      name: string;
      original_amount: number;
      discount_applied: number;
    };
  };
  refund_details?: {
    refunded_amount: number;
    refund_reason: string;
    refunded_at: string;
    refund_status: string;
    refund_tx_ref?: string;
    voucher_restored?: {
      amount: number;
      voucher_code: string;
      message: string;
    };
  };
  pricing_breakdown?: {
    items_subtotal: number;
    delivery_fee: number;
    service_fee: number;
    discount: number;
    total_before_discount: number;
    total_after_discount: number;
    amount_paid: number;
    tax?: number;
    refund_amount?: number;
  };
  payment_history?: Array<{
    id?: string;
    tx_ref?: string;
    status: string;
    amount?: number;
    type?: string;
    method?: string;
    created_at?: string;
  }>;
  order_items?: Array<{
    id: number;
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    description?: string;
  }>;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const orderService = new OrderService();
  const refundService = new RefundService();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingRefund, setSyncingRefund] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderId = parseInt(params.id as string);
      const data = await orderService.getOrderDetails(orderId);
      setOrder(data);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load order details",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (first: string | null, last: string | null) => {
    return ((first?.charAt(0) || "") + (last?.charAt(0) || "")).toUpperCase() || "?";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const handleSyncRefund = async () => {
    if (!order?.refund_details || order.refund_details.refund_status === "refunded") {
      return;
    }

    try {
      setSyncingRefund(true);
      const result = await refundService.syncRefunds();
      
      // Check if this specific order was updated
      const orderUpdate = result.data.details.find(detail => 
        detail.order_id === order.order_id
      );

      if (orderUpdate && orderUpdate.status === "updated") {
        // Reload order details to show updated status
        await loadOrder();
        toast.current?.show({
          severity: "success",
          summary: "Refund Updated",
          detail: `Order ${order.order_id} refund status updated to REFUNDED`,
          life: 5000,
        });
      } else {
        toast.current?.show({
          severity: "info",
          summary: "No Update Needed",
          detail: "Refund status is already up to date",
          life: 3000,
        });
      }
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Sync Failed",
        detail: error.message || "Failed to sync refund status",
        life: 3000,
      });
    } finally {
      setSyncingRefund(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-[#525866]">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-[#525866]">Order not found</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8]"
        >
          Go Back
        </button>
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
            <h1 className="text-[24px] font-bold text-[#111827]">Order Details</h1>
            <p className="text-[13px] text-[#525866] mt-1">{order.order_id}</p>
          </div>
          <div className="flex items-center gap-3">
            {order.refund_details && order.refund_details.refund_status === "refund_pending" && (
              <button
                onClick={handleSyncRefund}
                disabled={syncingRefund}
                className="px-4 py-2 bg-[#D97706] text-white rounded-lg text-[13px] font-semibold hover:bg-[#B45309] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {syncingRefund ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <i className="pi pi-refresh" />
                    Sync Refund
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB]"
            >
              Back
            </button>
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-4">
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Order Status
            </label>
            <StatusBadge status={order.order_status} />
          </div>
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-4">
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Payment Status
            </label>
            <div className="space-y-2">
              <StatusBadge status={order.payment_status} />
              {order.refund_details && (
                <StatusBadge status={order.refund_details.refund_status} />
              )}
            </div>
          </div>
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-4">
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Order Type
            </label>
            <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
              {order.order_type}
            </span>
          </div>
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-4">
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Dispatch Status
            </label>
            {order.dispatch_status ? (
              <StatusBadge status={order.dispatch_status} />
            ) : (
              <span className="text-[11px] text-[#525866]">N/A</span>
            )}
          </div>
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-4">
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Amount Paid
            </label>
            <p className="text-[16px] font-bold text-[#111827]">
              {formatCurrency(order.payment_details?.amount_paid || order.pricing_breakdown?.amount_paid || order.price_fees)}
            </p>
            {order.payment_details?.discount_applied && order.payment_details.discount_applied > 0 && (
              <p className="text-[11px] text-[#059669] mt-1">
                -{formatCurrency(order.payment_details.discount_applied)} discount
              </p>
            )}
          </div>
        </div>

        {/* Payment Details */}
        {order.payment_details && (
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Payment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">Payment Method</label>
                <p className="text-[13px] text-[#111827] capitalize">{order.payment_details.payment_method?.replace(/_/g, ' ') || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">Transaction Ref</label>
                <p className="text-[13px] font-mono text-[#111827]">{order.payment_details.tx_ref || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">Amount Paid</label>
                <p className="text-[13px] font-semibold text-[#059669]">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(order.payment_details.amount_paid)}</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">Paid At</label>
                <p className="text-[13px] text-[#111827]">{order.payment_details.paid_at ? new Date(order.payment_details.paid_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Voucher Information */}
        {order.payment_details?.voucher_used && (
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Voucher Applied</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Voucher Code
                </label>
                <span className="text-[11px] px-3 py-2 rounded-full bg-[#ECFDF3] text-[#059669] font-semibold">
                  {order.payment_details.voucher_used.code}
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Voucher Name
                </label>
                <p className="text-[13px] text-[#111827]">
                  {order.payment_details.voucher_used.name}
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Original Amount
                </label>
                <p className="text-[13px] text-[#111827]">
                  {formatCurrency(order.payment_details.voucher_used.original_amount)}
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Discount Applied
                </label>
                <p className="text-[13px] font-semibold text-[#059669]">
                  -{formatCurrency(order.payment_details.voucher_used.discount_applied)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Refund Information */}
        {order.refund_details && (
          <div className="bg-white border border-[#FEF2F2] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4 flex items-center gap-2">
              <i className="pi pi-exclamation-triangle text-[#DC2626]" />
              Refund Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Refund Status
                </label>
                <StatusBadge status={order.refund_details.refund_status} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Refunded Amount
                </label>
                <p className="text-[15px] font-semibold text-[#DC2626]">
                  -{formatCurrency(order.refund_details.refunded_amount)}
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Refund Reason
                </label>
                <p className="text-[13px] text-[#111827]">
                  {order.refund_details.refund_reason}
                </p>
              </div>
              {order.refund_details.refunded_at && (
                <div>
                  <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                    Refunded At
                  </label>
                  <p className="text-[13px] text-[#111827]">
                    {formatDate(order.refund_details.refunded_at)}
                  </p>
                </div>
              )}
              {order.refund_details.refund_tx_ref && (
                <div>
                  <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                    Refund TX Ref
                  </label>
                  <p className="text-[13px] font-mono text-[#111827]">
                    {order.refund_details.refund_tx_ref}
                  </p>
                </div>
              )}
            </div>
            {order.refund_details.voucher_restored && (
              <div className="mt-4 p-4 bg-[#ECFDF3] rounded-lg border border-[#059669]/20">
                <div className="flex items-center gap-2 mb-2">
                  <i className="pi pi-ticket text-[#059669]" />
                  <span className="text-[13px] font-semibold text-[#059669]">Voucher Restored</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">Code</label>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-white text-[#059669] font-semibold border border-[#059669]/20">
                      {order.refund_details.voucher_restored.voucher_code}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">Amount Restored</label>
                    <p className="text-[13px] font-semibold text-[#059669]">
                      {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(order.refund_details.voucher_restored.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">Message</label>
                    <p className="text-[13px] text-[#111827]">{order.refund_details.voucher_restored.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customer Information */}
        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
          <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Customer Information</h2>
          <div className="flex items-start gap-4">
            {order.user.picture ? (
              <img
                src={order.user.picture}
                alt={order.user.first_name || "Customer"}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[20px] font-semibold">
                {getInitials(order.user.first_name, order.user.last_name)}
              </div>
            )}
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-[#111827]">
                {order.user.first_name} {order.user.last_name}
              </p>
              <p className="text-[13px] text-[#525866] mt-1">
                Phone: {order.user.phone || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Pickup Location</h2>
            <p className="text-[13px] text-[#525866]">
              {order.sender_address || "N/A"}
            </p>
          </div>
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Delivery Location</h2>
            <div className="space-y-2">
              <p className="text-[13px] text-[#525866]">
                {typeof order.receiver_address === 'string' 
                  ? order.receiver_address 
                  : order.receiver_address?.dropoff_address || "N/A"}
              </p>
              {typeof order.receiver_address === 'object' && order.receiver_address?.receiver_name && (
                <>
                  <p className="text-[13px] text-[#525866]">
                    <span className="font-semibold">Recipient:</span> {order.receiver_address.receiver_name}
                  </p>
                  <p className="text-[13px] text-[#525866]">
                    <span className="font-semibold">Phone:</span> {order.receiver_address.receiver_phone}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Driver Information */}
        {order.driver && (
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Driver Information</h2>
            <div className="flex items-start gap-4">
              {order.driver.picture ? (
                <img
                  src={order.driver.picture}
                  alt={order.driver.first_name || "Driver"}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#9c27b0] text-white flex items-center justify-center text-[20px] font-semibold">
                  {getInitials(order.driver.first_name, order.driver.last_name)}
                </div>
              )}
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-[#111827]">
                  {order.driver.first_name} {order.driver.last_name}
                </p>
                <p className="text-[13px] text-[#525866] mt-1">
                  Phone: {order.driver.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vendor Information */}
        {order.vendor && (
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Vendor Information</h2>
            <div>
              <p className="text-[15px] font-semibold text-[#111827]">
                {order.vendor.name}
              </p>
              <p className="text-[13px] text-[#525866] mt-1">
                Phone: {order.vendor.phone || "N/A"}
              </p>
              {order.vendor.email && (
                <p className="text-[13px] text-[#525866]">
                  Email: {order.vendor.email}
                </p>
              )}
              {order.vendor.business_type && (
                <p className="text-[13px] text-[#525866]">
                  Type: {order.vendor.business_type}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Price Breakdown */}
        {(order.pricing_breakdown || order.price_breakdown) && (
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Price Breakdown</h2>
            {order.pricing_breakdown ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#525866]">Items Subtotal</span>
                  <span className="text-[13px] font-semibold text-[#111827]">
                    {formatCurrency(order.pricing_breakdown.items_subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#525866]">Delivery Fee</span>
                  <span className="text-[13px] font-semibold text-[#111827]">
                    {formatCurrency(order.pricing_breakdown.delivery_fee)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#525866]">Service Fee</span>
                  <span className="text-[13px] font-semibold text-[#111827]">
                    {formatCurrency(order.pricing_breakdown.service_fee)}
                  </span>
                </div>
                {order.pricing_breakdown.tax !== undefined && order.pricing_breakdown.tax > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-[#525866]">Tax</span>
                    <span className="text-[13px] font-semibold text-[#111827]">
                      {formatCurrency(order.pricing_breakdown.tax)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#525866]">Total Before Discount</span>
                  <span className="text-[13px] font-semibold text-[#111827]">
                    {formatCurrency(order.pricing_breakdown.total_before_discount)}
                  </span>
                </div>
                {order.pricing_breakdown.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-[#525866]">Discount Applied</span>
                    <span className="text-[13px] font-semibold text-[#059669]">
                      -{formatCurrency(order.pricing_breakdown.discount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-[#E1E4EA] pt-3 flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-[#111827]">Total After Discount</span>
                  <span className="text-[15px] font-bold text-[#111827]">
                    {formatCurrency(order.pricing_breakdown.total_after_discount)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-[#F9FAFB] p-3 rounded-lg">
                  <span className="text-[13px] font-semibold text-[#111827]">Amount Paid</span>
                  <span className="text-[16px] font-bold text-[#059669]">
                    {formatCurrency(order.pricing_breakdown.amount_paid)}
                  </span>
                </div>
                {order.pricing_breakdown.refund_amount !== undefined && order.pricing_breakdown.refund_amount > 0 && (
                  <div className="flex justify-between items-center bg-[#FEF2F2] p-3 rounded-lg">
                    <span className="text-[13px] font-semibold text-[#DC2626]">Refund Amount</span>
                    <span className="text-[16px] font-bold text-[#DC2626]">
                      -{formatCurrency(order.pricing_breakdown.refund_amount)}
                    </span>
                  </div>
                )}
              </div>
            ) : order.price_breakdown && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#525866]">Items Subtotal</span>
                  <span className="text-[13px] font-semibold text-[#111827]">
                    {formatCurrency(order.price_breakdown.gross)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#525866]">Commission ({(order.price_breakdown.commission_rate * 100).toFixed(0)}%)</span>
                  <span className="text-[13px] font-semibold text-[#111827]">
                    {formatCurrency(order.price_breakdown.commission)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#525866]">Service Fee</span>
                  <span className="text-[13px] font-semibold text-[#111827]">
                    {formatCurrency(order.price_breakdown.service_fee)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#525866]">Tax</span>
                  <span className="text-[13px] font-semibold text-[#111827]">
                    {formatCurrency(order.price_breakdown.tax)}
                  </span>
                </div>
                <div className="border-t border-[#E1E4EA] pt-3 flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-[#111827]">Total</span>
                  <span className="text-[16px] font-bold text-[#111827]">
                    {formatCurrency(order.price_breakdown.total)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order Items */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.order_items.map((item, index) => (
                <div key={item.id || index} className="flex justify-between items-start p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-[14px] font-semibold text-[#111827]">{item.name}</h3>
                    {item.description && (
                      <p className="text-[12px] text-[#525866] mt-1">{item.description}</p>
                    )}
                    <p className="text-[12px] text-[#525866] mt-1">
                      {formatCurrency(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-semibold text-[#111827]">
                      {formatCurrency(item.total_price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment History */}
        {order.payment_history && order.payment_history.length > 0 && (
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Payment History</h2>
            <div className="space-y-3">
              {order.payment_history.map((payment, index) => (
                <div key={payment.id || index} className="flex justify-between items-center p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      payment.status === "REFUNDED" ? "bg-[#DC2626]" : "bg-[#059669]"
                    }`} />
                    <div>
                      <p className="text-[13px] font-semibold text-[#111827] capitalize">
                        {payment.type || (payment.status === "REFUNDED" ? "refund" : "payment")}
                      </p>
                      {payment.created_at && (
                        <p className="text-[11px] text-[#525866]">
                          {formatDate(payment.created_at)}
                        </p>
                      )}
                      {payment.tx_ref && (
                        <p className="text-[11px] text-[#525866] font-mono">
                          {payment.tx_ref}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {payment.amount !== undefined && (
                      <p className={`text-[14px] font-semibold ${
                        payment.status === "REFUNDED" ? "text-[#DC2626]" : "text-[#059669]"
                      }`}>
                        {payment.status === "REFUNDED" ? "-" : "+"}{formatCurrency(payment.amount)}
                      </p>
                    )}
                    <StatusBadge status={payment.status} />
                    {payment.method && (
                      <p className="text-[11px] text-[#525866] mt-1 capitalize">
                        {payment.method}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Timeline */}
        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
          <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Order Timeline</h2>
          <div className="space-y-3">
            {order.created_at && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#525866]">Order Created</span>
                <span className="text-[13px] text-[#111827]">{formatDate(order.created_at)}</span>
              </div>
            )}
            {order.confirmed_at && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#525866]">Confirmed</span>
                <span className="text-[13px] text-[#111827]">{formatDate(order.confirmed_at)}</span>
              </div>
            )}
            {order.accepted_at && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#525866]">Vendor Accepted</span>
                <span className="text-[13px] text-[#111827]">{formatDate(order.accepted_at)}</span>
              </div>
            )}
            {order.preparing_at && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#525866]">Preparing</span>
                <span className="text-[13px] text-[#111827]">{formatDate(order.preparing_at)}</span>
              </div>
            )}
            {order.ready_at && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#525866]">Ready for Pickup</span>
                <span className="text-[13px] text-[#111827]">{formatDate(order.ready_at)}</span>
              </div>
            )}
            {order.driver_assigned_at && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#525866]">Driver Assigned</span>
                <span className="text-[13px] text-[#111827]">{formatDate(order.driver_assigned_at)}</span>
              </div>
            )}
            {order.delivered_at && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#525866]">Delivered</span>
                <span className="text-[13px] text-[#111827]">{formatDate(order.delivered_at)}</span>
              </div>
            )}
            {order.paid_at && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#525866]">Payment Received</span>
                <span className="text-[13px] text-[#111827]">{formatDate(order.paid_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
          <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                Package Type
              </label>
              <p className="text-[13px] text-[#111827]">{order.package || "N/A"}</p>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                Currency
              </label>
              <p className="text-[13px] text-[#111827]">{order.currency}</p>
            </div>
            {order.verification_code && (
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Verification Code
                </label>
                <p className="text-[13px] font-mono bg-[#F3F4F6] px-2 py-1 rounded text-[#111827]">
                  {order.verification_code}
                </p>
              </div>
            )}
            {order.prep_time_minutes && (
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Prep Time
                </label>
                <p className="text-[13px] text-[#111827]">{order.prep_time_minutes} minutes</p>
              </div>
            )}
            {order.vendor_notes && (
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Vendor Notes
                </label>
                <p className="text-[13px] text-[#111827]">{order.vendor_notes}</p>
              </div>
            )}
            {order.vendor_rating && (
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Vendor Rating
                </label>
                <p className="text-[13px] text-[#111827]">⭐ {order.vendor_rating}/5</p>
              </div>
            )}
            {order.vendor_review && (
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Vendor Review
                </label>
                <p className="text-[13px] text-[#111827]">{order.vendor_review}</p>
              </div>
            )}
            {order.cancel_reason && (
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Cancellation Reason
                </label>
                <p className="text-[13px] text-[#DC2626]">{order.cancel_reason}</p>
              </div>
            )}
            {order.rejection_reason && (
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Rejection Reason
                </label>
                <p className="text-[13px] text-[#DC2626]">{order.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

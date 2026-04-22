"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import OrderService from "@/lib/api/admin/orders";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import StatusBadge from "@/components/shared/StatusBadge";
import Toast, { ToastRef } from "@/components/shared/Toast";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import { useDebounce } from "@/hooks/useDebounce";

interface Order {
  id: number;
  order_id: string;
  order_status: string;
  order_type: string;
  payment_status: string;
  currency: string;
  price_fees: number;
  discount: number;
  created_at: string;
  updated_at: string;
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
  package: string | null;
  user: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    picture: string | null;
  };
  driver: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    picture: string | null;
  } | null;
  vendor?: {
    id: string;
    name: string;
    phone: string | null;
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
    refund_amount?: number;
  };
}

export default function OrderListPage() {
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const orderService = new OrderService();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
  const [dispatchStatusFilter, setDispatchStatusFilter] = useState<string>("");
  const [refundStatusFilter, setRefundStatusFilter] = useState<string>("");
  const [voucherUsedFilter, setVoucherUsedFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [minPriceFilter, setMinPriceFilter] = useState<string>("");
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>("");
  const debouncedMinPrice = useDebounce(minPriceFilter, 600);
  const debouncedMaxPrice = useDebounce(maxPriceFilter, 600);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    loadOrders(pagination.page, debouncedSearch, statusFilter, orderTypeFilter, paymentStatusFilter, dispatchStatusFilter, refundStatusFilter, voucherUsedFilter, dateFrom, dateTo, debouncedMinPrice, debouncedMaxPrice);
  }, [pagination.page, debouncedSearch, statusFilter, orderTypeFilter, paymentStatusFilter, dispatchStatusFilter, refundStatusFilter, voucherUsedFilter, dateFrom, dateTo, debouncedMinPrice, debouncedMaxPrice]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, statusFilter, orderTypeFilter, paymentStatusFilter, dispatchStatusFilter, refundStatusFilter, voucherUsedFilter, dateFrom, dateTo, debouncedMinPrice, debouncedMaxPrice]);

  const loadOrders = async (
    page: number, search: string, status: string, orderType: string,
    paymentStatus: string, dispatchStatus: string, refundStatus: string,
    voucherUsed: string, dateFrom: string, dateTo: string, minPrice: string, maxPrice: string
  ) => {
    try {
      setLoading(true);
      const result = await orderService.getAllOrders({
        page, limit: pagination.limit,
        search: search || undefined,
        status: status || undefined,
        order_type: orderType || undefined,
        payment_status: paymentStatus || undefined,
        dispatch_status: dispatchStatus || undefined,
        refund_status: refundStatus || undefined,
        voucher_used: voucherUsed || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
      });
      setOrders(result.data);
      setPagination((prev) => ({ ...prev, total: result.meta.total }));
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to load orders", life: 3000 });
    } finally {
      setInitialLoad(false);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const getInitials = (first: string | null, last: string | null) => {
    return ((first?.charAt(0) || "") + (last?.charAt(0) || "")).toUpperCase() || "?";
  };

  // Server handles pagination — use orders directly

  const columns = [
    {
      field: "order_id",
      header: "Order ID",
      sortable: true,
      body: (rowData: Order) => (
        <span className="text-[13px] font-semibold text-[#111827]">
          {rowData.order_id}
        </span>
      ),
    },
    {
      field: "user",
      header: "Customer",
      sortable: false,
      body: (rowData: Order) => (
        <div className="flex items-center gap-2">
          {rowData.user?.picture ? (
            <img
              src={rowData.user.picture}
              alt={rowData.user.first_name || "Customer"}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[11px] font-semibold">
              {getInitials(rowData.user?.first_name, rowData.user?.last_name)}
            </div>
          )}
          <span className="text-[13px]">
            {rowData.user?.first_name} {rowData.user?.last_name}
          </span>
        </div>
      ),
    },

    {
      field: "order_status",
      header: "Status",
      sortable: true,
      body: (rowData: Order) => (
        <StatusBadge status={rowData.order_status} />
      ),
    },
    {
      field: "order_type",
      header: "Type",
      sortable: true,
      body: (rowData: Order) => (
        <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
          {rowData.order_type}
        </span>
      ),
    },
    {
      field: "payment_status",
      header: "Payment",
      sortable: true,
      body: (rowData: Order) => (
        <StatusBadge 
          status={rowData.refund_details ? rowData.refund_details.refund_status : rowData.payment_status} 
        />
      ),
    },
    {
      field: "voucher_info",
      header: "Voucher",
      sortable: false,
      body: (rowData: Order) => (
        <div className="flex flex-col">
          {rowData.payment_details?.voucher_used ? (
            <>
              <span className="text-[11px] px-2 py-1 rounded-full bg-[#ECFDF3] text-[#059669] font-medium">
                {rowData.payment_details.voucher_used.code}
              </span>
              <span className="text-[10px] text-[#525866] mt-1">
                -{formatCurrency(rowData.payment_details.voucher_used.discount_applied)}
              </span>
            </>
          ) : (
            <span className="text-[11px] text-[#9CA3AF]">—</span>
          )}
        </div>
      ),
    },
    {
      field: "price_fees",
      header: "Amount",
      sortable: true,
      body: (rowData: Order) => (
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-[#111827]">
            {formatCurrency(rowData.pricing_breakdown?.amount_paid || rowData.price_fees)}
          </span>
          {rowData.payment_details?.voucher_used && (
            <span className="text-[11px] text-[#059669]">
              -{formatCurrency(rowData.payment_details.voucher_used.discount_applied)} voucher
            </span>
          )}
          {rowData.refund_details && (
            <span className="text-[11px] text-[#DC2626]">
              -{formatCurrency(rowData.refund_details.refunded_amount)} refunded
            </span>
          )}
        </div>
      ),
    },
    {
      field: "created_at",
      header: "Date",
      sortable: true,
      body: (rowData: Order) => formatDate(rowData.created_at),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      body: (rowData: Order) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/order/${rowData.id}`);
          }}
          className="text-[#2563EB] hover:underline text-[13px] font-semibold"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <>
      <Toast ref={toast} />

      <div className="flex flex-col gap-4 h-full min-h-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[24px] font-bold text-[#111827]">Order Management</h1>
          <button
            onClick={() => router.push("/order/refund")}
            className="px-4 py-2 border border-[#E1E4EA] text-[#525866] rounded-lg text-[13px] font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <i className="pi pi-undo text-sm" />
            Manage Refunds
          </button>
        </div>

        {/* Search Bar and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[250px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by order ID, customer, driver, or vendor..."
            />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="PICKUP">Pickup</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select value={orderTypeFilter} onChange={(e) => setOrderTypeFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All Types</option>
            <option value="PACKAGE">Package</option>
            <option value="VENDOR">Vendor</option>
          </select>

          <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All Payment</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>

          <select value={refundStatusFilter} onChange={(e) => setRefundStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All Refunds</option>
            <option value="refund_pending">Refund Pending</option>
            <option value="refunded">Refunded</option>
            <option value="NO_REFUND">No Refund</option>
          </select>

          <button
            onClick={() => setShowFiltersModal(true)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <i className="pi pi-filter text-sm" />
            More Filters
            {(dateFrom || dateTo || minPriceFilter || maxPriceFilter || dispatchStatusFilter || voucherUsedFilter) && (
              <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
            )}
          </button>
        </div>

        {/* Data Table */}
        {initialLoad && loading ? (
          <SkeletonLoader type="table" rows={10} />
        ) : (
          <DataTable
            data={orders}
            columns={columns}
            loading={false}
            pagination={pagination}
            onPaginationChange={(newPagination) => setPagination(newPagination)}
            emptyMessage="No orders found"
            className="flex-1 min-h-0"
          />
        )}
      </div>

      {/* Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowFiltersModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl border border-[#E1E4EA] w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E1E4EA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                  <i className="pi pi-filter text-[#2563EB]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold text-[#111827]">
                    Advanced Filters
                  </h2>
                  <p className="text-[12px] text-[#525866]">
                    Filter by date range and price
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <i className="pi pi-times text-[#525866]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Date Range */}
              <div>
                <label className="block text-[13px] font-semibold text-[#111827] mb-3">
                  Date Range
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-[13px] font-semibold text-[#111827] mb-3">
                  Price Range (₦)
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Minimum Price
                    </label>
                    <input
                      type="number"
                      value={minPriceFilter}
                      onChange={(e) => setMinPriceFilter(e.target.value)}
                      placeholder="Enter minimum price"
                      className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Maximum Price
                    </label>
                    <input
                      type="number"
                      value={maxPriceFilter}
                      onChange={(e) => setMaxPriceFilter(e.target.value)}
                      placeholder="Enter maximum price"
                      className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Filters */}
              <div>
                <label className="block text-[13px] font-semibold text-[#111827] mb-3">
                  Additional Filters
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Dispatch Status
                    </label>
                    <select 
                      value={dispatchStatusFilter} 
                      onChange={(e) => setDispatchStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white"
                    >
                      <option value="">All Dispatch</option>
                      <option value="IDLE">Idle</option>
                      <option value="SEARCHING">Searching</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Voucher Usage
                    </label>
                    <select 
                      value={voucherUsedFilter} 
                      onChange={(e) => setVoucherUsedFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white"
                    >
                      <option value="">All Vouchers</option>
                      <option value="true">Voucher Used</option>
                      <option value="false">No Voucher</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between gap-3 p-6 border-t border-[#E1E4EA]">
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setMinPriceFilter("");
                  setMaxPriceFilter("");
                  setDispatchStatusFilter("");
                  setVoucherUsedFilter("");
                }}
                className="px-4 py-2 text-[13px] font-semibold text-[#525866] hover:text-[#111827] transition-colors"
              >
                Clear All
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#111827] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

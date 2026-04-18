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
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [minPriceFilter, setMinPriceFilter] = useState<string>("");
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>("");
  const debouncedMinPrice = useDebounce(minPriceFilter, 600);
  const debouncedMaxPrice = useDebounce(maxPriceFilter, 600);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    loadOrders(pagination.page, debouncedSearch, statusFilter, orderTypeFilter, paymentStatusFilter, dispatchStatusFilter, dateFrom, dateTo, debouncedMinPrice, debouncedMaxPrice);
  }, [pagination.page, debouncedSearch, statusFilter, orderTypeFilter, paymentStatusFilter, dispatchStatusFilter, dateFrom, dateTo, debouncedMinPrice, debouncedMaxPrice]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, statusFilter, orderTypeFilter, paymentStatusFilter, dispatchStatusFilter, dateFrom, dateTo, debouncedMinPrice, debouncedMaxPrice]);

  const loadOrders = async (
    page: number, search: string, status: string, orderType: string,
    paymentStatus: string, dispatchStatus: string, dateFrom: string,
    dateTo: string, minPrice: string, maxPrice: string
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
      field: "receiver_address",
      header: "Delivery Address",
      sortable: false,
      body: (rowData: Order) => {
        const addr = rowData.receiver_address;
        const addressText = typeof addr === 'string' ? addr : (addr?.dropoff_address || "N/A");
        return (
          <span className="text-[13px] text-[#525866] truncate max-w-[200px]">
            {addressText}
          </span>
        );
      },
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
        <StatusBadge status={rowData.payment_status} />
      ),
    },
    {
      field: "price_fees",
      header: "Amount",
      sortable: true,
      body: (rowData: Order) => (
        <span className="text-[13px] font-semibold text-[#111827]">
          {formatCurrency(rowData.price_fees)}
        </span>
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
          <div className="flex items-center gap-3">
            {/* Date range */}
            <div className="flex items-center rounded-lg border border-[#E1E4EA] overflow-hidden bg-white">
              <span className="px-3 text-[12px] font-medium text-[#525866] bg-[#F9FAFB] border-r border-[#E1E4EA] flex items-center py-2">Date</span>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 text-[13px] text-[#525866] focus:outline-none bg-white" />
              <span className="px-2 text-[12px] text-[#9CA3AF]">→</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 text-[13px] text-[#525866] focus:outline-none border-l border-[#E1E4EA] bg-white" />
            </div>
            {/* Price range */}
            <div className="flex items-center rounded-lg border border-[#E1E4EA] overflow-hidden bg-white">
              <span className="px-3 text-[12px] font-medium text-[#525866] bg-[#F9FAFB] border-r border-[#E1E4EA] flex items-center py-2">₦</span>
              <input type="number" value={minPriceFilter} onChange={(e) => setMinPriceFilter(e.target.value)}
                placeholder="Min"
                className="px-3 py-2 text-[13px] text-[#525866] focus:outline-none w-[80px] bg-white" />
              <span className="px-2 text-[12px] text-[#9CA3AF]">→</span>
              <input type="number" value={maxPriceFilter} onChange={(e) => setMaxPriceFilter(e.target.value)}
                placeholder="Max"
                className="px-3 py-2 text-[13px] text-[#525866] focus:outline-none border-l border-[#E1E4EA] w-[80px] bg-white" />
            </div>
          </div>
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

          <select value={dispatchStatusFilter} onChange={(e) => setDispatchStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All Dispatch</option>
            <option value="IDLE">Idle</option>
            <option value="SEARCHING">Searching</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="FAILED">Failed</option>
          </select>
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
    </>
  );
}

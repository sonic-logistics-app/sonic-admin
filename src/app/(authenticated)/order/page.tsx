"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import OrderService from "@/services/OrderService";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import StatusBadge from "@/components/shared/StatusBadge";
import Toast, { ToastRef } from "@/components/shared/Toast";

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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
  const [dispatchStatusFilter, setDispatchStatusFilter] = useState<string>("");
  const [minPriceFilter, setMinPriceFilter] = useState<string>("");
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    // Filter orders based on search query and filters
    let filtered = orders;

    if (statusFilter !== "") {
      filtered = filtered.filter(o => o.order_status === statusFilter);
    }

    if (orderTypeFilter !== "") {
      filtered = filtered.filter(o => o.order_type === orderTypeFilter);
    }

    if (paymentStatusFilter !== "") {
      filtered = filtered.filter(o => o.payment_status === paymentStatusFilter);
    }

    if (dispatchStatusFilter !== "") {
      filtered = filtered.filter(o => {
        // Dispatch status would need to be added to the response
        // For now, we'll filter based on driver assignment
        if (dispatchStatusFilter === "ASSIGNED") return o.driver !== null;
        if (dispatchStatusFilter === "IDLE") return o.driver === null;
        return true;
      });
    }

    if (minPriceFilter !== "") {
      const minPrice = parseFloat(minPriceFilter);
      filtered = filtered.filter(o => o.price_fees >= minPrice);
    }

    if (maxPriceFilter !== "") {
      const maxPrice = parseFloat(maxPriceFilter);
      filtered = filtered.filter(o => o.price_fees <= maxPrice);
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (order) =>
          order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.receiver_address && typeof order.receiver_address === 'object' && order.receiver_address.dropoff_address && order.receiver_address.dropoff_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.sender_address && typeof order.sender_address === 'string' && order.sender_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.user && order.user.first_name && order.user.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.user && order.user.last_name && order.user.last_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.user && order.user.phone && order.user.phone.includes(searchQuery)) ||
          (order.driver && order.driver.first_name && order.driver.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.driver && order.driver.last_name && order.driver.last_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.driver && order.driver.phone && order.driver.phone.includes(searchQuery)) ||
          (order.vendor && order.vendor.name && order.vendor.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.vendor && order.vendor.phone && order.vendor.phone.includes(searchQuery))
      );
    }

    setFilteredOrders(filtered);
    setPagination((prev) => ({ ...prev, page: 1, total: filtered.length }));
  }, [searchQuery, statusFilter, orderTypeFilter, paymentStatusFilter, dispatchStatusFilter, minPriceFilter, maxPriceFilter, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      console.log("🔍 RAW ORDER DATA FROM BACKEND:", JSON.stringify(data, null, 2));
      console.log("🔍 Number of orders:", data.length);
      if (data.length > 0) {
        console.log("🔍 First order sample:", JSON.stringify(data[0], null, 2));
        console.log("🔍 Order keys:", Object.keys(data[0]));
      }
      setOrders(data);
      setFilteredOrders(data);
      setPagination((prev) => ({ ...prev, total: data.length }));
    } catch (error) {
      console.error("❌ Failed to load orders:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load orders",
        life: 3000,
      });
    } finally {
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

  // Get paginated data
  const paginatedData = filteredOrders.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

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

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[#111827]">Order Management</h1>
        </div>

        {/* Search Bar and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[250px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by order ID, address, customer, driver, or vendor..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PAYMENT">In Payment</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="PICKUP">Pickup</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="DRIVER_CANCELLED">Driver Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="">All Types</option>
            <option value="PACKAGE">Package</option>
            <option value="VENDOR">Vendor</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="">All Payment</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <select
            value={dispatchStatusFilter}
            onChange={(e) => setDispatchStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="">All Dispatch</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IDLE">Idle</option>
          </select>

          <input
            type="number"
            value={minPriceFilter}
            onChange={(e) => setMinPriceFilter(e.target.value)}
            placeholder="Min Price"
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] w-[120px]"
          />

          <input
            type="number"
            value={maxPriceFilter}
            onChange={(e) => setMaxPriceFilter(e.target.value)}
            placeholder="Max Price"
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] w-[120px]"
          />
        </div>

        {/* Data Table */}
        <DataTable
          data={paginatedData}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPaginationChange={setPagination}
          emptyMessage="No orders found"
        />
      </div>
    </>
  );
}

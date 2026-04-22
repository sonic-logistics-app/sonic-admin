"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TransactionService, { Transaction, TransactionSummary } from "@/lib/api/admin/transactions";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import StatusBadge from "@/components/shared/StatusBadge";
import Toast, { ToastRef } from "@/components/shared/Toast";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import { useDebounce } from "@/hooks/useDebounce";

export default function TransactionListPage() {
  const toast = useRef<ToastRef>(null);
  const searchParams = useSearchParams();
  const transactionService = new TransactionService();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const debouncedMinAmount = useDebounce(minAmount, 600);
  const debouncedMaxAmount = useDebounce(maxAmount, 600);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlType = searchParams.get('type');
    const urlStatus = searchParams.get('status');
    
    if (urlType) {
      setTypeFilter(urlType);
    }
    if (urlStatus) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams]);

  useEffect(() => {
    loadTransactions(
      pagination.page,
      debouncedSearch,
      statusFilter,
      typeFilter,
      dateFrom,
      dateTo,
      debouncedMinAmount,
      debouncedMaxAmount
    );
  }, [
    pagination.page,
    debouncedSearch,
    statusFilter,
    typeFilter,
    dateFrom,
    dateTo,
    debouncedMinAmount,
    debouncedMaxAmount,
  ]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, statusFilter, typeFilter, dateFrom, dateTo, debouncedMinAmount, debouncedMaxAmount]);

  const loadTransactions = async (
    page: number,
    search: string,
    status: string,
    type: string,
    dateFrom: string,
    dateTo: string,
    minAmount: string,
    maxAmount: string
  ) => {
    try {
      setLoading(true);
      const result = await transactionService.getAllTransactions({
        page,
        limit: pagination.limit,
        search: search || undefined,
        status: status || undefined,
        type: type === "all" ? undefined : type,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        min_amount: minAmount ? parseFloat(minAmount) : undefined,
        max_amount: maxAmount ? parseFloat(maxAmount) : undefined,
        sortBy: "created_at",
        sortOrder: "desc",
      });
      setTransactions(result.data);
      setSummary(result.summary || null);
      setPagination((prev) => ({ ...prev, total: result.meta.total }));
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load transactions",
        life: 3000,
      });
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

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "payment":
        return "Payment";
      case "vendor_earning":
        return "Vendor Earning";
      default:
        return type;
    }
  };

  const getStatusVariant = (status: string, type: string) => {
    if (type === "payment") {
      switch (status.toUpperCase()) {
        case "SUCCESS":
          return "SUCCESS";
        case "PENDING":
          return "PENDING";
        case "FAILED":
          return "FAILED";
        case "REFUNDED":
          return "REFUNDED";
        default:
          return status;
      }
    } else {
      // vendor_earning statuses
      switch (status.toLowerCase()) {
        case "completed":
          return "SUCCESS";
        case "pending":
          return "PENDING";
        case "failed":
          return "FAILED";
        case "cancelled":
          return "CANCELLED";
        default:
          return status;
      }
    }
  };

  const columns = [
    {
      field: "id",
      header: "Transaction ID",
      sortable: true,
      body: (rowData: Transaction) => (
        <span className="text-[13px] font-semibold text-[#111827] font-mono">
          {rowData.id.length > 12 ? `${rowData.id.substring(0, 12)}...` : rowData.id}
        </span>
      ),
    },
    {
      field: "type",
      header: "Type",
      sortable: true,
      body: (rowData: Transaction) => (
        <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
          {getTransactionTypeLabel(rowData.type)}
        </span>
      ),
    },
    {
      field: "order_id",
      header: "Order ID",
      sortable: true,
      body: (rowData: Transaction) => (
        <span className="text-[13px] font-semibold text-[#2563EB]">
          {rowData.order_id}
        </span>
      ),
    },
    {
      field: "customer",
      header: "Customer",
      sortable: false,
      body: (rowData: Transaction) => (
        <div className="flex flex-col">
          <span className="text-[13px] font-medium text-[#111827]">
            {rowData.customer.name}
          </span>
          <span className="text-[11px] text-[#525866]">
            {rowData.customer.email}
          </span>
        </div>
      ),
    },
    {
      field: "vendor",
      header: "Vendor",
      sortable: false,
      body: (rowData: Transaction) => (
        <div className="flex flex-col">
          {rowData.vendor ? (
            <>
              <span className="text-[13px] font-medium text-[#111827]">
                {rowData.vendor.name}
              </span>
              <span className="text-[11px] text-[#525866]">
                {rowData.vendor.business_type}
              </span>
            </>
          ) : (
            <span className="text-[13px] text-[#9CA3AF]">—</span>
          )}
        </div>
      ),
    },
    {
      field: "amount",
      header: "Amount",
      sortable: true,
      body: (rowData: Transaction) => (
        <div className="flex flex-col">
          <span className={`text-[13px] font-semibold ${
            rowData.status === "REFUNDED" ? "text-[#DC2626] line-through" : "text-[#111827]"
          }`}>
            {formatCurrency(rowData.amount)}
          </span>
          {rowData.status === "REFUNDED" && (
            <span className="text-[11px] text-[#DC2626] font-semibold">
              REFUNDED
            </span>
          )}
          {rowData.discount && rowData.discount > 0 && (
            <span className="text-[11px] text-[#059669]">
              -{formatCurrency(rowData.discount)} discount
            </span>
          )}
        </div>
      ),
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      body: (rowData: Transaction) => (
        <StatusBadge status={getStatusVariant(rowData.status, rowData.type)} />
      ),
    },
    {
      field: "method",
      header: "Method",
      sortable: true,
      body: (rowData: Transaction) => (
        <span className="text-[13px] text-[#525866]">
          {rowData.method || rowData.vendor_transaction_type || "—"}
        </span>
      ),
    },
    {
      field: "created_at",
      header: "Date",
      sortable: true,
      body: (rowData: Transaction) => (
        <span className="text-[13px] text-[#525866]">
          {formatDate(rowData.created_at)}
        </span>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      body: (rowData: Transaction) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(rowData);
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
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[#111827]">Transaction Management</h1>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">
                    Total Payments
                  </p>
                  <p className="text-[20px] font-bold text-[#111827] mt-1">
                    {formatCurrency(summary.total_payment_amount)}
                  </p>
                  <p className="text-[11px] text-[#525866] mt-1">
                    {summary.total_successful_payments} successful transactions
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#ECFDF3] flex items-center justify-center">
                  <i className="pi pi-credit-card text-[#059669] text-lg" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">
                    Vendor Earnings
                  </p>
                  <p className="text-[20px] font-bold text-[#111827] mt-1">
                    {formatCurrency(summary.total_vendor_amount)}
                  </p>
                  <p className="text-[11px] text-[#525866] mt-1">
                    {summary.total_vendor_transactions} transactions
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                  <i className="pi pi-shop text-[#2563EB] text-lg" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">
                    Net Revenue
                  </p>
                  <p className="text-[20px] font-bold text-[#111827] mt-1">
                    {formatCurrency(summary.net_payment_revenue)}
                  </p>
                  <p className="text-[11px] text-[#525866] mt-1">
                    After {formatCurrency(summary.total_discount_given)} discounts
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                  <i className="pi pi-chart-line text-[#D97706] text-lg" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[250px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by order ID, transaction reference, or description..."
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white"
          >
            <option value="all">All Types</option>
            <option value="payment">Payments</option>
            <option value="vendor_earning">Vendor Earnings</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white"
          >
            <option value="">All Status</option>
            {typeFilter === "payment" || typeFilter === "all" ? (
              <>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </>
            ) : null}
            {typeFilter === "vendor_earning" || typeFilter === "all" ? (
              <>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </>
            ) : null}
          </select>

          <button
            onClick={() => setShowFiltersModal(true)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <i className="pi pi-filter text-sm" />
            More Filters
            {(dateFrom || dateTo || minAmount || maxAmount) && (
              <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
            )}
          </button>
        </div>

        {/* Data Table */}
        {initialLoad && loading ? (
          <SkeletonLoader type="table" rows={10} />
        ) : (
          <DataTable
            data={transactions}
            columns={columns}
            loading={false}
            pagination={pagination}
            onPaginationChange={(newPagination) => setPagination(newPagination)}
            onRowClick={handleRowClick}
            emptyMessage="No transactions found"
            className="flex-1 min-h-0"
          />
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
            showDetailsModal ? "block" : "hidden"
          }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowDetailsModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl border border-[#E1E4EA] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E1E4EA]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                  <i className="pi pi-receipt text-lg" />
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-[#111827]">
                    Transaction Details
                  </h2>
                  <p className="text-[13px] text-[#525866]">
                    {selectedTransaction.type === "payment" ? "Payment Transaction" : "Vendor Earning"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <i className="pi pi-times text-[#525866]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Transaction Information */}
              <div>
                <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Transaction Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Transaction ID
                    </label>
                    <p className="text-[13px] text-[#111827] font-mono bg-[#F3F4F6] px-2 py-1 rounded">
                      {selectedTransaction.id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Order ID
                    </label>
                    <p className="text-[13px] text-[#2563EB] font-semibold">
                      {selectedTransaction.order_id}
                    </p>
                  </div>
                  {selectedTransaction.tx_ref && (
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Transaction Reference
                      </label>
                      <p className="text-[13px] text-[#111827] font-mono">
                        {selectedTransaction.tx_ref}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <StatusBadge status={getStatusVariant(selectedTransaction.status, selectedTransaction.type)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Amount
                    </label>
                    <p className="text-[15px] font-semibold text-[#111827]">
                      {formatCurrency(selectedTransaction.amount)}
                    </p>
                  </div>
                  {selectedTransaction.discount && selectedTransaction.discount > 0 && (
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Discount Applied
                      </label>
                      <p className="text-[13px] text-[#059669] font-semibold">
                        -{formatCurrency(selectedTransaction.discount)}
                      </p>
                    </div>
                  )}
                  {selectedTransaction.method && (
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Payment Method
                      </label>
                      <p className="text-[13px] text-[#111827] capitalize">
                        {selectedTransaction.method}
                      </p>
                    </div>
                  )}
                  {selectedTransaction.description && (
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Description
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {selectedTransaction.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Name
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {selectedTransaction.customer.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {selectedTransaction.customer.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Phone
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {selectedTransaction.customer.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Customer ID
                    </label>
                    <p className="text-[13px] text-[#525866] font-mono">
                      {selectedTransaction.customer.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vendor Information */}
              {selectedTransaction.vendor && (
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Vendor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Name
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {selectedTransaction.vendor.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Business Type
                      </label>
                      <p className="text-[13px] text-[#111827] capitalize">
                        {selectedTransaction.vendor.business_type}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Email
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {selectedTransaction.vendor.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Phone
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {selectedTransaction.vendor.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Driver Information */}
              {selectedTransaction.driver && (
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Driver Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Name
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {selectedTransaction.driver.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Email
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {selectedTransaction.driver.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Phone
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {selectedTransaction.driver.phone}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Driver ID
                      </label>
                      <p className="text-[13px] text-[#525866] font-mono">
                        {selectedTransaction.driver.id}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Voucher Information */}
              {selectedTransaction.voucher && (
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Voucher Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Voucher Code
                      </label>
                      <p className="text-[13px] text-[#111827] font-mono bg-[#F3F4F6] px-2 py-1 rounded">
                        {selectedTransaction.voucher.code}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Voucher Name
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {selectedTransaction.voucher.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Original Amount
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {formatCurrency(selectedTransaction.voucher.original_amount)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Discount Applied
                      </label>
                      <p className="text-[13px] text-[#059669] font-semibold">
                        -{formatCurrency(selectedTransaction.voucher.discount_applied)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div>
                <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Order Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Order Status
                    </label>
                    <StatusBadge status={selectedTransaction.order_details.order_status} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Payment Status
                    </label>
                    <StatusBadge status={selectedTransaction.order_details.payment_status} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Order Type
                    </label>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
                      {selectedTransaction.order_details.order_type}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Items Subtotal
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {formatCurrency(selectedTransaction.order_details.items_subtotal)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Delivery Fee
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {formatCurrency(selectedTransaction.order_details.delivery_fee)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Service Fee
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {formatCurrency(selectedTransaction.order_details.service_fee)}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Total Amount
                    </label>
                    <p className="text-[15px] font-semibold text-[#111827]">
                      {formatCurrency(selectedTransaction.order_details.total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Created At
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {formatDate(selectedTransaction.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Last Updated
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {formatDate(selectedTransaction.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-[#E1E4EA]">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#111827] hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                    Filter by date range and amount
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

              {/* Amount Range */}
              <div>
                <label className="block text-[13px] font-semibold text-[#111827] mb-3">
                  Amount Range (₦)
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Minimum Amount
                    </label>
                    <input
                      type="number"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      placeholder="Enter minimum amount"
                      className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Maximum Amount
                    </label>
                    <input
                      type="number"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      placeholder="Enter maximum amount"
                      className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white"
                    />
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
                  setMinAmount("");
                  setMaxAmount("");
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
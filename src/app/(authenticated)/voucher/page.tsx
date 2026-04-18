"use client";

import { useState, useEffect, useRef } from "react";
import VoucherService, { Voucher } from "@/lib/api/admin/vouchers";
import VoucherFormDialog from "@/components/vouchers/VoucherFormDialog";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Button from "@/components/shared/Button";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import { useDebounce } from "@/hooks/useDebounce";

export default function VoucherListPage() {
  const toast = useRef<ToastRef>(null);
  const voucherService = new VoucherService();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [hasCodeFilter, setHasCodeFilter] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const debouncedMin = useDebounce(minAmount, 600);
  const debouncedMax = useDebounce(maxAmount, 600);
  const [showDialog, setShowDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "primary" | "danger" | "success";
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "primary",
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    loadVouchers(pagination.page, debouncedSearch, hasCodeFilter, debouncedMin, debouncedMax);
  }, [pagination.page, debouncedSearch, hasCodeFilter, debouncedMin, debouncedMax]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, hasCodeFilter, debouncedMin, debouncedMax]);

  const loadVouchers = async (page: number, search: string, hasCode: string, minAmt: string, maxAmt: string) => {
    try {
      setLoading(true);
      const result = await voucherService.getAllVouchers({
        page, limit: pagination.limit,
        search: search || undefined,
        has_code: hasCode || undefined,
        min_amount: minAmt || undefined,
        max_amount: maxAmt || undefined,
      });
      setVouchers(result.data || []);
      setPagination((prev) => ({ ...prev, total: result.meta.total }));
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to load vouchers", life: 3000 });
    } finally {
      setInitialLoad(false);
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedVoucher(null);
    setEditMode(false);
    setShowDialog(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setEditMode(true);
    setShowDialog(true);
  };

  const confirmDelete = (voucher: Voucher) => {
    setConfirmDialog({
      visible: true,
      title: "Confirm Deletion",
      message: `Are you sure you want to delete voucher "${voucher.code}"? This action cannot be undone.`,
      onConfirm: () => handleDelete(voucher),
      variant: "danger",
    });
  };

  const handleDelete = async (voucher: Voucher) => {
    try {
      await voucherService.deleteVoucher(voucher.id);
      toast.current?.show({ severity: "success", summary: "Success", detail: `Voucher "${voucher.code}" deleted successfully`, life: 3000 });
      loadVouchers(pagination.page, debouncedSearch, hasCodeFilter, debouncedMin, debouncedMax);
    } catch (error: any) {
      toast.current?.show({ severity: "error", summary: "Delete Failed", detail: error.message || "Failed to delete voucher", life: 3000 });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Server handles pagination

  const columns = [
    {
      field: "code",
      header: "Code",
      sortable: true,
      body: (rowData: Voucher) => (
        <span className="text-[13px] font-semibold text-[#111827]">
          {rowData.code}
        </span>
      ),
    },
    {
      field: "name",
      header: "Name",
      sortable: true,
      body: (rowData: Voucher) => (
        <span className="text-[13px] text-[#111827]">
          {rowData.name}
        </span>
      ),
    },
    {
      field: "amount",
      header: "Amount",
      sortable: true,
      body: (rowData: Voucher) => (
        <span className="text-[13px] font-semibold text-[#111827]">
          ₦{rowData.amount?.toLocaleString() || "0"}
        </span>
      ),
    },
    {
      field: "expiry_type",
      header: "Expiry",
      sortable: true,
      body: (rowData: Voucher) => (
        <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
          {rowData.expiry_type}
        </span>
      ),
    },
    {
      field: "used",
      header: "Used",
      sortable: true,
      body: (rowData: Voucher) => (
        <span className="text-[13px] text-[#111827]">
          {rowData.used || 0} times
        </span>
      ),
    },
    {
      field: "created_at",
      header: "Created",
      sortable: true,
      body: (rowData: Voucher) => formatDate(rowData.created_at),
    },
    {
      field: "actions",
      header: "Actions",
      body: (rowData: Voucher) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(rowData);
            }}
            className="text-[#2563EB] hover:underline text-[13px] font-semibold"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(rowData);
            }}
            className="text-[#DC2626] hover:underline text-[13px] font-semibold"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={confirmDialog.visible}
        onHide={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmVariant={confirmDialog.variant}
        icon={confirmDialog.variant === "danger" ? "pi-exclamation-triangle" : "pi-check-circle"}
      />

      <div className="flex flex-col gap-4 h-full min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[24px] font-bold text-[#111827]">Voucher Management</h1>
          <Button onClick={handleCreate}>
            <i className="pi pi-plus mr-2" />
            New Voucher
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[250px]">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search vouchers by code or name..." />
          </div>
          <select value={hasCodeFilter} onChange={(e) => setHasCodeFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All Vouchers</option>
            <option value="true">Has Code</option>
            <option value="false">No Code</option>
          </select>
          {/* Amount range */}
          <div className="flex items-center rounded-lg border border-[#E1E4EA] overflow-hidden bg-white">
            <span className="px-3 text-[12px] font-medium text-[#525866] bg-[#F9FAFB] border-r border-[#E1E4EA] flex items-center py-2">₦</span>
            <input type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Min" className="px-3 py-2 text-[13px] text-[#525866] focus:outline-none w-[80px] bg-white" />
            <span className="px-2 text-[12px] text-[#9CA3AF]">→</span>
            <input type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="Max" className="px-3 py-2 text-[13px] text-[#525866] focus:outline-none border-l border-[#E1E4EA] w-[80px] bg-white" />
          </div>
        </div>

        {initialLoad && loading ? (
          <SkeletonLoader type="table" rows={10} />
        ) : (
          <DataTable
            data={vouchers}
            columns={columns}
            loading={false}
            pagination={pagination}
            onPaginationChange={(newPagination) => setPagination(newPagination)}
            emptyMessage="No vouchers found"
            className="flex-1 min-h-0"
          />
        )}
      </div>

      <VoucherFormDialog
        visible={showDialog}
        editMode={editMode}
        voucher={selectedVoucher}
        onHide={() => setShowDialog(false)}
        onSave={() => loadVouchers(pagination.page, debouncedSearch, hasCodeFilter, debouncedMin, debouncedMax)}
        toast={toast}
      />
    </>
  );
}

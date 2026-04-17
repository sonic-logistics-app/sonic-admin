"use client";

import { useState, useEffect, useRef } from "react";
import VoucherService, { Voucher } from "@/services/VoucherService";
import VoucherFormDialog from "@/components/vouchers/VoucherFormDialog";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Button from "@/components/shared/Button";

export default function VoucherListPage() {
  const toast = useRef<ToastRef>(null);
  const voucherService = new VoucherService();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVouchers(vouchers);
      setPagination((prev) => ({ ...prev, total: vouchers.length }));
    } else {
      const filtered = vouchers.filter(
        (voucher) =>
          voucher.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          voucher.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVouchers(filtered);
      setPagination((prev) => ({ ...prev, page: 1, total: filtered.length }));
    }
  }, [searchQuery, vouchers]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const data = await voucherService.getAllVouchers();
      setVouchers(data || []);
      setFilteredVouchers(data || []);
      setPagination((prev) => ({ ...prev, total: (data || []).length }));
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load vouchers",
        life: 3000,
      });
    } finally {
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
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Voucher "${voucher.code}" deleted successfully`,
        life: 3000,
      });
      loadVouchers();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: error.message || "Failed to delete voucher",
        life: 3000,
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const paginatedData = filteredVouchers.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

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

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[#111827]">Voucher Management</h1>
          <Button onClick={handleCreate}>
            <i className="pi pi-plus mr-2" />
            New Voucher
          </Button>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search vouchers by code or name..."
        />

        <DataTable
          data={paginatedData}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPaginationChange={setPagination}
          emptyMessage="No vouchers found"
        />
      </div>

      <VoucherFormDialog
        visible={showDialog}
        editMode={editMode}
        voucher={selectedVoucher}
        onHide={() => setShowDialog(false)}
        onSave={loadVouchers}
        toast={toast}
      />
    </>
  );
}

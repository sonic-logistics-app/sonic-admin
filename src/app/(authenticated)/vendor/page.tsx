"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import VendorService from "@/lib/api/admin/vendors";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import StatusBadge from "@/components/shared/StatusBadge";
import Button from "@/components/shared/Button";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import { useDebounce } from "@/hooks/useDebounce";

interface KYCDocuments {
  business_registration?: string;
  tax_id?: string;
  owner_id?: string;
  bank_verification?: string;
}

interface Vendor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  business_type: string;
  logo_url: string | null;
  description: string | null;
  kyc_status: string;
  kyc_documents: KYCDocuments;
  business_registration_number: string | null;
  tax_identification_number: string | null;
  status: string;
  is_accepting_orders: boolean;
  commission_rate: number;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  is_open: boolean;
  minimum_order: string | number;
  timezone: string;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  bank_code: string | null;
  onboarding_completed: boolean;
}

export default function VendorListPage() {
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const vendorService = new VendorService();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [kycStatusFilter, setKycStatusFilter] = useState<string>("");
  const [isAcceptingOrdersFilter, setIsAcceptingOrdersFilter] = useState<string>("");
  const [isOpenFilter, setIsOpenFilter] = useState<string>("");
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
    loadVendors(pagination.page, debouncedSearch, statusFilter, categoryFilter, kycStatusFilter, isAcceptingOrdersFilter, isOpenFilter);
  }, [pagination.page, debouncedSearch, statusFilter, categoryFilter, kycStatusFilter, isAcceptingOrdersFilter, isOpenFilter]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, statusFilter, categoryFilter, kycStatusFilter, isAcceptingOrdersFilter, isOpenFilter]);

  const loadVendors = async (page: number, search: string, status: string, category: string, kycStatus: string, isAccepting: string, isOpen: string) => {
    try {
      setLoading(true);
      const result = await vendorService.getAllVendors({
        page,
        limit: pagination.limit,
        search: search || undefined,
        status: status || undefined,
        category: category || undefined,
        kyc_status: kycStatus || undefined,
        is_accepting_orders: isAccepting || undefined,
        is_open: isOpen || undefined,
      });
      setVendors(result.data);
      setPagination((prev) => ({ ...prev, total: result.meta.total }));
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to load vendors", life: 3000 });
    } finally {
      setInitialLoad(false);
      setLoading(false);
    }
  };

  const confirmDelete = (vendor: Vendor) => {
    setConfirmDialog({
      visible: true,
      title: "Confirm Vendor Deletion",
      message: `Are you sure you want to delete ${vendor.name}? This is a soft delete - the vendor can be restored later if needed.`,
      onConfirm: () => handleDelete(vendor),
      variant: "danger",
    });
  };

  const handleDelete = async (vendor: Vendor) => {
    try {
      await vendorService.deleteVendor(vendor.id);
      toast.current?.show({ severity: "success", summary: "Success", detail: `Vendor ${vendor.name} deleted successfully`, life: 3000 });
      loadVendors(pagination.page, debouncedSearch, statusFilter, categoryFilter, kycStatusFilter, isAcceptingOrdersFilter, isOpenFilter);
    } catch (error: any) {
      toast.current?.show({ severity: "error", summary: "Delete Failed", detail: error.message || "Failed to delete vendor", life: 3000 });
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get paginated data — server handles pagination

  const columns = [
    {
      field: "name",
      header: "Vendor Name",
      sortable: true,
      body: (rowData: Vendor) => (
        <div className="flex items-center gap-2">
          {rowData.logo_url ? (
            <img
              src={rowData.logo_url}
              alt={rowData.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-[11px] font-semibold">
              {getInitials(rowData.name)}
            </div>
          )}
          <span>{rowData.name}</span>
        </div>
      ),
    },
    {
      field: "email",
      header: "Email",
      sortable: true,
      body: (rowData: Vendor) => rowData.email || "N/A",
    },
    {
      field: "business_type",
      header: "Business Type",
      sortable: true,
      body: (rowData: Vendor) => (
        <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium capitalize">
          {rowData.business_type}
        </span>
      ),
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      body: (rowData: Vendor) => (
        <StatusBadge status={rowData.status} />
      ),
    },
    {
      field: "kyc_status",
      header: "KYC Status",
      sortable: true,
      body: (rowData: Vendor) => (
        <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
          {rowData.kyc_status.toUpperCase()}
        </span>
      ),
    },
    {
      field: "commission_rate",
      header: "Commission Split",
      sortable: true,
      body: (rowData: Vendor) => (
        <div className="text-[13px]">
          <div className="font-semibold text-[#111827]">
            Sonic: {rowData.commission_rate}%
          </div>
          <div className="text-[11px] text-[#059669]">
            Vendor: {100 - rowData.commission_rate}%
          </div>
        </div>
      ),
    },
    {
      field: "created_at",
      header: "Joined Date",
      sortable: true,
      body: (rowData: Vendor) => formatDate(rowData.created_at),
    },
    {
      field: "actions",
      header: "Actions",
      body: (rowData: Vendor) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/vendor/${rowData.id}`);
            }}
            className="text-[#2563EB] hover:underline text-[13px] font-semibold"
          >
            View Details
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[#111827]">Vendor Management</h1>
          <button
            onClick={() => router.push("/vendor/create")}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors flex items-center gap-2"
          >
            <i className="pi pi-plus text-sm" />
            Create Vendor
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[250px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search vendors by name, email, phone, address..."
            />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All Status</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All Categories</option>
            <option value="restaurant">Restaurant</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="shop">Shop</option>
            <option value="grocery">Grocery</option>
            <option value="gadget">Gadget</option>
            <option value="flowers">Flowers</option>
            <option value="baby">Baby</option>
            <option value="personal_care">Personal Care</option>
            <option value="beverages">Beverages</option>
            <option value="other">Other</option>
          </select>

          <select value={kycStatusFilter} onChange={(e) => setKycStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All KYC Status</option>
            <option value="not_uploaded">Not Uploaded</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <select value={isAcceptingOrdersFilter} onChange={(e) => setIsAcceptingOrdersFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All Order Status</option>
            <option value="true">Accepting Orders</option>
            <option value="false">Not Accepting</option>
          </select>

          <select value={isOpenFilter} onChange={(e) => setIsOpenFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All Availability</option>
            <option value="true">Currently Open</option>
            <option value="false">Currently Closed</option>
          </select>
        </div>

        {/* Data Table */}
        {initialLoad && loading ? (
          <SkeletonLoader type="table" rows={10} />
        ) : (
          <DataTable
            data={vendors}
            columns={columns}
            loading={false}
            pagination={pagination}
            onPaginationChange={(newPagination) => setPagination(newPagination)}
            emptyMessage="No vendors found"
            className="flex-1 min-h-0"
          />
        )}
      </div>
    </>
  );
}

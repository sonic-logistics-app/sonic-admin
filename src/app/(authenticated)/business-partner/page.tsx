"use client";

import { MENU_BADGES_EVENT } from "@/lib/menuBadges";
import StatCards from "@/components/shared/StatCards";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VendorService from "@/lib/api/admin/vendors";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import StatusBadge from "@/components/shared/StatusBadge";
import CellStack from "@/components/shared/CellStack";
import RegisteredRangeChip, { useRegisteredRange } from "@/components/shared/RegisteredRangeChip";
import { RegistrationStats, getNextPendingVendor, getRegistrationStats, getVendorLocalities } from "@/lib/api/admin/ops";
import { usePermissions } from "@/lib/auth/permissions";
import Button from "@/components/shared/Button";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { businessTypeLabel, BUSINESS_TYPE_OPTIONS } from "@/lib/businessTypes";
import ExcelExportButton from "@/components/shared/ExcelExportButton";
import { downloadExcel, fetchAllPages, formatExportDate, yesNo } from "@/lib/exportExcel";

interface KYCDocuments {
  business_registration?: string;
  tax_id?: string;
  owner_id?: string;
  bank_verification?: string;
}

interface Vendor {
  id: string;
  short_code: string;
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
  VendorAddress?: { landmark_address?: string | null } | null;
  verification?: { isComplete: boolean; completionPercentage: number; missingItems: string[] };
  locality?: string | null;
  additional_business_types?: string[];
  evidence?: { passed: number; total: number; location_photos: number; products: number; products_missing_images: number };
}

export default function VendorListPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const searchParams = useSearchParams();
  const { createdFrom, createdTo } = useRegisteredRange();
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
  const [readyFilter, setReadyFilter] = useState<string>("");
  const [localityFilter, setLocalityFilter] = useState<string>("");
  const [reviewFilter, setReviewFilter] = useState<string>("");
  const [localities, setLocalities] = useState<{ name: string; vendors: number }[]>([]);
  const [queue, setQueue] = useState<RegistrationStats["attention"] | null>(null);
  // Business partners that are approved (live)
  const [approvedCount, setApprovedCount] = useState<number | undefined>(undefined);
  // Links from the dashboard open this list already filtered (?status=...&ready=...)
  const [filtersReady, setFiltersReady] = useState(false);
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
    setStatusFilter(searchParams.get("status") || "");
    setKycStatusFilter(searchParams.get("kyc_status") || "");
    setReadyFilter(searchParams.get("ready") || "");
    setLocalityFilter(searchParams.get("locality") || "");
    setReviewFilter(searchParams.get("review") || "");
    setFiltersReady(true);
  }, [searchParams]);

  // Queue counts and neighbourhoods for the triage cards and the locality filter
  useEffect(() => {
    const loadCards = () =>
      getRegistrationStats()
        .then(({ data }) => {
          setQueue(data.attention);
          setApprovedCount(data.vendors.active);
        })
        .catch(() => undefined);
    loadCards();
    getVendorLocalities().then(({ data }) => setLocalities(data.localities)).catch(() => undefined);
    // Approving, rejecting or suspending a business partner changes these numbers, so they follow along
    window.addEventListener(MENU_BADGES_EVENT, loadCards);
    return () => window.removeEventListener(MENU_BADGES_EVENT, loadCards);
  }, []);

  useEffect(() => {
    if (!filtersReady) return;
    loadVendors(pagination.page, debouncedSearch, statusFilter, categoryFilter, kycStatusFilter, isAcceptingOrdersFilter, isOpenFilter, readyFilter);
  }, [filtersReady, pagination.page, debouncedSearch, statusFilter, categoryFilter, kycStatusFilter, isAcceptingOrdersFilter, isOpenFilter, readyFilter, localityFilter, reviewFilter, createdFrom, createdTo]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, statusFilter, categoryFilter, kycStatusFilter, isAcceptingOrdersFilter, isOpenFilter, readyFilter, localityFilter, reviewFilter, createdFrom, createdTo]);

  const loadVendors = async (page: number, search: string, status: string, category: string, kycStatus: string, isAccepting: string, isOpen: string, ready: string) => {
    try {
      setLoading(true);
      const result = await vendorService.getAllVendors<Vendor>({
        page,
        limit: pagination.limit,
        search: search || undefined,
        status: status || undefined,
        category: category || undefined,
        kyc_status: kycStatus || undefined,
        is_accepting_orders: isAccepting || undefined,
        is_open: isOpen || undefined,
        ready: ready || undefined,
        locality: localityFilter || undefined,
        review: reviewFilter || undefined,
        created_from: createdFrom || undefined,
        created_to: createdTo || undefined,
      });
      setVendors(result.data);
      setPagination((prev) => ({ ...prev, total: result.meta.total }));
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to load business partners", life: 3000 });
    } finally {
      setInitialLoad(false);
      setLoading(false);
    }
  };

  const confirmDelete = (vendor: Vendor) => {
    setConfirmDialog({
      visible: true,
      title: "Confirm Business Partner Deletion",
      message: `Are you sure you want to delete ${vendor.name}? This is a soft delete - the business partner can be restored later if needed.`,
      onConfirm: () => handleDelete(vendor),
      variant: "danger",
    });
  };

  const handleDelete = async (vendor: Vendor) => {
    try {
      await vendorService.deleteVendor(vendor.id);
      toast.current?.show({ severity: "success", summary: "Success", detail: `Business Partner ${vendor.name} deleted successfully`, life: 3000 });
      loadVendors(pagination.page, debouncedSearch, statusFilter, categoryFilter, kycStatusFilter, isAcceptingOrdersFilter, isOpenFilter, readyFilter);
    } catch (caught) {
      const error = caught as Error;
      toast.current?.show({ severity: "error", summary: "Delete Failed", detail: error.message || "Failed to delete business partner", life: 3000 });
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
      header: "Business / category",
      sortable: true,
      body: (rowData: Vendor) => (
        <div className="flex items-center gap-3">
          {rowData.logo_url ? (
            <img
              src={rowData.logo_url}
              alt={rowData.name}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
              {getInitials(rowData.name)}
            </div>
          )}
          <CellStack
            primary={rowData.name}
            secondary={
              <>
                {businessTypeLabel(rowData.business_type)}
                {(rowData.additional_business_types?.length ?? 0) > 0 && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-semibold" title={rowData.additional_business_types!.map(businessTypeLabel).join(", ")}>
                    +{rowData.additional_business_types!.length}
                  </span>
                )}
              </>
            }
            tertiary={<span className="font-mono">{rowData.short_code || "—"}</span>}
          />
        </div>
      ),
    },
    {
      field: "email",
      header: "Contact",
      sortable: true,
      body: (rowData: Vendor) => (
        <CellStack primary={rowData.email || "N/A"} secondary={rowData.phone || "No phone"} />
      ),
    },
    {
      field: "locality",
      header: "Locality",
      body: (rowData: Vendor) => <span className="text-[13px] text-[#111827]">{rowData.locality || <span className="text-[#9CA3AF]">Unknown</span>}</span>,
    },
    {
      field: "evidence",
      header: "Evidence / products",
      body: (rowData: Vendor) => {
        const e = rowData.evidence;
        if (!e) return <span className="text-[#9CA3AF]">—</span>;
        return (
          <CellStack
            primary={<span className={e.passed === e.total ? "text-[#059669]" : "text-[#92400E]"}>{e.passed}/{e.total} checks</span>}
            secondary={`${e.location_photos} location photo${e.location_photos === 1 ? "" : "s"}`}
            tertiary={
              <>
                {e.products} product{e.products === 1 ? "" : "s"}
                {e.products_missing_images > 0 && <span className="text-[#D97706]"> · {e.products_missing_images} missing images</span>}
              </>
            }
          />
        );
      },
    },
    {
      field: "status",
      header: "Status / KYC",
      sortable: true,
      body: (rowData: Vendor) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={rowData.status} />
          <span className="text-[11px] text-[#525866]">KYC: {rowData.kyc_status.replace(/_/g, " ")}</span>
        </div>
      ),
    },
    {
      field: "verification",
      header: "Approval checklist",
      body: (rowData: Vendor) => {
        if (rowData.status !== "pending_approval" || !rowData.verification) return <span className="text-[#9CA3AF]">—</span>;
        const { isComplete, missingItems } = rowData.verification;
        return isComplete ? (
          <span className="text-[11px] px-2 py-1 rounded-full bg-[#D1FAE5] text-[#065F46] font-semibold">Ready to approve</span>
        ) : (
          <span
            title={missingItems.join(", ")}
            className="text-[11px] px-2 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] font-semibold cursor-help"
          >
            Missing {missingItems.length}
          </span>
        );
      },
    },
    {
      field: "created_at",
      header: "Joined",
      sortable: true,
      body: (rowData: Vendor) => formatDate(rowData.created_at),
    },
    {
      field: "actions",
      header: "Actions",
      body: (rowData: Vendor) => (
        <div className="flex items-center gap-2">
          <button
            disabled={!can("account.delete")}
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(rowData);
            }}
            className="text-[#DC2626] hover:underline text-[13px] font-semibold disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Opens the vendor that has waited longest for a decision
  const reviewOldest = async () => {
    try {
      const { data } = await getNextPendingVendor();
      if (!data.next) {
        toast.current?.show({ severity: "info", summary: "Queue is clear", detail: "No business partners are waiting for approval", life: 3000 });
        return;
      }
      router.push(`/business-partner/${data.next.short_code || data.next.id}`);
    } catch (caught) {
      const error = caught as Error;
      toast.current?.show({ severity: "error", summary: "Error", detail: error.message || "Could not load the queue", life: 3000 });
    }
  };

  const exportVendors = async () => {
    try {
      const rows = await fetchAllPages<Vendor>((page, limit) =>
        vendorService.getAllVendors<Vendor>({
          page,
          limit,
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
          kyc_status: kycStatusFilter || undefined,
          is_accepting_orders: isAcceptingOrdersFilter || undefined,
          is_open: isOpenFilter || undefined,
          ready: readyFilter || undefined,
          locality: localityFilter || undefined,
          review: reviewFilter || undefined,
          created_from: createdFrom || undefined,
          created_to: createdTo || undefined,
        }),
      );
      if (rows.length === 0) {
        toast.current?.show({ severity: "warn", summary: "Nothing to export", detail: "No business partners match the current filters", life: 3000 });
        return;
      }
      await downloadExcel("business-partners", "Business Partners", [
        { header: "Business name", width: 28, value: (v: Vendor) => v.name },
        { header: "Code", width: 14, value: (v: Vendor) => v.short_code },
        { header: "Email", width: 30, value: (v: Vendor) => v.email },
        { header: "Phone", width: 16, value: (v: Vendor) => v.phone },
        { header: "Business type", width: 16, value: (v: Vendor) => businessTypeLabel(v.business_type) },
        { header: "Status", width: 16, value: (v: Vendor) => v.status },
        { header: "KYC status", width: 14, value: (v: Vendor) => v.kyc_status },
        { header: "Accepting orders", width: 16, value: (v: Vendor) => yesNo(v.is_accepting_orders) },
        { header: "Store open", width: 12, value: (v: Vendor) => yesNo(v.is_open) },
        { header: "Address", width: 40, value: (v: Vendor) => v.VendorAddress?.landmark_address || v.address },
        { header: "Joined", width: 22, value: (v: Vendor) => formatExportDate(v.created_at) },
      ], rows);
      toast.current?.show({ severity: "success", summary: "Exported", detail: `${rows.length} business partners exported`, life: 3000 });
    } catch (caught) {
      const error = caught as Error;
      toast.current?.show({ severity: "error", summary: "Export failed", detail: error.message || "Could not export business partners", life: 4000 });
    }
  };

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[#111827]">Business Partner Management</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={reviewOldest}
              className="px-4 py-2 border border-[#2563EB] text-[#2563EB] rounded-lg text-[13px] font-semibold hover:bg-[#EFF6FF] transition-colors"
            >
              Review oldest pending
            </button>
            <ExcelExportButton onExport={exportVendors} />
          <button
            disabled={!can("account.create")}
            onClick={() => router.push("/business-partner/create")}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors flex items-center gap-2"
          >
            <i className="pi pi-plus text-sm" />
            Create Business Partner
          </button>
          </div>
        </div>

        {/* Review queue */}
        {queue && (
          <StatCards
            cards={[
              { key: "pending", label: "Pending approval", value: queue.vendors_pending_approval, tone: "warn", active: statusFilter === "pending_approval" && !readyFilter && !reviewFilter, onClick: () => router.push(statusFilter === "pending_approval" && !readyFilter && !reviewFilter ? "/business-partner" : "/business-partner?status=pending_approval") },
              { key: "approved", label: "Approved", value: approvedCount, tone: "good", active: statusFilter === "active" && !readyFilter && !reviewFilter, onClick: () => router.push(statusFilter === "active" && !readyFilter && !reviewFilter ? "/business-partner" : "/business-partner?status=active") },
              { key: "ready", label: "Ready to approve", value: queue.vendors_ready_to_approve, tone: "good", active: readyFilter === "true", onClick: () => router.push(readyFilter === "true" ? "/business-partner" : "/business-partner?status=pending_approval&ready=true") },
              { key: "corrections", label: "Needs correction", value: queue.vendors_with_open_corrections, tone: "warn", active: reviewFilter === "corrections", onClick: () => router.push(reviewFilter === "corrections" ? "/business-partner" : "/business-partner?review=corrections") },
              { key: "flags", label: "Flagged", value: queue.vendors_with_open_flags, tone: "bad", active: reviewFilter === "flags", onClick: () => router.push(reviewFilter === "flags" ? "/business-partner" : "/business-partner?review=flags") },
            ]}
          />
        )}

        <RegisteredRangeChip />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[250px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search business partners by name, email, phone, address..."
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
            {BUSINESS_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select value={kycStatusFilter} onChange={(e) => setKycStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All KYC Status</option>
            <option value="not_uploaded">Not Uploaded</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <select value={localityFilter} onChange={(e) => setLocalityFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All Localities</option>
            {localities.map((l) => (
              <option key={l.name} value={l.name}>{l.name} ({l.vendors})</option>
            ))}
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
          <DataTable data={[]} columns={columns} loading pagination={pagination} />
        ) : (
          <DataTable
            data={vendors}
            columns={columns}
            loading={false}
            pagination={pagination}
            onPaginationChange={(newPagination) => setPagination(newPagination)}
            onRowClick={(vendor) => router.push(`/business-partner/${vendor.short_code || vendor.id}`)}
            emptyMessage="No business partners found"
          />
        )}
      </div>
    </>
  );
}

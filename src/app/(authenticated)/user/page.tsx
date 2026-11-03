"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CustomerService from "@/lib/api/admin/customers";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import StatusBadge from "@/components/shared/StatusBadge";
import CellStack from "@/components/shared/CellStack";
import StatCards from "@/components/shared/StatCards";
import { useListStats } from "@/hooks/useListStats";
import RegisteredRangeChip, { useRegisteredRange } from "@/components/shared/RegisteredRangeChip";
import { usePermissions } from "@/lib/auth/permissions";
import Button from "@/components/shared/Button";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import { useOptimisticUpdate } from "@/hooks/useOptimisticUpdate";
import { useDebounce } from "@/hooks/useDebounce";
import ExcelExportButton from "@/components/shared/ExcelExportButton";
import { downloadExcel, fetchAllPages, formatExportDate, yesNo } from "@/lib/exportExcel";

interface Customer {
  id: number;
  suspended_at?: string | null;
  public_id: string;
  short_code: string;
  first_name: string | null;
  last_name: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  picture: string | null;
  profile_image_url: string | null;
  is_login: boolean;
  otp_verified: boolean;
  provider: string;
  google_id: string | null;
  apple_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  full_name: string | null;
  is_agree: boolean | null;
  is_verified: boolean;
  welcome_voucher_used: boolean;
  voucher_status?: string;
  referral_code: string | null;
  referral_used: number | null;
  earn_referral: number | null;
  last_login_at: string | null;
}

export default function UserListPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const searchParams = useSearchParams();
  const { createdFrom, createdTo } = useRegisteredRange();
  const [filtersReady, setFiltersReady] = useState(false);
  const toast = useRef<ToastRef>(null);
  const customerService = new CustomerService();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [isVerifiedFilter, setIsVerifiedFilter] = useState<string>("");
  const [suspendedFilter, setSuspendedFilter] = useState<string>("");
  const { counts: userCounts, reload: reloadUserCounts } = useListStats("users");
  const [otpVerifiedFilter, setOtpVerifiedFilter] = useState<string>("");
  const [providerFilter, setProviderFilter] = useState<string>("");
  const { data: optimisticCustomers, optimisticUpdate, resetData } = useOptimisticUpdate<Customer>(customers);
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
    limit: 20,
    total: 0,
  });

  // Dashboard links open this list already filtered (?verified=false)
  useEffect(() => {
    setIsVerifiedFilter(searchParams.get("verified") || "");
    setFiltersReady(true);
  }, [searchParams]);

  // Fetch when page, search, or filters change
  useEffect(() => {
    if (!filtersReady) return;
    loadCustomers(pagination.page, debouncedSearchQuery, isVerifiedFilter, providerFilter, otpVerifiedFilter);
  }, [filtersReady, pagination.page, debouncedSearchQuery, isVerifiedFilter, providerFilter, otpVerifiedFilter, suspendedFilter, createdFrom, createdTo]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearchQuery, isVerifiedFilter, providerFilter, otpVerifiedFilter, suspendedFilter, createdFrom, createdTo]);

  const loadCustomers = async (page: number, search: string, isVerified: string, provider: string, otpVerified: string) => {
    try {
      setLoading(true);
      const result = await customerService.getAllCustomers<Omit<Customer, "name">>({
        page,
        limit: pagination.limit,
        search: search || undefined,
        is_verified: isVerified || undefined,
        provider: provider || undefined,
        otp_verified: otpVerified || undefined,
        suspended: suspendedFilter || undefined,
        created_from: createdFrom || undefined,
        created_to: createdTo || undefined,
      });

      const formattedCustomers = result.data.map((customer) => ({
        ...customer,
        name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "No Name",
      }));

      setCustomers(formattedCustomers);
      resetData(formattedCustomers);
      setPagination((prev) => ({ ...prev, total: result.meta.total }));
      reloadUserCounts();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load users",
        life: 3000,
      });
    } finally {
      setInitialLoad(false);
      setLoading(false);
    }
  };

  const handleVerify = async (customer: Customer) => {
    await optimisticUpdate(
      (currentData) => currentData.map(c =>
        c.id === customer.id ? { ...c, is_verified: true } : c
      ),
      () => customerService.verifyCustomer(customer.id),
      (result, newData) => {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: `User ${customer.name} verified successfully`,
          life: 3000,
        });
        return newData;
      },
      (error) => {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to verify user",
          life: 3000,
        });
      }
    );
  };

  const confirmVerify = (customer: Customer) => {
    setConfirmDialog({
      visible: true,
      title: "Confirm Verification",
      message: `Are you sure you want to verify ${customer.name}?`,
      onConfirm: () => handleVerify(customer),
      variant: "success",
    });
  };

  const confirmDelete = (customer: Customer) => {
    setConfirmDialog({
      visible: true,
      title: "Confirm Deletion",
      message: `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
      onConfirm: () => handleDelete(customer),
      variant: "danger",
    });
  };

  const handleDelete = async (customer: Customer) => {
    await optimisticUpdate(
      (currentData) => currentData.filter(c => c.id !== customer.id),
      () => customerService.deleteCustomer(customer.id),
      (result, newData) => {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: `User ${customer.name} deleted successfully`,
          life: 3000,
        });
        return newData;
      },
      (error: Error) => {
        toast.current?.show({
          severity: "error",
          summary: "Delete Failed",
          detail: error.message || "Failed to delete user",
          life: 3000,
        });
      }
    );
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
    });
  };

  const handleRowClick = (customer: Customer) => {
    router.push(`/user/${customer.short_code || customer.id}`);
  };

  const columns = [
    {
      field: "name",
      header: "User",
      sortable: true,
      body: (rowData: Customer) => (
        <div className="flex items-center gap-3">
          {(rowData.picture || rowData.profile_image_url) ? (
            <img
              src={rowData.picture || rowData.profile_image_url || undefined}
              alt={rowData.name}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
              {getInitials(rowData.first_name, rowData.last_name)}
            </div>
          )}
          <CellStack
            primary={
              <>
                {rowData.name}
                {rowData.suspended_at && (
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] font-semibold">Suspended</span>
                )}
              </>
            }
            secondary={<span className="font-mono">{rowData.short_code || "—"}</span>}
          />
        </div>
      ),
    },
    {
      field: "email",
      header: "Contact",
      sortable: true,
      body: (rowData: Customer) => (
        <CellStack primary={rowData.email || "N/A"} secondary={rowData.phone || "No phone"} />
      ),
    },
    {
      field: "is_verified",
      header: "Verified / sign-up",
      sortable: true,
      body: (rowData: Customer) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={rowData.is_verified ? "VERIFIED" : "PENDING"} />
          <span className="text-[11px] text-[#525866]">via {rowData.provider}</span>
        </div>
      ),
    },
    {
      field: "created_at",
      header: "Joined Date",
      sortable: true,
      body: (rowData: Customer) => formatDate(rowData.created_at),
    },
    {
      field: "actions",
      header: "Actions",
      body: (rowData: Customer) => (
        <div className="flex items-center gap-2">
          {!rowData.is_verified && can("account.verify") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                confirmVerify(rowData);
              }}
              className="text-[#059669] hover:underline text-[13px] font-semibold"
            >
              Verify
            </button>
          )}
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

  const exportUsers = async () => {
    try {
      const rows = await fetchAllPages<Customer>((page, limit) =>
        customerService.getAllCustomers<Customer>({
          page,
          limit,
          search: debouncedSearchQuery || undefined,
          is_verified: isVerifiedFilter || undefined,
          provider: providerFilter || undefined,
          otp_verified: otpVerifiedFilter || undefined,
          suspended: suspendedFilter || undefined,
          created_from: createdFrom || undefined,
          created_to: createdTo || undefined,
        }),
      );
      if (rows.length === 0) {
        toast.current?.show({ severity: "warn", summary: "Nothing to export", detail: "No users match the current filters", life: 3000 });
        return;
      }
      await downloadExcel("users", "Users", [
        { header: "Name", width: 26, value: (c: Customer) => `${c.first_name || ""} ${c.last_name || ""}`.trim() || "No Name" },
        { header: "Code", width: 14, value: (c: Customer) => c.short_code },
        { header: "Email", width: 30, value: (c: Customer) => c.email },
        { header: "Phone", width: 16, value: (c: Customer) => c.phone },
        { header: "Verified", width: 10, value: (c: Customer) => yesNo(c.is_verified) },
        { header: "Sign-up method", width: 16, value: (c: Customer) => c.provider },
        { header: "Joined", width: 22, value: (c: Customer) => formatExportDate(c.created_at) },
        { header: "Last login", width: 22, value: (c: Customer) => formatExportDate(c.last_login_at) },
      ], rows);
      toast.current?.show({ severity: "success", summary: "Exported", detail: `${rows.length} users exported`, life: 3000 });
    } catch (caught) {
      const error = caught as Error;
      toast.current?.show({ severity: "error", summary: "Export failed", detail: error.message || "Could not export users", life: 4000 });
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

      <div className="flex flex-col gap-4 h-full min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[#111827]">User Management</h1>
          <div className="flex items-center gap-2">
            <ExcelExportButton onExport={exportUsers} />
          <button
            disabled={!can("account.create")}
            onClick={() => router.push("/user/create")}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors flex items-center gap-2"
          >
            <i className="pi pi-plus text-sm" />
            Create User
          </button>
          </div>
        </div>

        {/* Search Bar */}
        <StatCards
          cards={[
            { key: "all", label: "All users", value: userCounts?.total, active: !isVerifiedFilter && !suspendedFilter, onClick: () => { setIsVerifiedFilter(""); setSuspendedFilter(""); } },
            { key: "verified", label: "Verified", value: userCounts?.verified, tone: "good", active: isVerifiedFilter === "true" && !suspendedFilter, onClick: () => { setIsVerifiedFilter(isVerifiedFilter === "true" ? "" : "true"); setSuspendedFilter(""); } },
            { key: "unverified", label: "Unverified", value: userCounts?.unverified, tone: "warn", active: isVerifiedFilter === "false" && !suspendedFilter, onClick: () => { setIsVerifiedFilter(isVerifiedFilter === "false" ? "" : "false"); setSuspendedFilter(""); } },
            { key: "suspended", label: "Suspended", value: userCounts?.suspended, tone: "bad", active: suspendedFilter === "true", onClick: () => { setSuspendedFilter(suspendedFilter === "true" ? "" : "true"); setIsVerifiedFilter(""); } },
            { key: "new", label: "New, 7 days", value: userCounts?.new_7_days, active: false, onClick: () => router.push(`/user?created_from=${new Date(Date.now() - 6 * 86400000 + 3600000).toISOString().slice(0, 10)}&created_to=${new Date(Date.now() + 3600000).toISOString().slice(0, 10)}`) },
          ]}
        />

        <RegisteredRangeChip />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[250px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search users by name, email, or phone..."
            />
          </div>

          <select
            value={isVerifiedFilter}
            onChange={(e) => setIsVerifiedFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white"
          >
            <option value="">All Verification Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white"
          >
            <option value="">All Providers</option>
            <option value="CREDENTIALS">Email/Password</option>
            <option value="GOOGLE">Google</option>
            <option value="APPLE">Apple</option>
            <option value="FACEBOOK">Facebook</option>
          </select>

          <select
            value={otpVerifiedFilter}
            onChange={(e) => setOtpVerifiedFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white"
          >
            <option value="">All OTP Status</option>
            <option value="true">OTP Verified</option>
            <option value="false">OTP Not Verified</option>
          </select>
        </div>

        {/* Data Table */}
        {initialLoad && loading ? (
          <SkeletonLoader type="table" rows={10} />
        ) : (
          <>
          <DataTable
            data={optimisticCustomers}
            columns={columns}
            loading={false}
            pagination={pagination}
            onPaginationChange={(newPagination) => {
              setPagination(newPagination);
            }}
            onRowClick={handleRowClick}
            emptyMessage="No users found"
            className="flex-1 min-h-0"
          />
          </>
        )}
      </div>
    </>
  );
}

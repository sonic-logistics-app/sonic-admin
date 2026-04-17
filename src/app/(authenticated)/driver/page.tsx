"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DriverService from "@/services/DriverService";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import StatusBadge from "@/components/shared/StatusBadge";
import Button from "@/components/shared/Button";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

interface VerificationStatus {
  personal_info: "PENDING" | "VERIFIED" | "REJECTED";
  document: "PENDING" | "VERIFIED" | "REJECTED";
  vehicle: "PENDING" | "VERIFIED" | "REJECTED";
  id_confirmation: "PENDING" | "VERIFIED" | "REJECTED";
  bank_account: "PENDING" | "VERIFIED" | "REJECTED";
}

interface Driver {
  id: number;
  public_id: string;
  first_name: string | null;
  last_name: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  picture: string | null;
  profile_image_url: string | null;
  uploaded_files?: {
    profile_image?: string;
    national_id_image?: string;
    driver_license_image?: string;
    vehicle_image?: string;
    vehicle_certificate?: string;
    selfie_image?: string;
  };
  otp_verified: boolean;
  provider: string;
  apple_id: string | null;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  full_name: string | null;
  kyc_status: string;
  status: string;
  no_show_count: number;
  verificationStatus: VerificationStatus;
  verificationProgress: string;
}

export default function DriverListPage() {
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const driverService = new DriverService();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [kycStatusFilter, setKycStatusFilter] = useState<string>("");
  const [isVerifiedFilter, setIsVerifiedFilter] = useState<string>("");
  const [providerFilter, setProviderFilter] = useState<string>("");
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
    loadDrivers();
  }, []);

  useEffect(() => {
    // Filter drivers based on search query and filters
    let filtered = drivers;

    if (statusFilter !== "") {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    if (kycStatusFilter !== "") {
      filtered = filtered.filter(d => d.kyc_status === kycStatusFilter);
    }

    if (isVerifiedFilter !== "") {
      filtered = filtered.filter(d => {
        const isVerified = Object.values(d.verificationStatus).every(status => status === "VERIFIED");
        return isVerified === (isVerifiedFilter === "true");
      });
    }

    if (providerFilter !== "") {
      filtered = filtered.filter(d => d.provider === providerFilter);
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (driver) =>
          driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (driver.email && driver.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (driver.phone && driver.phone.includes(searchQuery))
      );
    }

    setFilteredDrivers(filtered);
    setPagination((prev) => ({ ...prev, page: 1, total: filtered.length }));
  }, [searchQuery, statusFilter, kycStatusFilter, isVerifiedFilter, providerFilter, drivers]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      
      const data = await driverService.getAllDrivers();
      
      const formattedDrivers = data.map((driver: any) => ({
        ...driver,
        name: `${driver.first_name || ""} ${driver.last_name || ""}`.trim() || "No Name",
      }));
      
      setDrivers(formattedDrivers);
      setFilteredDrivers(formattedDrivers);
      setPagination((prev) => ({ ...prev, total: formattedDrivers.length }));
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load drivers",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (driver: Driver) => {
    setConfirmDialog({
      visible: true,
      title: "Confirm Deletion",
      message: `Are you sure you want to delete ${driver.name}? This action cannot be undone.`,
      onConfirm: () => handleDelete(driver),
      variant: "danger",
    });
  };

  const handleDelete = async (driver: Driver) => {
    try {
      await driverService.deleteDriver(driver.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Driver ${driver.name} deleted successfully`,
        life: 3000,
      });
      loadDrivers();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: error.message || "Failed to delete driver",
        life: 3000,
      });
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

  const getInitials = (first: string | null, last: string | null) => {
    return ((first?.charAt(0) || "") + (last?.charAt(0) || "")).toUpperCase() || "?";
  };

  const handleRowClick = async (driver: Driver) => {
    router.push(`/driver/${driver.id}`);
  };

  const getVerificationProgress = (verificationStatus: VerificationStatus) => {
    const total = 5;
    const verified = Object.values(verificationStatus).filter(status => status === "VERIFIED").length;
    return `${verified}/${total}`;
  };

  const getOverallVerificationStatus = (verificationStatus: VerificationStatus) => {
    const statuses = Object.values(verificationStatus);
    const verifiedCount = statuses.filter(status => status === "VERIFIED").length;
    const rejectedCount = statuses.filter(status => status === "REJECTED").length;
    
    if (verifiedCount === 5) return "VERIFIED";
    if (rejectedCount > 0) return "REJECTED";
    return "PENDING";
  };

  // Get paginated data
  const paginatedData = filteredDrivers.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      body: (rowData: Driver) => (
        <div className="flex items-center gap-2">
          {(rowData.picture || rowData.profile_image_url || rowData.uploaded_files?.profile_image) ? (
            <img
              src={rowData.picture || rowData.profile_image_url || rowData.uploaded_files?.profile_image}
              alt={rowData.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#9c27b0] text-white flex items-center justify-center text-[11px] font-semibold">
              {getInitials(rowData.first_name, rowData.last_name)}
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
      body: (rowData: Driver) => rowData.email || "N/A",
    },
    {
      field: "phone",
      header: "Phone",
      sortable: true,
      body: (rowData: Driver) => rowData.phone || "N/A",
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      body: (rowData: Driver) => (
        <StatusBadge status={rowData.status} />
      ),
    },
    {
      field: "kyc_status",
      header: "KYC Status",
      sortable: true,
      body: (rowData: Driver) => (
        <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
          {rowData.kyc_status.toUpperCase()}
        </span>
      ),
    },
    {
      field: "verificationProgress",
      header: "Verification Progress",
      sortable: true,
      body: (rowData: Driver) => (
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium">
            {getVerificationProgress(rowData.verificationStatus)}
          </span>
          <StatusBadge status={getOverallVerificationStatus(rowData.verificationStatus)} />
        </div>
      ),
    },
    {
      field: "created_at",
      header: "Joined Date",
      sortable: true,
      body: (rowData: Driver) => formatDate(rowData.created_at),
    },
    {
      field: "actions",
      header: "Actions",
      body: (rowData: Driver) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/driver/${rowData.id}`);
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

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[#111827]">Driver Management</h1>
          <button
            onClick={() => router.push("/driver/create")}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors flex items-center gap-2"
          >
            <i className="pi pi-plus text-sm" />
            Create Driver
          </button>
        </div>

        {/* Search Bar and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[250px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search drivers by name, email, or phone..."
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="">All Status</option>
            <option value="OFFLINE">Offline</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="BUSY">Busy</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={kycStatusFilter}
            onChange={(e) => setKycStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="">All KYC Status</option>
            <option value="not_uploaded">Not Uploaded</option>
            <option value="pending">Pending</option>
            <option value="abandoned">Abandoned</option>
            <option value="failed">Failed</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={isVerifiedFilter}
            onChange={(e) => setIsVerifiedFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="">All Verification Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="">All Providers</option>
            <option value="CREDENTIALS">Email/Password</option>
            <option value="GOOGLE">Google</option>
            <option value="APPLE">Apple</option>
            <option value="FACEBOOK">Facebook</option>
          </select>
        </div>

        {/* Data Table */}
        <DataTable
          data={paginatedData}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPaginationChange={setPagination}
          onRowClick={handleRowClick}
          emptyMessage="No drivers found"
        />
      </div>
    </>
  );
}

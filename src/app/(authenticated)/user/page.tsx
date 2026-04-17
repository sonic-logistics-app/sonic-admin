"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CustomerService from "@/services/CustomerService";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import StatusBadge from "@/components/shared/StatusBadge";
import Button from "@/components/shared/Button";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

interface Customer {
  id: number;
  public_id: string;
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
  referral_code: string | null;
  referral_used: number | null;
  earn_referral: number | null;
  last_login_at: string | null;
}

export default function UserListPage() {
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const customerService = new CustomerService();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVerifiedFilter, setIsVerifiedFilter] = useState<string>("");
  const [providerFilter, setProviderFilter] = useState<string>("");
  const [otpVerifiedFilter, setOtpVerifiedFilter] = useState<string>("");
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
    loadCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search query and filters
    let filtered = customers;

    if (isVerifiedFilter !== "") {
      filtered = filtered.filter(c => c.is_verified === (isVerifiedFilter === "true"));
    }

    if (providerFilter !== "") {
      filtered = filtered.filter(c => c.provider === providerFilter);
    }

    if (otpVerifiedFilter !== "") {
      filtered = filtered.filter(c => c.otp_verified === (otpVerifiedFilter === "true"));
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (customer.phone && customer.phone.includes(searchQuery))
      );
    }

    setFilteredCustomers(filtered);
    setPagination((prev) => ({ ...prev, page: 1, total: filtered.length }));
  }, [searchQuery, isVerifiedFilter, providerFilter, otpVerifiedFilter, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllCustomers();
      
      // Log the raw data from backend
      console.log("🔍 RAW DATA FROM BACKEND:", JSON.stringify(data, null, 2));
      console.log("🔍 Number of customers:", data.length);
      console.log("🔍 First customer sample:", data[0]);
      
      const formattedCustomers = data.map((customer: any) => ({
        ...customer,
        name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "No Name",
      }));
      
      console.log("✅ FORMATTED CUSTOMERS:", JSON.stringify(formattedCustomers.slice(0, 3), null, 2));
      
      setCustomers(formattedCustomers);
      setFilteredCustomers(formattedCustomers);
      setPagination((prev) => ({ ...prev, total: formattedCustomers.length }));
    } catch (error) {
      console.error("❌ Failed to load customers:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load customers",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (customer: Customer) => {
    try {
      await customerService.verifyCustomer(customer.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Customer ${customer.name} verified successfully`,
        life: 3000,
      });
      loadCustomers();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to verify customer",
        life: 3000,
      });
    }
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
    try {
      await customerService.deleteCustomer(customer.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Customer ${customer.name} deleted successfully`,
        life: 3000,
      });
      loadCustomers();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: error.message || "Failed to delete customer",
        life: 3000,
      });
    }
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
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  // Get paginated data
  const paginatedData = filteredCustomers.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      body: (rowData: Customer) => (
        <div className="flex items-center gap-2">
          {(rowData.picture || rowData.profile_image_url) ? (
            <img
              src={rowData.picture || rowData.profile_image_url || undefined}
              alt={rowData.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[11px] font-semibold">
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
      body: (rowData: Customer) => rowData.email || "N/A",
    },
    {
      field: "phone",
      header: "Phone",
      sortable: true,
      body: (rowData: Customer) => rowData.phone || "N/A",
    },
    {
      field: "is_verified",
      header: "Verified",
      sortable: true,
      body: (rowData: Customer) => (
        <StatusBadge status={rowData.is_verified ? "VERIFIED" : "PENDING"} />
      ),
    },
    {
      field: "provider",
      header: "Provider",
      sortable: true,
      body: (rowData: Customer) => (
        <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
          {rowData.provider}
        </span>
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(rowData);
            }}
            className="text-[#2563EB] hover:underline text-[13px] font-semibold"
          >
            View
          </button>
          {!rowData.is_verified && (
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
          <h1 className="text-[24px] font-bold text-[#111827]">Customer Management</h1>
          <button
            onClick={() => router.push("/user/create")}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors flex items-center gap-2"
          >
            <i className="pi pi-plus text-sm" />
            Create User
          </button>
        </div>

        {/* Search Bar and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[250px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search customers by name, email, or phone..."
            />
          </div>
          
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

          <select
            value={otpVerifiedFilter}
            onChange={(e) => setOtpVerifiedFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="">All OTP Status</option>
            <option value="true">OTP Verified</option>
            <option value="false">OTP Not Verified</option>
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
          emptyMessage="No customers found"
        />
      </div>

      {/* User Details Modal */}
      {selectedCustomer && (
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
          <div className="relative bg-white rounded-2xl border border-[#E1E4EA] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E1E4EA]">
              <div className="flex items-center gap-3">
                {(selectedCustomer.picture || selectedCustomer.profile_image_url) ? (
                  <img
                    src={selectedCustomer.picture || selectedCustomer.profile_image_url || undefined}
                    alt={selectedCustomer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[16px] font-semibold">
                    {getInitials(selectedCustomer.first_name, selectedCustomer.last_name)}
                  </div>
                )}
                <div>
                  <h2 className="text-[18px] font-semibold text-[#111827]">
                    {selectedCustomer.name}
                  </h2>
                  <p className="text-[13px] text-[#525866]">
                    User ID: {selectedCustomer.public_id}
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
              {/* Personal Information */}
              <div>
                <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      First Name
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {selectedCustomer.first_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Last Name
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {selectedCustomer.last_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {selectedCustomer.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Phone
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {selectedCustomer.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Account Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Verification Status
                    </label>
                    <StatusBadge status={selectedCustomer.is_verified ? "VERIFIED" : "PENDING"} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      OTP Verified
                    </label>
                    <StatusBadge status={selectedCustomer.otp_verified ? "VERIFIED" : "PENDING"} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Login Provider
                    </label>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
                      {selectedCustomer.provider}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Currently Logged In
                    </label>
                    <StatusBadge status={selectedCustomer.is_login ? "ACTIVE" : "INACTIVE"} />
                  </div>
                </div>
              </div>

              {/* Activity Information */}
              <div>
                <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Activity Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Joined Date
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {formatDate(selectedCustomer.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Last Login
                    </label>
                    <p className="text-[13px] text-[#111827]">
                      {formatDate(selectedCustomer.last_login_at)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Welcome Voucher Used
                    </label>
                    <StatusBadge status={selectedCustomer.welcome_voucher_used ? "USED" : "AVAILABLE"} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Terms Agreed
                    </label>
                    <StatusBadge status={selectedCustomer.is_agree ? "AGREED" : "PENDING"} />
                  </div>
                </div>
              </div>

              {/* Referral Information */}
              {selectedCustomer.referral_code && (
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Referral Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Referral Code
                      </label>
                      <p className="text-[13px] text-[#111827] font-mono bg-[#F3F4F6] px-2 py-1 rounded">
                        {selectedCustomer.referral_code}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Referrals Used
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {selectedCustomer.referral_used || 0}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Earnings from Referrals
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        ₦{selectedCustomer.earn_referral || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-6 border-t border-[#E1E4EA]">
              {!selectedCustomer.is_verified && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    confirmVerify(selectedCustomer);
                  }}
                  className="px-4 py-2"
                >
                  <i className="pi pi-check mr-2" />
                  Verify User
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false);
                  confirmDelete(selectedCustomer);
                }}
                className="px-4 py-2 text-[#DC2626] border-[#DC2626] hover:bg-[#DC2626] hover:text-white"
              >
                <i className="pi pi-trash mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

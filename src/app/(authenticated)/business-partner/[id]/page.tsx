"use client";

import { DetailPageSkeleton } from "@/components/shared/Skeleton";
import { PARTNER_SHARE_PERCENT } from "@/lib/commission";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import VendorService from "@/services/VendorService";
import Button from "@/components/shared/Button";
import StatusBadge from "@/components/shared/StatusBadge";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { businessTypeLabel } from "@/lib/businessTypes";
import VendorReviewPanel from "@/components/vendors/VendorReviewPanel";
import MaskedValue from "@/components/shared/MaskedValue";
import VendorCataloguePanel from "@/components/vendors/VendorCataloguePanel";
import VendorFinancePanel from "@/components/vendors/VendorFinancePanel";
import { getNextPendingVendor } from "@/lib/api/admin/ops";
import VendorCategoriesPanel from "@/components/vendors/VendorCategoriesPanel";
import { usePermissions } from "@/lib/auth/permissions";

interface KYCDocuments {
  business_registration?: string;
  tax_id?: string;
  owner_id?: string;
  bank_verification?: string;
}

interface VendorDetails {
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
  kyc_documents: KYCDocuments | null;
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
  bvn: string | null;
  nin: string | null;
  cac_number: string | null;
  is_registered_business: boolean;
  verification_type: string | null;
  owner_first_name: string | null;
  owner_last_name: string | null;
  owner_middle_name: string | null;
  owner_date_of_birth: string | null;
  owner_phone_number: string | null;
  owner_gender: string | null;
  account_number: string | null;
  account_name: string | null;
  bank_name: string | null;
  bank_code: string | null;
  location_photos: string[] | null;
  onboarding_completed: boolean;
  max_orders_per_hour: number;
  // Computed by the API with the same checklist the approve/activate actions enforce
  verification?: {
    isComplete: boolean;
    completionPercentage: number;
    requirements: {
      businessProfileComplete: boolean;
      identityVerified: boolean;
      bankAccountAdded: boolean;
      locationPhotosUploaded: boolean;
      cacVerified?: boolean;
      documentsUploaded?: boolean;
    };
    missingItems: string[];
    missingProfileFields?: string[];
  };
  open_flags?: number;
  open_corrections?: number;
  orders_count?: number;
  last_order_date?: string;
  VendorAddress?: {
    landmark_address: string | null;
    dropoff_address: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
}

export default function VendorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { can } = usePermissions();
  const [nextPending, setNextPending] = useState<{ code: string; name: string; remaining: number; ready: boolean; readyRemaining: number } | null>(null);
  const toast = useRef<ToastRef>(null);
  const vendorService = new VendorService();

  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
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

  useEffect(() => {
    if (params.id) {
      loadVendorDetails();
    }
  }, [params.id]);

  // Next in the queue: ready-to-approve partners first (oldest first), then the other pending ones (oldest first)
  useEffect(() => {
    if (!params.id) return;
    getNextPendingVendor(String(params.id))
      .then(({ data }) => setNextPending(data.next ? { code: data.next.short_code || data.next.id, name: data.next.name, remaining: data.remaining, ready: data.next_is_ready, readyRemaining: data.ready_remaining } : null))
      .catch(() => setNextPending(null));
  }, [params.id, vendor?.status]);

  const loadVendorDetails = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getVendorById(params.id as string);
      setVendor(data);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load business partner details",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reload without the full-page spinner (used after review actions so the open tab stays put)
  const refreshVendor = async () => {
    try {
      setVendor(await vendorService.getVendorById(params.id as string));
    } catch {
      /* keep the data already on screen */
    }
  };

  const handleApprove = async () => {
    if (!vendor) return;
    
    setConfirmDialog({
      visible: true,
      title: "Approve Business Partner",
      message: `Are you sure you want to approve ${vendor.name}? This will activate the business partner and allow them to start receiving orders.`,
      variant: "success",
      onConfirm: async () => {
        try {
          await vendorService.approveVendor(vendor.id);
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Business Partner approved successfully",
            life: 3000,
          });
          loadVendorDetails();
        } catch (caught) {
          const error = caught as Error;
          toast.current?.show({
            severity: "error",
            summary: "Approval Failed",
            detail: error.message || "Failed to approve business partner",
            life: 3000,
          });
        }
        setConfirmDialog({ ...confirmDialog, visible: false });
      },
    });
  };

  const handleReject = async () => {
    if (!vendor) return;
    
    setConfirmDialog({
      visible: true,
      title: "Reject Business Partner",
      message: `Are you sure you want to reject ${vendor.name}? This will deactivate the business partner and prevent them from receiving orders.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          await vendorService.rejectVendor(vendor.id);
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Business Partner rejected successfully",
            life: 3000,
          });
          loadVendorDetails();
        } catch (caught) {
          const error = caught as Error;
          toast.current?.show({
            severity: "error",
            summary: "Rejection Failed",
            detail: error.message || "Failed to reject business partner",
            life: 3000,
          });
        }
        setConfirmDialog({ ...confirmDialog, visible: false });
      },
    });
  };

  const handleVerifyVendor = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!vendor) return;
    
    const action = status === 'VERIFIED' ? 'verify' : 'reject';
    const actionPast = status === 'VERIFIED' ? 'verified' : 'rejected';
    
    setConfirmDialog({
      visible: true,
      title: `${status === 'VERIFIED' ? 'Verify' : 'Reject'} Business Partner KYC`,
      message: `Are you sure you want to ${action} this business partner's KYC verification? This will ${status === 'VERIFIED' ? 'allow them to receive payments' : 'prevent them from receiving payments'}.`,
      variant: status === 'VERIFIED' ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          await vendorService.updateVendorKYCStatus(vendor.id, status);
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: `Business Partner KYC ${actionPast} successfully`,
            life: 3000,
          });
          loadVendorDetails();
        } catch (caught) {
          const error = caught as Error;
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.message || `Failed to ${action} business partner KYC`,
            life: 3000,
          });
        }
        setConfirmDialog({ ...confirmDialog, visible: false });
      },
    });
  };

  const handleSuspend = async () => {
    if (!vendor) return;
    
    setConfirmDialog({
      visible: true,
      title: "Suspend Business Partner",
      message: `Are you sure you want to suspend ${vendor.name}? This will temporarily disable their operations. They can be reactivated later.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          await vendorService.suspendVendor(vendor.id);
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Business Partner suspended successfully",
            life: 3000,
          });
          loadVendorDetails();
        } catch (caught) {
          const error = caught as Error;
          toast.current?.show({
            severity: "error",
            summary: "Suspension Failed",
            detail: error.message || "Failed to suspend business partner",
            life: 3000,
          });
        }
        setConfirmDialog({ ...confirmDialog, visible: false });
      },
    });
  };

  const handleActivate = async () => {
    if (!vendor) return;
    
    setConfirmDialog({
      visible: true,
      title: "Activate Business Partner",
      message: `Are you sure you want to activate ${vendor.name}? This will set the business partner to active status and allow them to receive orders.`,
      variant: "success",
      onConfirm: async () => {
        try {
          await vendorService.activateVendor(vendor.id);
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Business Partner activated successfully",
            life: 3000,
          });
          loadVendorDetails();
        } catch (caught) {
          const error = caught as Error;
          toast.current?.show({
            severity: "error",
            summary: "Activation Failed",
            detail: error.message || "Failed to activate business partner",
            life: 3000,
          });
        }
        setConfirmDialog({ ...confirmDialog, visible: false });
      },
    });
  };

  const confirmDelete = () => {
    if (!vendor) return;
    
    setConfirmDialog({
      visible: true,
      title: "Confirm Business Partner Deletion",
      message: `Are you sure you want to delete ${vendor.name}? This is a soft delete - the business partner can be restored later by activating them.`,
      onConfirm: handleDelete,
      variant: "danger",
    });
  };

  const handleDelete = async () => {
    if (!vendor) return;
    
    try {
      await vendorService.deleteVendor(vendor.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Business Partner ${vendor.name} has been deleted successfully (soft delete - can be restored)`,
        life: 3000,
      });
      router.push("/business-partner"); // Navigate back since vendor is now deleted and won't appear in normal queries
    } catch (caught) {
      const error = caught as Error;
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: error.message || "Failed to delete business partner",
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
      hour: "2-digit",
      minute: "2-digit",
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

  // Completion comes from the API so this page can never disagree with what approve enforces
  const verification = vendor?.verification;
  const reqs = verification?.requirements;
  const isBusinessProfileComplete = !!reqs?.businessProfileComplete;
  const isKycComplete = !!reqs?.identityVerified && reqs.cacVerified !== false && reqs.documentsUploaded !== false;
  const isLocationPhotosComplete = !!reqs?.locationPhotosUploaded;
  const isBankingComplete = !!reqs?.bankAccountAdded;
  const openFlags = vendor?.open_flags ?? 0;
  const openCorrections = vendor?.open_corrections ?? 0;
  const allTabsComplete = !!verification?.isComplete;
  const canApprove = allTabsComplete && openFlags === 0;
  // Same rule the API applies before it accepts a KYC "verified" review
  const hasIdentityData =
    (vendor?.verification_type === "bvn" && !!vendor.bvn) ||
    (vendor?.verification_type === "nin" && !!vendor.nin);
  const kycRejected = vendor?.kyc_status === "failed";
  const kycMarkedWithoutData = vendor?.kyc_status === "completed" && !hasIdentityData;
  const profileFieldLabels: Record<string, string> = {
    logo: "Logo",
    name: "Business name",
    business_type: "Business type",
    phone: "Phone",
    address: "Address with GPS (landmark address, latitude and longitude)",
  };
  const missingProfileLabels = (verification?.missingProfileFields ?? []).map((f) => profileFieldLabels[f] ?? f);
  const checklist = [
    { tab: "business-profile", label: "Business Profile", ok: isBusinessProfileComplete },
    { tab: "kyc", label: "Identity & KYC", ok: isKycComplete },
    { tab: "location-photos", label: "Location Photos", ok: isLocationPhotosComplete },
    { tab: "banking", label: "Banking Details", ok: isBankingComplete },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: "pi-home" },
    { 
      id: "business-profile", 
      label: "Business Profile", 
      icon: "pi-building",
      status: isBusinessProfileComplete ? "completed" : "pending"
    },
    { 
      id: "kyc", 
      label: "Identity & KYC", 
      icon: "pi-shield",
      status: isKycComplete ? "completed" : vendor?.kyc_status === "failed" ? "rejected" : "pending"
    },
    { 
      id: "location-photos", 
      label: "Location Photos", 
      icon: "pi-camera",
      status: isLocationPhotosComplete ? "completed" : "pending"
    },
    { 
      id: "banking", 
      label: "Banking Details", 
      icon: "pi-credit-card",
      status: isBankingComplete ? "completed" : "pending"
    },
    { id: "catalogue", label: "Catalogue", icon: "pi-box" },
    {
      id: "review",
      label: "Review",
      icon: "pi-flag",
      status: openFlags > 0 ? "rejected" : openCorrections > 0 ? "pending" : undefined,
    },
    { id: "activity", label: "Activity", icon: "pi-clock" },
  ];

  if (loading) {
    return <DetailPageSkeleton tabs={7} />;
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-exclamation-triangle text-[#DC2626] text-4xl mb-4" />
          <p className="text-[16px] text-[#525866]">Business Partner not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/business-partner")}
            className="mt-4"
          >
            Back to Business Partners
          </Button>
        </div>
      </div>
    );
  }

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

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/business-partner")}
              className="px-3 py-2"
            >
              <i className="pi pi-arrow-left mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-[20px] md:text-[24px] font-bold text-[#111827]">Business Partner Details</h1>
              <p className="text-[13px] text-[#525866]">
                Code: {vendor.short_code}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={vendor.status} />
            {nextPending && (
              <Button variant="outline" onClick={() => router.push(`/business-partner/${nextPending.code}`)}>
                {nextPending.ready ? `Next ready to approve (${nextPending.readyRemaining})` : `Next pending (${nextPending.remaining})`}
                <i className="pi pi-arrow-right ml-2" />
              </Button>
            )}
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={!can("account.delete")}
            >
              <i className="pi pi-trash mr-2" />
              Delete Business Partner
            </Button>
          </div>
        </div>

        {/* Vendor Profile Card */}
        <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
          <div className="flex items-center gap-6">
            {vendor.logo_url ? (
              <img
                src={vendor.logo_url}
                alt={vendor.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-[24px] font-semibold">
                {getInitials(vendor.name)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h2 className="text-[20px] font-semibold text-[#111827] mb-1 break-words">
                {vendor.name}
              </h2>
              <p className="text-[13px] text-[#525866] mb-3 break-all">
                {vendor.email} • {vendor.phone}
              </p>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={vendor.status} />
                  <span className="text-[11px] text-[#525866]">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
                    {vendor.kyc_status.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-[#525866]">KYC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-[#E1E4EA]">
          <div className="border-b border-[#E1E4EA]">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-4 text-[13px] font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors relative ${
                    activeTab === tab.id
                      ? "border-[#2563EB] text-[#2563EB]"
                      : "border-transparent text-[#525866] hover:text-[#111827]"
                  }`}
                >
                  <i className={`pi ${tab.icon}`} />
                  {tab.label}
                  {tab.status && (
                    <div className={`w-2 h-2 rounded-full ml-1 ${
                      tab.status === "active" || tab.status === "completed" ? "bg-[#059669]" :
                      tab.status === "inactive" || tab.status === "rejected" ? "bg-[#DC2626]" :
                      "bg-[#D97706]"
                    }`} />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Status Information</h3>
                  <div className="bg-[#F9FAFB] rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <StatusBadge status={vendor.status} />
                      <div>
                        <p className="text-[13px] font-semibold text-[#111827]">
                          Current Status: {vendor.status.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-[11px] text-[#525866]">
                          {vendor.status === "active" && "Business Partner is active and can receive orders"}
                          {vendor.status === "inactive" && "Business Partner is deactivated - can be reactivated anytime"}
                          {vendor.status === "suspended" && "Business Partner is temporarily suspended - can be reactivated"}
                          {vendor.status === "pending_approval" && "Business Partner is awaiting approval to start operations"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-[11px] text-[#525866]">
                      <p className="mb-1">
                        <strong>Available Actions:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {vendor.status === "active" && (
                          <>
                            <li>Suspend: Temporarily disable business partner operations (reversible)</li>
                            <li>Delete: Soft delete business partner (can be restored via activate)</li>
                          </>
                        )}
                        {vendor.status === "inactive" && (
                          <>
                            <li>Activate: Set business partner to active status</li>
                            <li>Suspend: Move to suspended status</li>
                            <li>Delete: Soft delete business partner (can be restored via activate)</li>
                          </>
                        )}
                        {vendor.status === "suspended" && (
                          <>
                            <li>Activate: Restore business partner to active status</li>
                            <li>Delete: Soft delete business partner (can be restored via activate)</li>
                          </>
                        )}
                        {vendor.status === "pending_approval" && (
                          <>
                            <li>Approve: Activate business partner for operations</li>
                            <li>Reject: Decline business partner application</li>
                            <li>Suspend: Move to suspended status</li>
                            <li>Delete: Soft delete business partner (can be restored via activate)</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Business Name
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {vendor.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Business Type
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {businessTypeLabel(vendor.business_type)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Email
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {vendor.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Phone
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {vendor.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Address
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {vendor.VendorAddress?.landmark_address || vendor.VendorAddress?.dropoff_address || vendor.address || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Timezone
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {vendor.timezone}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Operational Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Current Status
                      </label>
                      <StatusBadge status={vendor.status} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Accepting Orders
                      </label>
                      <StatusBadge status={(vendor.status === "active" && vendor.is_accepting_orders) ? "VERIFIED" : "PENDING"} />
                      <p className="text-[10px] text-[#525866] mt-1">
                        {vendor.status !== "active" ? "Requires active status" : vendor.is_accepting_orders ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Store Open
                      </label>
                      <StatusBadge status={(vendor.status === "active" && vendor.is_open) ? "VERIFIED" : "PENDING"} />
                      <p className="text-[10px] text-[#525866] mt-1">
                        {vendor.status !== "active" ? "Requires active status" : vendor.is_open ? "Currently open" : "Currently closed"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Status Management Actions */}
                <div className="flex flex-col items-center gap-4 pt-6 border-t border-[#E1E4EA]">
                  {vendor.status === "pending_approval" && openFlags > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center max-w-2xl text-[13px] text-red-800">
                      This business partner has {openFlags} unresolved suspicion flag{openFlags > 1 ? "s" : ""}. Approval is blocked until{" "}
                      <button type="button" onClick={() => setActiveTab("review")} className="underline font-semibold">
                        the flag is resolved
                      </button>
                      .
                    </div>
                  )}
                  {vendor.status === "pending_approval" && !allTabsComplete && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center max-w-2xl">
                      <p className="text-[13px] text-orange-800 flex items-center justify-center gap-2">
                        <i className="pi pi-exclamation-triangle" />
                        <span>
                          Approval is blocked until these sections are complete:
                          {verification
                            ? checklist.filter((c) => !c.ok).map((c) => (
                                <button
                                  key={c.tab}
                                  type="button"
                                  onClick={() => setActiveTab(c.tab)}
                                  className="ml-2 underline font-semibold hover:text-orange-950 py-2.5"
                                >
                                  {c.label}
                                </button>
                              ))
                            : " verification status unavailable."}
                        </span>
                      </p>
                    </div>
                  )}
                  
                  {!can("vendor.decide") && (
                    <p className="text-[12px] text-[#525866] mb-3">Your role can view this business partner but not approve, reject, suspend or delete it.</p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {vendor.status === "pending_approval" && (
                      <>
                        <Button
                          variant="success"
                          onClick={handleApprove}
                          disabled={!canApprove || !can("vendor.decide")}
                          className={!canApprove ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <i className="pi pi-check mr-2" />
                          Approve Business Partner
                        </Button>
                        <Button
                          variant="danger"
                          onClick={handleReject}
                          disabled={!can("vendor.decide")}
                        >
                          <i className="pi pi-times mr-2" />
                          Reject Business Partner
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleSuspend}
                        disabled={!can("vendor.decide")}
                        >
                          <i className="pi pi-pause mr-2" />
                          Suspend
                        </Button>
                      </>
                    )}

                  {vendor.status === "active" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleSuspend}
                        disabled={!can("vendor.decide")}
                      >
                        <i className="pi pi-pause mr-2" />
                        Suspend Business Partner
                      </Button>
                    </>
                  )}

                  {vendor.status === "suspended" && (
                    <>
                      <Button
                        variant="success"
                        onClick={handleActivate}
                        disabled={!can("vendor.decide")}
                      >
                        <i className="pi pi-play mr-2" />
                        Activate Business Partner
                      </Button>
                    </>
                  )}

                  {vendor.status === "inactive" && (
                    <>
                      <Button
                        variant="success"
                        onClick={handleActivate}
                        disabled={!can("vendor.decide")}
                      >
                        <i className="pi pi-refresh mr-2" />
                        Activate Business Partner
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSuspend}
                        disabled={!can("vendor.decide")}
                      >
                        <i className="pi pi-pause mr-2" />
                        Suspend
                      </Button>
                    </>
                  )}

                  {/* Universal Delete Action - Available for All Statuses */}
                  <div className="border-l border-[#E1E4EA] pl-4 ml-4">
                    <Button
                      variant="danger"
                      onClick={confirmDelete}
              disabled={!can("account.delete")}
                      className="text-[12px]"
                    >
                      <i className="pi pi-trash mr-2" />
                      Delete Business Partner
                    </Button>
                  </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "kyc" && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-[18px] font-semibold text-[#111827]">Identity & KYC Verification</h3>
                      <p className={`text-[13px] font-medium ${
                        isKycComplete ? "text-[#059669]" : kycRejected ? "text-[#DC2626]" : "text-[#D97706]"
                      }`}>
                        {isKycComplete
                          ? "Identity verified. This section passes the approval checklist."
                          : kycRejected
                          ? "KYC was rejected. Identity cannot be used for approval."
                          : !hasIdentityData
                          ? "Identity not submitted. The business partner has not provided a BVN or NIN."
                          : "Identity submitted. Waiting for your review."}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-wider text-[#525866] mb-1">Admin review result</span>
                        <StatusBadge status={vendor.kyc_status} />
                      </div>
                      {/* Verify/Reject Buttons */}
                      {vendor.kyc_status !== 'completed' && hasIdentityData && (
                        <Button
                          onClick={() => handleVerifyVendor('VERIFIED')}
                          disabled={!can("vendor.decide")}
                          className="bg-green-600 hover:bg-green-700 text-white text-[13px] px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                          <i className="pi pi-check-circle" />
                          Verify Business Partner
                        </Button>
                      )}
                      {vendor.kyc_status !== 'failed' && (hasIdentityData || kycMarkedWithoutData) && (
                        <Button
                          onClick={() => handleVerifyVendor('REJECTED')}
                          disabled={!can("vendor.decide")}
                          className="bg-red-600 hover:bg-red-700 text-white text-[13px] px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                          <i className="pi pi-times-circle" />
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>

                  {kycMarkedWithoutData && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6 text-[13px] text-orange-800">
                      KYC is marked <strong>completed</strong>, but no BVN or NIN is on file. The completed status is not backed
                      by any identity data, so approval stays blocked. Reject it to correct the status, or ask the business partner to
                      verify their BVN or NIN in the business partner app.
                    </div>
                  )}

                  {/* Identity Verification Details */}
                  <div className="border border-[#E1E4EA] rounded-lg p-6 mb-6">
                    <h4 className="text-[15px] font-semibold text-[#111827] mb-4">Identity Verification</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                          Verification Method
                        </label>
                        <p className={`text-[13px] uppercase font-semibold ${vendor.verification_type ? "text-[#111827]" : "text-[#9CA3AF]"}`}>
                          {vendor.verification_type || "Not submitted"}
                        </p>
                      </div>
                      {vendor.verification_type === "bvn" && vendor.bvn && (
                        <div>
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                            Bank Verification Number (BVN)
                          </label>
                          <p className="text-[13px] text-[#111827] font-mono">
                            <MaskedValue value={vendor.bvn} />
                          </p>
                        </div>
                      )}
                      {vendor.verification_type === "nin" && vendor.nin && (
                        <div>
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                            National Identification Number (NIN)
                          </label>
                          <p className="text-[13px] text-[#111827] font-mono">
                            <MaskedValue value={vendor.nin} />
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Owner Information */}
                  {(vendor.owner_first_name || vendor.owner_last_name) && (
                    <div className="border border-[#E1E4EA] rounded-lg p-6 mb-6">
                      <h4 className="text-[15px] font-semibold text-[#111827] mb-4">Owner Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                            Full Name
                          </label>
                          <p className="text-[13px] text-[#111827]">
                            {[vendor.owner_first_name, vendor.owner_middle_name, vendor.owner_last_name].filter(Boolean).join(" ")}
                          </p>
                        </div>
                        {vendor.owner_date_of_birth && (
                          <div>
                            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                              Date of Birth
                            </label>
                            <p className="text-[13px] text-[#111827]">
                              {vendor.owner_date_of_birth}
                            </p>
                          </div>
                        )}
                        {vendor.owner_phone_number && (
                          <div>
                            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                              Phone Number
                            </label>
                            <p className="text-[13px] text-[#111827]">
                              {vendor.owner_phone_number}
                            </p>
                          </div>
                        )}
                        {vendor.owner_gender && (
                          <div>
                            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                              Gender
                            </label>
                            <p className="text-[13px] text-[#111827] capitalize">
                              {vendor.owner_gender}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CAC Verification (only for registered businesses) */}
                  {vendor.is_registered_business && (
                    <div className="border border-[#E1E4EA] rounded-lg p-6 mb-6">
                      <h4 className="text-[15px] font-semibold text-[#111827] mb-4">CAC Verification</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                            CAC Registration Number
                          </label>
                          <p className="text-[13px] text-[#111827] font-mono">
                            {vendor.cac_number || "Not Provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                            Verification Status
                          </label>
                          <StatusBadge status={vendor.cac_number ? "VERIFIED" : "PENDING"} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                            Business Registration Number
                          </label>
                          <p className={`text-[13px] font-mono ${vendor.business_registration_number ? "text-[#111827]" : "text-[#DC2626]"}`}>
                            {vendor.business_registration_number || "Not provided (required for registered businesses)"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KYC Documents */}
                  <h4 className="text-[15px] font-semibold text-[#111827] mb-4 mt-6">Uploaded Documents</h4>
                  {!(vendor.kyc_documents?.business_registration || vendor.kyc_documents?.tax_id || vendor.kyc_documents?.owner_id || vendor.kyc_documents?.bank_verification) && (
                    <div className="text-center py-8 bg-[#F9FAFB] rounded-lg">
                      <i className="pi pi-file text-[#9CA3AF] text-3xl mb-2" />
                      <p className="text-[13px] text-[#525866]">No documents uploaded</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vendor.kyc_documents?.business_registration && (
                      <div className="border border-[#E1E4EA] rounded-lg p-4">
                        <h4 className="text-[13px] font-semibold text-[#111827] mb-3">Business Registration</h4>
                        <a
                          href={vendor.kyc_documents.business_registration}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#2563EB] hover:underline text-[13px] font-medium"
                        >
                          <i className="pi pi-file-pdf" />
                          View Document
                        </a>
                      </div>
                    )}

                    {vendor.kyc_documents?.tax_id && (
                      <div className="border border-[#E1E4EA] rounded-lg p-4">
                        <h4 className="text-[13px] font-semibold text-[#111827] mb-3">Tax ID</h4>
                        <a
                          href={vendor.kyc_documents.tax_id}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#2563EB] hover:underline text-[13px] font-medium"
                        >
                          <i className="pi pi-file-pdf" />
                          View Document
                        </a>
                      </div>
                    )}

                    {vendor.kyc_documents?.owner_id && (
                      <div className="border border-[#E1E4EA] rounded-lg p-4">
                        <h4 className="text-[13px] font-semibold text-[#111827] mb-3">Owner ID</h4>
                        <a
                          href={vendor.kyc_documents.owner_id}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#2563EB] hover:underline text-[13px] font-medium"
                        >
                          <i className="pi pi-file-image" />
                          View Document
                        </a>
                      </div>
                    )}

                    {vendor.kyc_documents?.bank_verification && (
                      <div className="border border-[#E1E4EA] rounded-lg p-4">
                        <h4 className="text-[13px] font-semibold text-[#111827] mb-3">Bank Verification</h4>
                        <a
                          href={vendor.kyc_documents.bank_verification}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#2563EB] hover:underline text-[13px] font-medium"
                        >
                          <i className="pi pi-file-pdf" />
                          View Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "business-profile" && (
              <div className="space-y-6">
                {!isBusinessProfileComplete && missingProfileLabels.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-[13px] text-orange-800">
                    Required for approval, still missing: <strong>{missingProfileLabels.join(", ")}</strong>.
                  </div>
                )}
                <VendorCategoriesPanel vendorId={vendor.id} onChanged={refreshVendor} />
                {/* Business Information */}
                <div className="border border-[#E1E4EA] rounded-lg p-6">
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Business Name
                      </label>
                      <p className="text-[13px] text-[#111827] font-semibold">
                        {vendor.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Business Type
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {businessTypeLabel(vendor.business_type)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Registration Type
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {vendor.is_registered_business ? "Registered Business" : "Individual Business Partner"}
                      </p>
                    </div>
                    {vendor.is_registered_business && vendor.cac_number && (
                      <div>
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                          CAC Registration Number
                        </label>
                        <p className="text-[13px] text-[#111827] font-mono">
                          {vendor.cac_number}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Email
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {vendor.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Phone
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {vendor.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address & Location */}
                <div className="border border-[#E1E4EA] rounded-lg p-6">
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Address & Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Address
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {vendor.VendorAddress?.landmark_address || vendor.VendorAddress?.dropoff_address || vendor.address || "N/A"}
                      </p>
                      {!vendor.VendorAddress?.landmark_address && (
                        <p className="text-[11px] text-[#DC2626] mt-1">
                          No landmark address on file. Approval needs a landmark address.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        GPS Coordinates
                      </label>
                      <p className="text-[13px] text-[#111827] font-mono">
                        {(vendor.VendorAddress?.latitude && vendor.VendorAddress?.longitude)
                          ? `${vendor.VendorAddress.latitude}, ${vendor.VendorAddress.longitude}`
                          : (vendor.latitude && vendor.longitude)
                          ? `${vendor.latitude}, ${vendor.longitude}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Logo */}
                {!vendor.logo_url && (
                  <div className="border border-[#E1E4EA] rounded-lg p-6">
                    <h3 className="text-[15px] font-semibold text-[#111827] mb-2">Business Logo</h3>
                    <p className="text-[13px] text-[#DC2626]">No logo uploaded. A logo is required for approval.</p>
                  </div>
                )}
                {vendor.logo_url && (
                  <div className="border border-[#E1E4EA] rounded-lg p-6">
                    <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Business Logo</h3>
                    <div className="flex items-center gap-4">
                      <img
                        src={vendor.logo_url}
                        alt={vendor.name}
                        className="w-24 h-24 rounded-lg object-cover border-2 border-[#E1E4EA]"
                      />
                      <div>
                        <p className="text-[13px] text-[#525866]">Logo uploaded</p>
                        <a
                          href={vendor.logo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-[#2563EB] hover:underline"
                        >
                          View full size
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Operational Settings */}
                <div className="border border-[#E1E4EA] rounded-lg p-6">
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Operational Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Business Partner Commission
                      </label>
                      <p className="text-[13px] text-[#059669] font-semibold">
                        {PARTNER_SHARE_PERCENT}%
                      </p>
                      <p className="text-[11px] text-[#525866] mt-1">
                        Every business partner receives this share of their item sales
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Minimum Order
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        ₦{vendor.minimum_order}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Max Orders/Hour
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {vendor.max_orders_per_hour}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Timezone
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {vendor.timezone}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Onboarding Status
                      </label>
                      <StatusBadge status={vendor.onboarding_completed ? "VERIFIED" : "PENDING"} />
                    </div>
                  </div>
                </div>

                {vendor.description && (
                  <div className="border border-[#E1E4EA] rounded-lg p-6">
                    <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Description</h3>
                    <p className="text-[13px] text-[#525866] leading-relaxed">
                      {vendor.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "location-photos" && (
              <div className="space-y-6">
                <div className="border border-[#E1E4EA] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#111827]">Business Location Photos</h3>
                      <p className="text-[13px] text-[#525866] mt-1">
                        Photos of the business storefront, entrance, and interior
                      </p>
                    </div>
                    {!isLocationPhotosComplete && (
                      <span className="text-[13px] font-semibold text-[#D97706]">At least 1 photo required for approval</span>
                    )}
                    {vendor.location_photos && vendor.location_photos.length > 0 && (
                      <div className="flex items-center gap-2">
                        <i className="pi pi-check-circle text-green-600" />
                        <span className="text-[13px] font-semibold text-green-600">
                          {vendor.location_photos.length} Photo{vendor.location_photos.length > 1 ? 's' : ''} Uploaded
                        </span>
                      </div>
                    )}
                  </div>

                  {vendor.location_photos && vendor.location_photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {vendor.location_photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-[#E1E4EA] hover:border-[#2563EB] transition-all">
                            <img
                              src={photo}
                              alt={`Location photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full font-semibold">
                              Primary
                            </div>
                          )}
                          <a
                            href={photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <i className="pi pi-eye text-white text-xl" />
                          </a>
                          <div className="mt-2 text-center">
                            <p className="text-[11px] text-[#525866]">
                              Photo {index + 1}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-[#F9FAFB] rounded-lg">
                      <i className="pi pi-camera text-[#9CA3AF] text-4xl mb-3" />
                      <p className="text-[13px] text-[#525866]">No location photos uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "banking" && (
              <div className="space-y-6">
                <div className="border border-[#E1E4EA] rounded-lg p-6">
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Bank Account Details</h3>
                  {!isBankingComplete && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-[13px] text-orange-800">
                      Required for approval: account holder name, account number and bank name.
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#F9FAFB] rounded-lg p-4">
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                        Account Holder Name
                      </label>
                      <p className="text-[16px] text-[#111827] font-semibold">
                        {vendor.account_name || <span className="text-[#DC2626] text-[13px] font-medium">Missing (required)</span>}
                      </p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-lg p-4">
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                        Account Number
                      </label>
                      <p className="text-[16px] text-[#111827] font-mono font-semibold">
                        {vendor.account_number ? <MaskedValue value={vendor.account_number} visibleEnd={4} /> : <span className="text-[#DC2626] text-[13px] font-medium">Missing (required)</span>}
                      </p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-lg p-4">
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                        Bank Name
                      </label>
                      <p className="text-[16px] text-[#111827] font-semibold">
                        {vendor.bank_name || <span className="text-[#DC2626] text-[13px] font-medium">Missing (required)</span>}
                      </p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-lg p-4">
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                        Bank Code
                      </label>
                      <p className="text-[16px] text-[#111827] font-mono">
                        {vendor.bank_code || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <VendorFinancePanel vendorId={vendor.id} />
              </div>
            )}

            {activeTab === "catalogue" && <VendorCataloguePanel vendorId={vendor.id} />}

            {activeTab === "review" && <VendorReviewPanel vendorId={vendor.id} onChanged={refreshVendor} />}

            {activeTab === "activity" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-[#E1E4EA] rounded-lg p-4">
                    <h4 className="text-[13px] font-semibold text-[#111827] mb-2">Joined Date</h4>
                    <p className="text-[15px] text-[#111827]">
                      {formatDate(vendor.created_at)}
                    </p>
                  </div>
                  <div className="border border-[#E1E4EA] rounded-lg p-4">
                    <h4 className="text-[13px] font-semibold text-[#111827] mb-2">Last Updated</h4>
                    <p className="text-[15px] text-[#111827]">
                      {formatDate(vendor.updated_at)}
                    </p>
                  </div>
                  <div className="border border-[#E1E4EA] rounded-lg p-4">
                    <h4 className="text-[13px] font-semibold text-[#111827] mb-2">Total Orders</h4>
                    <p className="text-[15px] text-[#111827] font-semibold">
                      {vendor.orders_count || 0}
                    </p>
                  </div>
                </div>

                {vendor.last_order_date && (
                  <div className="border border-[#E1E4EA] rounded-lg p-6">
                    <h4 className="text-[15px] font-semibold text-[#111827] mb-3">Last Activity</h4>
                    <p className="text-[13px] text-[#525866]">
                      Last order: {formatDate(vendor.last_order_date)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Location Photos */}
      {lightboxOpen && vendor.location_photos && vendor.location_photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <i className="pi pi-times text-3xl" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors"
            >
              <i className="pi pi-chevron-left text-4xl" />
            </button>
          )}

          {lightboxIndex < vendor.location_photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors"
            >
              <i className="pi pi-chevron-right text-4xl" />
            </button>
          )}

          <div className="max-w-6xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={vendor.location_photos[lightboxIndex]}
              alt={`Location photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="text-center mt-4">
              <p className="text-white text-sm">
                Photo {lightboxIndex + 1} of {vendor.location_photos.length}
                {lightboxIndex === 0 && " (Primary)"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

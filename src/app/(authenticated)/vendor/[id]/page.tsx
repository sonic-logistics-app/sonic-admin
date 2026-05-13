"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import VendorService from "@/services/VendorService";
import Button from "@/components/shared/Button";
import StatusBadge from "@/components/shared/StatusBadge";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

interface KYCDocuments {
  business_registration?: string;
  tax_id?: string;
  owner_id?: string;
  bank_verification?: string;
}

interface VendorDetails {
  id: string;
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
  orders_count?: number;
  last_order_date?: string;
}

export default function VendorDetailsPage() {
  const router = useRouter();
  const params = useParams();
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

  const loadVendorDetails = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getVendorById(params.id as string);
      setVendor(data);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load vendor details",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!vendor) return;
    
    try {
      await vendorService.approveVendor(vendor.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Vendor approved successfully",
        life: 3000,
      });
      loadVendorDetails();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Approval Failed",
        detail: error.message || "Failed to approve vendor",
        life: 3000,
      });
    }
  };

  const handleReject = async () => {
    if (!vendor) return;
    
    try {
      await vendorService.rejectVendor(vendor.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Vendor rejected successfully",
        life: 3000,
      });
      loadVendorDetails();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Rejection Failed",
        detail: error.message || "Failed to reject vendor",
        life: 3000,
      });
    }
  };

  const handleVerifyVendor = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!vendor) return;
    
    const action = status === 'VERIFIED' ? 'verify' : 'reject';
    const actionPast = status === 'VERIFIED' ? 'verified' : 'rejected';
    
    setConfirmDialog({
      visible: true,
      title: `${status === 'VERIFIED' ? 'Verify' : 'Reject'} Vendor KYC`,
      message: `Are you sure you want to ${action} this vendor's KYC verification? This will ${status === 'VERIFIED' ? 'allow them to receive payments' : 'prevent them from receiving payments'}.`,
      variant: status === 'VERIFIED' ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          await vendorService.updateVendorKYCStatus(vendor.id, status);
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: `Vendor KYC ${actionPast} successfully`,
            life: 3000,
          });
          loadVendorDetails();
        } catch (error: any) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.message || `Failed to ${action} vendor KYC`,
            life: 3000,
          });
        }
        setConfirmDialog({ ...confirmDialog, visible: false });
      },
    });
  };

  const handleSuspend = async () => {
    if (!vendor) return;
    
    try {
      await vendorService.suspendVendor(vendor.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Vendor suspended successfully",
        life: 3000,
      });
      loadVendorDetails();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Suspension Failed",
        detail: error.message || "Failed to suspend vendor",
        life: 3000,
      });
    }
  };

  const handleActivate = async () => {
    if (!vendor) return;
    
    try {
      await vendorService.activateVendor(vendor.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Vendor activated successfully",
        life: 3000,
      });
      loadVendorDetails();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Activation Failed",
        detail: error.message || "Failed to activate vendor",
        life: 3000,
      });
    }
  };

  const confirmDelete = () => {
    if (!vendor) return;
    
    setConfirmDialog({
      visible: true,
      title: "Confirm Vendor Deletion",
      message: `Are you sure you want to delete ${vendor.name}? This is a soft delete - the vendor can be restored later by activating them.`,
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
        detail: `Vendor ${vendor.name} has been deleted successfully (soft delete - can be restored)`,
        life: 3000,
      });
      router.push("/vendor"); // Navigate back since vendor is now deleted and won't appear in normal queries
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: error.message || "Failed to delete vendor",
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

  const tabs = [
    { id: "overview", label: "Overview", icon: "pi-home" },
    { 
      id: "kyc", 
      label: "KYC Documents", 
      icon: "pi-file",
      status: vendor?.kyc_status 
    },
    { 
      id: "business", 
      label: "Business Info", 
      icon: "pi-briefcase",
      status: vendor?.status 
    },
    { 
      id: "banking", 
      label: "Banking Details", 
      icon: "pi-credit-card",
      status: vendor?.status 
    },
    { id: "activity", label: "Activity", icon: "pi-clock" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-spinner pi-spin text-[#2563EB] text-4xl mb-4" />
          <p className="text-[16px] text-[#525866]">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-exclamation-triangle text-[#DC2626] text-4xl mb-4" />
          <p className="text-[16px] text-[#525866]">Vendor not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/vendor")}
            className="mt-4"
          >
            Back to Vendors
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/vendor")}
              className="px-3 py-2"
            >
              <i className="pi pi-arrow-left mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-[24px] font-bold text-[#111827]">Vendor Details</h1>
              <p className="text-[13px] text-[#525866]">
                ID: {vendor.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={vendor.status} />
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              <i className="pi pi-trash mr-2" />
              Delete Vendor
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
            
            <div className="flex-1">
              <h2 className="text-[20px] font-semibold text-[#111827] mb-1">
                {vendor.name}
              </h2>
              <p className="text-[13px] text-[#525866] mb-3">
                {vendor.email} • {vendor.phone}
              </p>
              
              <div className="flex items-center gap-6">
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
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#111827]">
                    {vendor.commission_rate}%
                  </span>
                  <span className="text-[11px] text-[#525866]">Commission</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-[#E1E4EA]">
          <div className="border-b border-[#E1E4EA]">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-[13px] font-medium border-b-2 transition-colors relative ${
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
                          {vendor.status === "active" && "Vendor is active and can receive orders"}
                          {vendor.status === "inactive" && "Vendor is deactivated - can be reactivated anytime"}
                          {vendor.status === "suspended" && "Vendor is temporarily suspended - can be reactivated"}
                          {vendor.status === "pending_approval" && "Vendor is awaiting approval to start operations"}
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
                            <li>Suspend: Temporarily disable vendor operations (reversible)</li>
                            <li>Delete: Soft delete vendor (can be restored via activate)</li>
                          </>
                        )}
                        {vendor.status === "inactive" && (
                          <>
                            <li>Activate: Set vendor to active status</li>
                            <li>Suspend: Move to suspended status</li>
                            <li>Delete: Soft delete vendor (can be restored via activate)</li>
                          </>
                        )}
                        {vendor.status === "suspended" && (
                          <>
                            <li>Activate: Restore vendor to active status</li>
                            <li>Delete: Soft delete vendor (can be restored via activate)</li>
                          </>
                        )}
                        {vendor.status === "pending_approval" && (
                          <>
                            <li>Approve: Activate vendor for operations</li>
                            <li>Reject: Decline vendor application</li>
                            <li>Suspend: Move to suspended status</li>
                            <li>Delete: Soft delete vendor (can be restored via activate)</li>
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
                      <p className="text-[13px] text-[#111827] capitalize">
                        {vendor.business_type}
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
                        {vendor.address || "N/A"}
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
                      <StatusBadge status={vendor.is_accepting_orders ? "VERIFIED" : "PENDING"} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Store Open
                      </label>
                      <StatusBadge status={vendor.is_open ? "VERIFIED" : "PENDING"} />
                    </div>
                  </div>
                </div>

                {/* Enhanced Status Management Actions */}
                <div className="flex justify-center gap-4 pt-6 border-t border-[#E1E4EA]">
                  {vendor.status === "pending_approval" && (
                    <>
                      <Button
                        variant="success"
                        onClick={handleApprove}
                      >
                        <i className="pi pi-check mr-2" />
                        Approve Vendor
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleReject}
                      >
                        <i className="pi pi-times mr-2" />
                        Reject Vendor
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSuspend}
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
                      >
                        <i className="pi pi-pause mr-2" />
                        Suspend Vendor
                      </Button>
                    </>
                  )}

                  {vendor.status === "suspended" && (
                    <>
                      <Button
                        variant="success"
                        onClick={handleActivate}
                      >
                        <i className="pi pi-play mr-2" />
                        Activate Vendor
                      </Button>
                    </>
                  )}

                  {vendor.status === "inactive" && (
                    <>
                      <Button
                        variant="success"
                        onClick={handleActivate}
                      >
                        <i className="pi pi-refresh mr-2" />
                        Activate Vendor
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSuspend}
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
                      className="text-[12px]"
                    >
                      <i className="pi pi-trash mr-2" />
                      Delete Vendor
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "kyc" && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-[18px] font-semibold text-[#111827]">KYC Documents</h3>
                      <p className="text-[13px] text-[#525866]">
                        KYC Status: {vendor.kyc_status.toUpperCase()}
                      </p>
                    </div>
                    <StatusBadge status={vendor.kyc_status} />
                  </div>

                  {/* Verification Status Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-5 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[14px] font-semibold text-[#111827] flex items-center gap-2">
                        <i className="pi pi-shield text-blue-600" />
                        Verification Status
                      </h4>
                      
                      {/* Verify/Reject Buttons */}
                      <div className="flex items-center gap-2">
                        {vendor.kyc_status !== 'completed' && (
                          <Button
                            onClick={() => handleVerifyVendor('VERIFIED')}
                            className="bg-green-600 hover:bg-green-700 text-white text-[13px] px-4 py-2 rounded-lg flex items-center gap-2"
                          >
                            <i className="pi pi-check-circle" />
                            Verify Vendor
                          </Button>
                        )}
                        {vendor.kyc_status !== 'failed' && (
                          <Button
                            onClick={() => handleVerifyVendor('REJECTED')}
                            className="bg-red-600 hover:bg-red-700 text-white text-[13px] px-4 py-2 rounded-lg flex items-center gap-2"
                          >
                            <i className="pi pi-times-circle" />
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Business Profile Completeness */}
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                          Business Profile
                        </label>
                        <div className="flex items-center gap-2">
                          {(vendor.name && vendor.business_type && vendor.phone && vendor.address && vendor.latitude && vendor.longitude && vendor.logo_url) ? (
                            <>
                              <i className="pi pi-check-circle text-green-600" />
                              <span className="text-[13px] font-semibold text-green-600">Complete</span>
                            </>
                          ) : (
                            <>
                              <i className="pi pi-exclamation-triangle text-orange-600" />
                              <span className="text-[13px] font-semibold text-orange-600">Incomplete</span>
                            </>
                          )}
                        </div>
                        <div className="mt-2 space-y-0.5 text-[10px] text-[#525866]">
                          <div className="flex items-center gap-1">
                            <i className={`pi ${vendor.name ? 'pi-check text-green-600' : 'pi-times text-red-600'}`} />
                            <span>Name</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className={`pi ${vendor.business_type ? 'pi-check text-green-600' : 'pi-times text-red-600'}`} />
                            <span>Business Type</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className={`pi ${vendor.phone ? 'pi-check text-green-600' : 'pi-times text-red-600'}`} />
                            <span>Phone</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className={`pi ${(vendor.address && vendor.latitude && vendor.longitude) ? 'pi-check text-green-600' : 'pi-times text-red-600'}`} />
                            <span>Address + GPS</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className={`pi ${vendor.logo_url ? 'pi-check text-green-600' : 'pi-times text-red-600'}`} />
                            <span>Logo</span>
                          </div>
                        </div>
                      </div>

                      {/* Business Type */}
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                          Business Type
                        </label>
                        <div className="flex items-center gap-2">
                          {vendor.is_registered_business ? (
                            <>
                              <i className="pi pi-building text-orange-500" />
                              <span className="text-[13px] font-semibold text-[#111827]">Registered Business</span>
                            </>
                          ) : (
                            <>
                              <i className="pi pi-user text-gray-500" />
                              <span className="text-[13px] font-semibold text-[#111827]">Individual</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Identity Verification (BVN/NIN) */}
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                          Identity Verification
                        </label>
                        <div className="flex items-center gap-2">
                          {(vendor.bvn || vendor.nin) ? (
                            <>
                              <i className="pi pi-check-circle text-green-600" />
                              <span className="text-[13px] font-semibold text-green-600">Verified</span>
                            </>
                          ) : (
                            <>
                              <i className="pi pi-times-circle text-red-600" />
                              <span className="text-[13px] font-semibold text-red-600">Not Verified</span>
                            </>
                          )}
                        </div>
                        {vendor.verification_type && (
                          <p className="text-[11px] text-[#525866] mt-1">
                            {vendor.verification_type.toUpperCase()}: {' '}
                            <span className="font-mono">
                              {vendor.verification_type === 'bvn' 
                                ? vendor.bvn?.substring(0, 3) + '********'
                                : vendor.nin?.substring(0, 3) + '********'
                              }
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Owner Information */}
                      {(vendor.owner_first_name || vendor.owner_last_name) && (
                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                            Owner Information
                          </label>
                          <div className="space-y-1">
                            <p className="text-[13px] font-semibold text-[#111827]">
                              {vendor.owner_first_name} {vendor.owner_middle_name} {vendor.owner_last_name}
                            </p>
                            {vendor.owner_date_of_birth && (
                              <p className="text-[11px] text-[#525866]">
                                DOB: {vendor.owner_date_of_birth}
                              </p>
                            )}
                            {vendor.owner_gender && (
                              <p className="text-[11px] text-[#525866]">
                                Gender: {vendor.owner_gender}
                              </p>
                            )}
                            {vendor.owner_phone_number && (
                              <p className="text-[11px] text-[#525866]">
                                Phone: {vendor.owner_phone_number}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* CAC Verification (only for registered businesses) */}
                      {vendor.is_registered_business && (
                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                            CAC Verification
                          </label>
                          <div className="flex items-center gap-2">
                            {vendor.cac_number ? (
                              <>
                                <i className="pi pi-check-circle text-green-600" />
                                <span className="text-[13px] font-semibold text-green-600">Verified</span>
                              </>
                            ) : (
                              <>
                                <i className="pi pi-times-circle text-red-600" />
                                <span className="text-[13px] font-semibold text-red-600">Not Verified</span>
                              </>
                            )}
                          </div>
                          {vendor.cac_number && (
                            <p className="text-[11px] text-[#525866] mt-1 font-mono">
                              {vendor.cac_number}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Bank Account Verification */}
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                          Bank Account
                        </label>
                        <div className="flex items-center gap-2">
                          {vendor.account_number && vendor.bank_name ? (
                            <>
                              <i className="pi pi-check-circle text-green-600" />
                              <span className="text-[13px] font-semibold text-green-600">Verified</span>
                            </>
                          ) : (
                            <>
                              <i className="pi pi-times-circle text-red-600" />
                              <span className="text-[13px] font-semibold text-red-600">Not Verified</span>
                            </>
                          )}
                        </div>
                        {vendor.account_number && (
                          <div className="mt-1 space-y-0.5">
                            {vendor.account_name && (
                              <p className="text-[11px] text-[#111827] font-semibold">
                                {vendor.account_name}
                              </p>
                            )}
                            <p className="text-[11px] text-[#525866]">
                              {vendor.bank_name} • {vendor.account_number}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Location Photos */}
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                          Location Photos
                        </label>
                        <div className="flex items-center gap-2">
                          {vendor.location_photos && vendor.location_photos.length > 0 ? (
                            <>
                              <i className="pi pi-check-circle text-green-600" />
                              <span className="text-[13px] font-semibold text-green-600">
                                {vendor.location_photos.length} Photo{vendor.location_photos.length > 1 ? 's' : ''}
                              </span>
                            </>
                          ) : (
                            <>
                              <i className="pi pi-times-circle text-red-600" />
                              <span className="text-[13px] font-semibold text-red-600">No Photos</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KYC Documents */}
                  <h4 className="text-[15px] font-semibold text-[#111827] mb-4 mt-6">Uploaded Documents</h4>
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

                  {/* Business Location Photos */}
                  {vendor.location_photos && vendor.location_photos.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-[15px] font-semibold text-[#111827] mb-4">Business Location Photos</h4>
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
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-[#525866] mt-3">
                        {vendor.location_photos.length} photo{vendor.location_photos.length > 1 ? 's' : ''} uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "business" && (
              <div className="space-y-6">
                <div className="border border-[#E1E4EA] rounded-lg p-6">
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Business Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Business Registration Number
                      </label>
                      <p className="text-[13px] text-[#111827] font-mono">
                        {vendor.business_registration_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Tax ID Number
                      </label>
                      <p className="text-[13px] text-[#111827] font-mono">
                        {vendor.tax_identification_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Commission Rate
                      </label>
                      <p className="text-[13px] text-[#111827] font-semibold">
                        {vendor.commission_rate}%
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
                        {vendor.orders_count || "N/A"}
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

            {activeTab === "banking" && (
              <div className="space-y-6">
                <div className="border border-[#E1E4EA] rounded-lg p-6">
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Bank Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#F9FAFB] rounded-lg p-4">
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                        Account Holder Name
                      </label>
                      <p className="text-[16px] text-[#111827] font-semibold">
                        {vendor.account_name || "N/A"}
                      </p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-lg p-4">
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                        Account Number
                      </label>
                      <p className="text-[16px] text-[#111827] font-mono font-semibold">
                        {vendor.account_number || "N/A"}
                      </p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-lg p-4">
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                        Bank Name
                      </label>
                      <p className="text-[16px] text-[#111827] font-semibold">
                        {vendor.bank_name || "N/A"}
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
              </div>
            )}

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

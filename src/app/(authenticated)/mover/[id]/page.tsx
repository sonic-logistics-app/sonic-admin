"use client";

import { DetailPageSkeleton } from "@/components/shared/Skeleton";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import DriverService from "@/services/DriverService";
import Button from "@/components/shared/Button";
import StatusBadge from "@/components/shared/StatusBadge";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DocumentViewer from "@/components/driver/DocumentViewer";
import VehicleViewer from "@/components/driver/VehicleViewer";
import DriverPerformancePanel from "@/components/driver/DriverPerformancePanel";
import { usePermissions } from "@/lib/auth/permissions";
import { suspendDriver, unsuspendDriver } from "@/lib/api/admin/ops";

interface VerificationStatus {
  personal_info: "PENDING" | "VERIFIED" | "REJECTED";
  document: "PENDING" | "VERIFIED" | "REJECTED";
  vehicle: "PENDING" | "VERIFIED" | "REJECTED";
  id_confirmation: "PENDING" | "VERIFIED" | "REJECTED";
  bank_account: "PENDING" | "VERIFIED" | "REJECTED";
}

interface DriverDocument {
  id: number;
  public_id: string;
  national_id_number: string | null;
  national_id_url: string | null;
  driver_license_url: string | null;
  bank_verification: string | null;
  is_national_id_verified: boolean;
  is_driver_license_verified: boolean;
  is_bank_verification_verified: boolean;
  is_rejected: boolean;
  created_at: string;
  updated_at: string;
  driver_id: number;
}

interface DriverVehicle {
  id: number;
  public_id: string;
  vehicle_type: string;
  brand_name: string | null;
  model_name: string | null;
  model_year: string | null;
  model_color: string | null;
  model_plate_number: string | null;
  model_seat_capacity: number | null;
  national_identification_number: string | null;
  nin_name: string | null;
  bvn_number: string | null;
  model_image_url: string | null;
  model_certificate_url: string | null;
  is_verified: boolean;
  is_rejected: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  driver_id: number;
}

interface DriverIdConfirmation {
  id: number;
  public_id: string;
  is_confirmed: boolean;
  image_url: string | null;
  is_verified: boolean;
  is_rejected: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  driver_id: number;
}

interface BankAccount {
  id: number;
  public_id: string;
  account_holder_name: string | null;
  bank_name: string | null;
  bank_code: string | null;
  account_type: string | null;
  account_number: string | null;
  is_verified: boolean;
  is_rejected: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  driver_id: number;
}

interface DriverDetails {
  short_code: string;
  id: number;
  public_id: string;
  first_name: string | null;
  last_name: string | null;
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
  driver_documents: DriverDocument[];
  driver_vehicle: DriverVehicle[];
  driver_id_confirmation: DriverIdConfirmation[];
  bank_account: BankAccount[];
  suspended_at?: string | null;
  suspended_reason?: string | null;
  /** Open rejection reasons and suspension, newest first: what the mover sees in the app */
  review_events?: { id: string; section: string; kind: string; reason: string; admin_email: string | null; created_at: string }[];
}

const needsForceMessage = (message: string) => /in progress/i.test(message);

const SECTION_LABELS: Record<string, string> = {
  personal_info: "Personal info",
  document: "Documents",
  vehicle: "Vehicle",
  id_confirmation: "ID confirmation",
  bank_account: "Bank account",
};

/** The KYC check result, coloured so a failure is not hidden among grey pills */
const kycPillClass = (status: string) => {
  const s = status.toLowerCase();
  if (s === "completed") return "bg-[#D1FAE5] text-[#065F46]";
  if (s === "failed") return "bg-[#FEE2E2] text-[#991B1B]";
  if (s === "pending" || s === "abandoned") return "bg-[#FEF3C7] text-[#92400E]";
  return "bg-[#F3F4F6] text-[#525866]";
};

export default function DriverDetailsPage() {
  const { can } = usePermissions();
  const router = useRouter();
  const params = useParams();
  const toast = useRef<ToastRef>(null);
  const driverService = new DriverService();

  const [driver, setDriver] = useState<DriverDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  // Rejecting and suspending both need a reason the mover will read
  const [reasonFor, setReasonFor] = useState<{ kind: "reject"; component: keyof VerificationStatus } | { kind: "suspend" } | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsForce, setNeedsForce] = useState(false);
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
      loadDriverDetails();
    }
  }, [params.id]);

  const loadDriverDetails = async () => {
    try {
      setLoading(true);
      const data = await driverService.getDriverById(params.id as string);
      
      const formattedDriver = {
        ...data,
        full_name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "No Name",
      };
      
      setDriver(formattedDriver);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load mover details",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyComponent = async (component: keyof VerificationStatus) => {
    if (!driver) return;
    if (!can("account.verify")) {
      toast.current?.show({ severity: "error", summary: "Not allowed", detail: "Your role does not allow this action.", life: 4000 });
      return;
    }
    
    try {
      const verificationData = {
        [component]: true,
      };
      
      await driverService.verifyDriver(driver.id, verificationData);
      
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `${component.replace('_', ' ')} verified successfully`,
        life: 3000,
      });
      
      loadDriverDetails();
    } catch (caught) {
      const error = caught as Error;
      toast.current?.show({
        severity: "error",
        summary: "Verification Failed",
        detail: error.message || `Failed to verify ${component}`,
        life: 3000,
      });
    }
  };

  const handleRejectComponent = (component: keyof VerificationStatus) => {
    if (!driver) return;
    if (!can("account.verify")) {
      toast.current?.show({ severity: "error", summary: "Not allowed", detail: "Your role does not allow this action.", life: 4000 });
      return;
    }
    setReasonText("");
    setNeedsForce(false);
    setReasonFor({ kind: "reject", component });
  };

  const submitReason = async (force = false) => {
    if (!driver || !reasonFor) return;
    const reason = reasonText.trim();
    if (reason.length < 3) return;
    try {
      setBusy(true);
      if (reasonFor.kind === "reject") {
        await driverService.rejectDriver(driver.id, { [reasonFor.component]: true, reason });
        toast.current?.show({ severity: "success", summary: "Rejected", detail: `${SECTION_LABELS[reasonFor.component] ?? reasonFor.component} rejected. The mover was told why.`, life: 4000 });
      } else {
        await suspendDriver(driver.id, reason, force);
        toast.current?.show({ severity: "success", summary: "Suspended", detail: "The mover is offline and cannot take orders. They can still sign in to see why.", life: 4000 });
      }
      setReasonFor(null);
      setReasonText("");
      setNeedsForce(false);
      loadDriverDetails();
    } catch (caught) {
      const message = (caught as Error).message || "Something went wrong";
      // A delivery is in progress: ask once, then allow it
      if (reasonFor.kind === "suspend" && /in progress/i.test(message)) setNeedsForce(true);
      toast.current?.show({ severity: needsForceMessage(message) ? "warn" : "error", summary: reasonFor.kind === "reject" ? "Rejection failed" : "Could not suspend", detail: message, life: 6000 });
    } finally {
      setBusy(false);
    }
  };

  const reinstate = async () => {
    if (!driver) return;
    try {
      setBusy(true);
      await unsuspendDriver(driver.id);
      toast.current?.show({ severity: "success", summary: "Reinstated", detail: "The mover can go online again.", life: 4000 });
      loadDriverDetails();
    } catch (caught) {
      toast.current?.show({ severity: "error", summary: "Could not reinstate", detail: (caught as Error).message, life: 5000 });
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    if (!driver) return;
    
    setConfirmDialog({
      visible: true,
      title: "Confirm Deletion",
      message: `Are you sure you want to delete ${driver.full_name}? This action cannot be undone.`,
      onConfirm: handleDelete,
      variant: "danger",
    });
  };

  const handleDelete = async () => {
    if (!driver) return;
    
    try {
      await driverService.deleteDriver(driver.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Mover ${driver.full_name} deleted successfully`,
        life: 3000,
      });
      router.push("/mover");
    } catch (caught) {
      const error = caught as Error;
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: error.message || "Failed to delete mover",
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

  const getInitials = (first: string | null, last: string | null) => {
    return ((first?.charAt(0) || "") + (last?.charAt(0) || "")).toUpperCase() || "?";
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

  /** Per-field status so empty National ID is not shown as REJECTED. */
  const getDocumentFieldStatus = (
    doc: DriverDocument | undefined,
    field: "national_id" | "driver_license" | "bank_verification",
  ): "PENDING" | "VERIFIED" | "REJECTED" => {
    if (!doc) return "PENDING";

    if (field === "national_id") {
      const hasData = Boolean(doc.national_id_url || doc.national_id_number);
      if (doc.is_national_id_verified) return "VERIFIED";
      if (doc.is_rejected && hasData) return "REJECTED";
      return "PENDING";
    }

    if (field === "driver_license") {
      const hasData = Boolean(doc.driver_license_url && doc.driver_license_url !== "pending");
      if (doc.is_driver_license_verified) return "VERIFIED";
      if (doc.is_rejected && hasData) return "REJECTED";
      return "PENDING";
    }

    const hasData = Boolean(doc.bank_verification);
    if (doc.is_bank_verification_verified) return "VERIFIED";
    if (doc.is_rejected && hasData) return "REJECTED";
    return "PENDING";
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "pi-user" },
    { 
      id: "personal_info", 
      label: "Personal Info", 
      icon: "pi-id-card",
      status: driver?.verificationStatus.personal_info 
    },
    { 
      id: "documents", 
      label: "Documents", 
      icon: "pi-file",
      status: driver?.verificationStatus.document 
    },
    { 
      id: "vehicle", 
      label: "Vehicle", 
      icon: "pi-car",
      status: driver?.verificationStatus.vehicle 
    },
    { 
      id: "id_confirmation", 
      label: "ID Confirmation", 
      icon: "pi-camera",
      status: driver?.verificationStatus.id_confirmation 
    },
    { 
      id: "bank_account", 
      label: "Bank Account", 
      icon: "pi-credit-card",
      status: driver?.verificationStatus.bank_account 
    },
    { id: "activity", label: "Activity", icon: "pi-clock" },
  ];

  if (loading) {
    return <DetailPageSkeleton tabs={5} />;
  }

  if (!driver) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-exclamation-triangle text-[#DC2626] text-4xl mb-4" />
          <p className="text-[16px] text-[#525866]">Mover not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/mover")}
            className="mt-4"
          >
            Back to Movers
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
              onClick={() => router.push("/mover")}
              className="px-3 py-2"
            >
              <i className="pi pi-arrow-left mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-[20px] md:text-[24px] font-bold text-[#111827]">Mover Details</h1>
              <p className="text-[13px] text-[#525866]">
                Code: {driver.short_code}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={getOverallVerificationStatus(driver.verificationStatus)} />
            {driver.suspended_at && <span className="text-[11px] px-2 py-1 rounded-full bg-[#FEE2E2] text-[#991B1B] font-semibold">Suspended</span>}
            {can("account.suspend") &&
              (driver.suspended_at ? (
                <Button variant="success" loading={busy} onClick={reinstate}>Reinstate</Button>
              ) : (
                <Button variant="outline" onClick={() => { setReasonText(""); setNeedsForce(false); setReasonFor({ kind: "suspend" }); }}>Suspend</Button>
              ))}
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              <i className="pi pi-trash mr-2" />
              Delete Mover
            </Button>
          </div>
        </div>

        {driver.suspended_at && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-[13px] text-orange-800">
            Suspended {new Date(driver.suspended_at).toLocaleDateString()}{driver.suspended_reason ? `: ${driver.suspended_reason}` : ""}. The mover is offline and cannot go online, take orders or withdraw. They can still sign in and see this reason.
          </div>
        )}

        {reasonFor && (
          <div className="border border-[#DC2626] rounded-lg p-4 bg-[#FEF2F2] space-y-3">
            <p className="text-[13px] text-[#991B1B]">
              {reasonFor.kind === "reject"
                ? `Rejecting ${SECTION_LABELS[reasonFor.component] ?? reasonFor.component} takes the mover offline until it is fixed. They get this message in the app and by email, so say what to change.`
                : "Suspending takes the mover offline and blocks going online, taking orders and withdrawing. They can still sign in to see this reason. You can reinstate them any time."}
            </p>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder={reasonFor.kind === "reject" ? "What should the mover fix? (required)" : "Reason (required)"}
              className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] bg-white"
            />
            {needsForce && (
              <p className="text-[13px] text-[#991B1B] font-medium">This mover has a delivery in progress. Suspending does not cancel it. Confirm below to go ahead.</p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="danger" disabled={reasonText.trim().length < 3 || busy} loading={busy} onClick={() => submitReason(needsForce)}>
                {reasonFor.kind === "reject" ? "Reject and notify mover" : needsForce ? "Suspend anyway" : "Suspend mover"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setReasonFor(null); setNeedsForce(false); }}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Driver Profile Card */}
        <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6">
          <div className="flex items-center gap-6">
            {(driver.picture || driver.profile_image_url || driver.uploaded_files?.profile_image) ? (
              <img
                src={driver.picture || driver.profile_image_url || driver.uploaded_files?.profile_image}
                alt={driver.full_name || "Mover"}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#9c27b0] text-white flex items-center justify-center text-[24px] font-semibold">
                {getInitials(driver.first_name, driver.last_name)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h2 className="text-[20px] font-semibold text-[#111827] mb-1 break-words">
                {driver.full_name}
              </h2>
              <p className="text-[13px] text-[#525866] mb-3 break-all">
                {driver.email} • {driver.phone}
              </p>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={driver.status} />
                  <span className="text-[11px] text-[#525866]">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${kycPillClass(driver.kyc_status)}`}>
                    {driver.kyc_status.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-[#525866]">KYC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#111827]">
                    {getVerificationProgress(driver.verificationStatus)}
                  </span>
                  <span className="text-[11px] text-[#525866]">Verified</span>
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
                      tab.status === "VERIFIED" ? "bg-[#059669]" :
                      tab.status === "REJECTED" ? "bg-[#DC2626]" :
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
                {/* Dispatch readiness: what is still missing before this driver can take deliveries */}
                <div className="border border-[#E1E4EA] rounded-lg p-4">
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Readiness for dispatch</h3>
                  <div className="flex flex-wrap gap-2">
                    {([
                      ["Personal info", driver.verificationStatus.personal_info],
                      ["Documents", driver.verificationStatus.document],
                      ["Vehicle", driver.verificationStatus.vehicle],
                      ["ID confirmation", driver.verificationStatus.id_confirmation],
                      ["Bank account", driver.verificationStatus.bank_account],
                    ] as const).map(([name, state]) => (
                      <span
                        key={name}
                        className={`text-[12px] px-3 py-1 rounded-full font-semibold ${
                          state === "VERIFIED" ? "bg-[#D1FAE5] text-[#065F46]" : state === "REJECTED" ? "bg-[#FEE2E2] text-[#991B1B]" : "bg-[#FEF3C7] text-[#92400E]"
                        }`}
                      >
                        {name}: {state === "VERIFIED" ? "done" : state === "REJECTED" ? "rejected" : "missing or pending"}
                      </span>
                    ))}
                    <span className={`text-[12px] px-3 py-1 rounded-full font-semibold ${kycPillClass(driver.kyc_status)}`} title="The identity check run by the KYC provider. It is separate from the sections above.">
                      KYC check: {driver.kyc_status.replace(/_/g, " ")}
                    </span>
                  </div>
                  {(driver.review_events ?? []).filter((e) => e.kind === "rejected").length > 0 && (
                    <ul className="mt-3 space-y-1 text-[12px] text-[#991B1B]">
                      {(driver.review_events ?? []).filter((e) => e.kind === "rejected").map((e) => (
                        <li key={e.id}>
                          <strong>{SECTION_LABELS[e.section === "documents" ? "document" : e.section] ?? e.section}:</strong> {e.reason}
                          <span className="text-[#525866]"> ({e.admin_email ?? "admin"}, {new Date(e.created_at).toLocaleDateString()})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-[12px] text-[#525866] mt-2">
                    {Object.values(driver.verificationStatus).every((v) => v === "VERIFIED")
                      ? "Every section is verified. Online availability is separate and is set by the mover."
                      : "Dispatch needs every section verified. Online or offline is separate from verification."}
                  </p>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        First Name
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {driver.first_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Last Name
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {driver.last_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Email
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {driver.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Phone
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {driver.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Birth Date
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {formatDate(driver.birth_date)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Provider
                      </label>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
                        {driver.provider}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Driver Status */}
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Mover Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Current Status
                      </label>
                      <StatusBadge status={driver.status} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        KYC Status
                      </label>
                      <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${kycPillClass(driver.kyc_status)}`}>
                        {driver.kyc_status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        No Show Count
                      </label>
                      <p className="text-[13px] text-[#111827]">
                        {driver.no_show_count}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification Progress */}
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Verification Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {Object.entries(driver.verificationStatus).map(([key, status]) => (
                      <div key={key} className="border border-[#E1E4EA] rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            status === "VERIFIED" ? "bg-[#D1FAE5] text-[#059669]" :
                            status === "REJECTED" ? "bg-[#FEE2E2] text-[#DC2626]" :
                            "bg-[#FEF3C7] text-[#D97706]"
                          }`}>
                            <i className={`pi ${
                              status === "VERIFIED" ? "pi-check" :
                              status === "REJECTED" ? "pi-times" :
                              "pi-clock"
                            } text-xs`} />
                          </div>
                          <StatusBadge status={status} />
                        </div>
                        <h4 className="text-[11px] font-semibold text-[#111827]">
                          {SECTION_LABELS[key] ?? key}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                {driver.driver_documents && driver.driver_documents.length > 0 ? (
                  <>
                    {driver.verificationStatus.document === "REJECTED" && (
                      <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#991B1B]">
                        The documents section is marked rejected{(driver.review_events ?? []).find((e) => e.kind === "rejected" && e.section === "documents") ? `: ${(driver.review_events ?? []).find((e) => e.kind === "rejected" && e.section === "documents")!.reason}` : " (no reason was recorded)"}. The checks below show what is verified and what is still missing. Use Verify All Documents to clear the rejection once everything is in order.
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DocumentViewer
                        title="National ID"
                        documents={{
                          front_image: driver.driver_documents[0].national_id_url || undefined,
                          verified: driver.driver_documents[0].is_national_id_verified,
                          uploaded_at: driver.driver_documents[0].created_at,
                        }}
                        onVerify={() => handleVerifyComponent("document")}
                        onReject={() => handleRejectComponent("document")}
                        status={getDocumentFieldStatus(driver.driver_documents[0], "national_id")}
                        actions={false}
                      />
                      <DocumentViewer
                        title="Driver License"
                        documents={{
                          front_image:
                            driver.driver_documents[0].driver_license_url &&
                            driver.driver_documents[0].driver_license_url !== "pending"
                              ? driver.driver_documents[0].driver_license_url
                              : undefined,
                          verified: driver.driver_documents[0].is_driver_license_verified,
                          uploaded_at: driver.driver_documents[0].created_at,
                        }}
                        onVerify={() => handleVerifyComponent("document")}
                        onReject={() => handleRejectComponent("document")}
                        status={getDocumentFieldStatus(driver.driver_documents[0], "driver_license")}
                        actions={false}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-[#E1E4EA] rounded-lg p-4">
                        <h4 className="text-[15px] font-semibold text-[#111827] mb-4">National ID Details</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                              ID Number
                            </label>
                            <p className="text-[13px] text-[#111827] font-mono">
                              {driver.driver_documents[0].national_id_number || "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                              Status
                            </label>
                            <StatusBadge status={getDocumentFieldStatus(driver.driver_documents[0], "national_id")} />
                          </div>
                        </div>
                      </div>

                      <div className="border border-[#E1E4EA] rounded-lg p-4">
                        <h4 className="text-[15px] font-semibold text-[#111827] mb-4">BVN Verification</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                              BVN
                            </label>
                            <p className="text-[13px] text-[#111827] font-mono">
                              {driver.driver_documents[0].bank_verification || "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                              Status
                            </label>
                            <StatusBadge status={getDocumentFieldStatus(driver.driver_documents[0], "bank_verification")} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {driver.verificationStatus.document !== "VERIFIED" && (
                      <div className="flex justify-center gap-4 pt-4 border-t border-[#E1E4EA]">
                        <Button
                          variant="success"
                          onClick={() => handleVerifyComponent("document")}
                          disabled={!can("account.verify")}
                        >
                          <i className="pi pi-check mr-2" />
                          Verify All Documents
                        </Button>
                        {driver.verificationStatus.document === "PENDING" && (
                          <Button
                            variant="danger"
                            onClick={() => handleRejectComponent("document")}
                            disabled={!can("account.verify")}
                          >
                            <i className="pi pi-times mr-2" />
                            Reject All Documents
                          </Button>
                      )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <i className="pi pi-file text-[#9CA3AF] text-4xl mb-4" />
                    <p className="text-[16px] text-[#525866]">No documents uploaded</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "vehicle" && (
              <div className="space-y-6">
                {driver.driver_vehicle && driver.driver_vehicle.length > 0 ? (
                  <>
                    <VehicleViewer
                      vehicle={{
                        make: driver.driver_vehicle[0].brand_name || undefined,
                        model: driver.driver_vehicle[0].model_name || undefined,
                        year: driver.driver_vehicle[0].model_year || undefined,
                        color: driver.driver_vehicle[0].model_color || undefined,
                        plate_number: driver.driver_vehicle[0].model_plate_number || undefined,
                        registration_document: driver.driver_vehicle[0].model_certificate_url || undefined,
                        insurance_document: driver.driver_vehicle[0].model_image_url || undefined,
                        verified: driver.driver_vehicle[0].is_verified,
                      }}
                      onVerify={() => handleVerifyComponent("vehicle")}
                      onReject={() => handleRejectComponent("vehicle")}
                      status={driver.verificationStatus.vehicle}
                    />
                    
                    <div className="border border-[#E1E4EA] rounded-lg p-6">
                      <h4 className="text-[15px] font-semibold text-[#111827] mb-4">Additional Vehicle Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                            Vehicle Type
                          </label>
                          <p className="text-[13px] text-[#111827]">
                            {driver.driver_vehicle[0].vehicle_type || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                            Seat Capacity
                          </label>
                          <p className="text-[13px] text-[#111827]">
                            {driver.driver_vehicle[0].model_seat_capacity || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                            NIN Number
                          </label>
                          <p className="text-[13px] text-[#111827] font-mono">
                            {driver.driver_vehicle[0].national_identification_number || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                            NIN Name
                          </label>
                          <p className="text-[13px] text-[#111827]">
                            {driver.driver_vehicle[0].nin_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                            BVN Number
                          </label>
                          <p className="text-[13px] text-[#111827] font-mono">
                            {driver.driver_vehicle[0].bvn_number || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                            Verified At
                          </label>
                          <p className="text-[13px] text-[#111827]">
                            {driver.driver_vehicle[0].verified_at ? formatDate(driver.driver_vehicle[0].verified_at) : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <i className="pi pi-car text-[#9CA3AF] text-4xl mb-4" />
                    <p className="text-[16px] text-[#525866]">No vehicle information provided</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "personal_info" && (
              <div className="space-y-6">
                <div className="border border-[#E1E4EA] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        driver.verificationStatus.personal_info === "VERIFIED" ? "bg-[#D1FAE5] text-[#059669]" :
                        driver.verificationStatus.personal_info === "REJECTED" ? "bg-[#FEE2E2] text-[#DC2626]" :
                        "bg-[#FEF3C7] text-[#D97706]"
                      }`}>
                        <i className={`pi ${
                          driver.verificationStatus.personal_info === "VERIFIED" ? "pi-check" :
                          driver.verificationStatus.personal_info === "REJECTED" ? "pi-times" :
                          "pi-clock"
                        } text-lg`} />
                      </div>
                      <div>
                        <h3 className="text-[18px] font-semibold text-[#111827]">Personal Information Verification</h3>
                        <p className="text-[13px] text-[#525866]">
                          Review and verify mover&apos;s basic profile information and KYC status
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={driver.verificationStatus.personal_info} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <p className="text-[15px] text-[#111827] font-medium">
                        {driver.full_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <p className="text-[15px] text-[#111827]">
                        {driver.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <p className="text-[15px] text-[#111827]">
                        {driver.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Date of Birth
                      </label>
                      <p className="text-[15px] text-[#111827]">
                        {formatDate(driver.birth_date)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        KYC Status
                      </label>
                      <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${kycPillClass(driver.kyc_status)}`}>
                        {driver.kyc_status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                        Auth Provider
                      </label>
                      <span className="text-[13px] px-3 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
                        {driver.provider}
                      </span>
                    </div>
                  </div>

                  {driver.verificationStatus.personal_info !== "VERIFIED" && (
                    <div className="flex justify-center gap-4 pt-6 border-t border-[#E1E4EA]">
                      <Button
                        variant="success"
                        onClick={() => handleVerifyComponent("personal_info")}
                        disabled={!can("account.verify")}
                      >
                        <i className="pi pi-check mr-2" />
                        Verify Personal Information
                      </Button>
                      {driver.verificationStatus.personal_info === "PENDING" && (
                        <Button
                          variant="danger"
                          onClick={() => handleRejectComponent("personal_info")}
                          disabled={!can("account.verify")}
                        >
                          <i className="pi pi-times mr-2" />
                          Reject Personal Information
                        </Button>
                    )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "id_confirmation" && (
              <div className="space-y-6">
                {driver.driver_id_confirmation && driver.driver_id_confirmation.length > 0 ? (
                  <div className="border border-[#E1E4EA] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          driver.verificationStatus.id_confirmation === "VERIFIED" ? "bg-[#D1FAE5] text-[#059669]" :
                          driver.verificationStatus.id_confirmation === "REJECTED" ? "bg-[#FEE2E2] text-[#DC2626]" :
                          "bg-[#FEF3C7] text-[#D97706]"
                        }`}>
                          <i className={`pi ${
                            driver.verificationStatus.id_confirmation === "VERIFIED" ? "pi-check" :
                            driver.verificationStatus.id_confirmation === "REJECTED" ? "pi-times" :
                            "pi-clock"
                          } text-lg`} />
                        </div>
                        <div>
                          <h3 className="text-[18px] font-semibold text-[#111827]">ID Confirmation Verification</h3>
                          <p className="text-[13px] text-[#525866]">
                            Selfie verification status: {driver.driver_id_confirmation[0].is_confirmed ? "Confirmed" : "Pending"}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={driver.verificationStatus.id_confirmation} />
                    </div>
                    
                    {driver.driver_id_confirmation[0].image_url ? (
                      <div className="flex justify-center mb-6">
                        <div className="relative">
                          <img
                            src={driver.driver_id_confirmation[0].image_url}
                            alt="ID Confirmation Selfie"
                            className="w-64 h-64 object-cover rounded-2xl border-2 border-[#E1E4EA] shadow-lg"
                          />
                          <div className="absolute top-3 right-3">
                            <StatusBadge status={driver.verificationStatus.id_confirmation} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center mb-6">
                        <div className="w-64 h-64 bg-[#F3F4F6] rounded-2xl flex items-center justify-center">
                          <div className="text-center">
                            <i className="pi pi-camera text-[#9CA3AF] text-4xl mb-2" />
                            <p className="text-[13px] text-[#525866]">No selfie uploaded</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                          Confirmation Status
                        </label>
                        <p className="text-[15px] text-[#111827]">
                          {driver.driver_id_confirmation[0].is_confirmed ? "Confirmed" : "Not Confirmed"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                          Uploaded At
                        </label>
                        <p className="text-[15px] text-[#111827]">
                          {formatDate(driver.driver_id_confirmation[0].created_at)}
                        </p>
                      </div>
                    </div>

                    {driver.verificationStatus.id_confirmation !== "VERIFIED" && (
                      <div className="flex justify-center gap-4 pt-6 border-t border-[#E1E4EA]">
                        <Button
                          variant="success"
                          onClick={() => handleVerifyComponent("id_confirmation")}
                          disabled={!can("account.verify")}
                        >
                          <i className="pi pi-check mr-2" />
                          Verify ID Confirmation
                        </Button>
                        {driver.verificationStatus.id_confirmation === "PENDING" && (
                          <Button
                            variant="danger"
                            onClick={() => handleRejectComponent("id_confirmation")}
                            disabled={!can("account.verify")}
                          >
                            <i className="pi pi-times mr-2" />
                            Reject ID Confirmation
                          </Button>
                      )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-[#E1E4EA] rounded-lg">
                    <i className="pi pi-camera text-[#9CA3AF] text-4xl mb-4" />
                    <p className="text-[16px] text-[#525866]">No ID confirmation provided</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "bank_account" && (
              <div className="space-y-6">
                {driver.bank_account && driver.bank_account.length > 0 ? (
                  <div className="border border-[#E1E4EA] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          driver.verificationStatus.bank_account === "VERIFIED" ? "bg-[#D1FAE5] text-[#059669]" :
                          driver.verificationStatus.bank_account === "REJECTED" ? "bg-[#FEE2E2] text-[#DC2626]" :
                          "bg-[#FEF3C7] text-[#D97706]"
                        }`}>
                          <i className={`pi ${
                            driver.verificationStatus.bank_account === "VERIFIED" ? "pi-check" :
                            driver.verificationStatus.bank_account === "REJECTED" ? "pi-times" :
                            "pi-clock"
                          } text-lg`} />
                        </div>
                        <div>
                          <h3 className="text-[18px] font-semibold text-[#111827]">Bank Account Verification</h3>
                          <p className="text-[13px] text-[#525866]">
                            Review and verify mover&apos;s bank account details
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={driver.verificationStatus.bank_account} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-[#F9FAFB] rounded-lg p-4">
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                          Account Holder Name
                        </label>
                        <p className="text-[16px] text-[#111827] font-semibold">
                          {driver.bank_account[0].account_holder_name || "N/A"}
                        </p>
                      </div>
                      <div className="bg-[#F9FAFB] rounded-lg p-4">
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                          Account Number
                        </label>
                        <p className="text-[16px] text-[#111827] font-mono font-semibold">
                          {driver.bank_account[0].account_number || "N/A"}
                        </p>
                      </div>
                      <div className="bg-[#F9FAFB] rounded-lg p-4">
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                          Bank Name
                        </label>
                        <p className="text-[16px] text-[#111827] font-semibold">
                          {driver.bank_account[0].bank_name || "N/A"}
                        </p>
                      </div>
                      <div className="bg-[#F9FAFB] rounded-lg p-4">
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                          Bank Code
                        </label>
                        <p className="text-[16px] text-[#111827] font-mono">
                          {driver.bank_account[0].bank_code || "N/A"}
                        </p>
                      </div>
                      <div className="bg-[#F9FAFB] rounded-lg p-4">
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                          Account Type
                        </label>
                        <p className="text-[16px] text-[#111827]">
                          {driver.bank_account[0].account_type || "N/A"}
                        </p>
                      </div>
                      <div className="bg-[#F9FAFB] rounded-lg p-4">
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                          Verified At
                        </label>
                        <p className="text-[16px] text-[#111827]">
                          {driver.bank_account[0].verified_at ? formatDate(driver.bank_account[0].verified_at) : "Not verified"}
                        </p>
                      </div>
                    </div>

                    {driver.verificationStatus.bank_account !== "VERIFIED" && (
                      <div className="flex justify-center gap-4 pt-6 border-t border-[#E1E4EA]">
                        <Button
                          variant="success"
                          onClick={() => handleVerifyComponent("bank_account")}
                          disabled={!can("account.verify")}
                        >
                          <i className="pi pi-check mr-2" />
                          Verify Bank Account
                        </Button>
                        {driver.verificationStatus.bank_account === "PENDING" && (
                          <Button
                            variant="danger"
                            onClick={() => handleRejectComponent("bank_account")}
                            disabled={!can("account.verify")}
                          >
                            <i className="pi pi-times mr-2" />
                            Reject Bank Account
                          </Button>
                      )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-[#E1E4EA] rounded-lg">
                    <i className="pi pi-credit-card text-[#9CA3AF] text-4xl mb-4" />
                    <p className="text-[16px] text-[#525866]">No bank account information provided</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "verification" && (
              <div className="space-y-6">
                {/* Personal Info Verification */}
                <div className="border border-[#E1E4EA] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        driver.verificationStatus.personal_info === "VERIFIED" ? "bg-[#D1FAE5] text-[#059669]" :
                        driver.verificationStatus.personal_info === "REJECTED" ? "bg-[#FEE2E2] text-[#DC2626]" :
                        "bg-[#FEF3C7] text-[#D97706]"
                      }`}>
                        <i className={`pi ${
                          driver.verificationStatus.personal_info === "VERIFIED" ? "pi-check" :
                          driver.verificationStatus.personal_info === "REJECTED" ? "pi-times" :
                          "pi-clock"
                        }`} />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-semibold text-[#111827]">Personal Information</h4>
                        <p className="text-[13px] text-[#525866]">
                          Basic profile information and KYC status
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={driver.verificationStatus.personal_info} />
                      {driver.verificationStatus.personal_info === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleVerifyComponent("personal_info")}
                            disabled={!can("account.verify")}
                          >
                            <i className="pi pi-check mr-1" />
                            Verify
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectComponent("personal_info")}
                            disabled={!can("account.verify")}
                          >
                            <i className="pi pi-times mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ID Confirmation */}
                {driver.driver_id_confirmation && driver.driver_id_confirmation.length > 0 && (
                  <div className="border border-[#E1E4EA] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          driver.verificationStatus.id_confirmation === "VERIFIED" ? "bg-[#D1FAE5] text-[#059669]" :
                          driver.verificationStatus.id_confirmation === "REJECTED" ? "bg-[#FEE2E2] text-[#DC2626]" :
                          "bg-[#FEF3C7] text-[#D97706]"
                        }`}>
                          <i className={`pi ${
                            driver.verificationStatus.id_confirmation === "VERIFIED" ? "pi-check" :
                            driver.verificationStatus.id_confirmation === "REJECTED" ? "pi-times" :
                            "pi-clock"
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-[15px] font-semibold text-[#111827]">ID Confirmation</h4>
                          <p className="text-[13px] text-[#525866]">
                            Selfie verification: {driver.driver_id_confirmation[0].is_confirmed ? "Confirmed" : "Pending"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={driver.verificationStatus.id_confirmation} />
                        {driver.verificationStatus.id_confirmation === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleVerifyComponent("id_confirmation")}
                              disabled={!can("account.verify")}
                            >
                              <i className="pi pi-check mr-1" />
                              Verify
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRejectComponent("id_confirmation")}
                              disabled={!can("account.verify")}
                            >
                              <i className="pi pi-times mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {driver.driver_id_confirmation[0].image_url && (
                      <div className="mt-4">
                        <img
                          src={driver.driver_id_confirmation[0].image_url}
                          alt="ID Confirmation Selfie"
                          className="w-32 h-32 object-cover rounded-lg border border-[#E1E4EA]"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Bank Account Verification */}
                {driver.bank_account && driver.bank_account.length > 0 && (
                  <div className="border border-[#E1E4EA] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          driver.verificationStatus.bank_account === "VERIFIED" ? "bg-[#D1FAE5] text-[#059669]" :
                          driver.verificationStatus.bank_account === "REJECTED" ? "bg-[#FEE2E2] text-[#DC2626]" :
                          "bg-[#FEF3C7] text-[#D97706]"
                        }`}>
                          <i className={`pi ${
                            driver.verificationStatus.bank_account === "VERIFIED" ? "pi-check" :
                            driver.verificationStatus.bank_account === "REJECTED" ? "pi-times" :
                            "pi-clock"
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-[15px] font-semibold text-[#111827]">Bank Account</h4>
                          <p className="text-[13px] text-[#525866]">
                            {driver.bank_account[0].bank_name} - {driver.bank_account[0].account_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={driver.verificationStatus.bank_account} />
                        {driver.verificationStatus.bank_account === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleVerifyComponent("bank_account")}
                              disabled={!can("account.verify")}
                            >
                              <i className="pi pi-check mr-1" />
                              Verify
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRejectComponent("bank_account")}
                              disabled={!can("account.verify")}
                            >
                              <i className="pi pi-times mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                          Account Holder
                        </label>
                        <p className="text-[13px] text-[#111827]">
                          {driver.bank_account[0].account_holder_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                          Account Type
                        </label>
                        <p className="text-[13px] text-[#111827]">
                          {driver.bank_account[0].account_type || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-6">
                <DriverPerformancePanel driverId={driver.id} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-[#E1E4EA] rounded-lg p-4">
                    <h4 className="text-[13px] font-semibold text-[#111827] mb-2">Joined Date</h4>
                    <p className="text-[15px] text-[#111827]">
                      {formatDate(driver.created_at)}
                    </p>
                  </div>
                  <div className="border border-[#E1E4EA] rounded-lg p-4">
                    <h4 className="text-[13px] font-semibold text-[#111827] mb-2">Last Updated</h4>
                    <p className="text-[15px] text-[#111827]">
                      {formatDate(driver.updated_at)}
                    </p>
                  </div>
                  <div className="border border-[#E1E4EA] rounded-lg p-4">
                    <h4 className="text-[13px] font-semibold text-[#111827] mb-2">OTP Verified</h4>
                    <StatusBadge status={driver.otp_verified ? "VERIFIED" : "PENDING"} />
                  </div>
                </div>

                <div className="border border-[#E1E4EA] rounded-lg p-6">
                  <h4 className="text-[15px] font-semibold text-[#111827] mb-4">Account Timeline</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-[#F9FAFB] rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                        <i className="pi pi-user text-xs" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#111827]">Account Created</p>
                        <p className="text-[11px] text-[#525866]">{formatDate(driver.created_at)}</p>
                      </div>
                    </div>
                    
                    {driver.driver_documents && driver.driver_documents.length > 0 && (
                      <div className="flex items-center gap-4 p-3 bg-[#F9FAFB] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center">
                          <i className="pi pi-file text-xs" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#111827]">Documents Uploaded</p>
                          <p className="text-[11px] text-[#525866]">{formatDate(driver.driver_documents[0].created_at)}</p>
                        </div>
                      </div>
                    )}
                    
                    {driver.driver_vehicle && driver.driver_vehicle.length > 0 && (
                      <div className="flex items-center gap-4 p-3 bg-[#F9FAFB] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center">
                          <i className="pi pi-car text-xs" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#111827]">Vehicle Registered</p>
                          <p className="text-[11px] text-[#525866]">{formatDate(driver.driver_vehicle[0].created_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
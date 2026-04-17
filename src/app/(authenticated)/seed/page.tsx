"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SeedService, { SeedStatus } from "@/services/SeedService";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function SeedPage() {
  const toast = useRef<ToastRef>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seedService = new SeedService();

  const [seedStatus, setSeedStatus] = useState<SeedStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [progressStep, setProgressStep] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "primary" | "danger" | "success";
  }>({ visible: false, title: "", message: "", onConfirm: () => {}, variant: "primary" });

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const data = await seedService.getSeedStatus();
        setSeedStatus(data);
        setProgressStep(data.job?.step || null);

        if (data.job?.status === "done") {
          stopPolling();
          setSeeding(false);
          setProgressStep(null);
          toast.current?.show({
            severity: "success",
            summary: "Seed Complete",
            detail: "Test data seeded successfully",
            life: 4000,
          });
        } else if (data.job?.status === "failed") {
          stopPolling();
          setSeeding(false);
          setProgressStep(null);
          toast.current?.show({
            severity: "error",
            summary: "Seed Failed",
            detail: data.job.error || "Seed process failed",
            life: 5000,
          });
        }
      } catch {
        // keep polling on transient errors
      }
    }, 3000);
  }, [stopPolling]);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await seedService.getSeedStatus();
        setSeedStatus(data);
        // Resume polling if a seed is already running (e.g. page refresh mid-seed)
        if (data.job?.status === "running") {
          setSeeding(true);
          setProgressStep(data.job.step || "Running...");
          startPolling();
        }
      } catch {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load seed status",
          life: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => stopPolling();
  }, []);

  const handleRunSeed = async () => {
    try {
      setSeeding(true);
      setProgressStep("Starting seed...");
      const res = await seedService.runFullSeed();

      if (res.status === 202 || res.status === 200) {
        setProgressStep("Seed started...");
        startPolling();
      } else if (res.status === 409) {
        // Already running — just start polling
        setProgressStep("Seed already running...");
        startPolling();
      } else {
        throw new Error("Unexpected response from seed endpoint");
      }
    } catch (error: any) {
      setSeeding(false);
      setProgressStep(null);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to start seed",
        life: 3000,
      });
    }
  };

  const handleCleanup = async () => {
    try {
      setCleaning(true);
      await seedService.cleanupTestData();
      const data = await seedService.getSeedStatus();
      setSeedStatus(data);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Test data cleaned up successfully",
        life: 3000,
      });
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to cleanup test data",
        life: 3000,
      });
    } finally {
      setCleaning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4" />
          <p className="text-[#525866]">Loading seed status...</p>
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

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-[24px] font-bold text-[#111827]">Seed Data Management</h1>
          <p className="text-[13px] text-[#525866] mt-1">Generate and manage test data for development</p>
        </div>

        {/* Progress Banner */}
        {seeding && (
          <div className="bg-[#DBEAFE] border border-[#93C5FD] rounded-lg p-4 flex items-center gap-3">
            <i className="pi pi-spinner pi-spin text-[#2563EB] text-lg" />
            <div>
              <p className="text-[13px] font-semibold text-[#1E40AF]">Seed in progress...</p>
              {progressStep && (
                <p className="text-[12px] text-[#3B82F6] mt-0.5">{progressStep}</p>
              )}
            </div>
          </div>
        )}

        {/* Seed Result from last completed job */}
        {seedStatus?.job?.status === "done" && seedStatus.job.result && (
          <div className="bg-[#ECFDF5] border border-[#6EE7B7] rounded-lg p-6">
            <h2 className="text-[15px] font-semibold text-[#065F46] mb-4">Last Seed Result</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(seedStatus.job.result).map(([key, val]) => (
                <div key={key}>
                  <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider capitalize">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-[18px] font-bold text-[#111827] mt-1">
                    {typeof val === "number" && key.includes("revenue")
                      ? `₦${val.toLocaleString()}`
                      : val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed job error */}
        {seedStatus?.job?.status === "failed" && seedStatus.job.error && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg p-4">
            <p className="text-[13px] font-semibold text-[#DC2626]">Last seed failed</p>
            <p className="text-[12px] text-[#EF4444] mt-1">{seedStatus.job.error}</p>
          </div>
        )}

        {/* Current DB Counts */}
        {seedStatus && (
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Current Test Data</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Users", value: seedStatus.test_users },
                { label: "Drivers", value: seedStatus.test_drivers },
                { label: "Vendors", value: seedStatus.test_vendors },
                { label: "Orders", value: seedStatus.test_orders },
                { label: "Payments", value: seedStatus.test_payments },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#F3F4F6] rounded-lg p-4">
                  <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">{label}</p>
                  <p className="text-[20px] font-bold text-[#111827] mt-2">{value}</p>
                </div>
              ))}
              <div className={`rounded-lg p-4 ${seedStatus.has_test_data ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]"}`}>
                <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">Status</p>
                <p className={`text-[13px] font-bold mt-2 ${seedStatus.has_test_data ? "text-[#059669]" : "text-[#DC2626]"}`}>
                  {seedStatus.has_test_data ? "Active" : "Empty"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
          <h2 className="text-[16px] font-semibold text-[#111827] mb-4">About Seed Data</h2>
          <div className="space-y-3 text-[13px] text-[#525866]">
            <p><span className="font-semibold text-[#111827]">Full Seed</span> generates comprehensive test data including:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>50 test users (85% verified)</li>
              <li>20 test drivers with complete documentation</li>
              <li>27 test vendors (restaurants, pharmacies, groceries)</li>
              <li>~90 test orders with realistic status distribution</li>
              <li>~237 test payments</li>
              <li>5 test vouchers</li>
              <li>35 FAQs across 7 categories</li>
            </ul>
            <p className="mt-4"><span className="font-semibold text-[#111827]">Test Data Identification:</span></p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Users/Drivers: email ends with @test.com</li>
              <li>Vendors: email ends with @sonic-test.com</li>
              <li>Orders: order_id starts with ORD-SEED-</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleRunSeed}
            disabled={seeding || cleaning}
            className="px-6 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {seeding ? (
              <><i className="pi pi-spinner pi-spin text-sm" />Seeding...</>
            ) : (
              <><i className="pi pi-database text-sm" />Run Full Seed</>
            )}
          </button>

          {seedStatus?.has_test_data && (
            <button
              onClick={() => setConfirmDialog({
                visible: true,
                title: "Confirm Cleanup",
                message: "Are you sure you want to delete all test data? This action cannot be undone.",
                onConfirm: handleCleanup,
                variant: "danger",
              })}
              disabled={seeding || cleaning}
              className="px-6 py-2 bg-[#DC2626] text-white rounded-lg text-[13px] font-semibold hover:bg-[#B91C1C] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {cleaning ? (
                <><i className="pi pi-spinner pi-spin text-sm" />Cleaning...</>
              ) : (
                <><i className="pi pi-trash text-sm" />Cleanup Test Data</>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

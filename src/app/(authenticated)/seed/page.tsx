"use client";

import { useState, useEffect, useRef } from "react";
import SeedService, { SeedStatus, SeedResult } from "@/services/SeedService";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function SeedPage() {
  const toast = useRef<ToastRef>(null);
  const seedService = new SeedService();

  const [seedStatus, setSeedStatus] = useState<SeedStatus | null>(null);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [cleaning, setCleaning] = useState(false);
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
    loadSeedStatus();
  }, []);

  const loadSeedStatus = async () => {
    try {
      setLoading(true);
      const data = await seedService.getSeedStatus();
      setSeedStatus(data);
    } catch (error) {
      console.error("❌ Failed to load seed status:", error);
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

  const handleRunSeed = async () => {
    try {
      setSeeding(true);
      const result = await seedService.runFullSeed();
      setSeedResult(result);
      await loadSeedStatus();
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Test data seeded successfully",
        life: 3000,
      });
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to seed test data",
        life: 3000,
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleCleanup = async () => {
    try {
      setCleaning(true);
      await seedService.cleanupTestData();
      setSeedStatus(null);
      setSeedResult(null);
      await loadSeedStatus();
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

  const confirmCleanup = () => {
    setConfirmDialog({
      visible: true,
      title: "Confirm Cleanup",
      message: "Are you sure you want to delete all test data? This action cannot be undone.",
      onConfirm: handleCleanup,
      variant: "danger",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
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

        {/* Status Card */}
        {seedStatus && (
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Current Test Data</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-[#F3F4F6] rounded-lg p-4">
                <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">Users</p>
                <p className="text-[20px] font-bold text-[#111827] mt-2">{seedStatus.test_users}</p>
              </div>
              <div className="bg-[#F3F4F6] rounded-lg p-4">
                <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">Drivers</p>
                <p className="text-[20px] font-bold text-[#111827] mt-2">{seedStatus.test_drivers}</p>
              </div>
              <div className="bg-[#F3F4F6] rounded-lg p-4">
                <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">Vendors</p>
                <p className="text-[20px] font-bold text-[#111827] mt-2">{seedStatus.test_vendors}</p>
              </div>
              <div className="bg-[#F3F4F6] rounded-lg p-4">
                <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">Orders</p>
                <p className="text-[20px] font-bold text-[#111827] mt-2">{seedStatus.test_orders}</p>
              </div>
              <div className="bg-[#F3F4F6] rounded-lg p-4">
                <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">Payments</p>
                <p className="text-[20px] font-bold text-[#111827] mt-2">{seedStatus.test_payments}</p>
              </div>
              <div className={`rounded-lg p-4 ${seedStatus.has_test_data ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]"}`}>
                <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">Status</p>
                <p className={`text-[13px] font-bold mt-2 ${seedStatus.has_test_data ? "text-[#059669]" : "text-[#DC2626]"}`}>
                  {seedStatus.has_test_data ? "Active" : "Empty"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Seed Result */}
        {seedResult && (
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Last Seed Result</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Users Created
                </label>
                <p className="text-[18px] font-bold text-[#111827]">{seedResult.users}</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Drivers Created
                </label>
                <p className="text-[18px] font-bold text-[#111827]">{seedResult.drivers}</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Vendors Created
                </label>
                <p className="text-[18px] font-bold text-[#111827]">{seedResult.vendors}</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Orders Created
                </label>
                <p className="text-[18px] font-bold text-[#111827]">{seedResult.orders}</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Payments Created
                </label>
                <p className="text-[18px] font-bold text-[#111827]">{seedResult.payments}</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Total Revenue
                </label>
                <p className="text-[18px] font-bold text-[#111827]">
                  ₦{seedResult.total_revenue.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Delivered Orders
                </label>
                <p className="text-[18px] font-bold text-[#111827]">{seedResult.delivered_orders}</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Vouchers Created
                </label>
                <p className="text-[18px] font-bold text-[#111827]">{seedResult.vouchers}</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  FAQs Created
                </label>
                <p className="text-[18px] font-bold text-[#111827]">{seedResult.faqs}</p>
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
          <h2 className="text-[16px] font-semibold text-[#111827] mb-4">About Seed Data</h2>
          <div className="space-y-3 text-[13px] text-[#525866]">
            <p>
              <span className="font-semibold text-[#111827]">Full Seed</span> generates comprehensive test data including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>50 test users (85% verified)</li>
              <li>20 test drivers with complete documentation</li>
              <li>27 test vendors (restaurants, pharmacies, groceries)</li>
              <li>~90 test orders with realistic status distribution</li>
              <li>~237 test payments</li>
              <li>5 test vouchers</li>
              <li>35 FAQs across 7 categories</li>
            </ul>
            <p className="mt-4">
              <span className="font-semibold text-[#111827]">Test Data Identification:</span> All test data uses specific identifiers:
            </p>
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
            disabled={seeding}
            className="px-6 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <i className="pi pi-database text-sm" />
            {seeding ? "Seeding..." : "Run Full Seed"}
          </button>
          {seedStatus?.has_test_data && (
            <button
              onClick={confirmCleanup}
              disabled={cleaning}
              className="px-6 py-2 bg-[#DC2626] text-white rounded-lg text-[13px] font-semibold hover:bg-[#B91C1C] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <i className="pi pi-trash text-sm" />
              {cleaning ? "Cleaning..." : "Cleanup Test Data"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

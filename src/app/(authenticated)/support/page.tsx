"use client";

import { useState, useEffect, useRef } from "react";
import SupportService, { ContactInfo } from "@/services/SupportService";
import Toast, { ToastRef } from "@/components/shared/Toast";
import Button from "@/components/shared/Button";
import BusinessHoursInput from "@/components/shared/BusinessHoursInput";

export default function SupportPage() {
  const toast = useRef<ToastRef>(null);
  const supportService = new SupportService();

  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [formData, setFormData] = useState<Partial<ContactInfo>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      setLoading(true);
      const data = await supportService.getContactInfo();
      setContactInfo(data);
      setFormData(data);
    } catch (error) {
      console.error("❌ Failed to load contact info:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load contact information",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.phone?.trim() || !formData.email?.trim()) {
        toast.current?.show({
          severity: "error",
          summary: "Validation Error",
          detail: "Phone and email are required",
          life: 3000,
        });
        return;
      }

      setSaving(true);
      const updated = await supportService.updateContactInfo(formData);
      setContactInfo(updated);
      setIsEditing(false);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Contact information updated successfully",
        life: 3000,
      });
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to update contact information",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(contactInfo || {});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-[#525866]">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-[#111827]">Support Settings</h1>
            <p className="text-[13px] text-[#525866] mt-1">Manage contact information and business hours</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <i className="pi pi-pencil mr-2" />
              Edit
            </Button>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
          <h2 className="text-[16px] font-semibold text-[#111827] mb-6">Contact Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                Phone Number *
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="e.g., +234 800 123 4567"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              ) : (
                <p className="text-[13px] text-[#111827] py-2">{contactInfo?.phone || "N/A"}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                Email Address *
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="e.g., support@sonic.com"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              ) : (
                <p className="text-[13px] text-[#111827] py-2">{contactInfo?.email || "N/A"}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                Physical Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="e.g., 123 Lekki Phase 1, Lagos"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              ) : (
                <p className="text-[13px] text-[#111827] py-2">{contactInfo?.address || "N/A"}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                City
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.city || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="e.g., Lagos"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              ) : (
                <p className="text-[13px] text-[#111827] py-2">{contactInfo?.city || "N/A"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
          <h2 className="text-[16px] font-semibold text-[#111827] mb-6">Business Hours</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Weekday Hours */}
            <div>
              {isEditing ? (
                <BusinessHoursInput
                  value={formData.businessHours || ""}
                  onChange={(value) =>
                    setFormData({ ...formData, businessHours: value })
                  }
                  label="Monday - Friday"
                  placeholder="Select hours"
                />
              ) : (
                <>
                  <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                    Monday - Friday
                  </label>
                  <p className="text-[13px] text-[#111827] py-2">{contactInfo?.businessHours || "N/A"}</p>
                </>
              )}
            </div>

            {/* Saturday Hours */}
            <div>
              {isEditing ? (
                <BusinessHoursInput
                  value={formData.saturdayHours || ""}
                  onChange={(value) =>
                    setFormData({ ...formData, saturdayHours: value })
                  }
                  label="Saturday"
                  placeholder="Select hours"
                />
              ) : (
                <>
                  <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                    Saturday
                  </label>
                  <p className="text-[13px] text-[#111827] py-2">{contactInfo?.saturdayHours || "N/A"}</p>
                </>
              )}
            </div>

            {/* Sunday Hours */}
            <div>
              {isEditing ? (
                <BusinessHoursInput
                  value={formData.sundayHours || ""}
                  onChange={(value) =>
                    setFormData({ ...formData, sundayHours: value })
                  }
                  label="Sunday"
                  placeholder="Select hours"
                />
              ) : (
                <>
                  <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                    Sunday
                  </label>
                  <p className="text-[13px] text-[#111827] py-2">{contactInfo?.sundayHours || "N/A"}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

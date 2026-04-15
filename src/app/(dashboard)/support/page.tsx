"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import SupportService, { ContactInfo } from "@/services/SupportService";

export default function SupportPage() {
  const toast = useRef<Toast>(null);
  const supportService = new SupportService();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone_number: "",
    email: "",
    address: "",
    whatsapp_number: "",
    support_hours: "",
    emergency_contact: "",
  });

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      setLoading(true);
      const data = await supportService.getContactInfo();
      if (data) {
        setContactInfo(data);
      }
    } catch (error) {
      console.error("Failed to load contact info:", error);
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
      setSaving(true);
      await supportService.updateContactInfo(contactInfo);
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

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-spinner pi-spin text-4xl text-blue-500 mb-3"></i>
          <p className="text-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <Toast ref={toast} />

      <div className="col-12">
        <div className="card">
          <div className="flex align-items-center justify-content-between mb-4">
            <h5 className="m-0">Support Contact Information</h5>
            <Button
              label="Save Changes"
              icon="pi pi-save"
              onClick={handleSave}
              loading={saving}
            />
          </div>

          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="phone" className="block text-900 font-medium mb-2">
                  Phone Number *
                </label>
                <InputText
                  id="phone"
                  value={contactInfo.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="w-full"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="email" className="block text-900 font-medium mb-2">
                  Email Address *
                </label>
                <InputText
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="whatsapp" className="block text-900 font-medium mb-2">
                  WhatsApp Number
                </label>
                <InputText
                  id="whatsapp"
                  value={contactInfo.whatsapp_number || ""}
                  onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                  className="w-full"
                  placeholder="Enter WhatsApp number"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="emergency" className="block text-900 font-medium mb-2">
                  Emergency Contact
                </label>
                <InputText
                  id="emergency"
                  value={contactInfo.emergency_contact || ""}
                  onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                  className="w-full"
                  placeholder="Enter emergency contact"
                />
              </div>
            </div>

            <div className="col-12">
              <div className="field">
                <label htmlFor="address" className="block text-900 font-medium mb-2">
                  Office Address
                </label>
                <InputTextarea
                  id="address"
                  value={contactInfo.address || ""}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full"
                  placeholder="Enter office address"
                  rows={3}
                />
              </div>
            </div>

            <div className="col-12">
              <div className="field">
                <label htmlFor="hours" className="block text-900 font-medium mb-2">
                  Support Hours
                </label>
                <InputTextarea
                  id="hours"
                  value={contactInfo.support_hours || ""}
                  onChange={(e) => handleInputChange('support_hours', e.target.value)}
                  className="w-full"
                  placeholder="Enter support hours (e.g., Monday - Friday: 9:00 AM - 6:00 PM)"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-content-end mt-4">
            <Button
              label="Save Changes"
              icon="pi pi-save"
              onClick={handleSave}
              loading={saving}
            />
          </div>
        </div>
      </div>

      {/* Contact Information Preview */}
      <div className="col-12">
        <Card title="Contact Information Preview" className="mt-4">
          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="mb-3">
                <div className="flex align-items-center mb-2">
                  <i className="pi pi-phone text-blue-500 mr-2"></i>
                  <strong>Phone:</strong>
                </div>
                <p className="ml-4 text-600">
                  {contactInfo.phone_number || "Not set"}
                </p>
              </div>

              <div className="mb-3">
                <div className="flex align-items-center mb-2">
                  <i className="pi pi-envelope text-blue-500 mr-2"></i>
                  <strong>Email:</strong>
                </div>
                <p className="ml-4 text-600">
                  {contactInfo.email || "Not set"}
                </p>
              </div>

              <div className="mb-3">
                <div className="flex align-items-center mb-2">
                  <i className="pi pi-whatsapp text-green-500 mr-2"></i>
                  <strong>WhatsApp:</strong>
                </div>
                <p className="ml-4 text-600">
                  {contactInfo.whatsapp_number || "Not set"}
                </p>
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="mb-3">
                <div className="flex align-items-center mb-2">
                  <i className="pi pi-exclamation-triangle text-red-500 mr-2"></i>
                  <strong>Emergency Contact:</strong>
                </div>
                <p className="ml-4 text-600">
                  {contactInfo.emergency_contact || "Not set"}
                </p>
              </div>

              <div className="mb-3">
                <div className="flex align-items-center mb-2">
                  <i className="pi pi-clock text-blue-500 mr-2"></i>
                  <strong>Support Hours:</strong>
                </div>
                <p className="ml-4 text-600">
                  {contactInfo.support_hours || "Not set"}
                </p>
              </div>
            </div>

            <div className="col-12">
              <div className="mb-3">
                <div className="flex align-items-center mb-2">
                  <i className="pi pi-map-marker text-blue-500 mr-2"></i>
                  <strong>Office Address:</strong>
                </div>
                <p className="ml-4 text-600">
                  {contactInfo.address || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
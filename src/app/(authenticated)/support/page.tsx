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
    phone: "",
    email: "",
    address: "",
    city: "",
    businessHours: "",
    saturdayHours: "",
    sundayHours: "",
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
                  value={contactInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
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
                <label htmlFor="address" className="block text-900 font-medium mb-2">
                  Address
                </label>
                <InputText
                  id="address"
                  value={contactInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full"
                  placeholder="Enter address"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="city" className="block text-900 font-medium mb-2">
                  City
                </label>
                <InputText
                  id="city"
                  value={contactInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full"
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="businessHours" className="block text-900 font-medium mb-2">
                  Business Hours
                </label>
                <InputText
                  id="businessHours"
                  value={contactInfo.businessHours}
                  onChange={(e) => handleInputChange('businessHours', e.target.value)}
                  className="w-full"
                  placeholder="e.g., 9:00 AM - 6:00 PM"
                />
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="saturdayHours" className="block text-900 font-medium mb-2">
                  Saturday Hours
                </label>
                <InputText
                  id="saturdayHours"
                  value={contactInfo.saturdayHours}
                  onChange={(e) => handleInputChange('saturdayHours', e.target.value)}
                  className="w-full"
                  placeholder="e.g., 10:00 AM - 4:00 PM"
                />
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="sundayHours" className="block text-900 font-medium mb-2">
                  Sunday Hours
                </label>
                <InputText
                  id="sundayHours"
                  value={contactInfo.sundayHours}
                  onChange={(e) => handleInputChange('sundayHours', e.target.value)}
                  className="w-full"
                  placeholder="e.g., Closed or 12:00 PM - 4:00 PM"
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
                  {contactInfo.phone || "Not set"}
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
                  <i className="pi pi-map-marker text-blue-500 mr-2"></i>
                  <strong>Address:</strong>
                </div>
                <p className="ml-4 text-600">
                  {contactInfo.address || "Not set"}
                </p>
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="mb-3">
                <div className="flex align-items-center mb-2">
                  <i className="pi pi-building text-blue-500 mr-2"></i>
                  <strong>City:</strong>
                </div>
                <p className="ml-4 text-600">
                  {contactInfo.city || "Not set"}
                </p>
              </div>

              <div className="mb-3">
                <div className="flex align-items-center mb-2">
                  <i className="pi pi-clock text-blue-500 mr-2"></i>
                  <strong>Business Hours:</strong>
                </div>
                <p className="ml-4 text-600">
                  {contactInfo.businessHours || "Not set"}
                </p>
              </div>

              <div className="mb-3">
                <div className="flex align-items-center mb-2">
                  <i className="pi pi-calendar text-green-500 mr-2"></i>
                  <strong>Saturday Hours:</strong>
                </div>
                <p className="ml-4 text-600">
                  {contactInfo.saturdayHours || "Not set"}
                </p>
              </div>

              <div className="mb-3">
                <div className="flex align-items-center mb-2">
                  <i className="pi pi-calendar text-red-500 mr-2"></i>
                  <strong>Sunday Hours:</strong>
                </div>
                <p className="ml-4 text-600">
                  {contactInfo.sundayHours || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import VendorService, { VendorFormData } from "@/services/VendorService";

export default function CreateVendorPage() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const vendorService = new VendorService();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<VendorFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    business_type: "",
    description: "",
    business_registration_number: "",
    tax_identification_number: "",
    account_name: "",
    account_number: "",
    bank_name: "",
    bank_code: "",
    commission_rate: 10.5,
    minimum_order: 1000,
    latitude: 6.5244,
    longitude: 3.3792,
    status: "pending",
    kyc_status: "pending",
    is_accepting_orders: true,
    is_open: true,
    onboarding_completed: false,
    timezone: "Africa/Lagos",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Business name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.business_type.trim()) {
      newErrors.business_type = "Business type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (saveAsDraft = false) => {
    if (!saveAsDraft && !validateForm()) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Please fill in all required fields",
        life: 3000,
      });
      return;
    }

    try {
      setSaving(true);
      await vendorService.createVendor(formData);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Vendor ${saveAsDraft ? "saved as draft" : "created"} successfully`,
        life: 3000,
      });
      setTimeout(() => {
        router.push("/vendor");
      }, 1000);
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to create vendor",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid">
      <Toast ref={toast} />

      <div className="col-12">
        <Card>
          <div className="flex justify-content-between align-items-center mb-4">
            <div className="flex align-items-center gap-3">
              <Button
                icon="pi pi-arrow-left"
                rounded
                text
                onClick={() => router.push("/vendor")}
              />
              <h5 className="m-0">Add New Vendor</h5>
            </div>
          </div>

          <Divider />

          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="name" className="font-semibold">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full ${errors.name ? "p-invalid" : ""}`}
                  placeholder="Enter business name"
                />
                {errors.name && (
                  <small className="p-error">{errors.name}</small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="business_type" className="font-semibold">
                  Business Type <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="business_type"
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  className={`w-full ${errors.business_type ? "p-invalid" : ""}`}
                  placeholder="e.g., Restaurant, Grocery, Electronics"
                />
                {errors.business_type && (
                  <small className="p-error">{errors.business_type}</small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="phone" className="font-semibold">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`w-full ${errors.phone ? "p-invalid" : ""}`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <small className="p-error">{errors.phone}</small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="email" className="font-semibold">
                  Email <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full ${errors.email ? "p-invalid" : ""}`}
                  placeholder="Enter email address"
                />
                {errors.email && <small className="p-error">{errors.email}</small>}
              </div>
            </div>

            <div className="col-12">
              <div className="field">
                <label htmlFor="address" className="font-semibold">
                  Business Address <span className="text-red-500">*</span>
                </label>
                <InputTextarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={3}
                  className={`w-full ${errors.address ? "p-invalid" : ""}`}
                  placeholder="Enter full business address"
                />
                {errors.address && (
                  <small className="p-error">{errors.address}</small>
                )}
              </div>
            </div>

            <div className="col-12">
              <div className="field">
                <label htmlFor="description" className="font-semibold">
                  Description
                </label>
                <InputTextarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full"
                  placeholder="Enter business description"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="commission_rate" className="font-semibold">
                  Commission Rate (%)
                </label>
                <InputText
                  id="commission_rate"
                  type="number"
                  step="0.1"
                  value={formData.commission_rate?.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission_rate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full"
                  placeholder="10.5"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="minimum_order" className="font-semibold">
                  Minimum Order Amount
                </label>
                <InputText
                  id="minimum_order"
                  type="number"
                  value={formData.minimum_order?.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimum_order: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full"
                  placeholder="1000"
                />
              </div>
            </div>
          </div>

          <Divider />

          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              outlined
              onClick={() => router.push("/vendor")}
            />
            <Button
              label="Save as Draft"
              icon="pi pi-save"
              outlined
              loading={saving}
              onClick={() => handleSubmit(true)}
            />
            <Button
              label="Create Vendor"
              icon="pi pi-check"
              loading={saving}
              onClick={() => handleSubmit(false)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

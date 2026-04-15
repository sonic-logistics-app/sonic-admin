"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import VendorService, { VendorFormData } from "@/services/VendorService";

const categories = [
  { label: "Food", value: "food" },
  { label: "Grocery", value: "grocery" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Electronics", value: "electronics" },
  { label: "Fashion", value: "fashion" },
  { label: "Other", value: "other" },
];

export default function CreateVendorPage() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const vendorService = new VendorService();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<VendorFormData>({
    business_name: "",
    category: "",
    contact_name: "",
    phone_number: "",
    email: "",
    password: "",
    business_address: "",
    opening_hours: "",
    closing_hours: "",
    delivery_radius: 5,
    bank_details: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.business_name.trim()) {
      newErrors.business_name = "Business name is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.contact_name.trim()) {
      newErrors.contact_name = "Contact person is required";
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.business_address.trim()) {
      newErrors.business_address = "Business address is required";
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
                <label htmlFor="business_name" className="font-semibold">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) =>
                    setFormData({ ...formData, business_name: e.target.value })
                  }
                  className={`w-full ${errors.business_name ? "p-invalid" : ""}`}
                  placeholder="Enter business name"
                />
                {errors.business_name && (
                  <small className="p-error">{errors.business_name}</small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="category" className="font-semibold">
                  Category <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  id="category"
                  value={formData.category}
                  options={categories}
                  onChange={(e) => setFormData({ ...formData, category: e.value })}
                  className={`w-full ${errors.category ? "p-invalid" : ""}`}
                  placeholder="Select a category"
                />
                {errors.category && (
                  <small className="p-error">{errors.category}</small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="contact_name" className="font-semibold">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_name: e.target.value })
                  }
                  className={`w-full ${errors.contact_name ? "p-invalid" : ""}`}
                  placeholder="Enter contact person name"
                />
                {errors.contact_name && (
                  <small className="p-error">{errors.contact_name}</small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="phone_number" className="font-semibold">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className={`w-full ${errors.phone_number ? "p-invalid" : ""}`}
                  placeholder="Enter phone number"
                />
                {errors.phone_number && (
                  <small className="p-error">{errors.phone_number}</small>
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

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="password" className="font-semibold">
                  Password
                </label>
                <Password
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full"
                  inputClassName="w-full"
                  placeholder="Auto-generated if left empty"
                  toggleMask
                />
              </div>
            </div>

            <div className="col-12">
              <div className="field">
                <label htmlFor="business_address" className="font-semibold">
                  Business Address <span className="text-red-500">*</span>
                </label>
                <InputTextarea
                  id="business_address"
                  value={formData.business_address}
                  onChange={(e) =>
                    setFormData({ ...formData, business_address: e.target.value })
                  }
                  rows={3}
                  className={`w-full ${errors.business_address ? "p-invalid" : ""}`}
                  placeholder="Enter full business address"
                />
                {errors.business_address && (
                  <small className="p-error">{errors.business_address}</small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="opening_hours" className="font-semibold">
                  Opening Hours
                </label>
                <InputText
                  id="opening_hours"
                  value={formData.opening_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, opening_hours: e.target.value })
                  }
                  className="w-full"
                  placeholder="e.g., 09:00 AM"
                />
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="closing_hours" className="font-semibold">
                  Closing Hours
                </label>
                <InputText
                  id="closing_hours"
                  value={formData.closing_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, closing_hours: e.target.value })
                  }
                  className="w-full"
                  placeholder="e.g., 09:00 PM"
                />
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="delivery_radius" className="font-semibold">
                  Delivery Radius (km)
                </label>
                <InputText
                  id="delivery_radius"
                  type="number"
                  value={formData.delivery_radius?.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      delivery_radius: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="col-12">
              <div className="field">
                <label htmlFor="bank_details" className="font-semibold">
                  Bank Details
                </label>
                <InputTextarea
                  id="bank_details"
                  value={formData.bank_details}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_details: e.target.value })
                  }
                  rows={3}
                  className="w-full"
                  placeholder="Enter bank account details"
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

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import VendorService, { Vendor } from "@/services/VendorService";

const categories = [
  { label: "Food", value: "food" },
  { label: "Grocery", value: "grocery" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Electronics", value: "electronics" },
  { label: "Fashion", value: "fashion" },
  { label: "Other", value: "other" },
];

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const vendorService = new VendorService();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    business_name: "",
    category: "",
    contact_name: "",
    phone_number: "",
    email: "",
    business_address: "",
    opening_hours: "",
    closing_hours: "",
    delivery_radius: 0,
    bank_details: "",
  });

  useEffect(() => {
    if (params.id) {
      loadVendor();
    }
  }, [params.id]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getVendorById(params.id as string);
      setVendor(data);
      setFormData({
        business_name: data.business_name || "",
        category: data.category || "",
        contact_name: data.contact_name || "",
        phone_number: data.phone_number || "",
        email: data.email || "",
        business_address: data.business_address || "",
        opening_hours: data.opening_hours || "",
        closing_hours: data.closing_hours || "",
        delivery_radius: data.delivery_radius || 0,
        bank_details: data.bank_details || "",
      });
    } catch (error) {
      console.error("Failed to load vendor:", error);
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

  const handleSave = async () => {
    try {
      setSaving(true);
      await vendorService.updateVendor(vendor!.id, formData);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Vendor updated successfully",
        life: 3000,
      });
      setEditMode(false);
      loadVendor();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update vendor",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    try {
      await vendorService.approveVendor(vendor!.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Vendor approved successfully",
        life: 3000,
      });
      loadVendor();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to approve vendor",
        life: 3000,
      });
    }
  };

  const handleReject = () => {
    confirmDialog({
      message: "Are you sure you want to reject this vendor?",
      header: "Confirm Rejection",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await vendorService.rejectVendor(vendor!.id, {
            reason: "Does not meet requirements",
          });
          toast.current?.show({
            severity: "info",
            summary: "Rejected",
            detail: "Vendor rejected",
            life: 3000,
          });
          loadVendor();
        } catch (error) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to reject vendor",
            life: 3000,
          });
        }
      },
    });
  };

  const handleSuspend = () => {
    confirmDialog({
      message: "Are you sure you want to suspend this vendor?",
      header: "Confirm Suspension",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-warning",
      accept: async () => {
        try {
          await vendorService.suspendVendor(vendor!.id, {
            reason: "Suspended by admin",
          });
          toast.current?.show({
            severity: "warn",
            summary: "Suspended",
            detail: "Vendor suspended",
            life: 3000,
          });
          loadVendor();
        } catch (error) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to suspend vendor",
            life: 3000,
          });
        }
      },
    });
  };

  const handleActivate = async () => {
    try {
      await vendorService.activateVendor(vendor!.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Vendor activated successfully",
        life: 3000,
      });
      loadVendor();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to activate vendor",
        life: 3000,
      });
    }
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      case "SUSPENDED":
        return "danger";
      case "DRAFT":
        return "info";
      default:
        return undefined;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: "3rem" }} />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="card">
        <h5>Vendor not found</h5>
        <Button label="Back to List" icon="pi pi-arrow-left" onClick={() => router.push("/vendor")} />
      </div>
    );
  }

  return (
    <div className="grid">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="col-12">
        <div className="card">
          <div className="flex justify-content-between align-items-center mb-4">
            <div className="flex align-items-center gap-3">
              <Button
                icon="pi pi-arrow-left"
                rounded
                text
                onClick={() => router.push("/vendor")}
              />
              <div>
                <h5 className="m-0">{vendor.business_name}</h5>
                <Tag value={vendor.status} severity={getStatusSeverity(vendor.status)} className="mt-2" />
              </div>
            </div>
            <div className="flex gap-2">
              {!editMode ? (
                <>
                  <Button
                    label="Edit"
                    icon="pi pi-pencil"
                    onClick={() => setEditMode(true)}
                  />
                  {vendor.status === "PENDING" && (
                    <>
                      <Button
                        label="Approve"
                        icon="pi pi-check"
                        severity="success"
                        onClick={handleApprove}
                      />
                      <Button
                        label="Reject"
                        icon="pi pi-times"
                        severity="danger"
                        onClick={handleReject}
                      />
                    </>
                  )}
                  {vendor.status === "APPROVED" && (
                    <Button
                      label="Suspend"
                      icon="pi pi-ban"
                      severity="warning"
                      onClick={handleSuspend}
                    />
                  )}
                  {vendor.status === "SUSPENDED" && (
                    <Button
                      label="Activate"
                      icon="pi pi-check-circle"
                      severity="success"
                      onClick={handleActivate}
                    />
                  )}
                </>
              ) : (
                <>
                  <Button
                    label="Cancel"
                    icon="pi pi-times"
                    outlined
                    onClick={() => {
                      setEditMode(false);
                      loadVendor();
                    }}
                  />
                  <Button
                    label="Save"
                    icon="pi pi-check"
                    loading={saving}
                    onClick={handleSave}
                  />
                </>
              )}
            </div>
          </div>

          <Divider />

          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="business_name" className="font-semibold">
                  Business Name
                </label>
                <InputText
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) =>
                    setFormData({ ...formData, business_name: e.target.value })
                  }
                  disabled={!editMode}
                  className="w-full"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="category" className="font-semibold">
                  Category
                </label>
                <Dropdown
                  id="category"
                  value={formData.category}
                  options={categories}
                  onChange={(e) => setFormData({ ...formData, category: e.value })}
                  disabled={!editMode}
                  className="w-full"
                  placeholder="Select a category"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="contact_name" className="font-semibold">
                  Contact Person
                </label>
                <InputText
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_name: e.target.value })
                  }
                  disabled={!editMode}
                  className="w-full"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="phone_number" className="font-semibold">
                  Phone Number
                </label>
                <InputText
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  disabled={!editMode}
                  className="w-full"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="email" className="font-semibold">
                  Email
                </label>
                <InputText
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!editMode}
                  className="w-full"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="delivery_radius" className="font-semibold">
                  Delivery Radius (km)
                </label>
                <InputText
                  id="delivery_radius"
                  type="number"
                  value={formData.delivery_radius.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      delivery_radius: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled={!editMode}
                  className="w-full"
                />
              </div>
            </div>

            <div className="col-12">
              <div className="field">
                <label htmlFor="business_address" className="font-semibold">
                  Business Address
                </label>
                <InputTextarea
                  id="business_address"
                  value={formData.business_address}
                  onChange={(e) =>
                    setFormData({ ...formData, business_address: e.target.value })
                  }
                  disabled={!editMode}
                  rows={3}
                  className="w-full"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
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
                  disabled={!editMode}
                  className="w-full"
                  placeholder="e.g., 09:00 AM"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
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
                  disabled={!editMode}
                  className="w-full"
                  placeholder="e.g., 09:00 PM"
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
                  disabled={!editMode}
                  rows={3}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Divider />

          <div className="grid">
            <div className="col-12 md:col-4">
              <Card title="Orders" className="text-center">
                <h2 className="m-0">{vendor.orders_count || 0}</h2>
                <p className="text-500">Total Orders</p>
              </Card>
            </div>
            <div className="col-12 md:col-4">
              <Card title="Rating" className="text-center">
                <h2 className="m-0">{vendor.rating || "N/A"}</h2>
                <p className="text-500">Average Rating</p>
              </Card>
            </div>
            <div className="col-12 md:col-4">
              <Card title="Status" className="text-center">
                <Tag
                  value={vendor.status}
                  severity={getStatusSeverity(vendor.status)}
                  className="text-xl"
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

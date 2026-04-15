"use client";

import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { FilterMatchMode } from "primereact/api";
import VoucherService, { Voucher, VoucherFormData } from "@/services/VoucherService";

export default function VoucherListPage() {
  const toast = useRef<Toast>(null);
  const menu = useRef<Menu>(null);
  const voucherService = new VoucherService();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    code: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Form state
  const [formData, setFormData] = useState<VoucherFormData>({
    code: "",
    title: "",
    description: "",
    discount_type: "PERCENTAGE",
    discount_value: 0,
    minimum_order_amount: 0,
    maximum_discount_amount: 0,
    usage_limit: 0,
    valid_from: "",
    valid_until: "",
    is_active: true,
  });

  const discountTypes = [
    { label: "Percentage", value: "PERCENTAGE" },
    { label: "Fixed Amount", value: "FIXED_AMOUNT" },
  ];

  const menuItems = [
    {
      label: "Edit",
      icon: "pi pi-pencil",
      command: () => {
        if (selectedVoucher) {
          handleEdit(selectedVoucher);
        }
      },
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: () => {
        if (selectedVoucher) {
          confirmDelete(selectedVoucher);
        }
      },
    },
  ];

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const data = await voucherService.getAllVouchers();
      setVouchers(data || []);
    } catch (error) {
      console.error("Failed to load vouchers:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load vouchers",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      code: "",
      title: "",
      description: "",
      discount_type: "PERCENTAGE",
      discount_value: 0,
      minimum_order_amount: 0,
      maximum_discount_amount: 0,
      usage_limit: 0,
      valid_from: "",
      valid_until: "",
      is_active: true,
    });
    setEditMode(false);
    setShowDialog(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setFormData({
      code: voucher.code,
      title: voucher.title,
      description: voucher.description || "",
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      minimum_order_amount: voucher.minimum_order_amount || 0,
      maximum_discount_amount: voucher.maximum_discount_amount || 0,
      usage_limit: voucher.usage_limit || 0,
      valid_from: voucher.valid_from,
      valid_until: voucher.valid_until,
      is_active: voucher.is_active,
    });
    setEditMode(true);
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editMode && selectedVoucher) {
        await voucherService.updateVoucher(selectedVoucher.id, formData);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Voucher updated successfully",
          life: 3000,
        });
      } else {
        await voucherService.createVoucher(formData);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Voucher created successfully",
          life: 3000,
        });
      }
      setShowDialog(false);
      loadVouchers();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to save voucher",
        life: 3000,
      });
    }
  };

  const confirmDelete = (voucher: Voucher) => {
    confirmDialog({
      message: `Are you sure you want to delete voucher "${voucher.code}"?`,
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDelete(voucher),
    });
  };

  const handleDelete = async (voucher: Voucher) => {
    try {
      await voucherService.deleteVoucher(voucher.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Voucher "${voucher.code}" deleted successfully`,
        life: 3000,
      });
      loadVouchers();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: error.message || "Failed to delete voucher",
        life: 3000,
      });
    }
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters: any = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const clearFilter = () => {
    setGlobalFilterValue("");
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      code: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const toggleMenu = (event: React.MouseEvent, voucher: Voucher) => {
    setSelectedVoucher(voucher);
    menu.current?.toggle(event);
  };

  const statusBodyTemplate = (rowData: Voucher) => {
    return (
      <Tag
        value={rowData.is_active ? "Active" : "Inactive"}
        severity={rowData.is_active ? "success" : "danger"}
      />
    );
  };

  const discountBodyTemplate = (rowData: Voucher) => {
    return rowData.discount_type === "PERCENTAGE"
      ? `${rowData.discount_value}%`
      : `₦${rowData.discount_value.toLocaleString()}`;
  };

  const usageBodyTemplate = (rowData: Voucher) => {
    const usageLimit = rowData.usage_limit || "Unlimited";
    return `${rowData.used_count} / ${usageLimit}`;
  };

  const dateBodyTemplate = (rowData: Voucher, field: string) => {
    const date = rowData[field as keyof Voucher] as string;
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const actionBodyTemplate = (rowData: Voucher) => {
    return (
      <Button
        icon="pi pi-ellipsis-v"
        rounded
        text
        onClick={(e) => toggleMenu(e, rowData)}
      />
    );
  };

  const header = (
    <div className="flex justify-content-between flex-column sm:flex-row">
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          outlined
          onClick={clearFilter}
        />
        <Button
          type="button"
          icon="pi pi-plus"
          label="New Voucher"
          onClick={handleCreate}
        />
      </div>
      <span className="p-input-icon-left mb-2">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Search vouchers..."
          style={{ width: "100%" }}
        />
      </span>
    </div>
  );

  return (
    <div className="grid">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="col-12">
        <div className="card">
          <h5>Voucher Management</h5>
          <DataTable
            value={vouchers}
            paginator
            rows={10}
            dataKey="id"
            filters={filters}
            filterDisplay="menu"
            loading={loading}
            responsiveLayout="scroll"
            globalFilterFields={["code", "title", "description"]}
            header={header}
            emptyMessage="No vouchers found."
            rowHover
          >
            <Column
              field="code"
              header="Code"
              sortable
              filter
              filterPlaceholder="Search by code"
              style={{ minWidth: "12rem" }}
            />
            <Column
              field="title"
              header="Title"
              sortable
              filter
              filterPlaceholder="Search by title"
              style={{ minWidth: "14rem" }}
            />
            <Column
              field="discount_value"
              header="Discount"
              body={discountBodyTemplate}
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="used_count"
              header="Usage"
              body={usageBodyTemplate}
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="valid_from"
              header="Valid From"
              body={(rowData) => dateBodyTemplate(rowData, "valid_from")}
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="valid_until"
              header="Valid Until"
              body={(rowData) => dateBodyTemplate(rowData, "valid_until")}
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="is_active"
              header="Status"
              body={statusBodyTemplate}
              sortable
              style={{ minWidth: "8rem" }}
            />
            <Column
              body={actionBodyTemplate}
              exportable={false}
              style={{ minWidth: "8rem" }}
              header="Action"
            />
          </DataTable>

          <Menu model={menuItems} popup ref={menu} />
        </div>
      </div>

      {/* Voucher Form Dialog */}
      <Dialog
        header={editMode ? "Edit Voucher" : "Create New Voucher"}
        visible={showDialog}
        style={{ width: "600px" }}
        onHide={() => setShowDialog(false)}
        modal
      >
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="code" className="block text-900 font-medium mb-2">
                Voucher Code *
              </label>
              <InputText
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full"
                placeholder="Enter voucher code"
                required
              />
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="title" className="block text-900 font-medium mb-2">
                Title *
              </label>
              <InputText
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full"
                placeholder="Enter voucher title"
                required
              />
            </div>
          </div>

          <div className="col-12">
            <div className="field">
              <label htmlFor="description" className="block text-900 font-medium mb-2">
                Description
              </label>
              <InputText
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full"
                placeholder="Enter voucher description"
              />
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="discountType" className="block text-900 font-medium mb-2">
                Discount Type *
              </label>
              <Dropdown
                id="discountType"
                value={formData.discount_type}
                options={discountTypes}
                onChange={(e) => setFormData({ ...formData, discount_type: e.value })}
                className="w-full"
                placeholder="Select discount type"
              />
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="discountValue" className="block text-900 font-medium mb-2">
                Discount Value *
              </label>
              <InputNumber
                id="discountValue"
                value={formData.discount_value}
                onValueChange={(e) => setFormData({ ...formData, discount_value: e.value || 0 })}
                className="w-full"
                placeholder="Enter discount value"
                min={0}
                max={formData.discount_type === "PERCENTAGE" ? 100 : undefined}
              />
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="validFrom" className="block text-900 font-medium mb-2">
                Valid From *
              </label>
              <Calendar
                id="validFrom"
                value={formData.valid_from ? new Date(formData.valid_from) : null}
                onChange={(e) => setFormData({ ...formData, valid_from: e.value?.toISOString() || "" })}
                className="w-full"
                showIcon
                dateFormat="yy-mm-dd"
              />
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="validUntil" className="block text-900 font-medium mb-2">
                Valid Until *
              </label>
              <Calendar
                id="validUntil"
                value={formData.valid_until ? new Date(formData.valid_until) : null}
                onChange={(e) => setFormData({ ...formData, valid_until: e.value?.toISOString() || "" })}
                className="w-full"
                showIcon
                dateFormat="yy-mm-dd"
              />
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="minOrder" className="block text-900 font-medium mb-2">
                Minimum Order Amount
              </label>
              <InputNumber
                id="minOrder"
                value={formData.minimum_order_amount}
                onValueChange={(e) => setFormData({ ...formData, minimum_order_amount: e.value || 0 })}
                className="w-full"
                placeholder="Enter minimum order amount"
                min={0}
                mode="currency"
                currency="NGN"
              />
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="usageLimit" className="block text-900 font-medium mb-2">
                Usage Limit
              </label>
              <InputNumber
                id="usageLimit"
                value={formData.usage_limit}
                onValueChange={(e) => setFormData({ ...formData, usage_limit: e.value || 0 })}
                className="w-full"
                placeholder="Enter usage limit (0 = unlimited)"
                min={0}
              />
            </div>
          </div>

          <div className="col-12">
            <div className="field-checkbox">
              <Checkbox
                id="isActive"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.checked || false })}
              />
              <label htmlFor="isActive" className="ml-2">
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            label="Cancel"
            icon="pi pi-times"
            outlined
            onClick={() => setShowDialog(false)}
          />
          <Button
            label={editMode ? "Update" : "Create"}
            icon="pi pi-check"
            onClick={handleSave}
          />
        </div>
      </Dialog>
    </div>
  );
}
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
import { FilterMatchMode } from "primereact/api";
import VoucherService, { Voucher } from "@/services/VoucherService";
import VoucherFormDialog from "@/components/vouchers/VoucherFormDialog";

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

  const menuItems = [
    {
      label: "Edit",
      icon: "pi pi-pencil",
      command: () => {
        if (selectedVoucher) {
          setEditMode(true);
          setShowDialog(true);
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
    setSelectedVoucher(null);
    setEditMode(false);
    setShowDialog(true);
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

      <VoucherFormDialog
        visible={showDialog}
        editMode={editMode}
        voucher={selectedVoucher}
        onHide={() => setShowDialog(false)}
        onSave={loadVouchers}
        toast={toast}
      />
    </div>
  );
}
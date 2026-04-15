"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { FilterMatchMode } from "primereact/api";
import { useRef } from "react";
import VendorService, { Vendor } from "@/services/VendorService";

export default function VendorListPage() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const menu = useRef<Menu>(null);
  const vendorService = new VendorService();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    business_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const menuItems = [
    {
      label: "View Details",
      icon: "pi pi-eye",
      command: () => {
        if (selectedVendor) {
          router.push(`/vendor/${selectedVendor.id}`);
        }
      },
    },
    {
      label: "Approve",
      icon: "pi pi-check",
      command: () => {
        if (selectedVendor) {
          handleApprove(selectedVendor);
        }
      },
    },
    {
      label: "Reject",
      icon: "pi pi-times",
      command: () => {
        if (selectedVendor) {
          handleReject(selectedVendor);
        }
      },
    },
    {
      label: "Suspend",
      icon: "pi pi-ban",
      command: () => {
        if (selectedVendor) {
          handleSuspend(selectedVendor);
        }
      },
    },
    {
      separator: true,
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: () => {
        if (selectedVendor) {
          confirmDelete(selectedVendor);
        }
      },
    },
  ];

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getAllVendors();
      setVendors(data || []);
    } catch (error) {
      console.error("Failed to load vendors:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load vendors",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendor: Vendor) => {
    try {
      await vendorService.approveVendor(vendor.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Vendor ${vendor.business_name} approved successfully`,
        life: 3000,
      });
      loadVendors();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to approve vendor",
        life: 3000,
      });
    }
  };

  const handleReject = async (vendor: Vendor) => {
    try {
      await vendorService.rejectVendor(vendor.id, {
        reason: "Does not meet requirements",
      });
      toast.current?.show({
        severity: "info",
        summary: "Rejected",
        detail: `Vendor ${vendor.business_name} rejected`,
        life: 3000,
      });
      loadVendors();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to reject vendor",
        life: 3000,
      });
    }
  };

  const handleSuspend = async (vendor: Vendor) => {
    try {
      await vendorService.suspendVendor(vendor.id, {
        reason: "Suspended by admin",
      });
      toast.current?.show({
        severity: "warn",
        summary: "Suspended",
        detail: `Vendor ${vendor.business_name} suspended`,
        life: 3000,
      });
      loadVendors();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to suspend vendor",
        life: 3000,
      });
    }
  };

  const confirmDelete = (vendor: Vendor) => {
    confirmDialog({
      message: `Are you sure you want to delete ${vendor.business_name}?`,
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDelete(vendor),
    });
  };

  const handleDelete = async (vendor: Vendor) => {
    try {
      await vendorService.deleteVendor(vendor.id);
      toast.current?.show({
        severity: "success",
        summary: "Deleted",
        detail: `Vendor ${vendor.business_name} deleted successfully`,
        life: 3000,
      });
      loadVendors();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete vendor",
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
      business_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      email: { value: null, matchMode: FilterMatchMode.CONTAINS },
      status: { value: null, matchMode: FilterMatchMode.EQUALS },
    });
  };

  const toggleMenu = (event: React.MouseEvent, vendor: Vendor) => {
    setSelectedVendor(vendor);
    menu.current?.toggle(event);
  };

  const statusBodyTemplate = (rowData: Vendor) => {
    const getSeverity = (status: string) => {
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

    return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
  };

  const actionBodyTemplate = (rowData: Vendor) => {
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
      <Button
        type="button"
        icon="pi pi-filter-slash"
        label="Clear"
        outlined
        onClick={clearFilter}
        className="mb-2"
      />
      <span className="p-input-icon-left mb-2">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Search vendors..."
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
          <div className="flex justify-content-between align-items-center mb-4">
            <h5>Vendor Management</h5>
            <Button
              label="Add New Vendor"
              icon="pi pi-plus"
              onClick={() => router.push("/vendor/create")}
            />
          </div>

          <DataTable
            value={vendors}
            paginator
            rows={10}
            dataKey="id"
            filters={filters}
            filterDisplay="menu"
            loading={loading}
            responsiveLayout="scroll"
            globalFilterFields={["business_name", "email", "category", "status"]}
            header={header}
            emptyMessage="No vendors found."
            rowHover
          >
            <Column
              field="business_name"
              header="Business Name"
              sortable
              filter
              filterPlaceholder="Search by name"
              style={{ minWidth: "14rem" }}
            />
            <Column
              field="category"
              header="Category"
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="contact_name"
              header="Contact Person"
              sortable
              style={{ minWidth: "12rem" }}
            />
            <Column
              field="email"
              header="Email"
              sortable
              filter
              filterPlaceholder="Search by email"
              style={{ minWidth: "14rem" }}
            />
            <Column
              field="phone_number"
              header="Phone"
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="status"
              header="Status"
              body={statusBodyTemplate}
              sortable
              filter
              filterPlaceholder="Filter by status"
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="orders_count"
              header="Orders"
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
    </div>
  );
}

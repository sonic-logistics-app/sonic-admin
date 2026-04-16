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
import { Avatar } from "primereact/avatar";
import CustomerService from "@/services/CustomerService";

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone_number: string;
  otp_verified: boolean;
  status: string;
  picture?: string;
  created_at?: string;
}

export default function UserListPage() {
  const toast = useRef<Toast>(null);
  const menu = useRef<Menu>(null);
  const customerService = new CustomerService();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    email: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const menuItems = [
    {
      label: "Verify",
      icon: "pi pi-check",
      command: () => {
        if (selectedCustomer) {
          handleVerify(selectedCustomer);
        }
      },
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: () => {
        if (selectedCustomer) {
          confirmDelete(selectedCustomer);
        }
      },
    },
  ];

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllCustomers();
      const formattedCustomers = data.map((customer: any) => ({
        ...customer,
        name: `${customer.first_name} ${customer.last_name}`,
      }));
      setCustomers(formattedCustomers);
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load customers",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (customer: Customer) => {
    try {
      await customerService.verifyCustomer(customer.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Customer ${customer.name} verified successfully`,
        life: 3000,
      });
      loadCustomers();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to verify customer",
        life: 3000,
      });
    }
  };

  const confirmDelete = (customer: Customer) => {
    confirmDialog({
      message: `Are you sure you want to delete ${customer.name}?`,
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDelete(customer),
    });
  };

  const handleDelete = async (customer: Customer) => {
    try {
      await customerService.deleteCustomer(customer.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Customer ${customer.name} deleted successfully`,
        life: 3000,
      });
      loadCustomers();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: error.message || "Failed to delete customer",
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
      name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const toggleMenu = (event: React.MouseEvent, customer: Customer) => {
    setSelectedCustomer(customer);
    menu.current?.toggle(event);
  };

  const getInitials = (first: string, last: string) => {
    return ((first?.charAt(0) || "") + (last?.charAt(0) || "")).toUpperCase();
  };

  const nameBodyTemplate = (rowData: Customer) => {
    return (
      <div className="flex align-items-center gap-2">
        {rowData.picture ? (
          <Avatar image={rowData.picture} size="normal" shape="circle" />
        ) : (
          <Avatar
            label={getInitials(rowData.first_name, rowData.last_name)}
            size="normal"
            shape="circle"
            style={{ backgroundColor: "#2196F3", color: "#ffffff" }}
          />
        )}
        <span>{rowData.name}</span>
      </div>
    );
  };

  const verifiedBodyTemplate = (rowData: Customer) => {
    return (
      <Tag
        value={rowData.otp_verified ? "Verified" : "Not Verified"}
        severity={rowData.otp_verified ? "success" : "warning"}
      />
    );
  };

  const dateBodyTemplate = (rowData: Customer) => {
    if (!rowData.created_at) return "N/A";
    return new Date(rowData.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const actionBodyTemplate = (rowData: Customer) => {
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
          placeholder="Search customers..."
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
          <h5>Customer Management</h5>
          <DataTable
            value={customers}
            paginator
            rows={10}
            dataKey="id"
            filters={filters}
            filterDisplay="menu"
            loading={loading}
            responsiveLayout="scroll"
            globalFilterFields={["name", "email", "phone_number"]}
            header={header}
            emptyMessage="No customers found."
            rowHover
          >
            <Column
              field="name"
              header="Name"
              body={nameBodyTemplate}
              sortable
              filter
              filterPlaceholder="Search by name"
              style={{ minWidth: "14rem" }}
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
              sortable
              style={{ minWidth: "12rem" }}
            />
            <Column
              field="otp_verified"
              header="Verified"
              body={verifiedBodyTemplate}
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="created_at"
              header="Joined Date"
              body={dateBodyTemplate}
              sortable
              style={{ minWidth: "10rem" }}
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

"use client";

import { useState, useEffect, useRef } from "react";
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
import { Avatar } from "primereact/avatar";
import DriverService from "@/services/DriverService";

interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  birth_date: string;
  dateBirth: string;
  verified: boolean;
  otp_verified: boolean;
  status: string;
  picture?: string;
  public_id?: string;
  verificationProgress?: string;
  verificationStatus?: string;
  imageLoaded: boolean;
}

export default function DriverListPage() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const menu = useRef<Menu>(null);
  const driverService = new DriverService();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const menuItems = [
    {
      label: "Verify",
      icon: "pi pi-check",
      command: () => {
        if (selectedDriver) {
          router.push(`/driver/${selectedDriver.id}`);
        }
      },
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: () => {
        if (selectedDriver) {
          confirmDelete(selectedDriver);
        }
      },
    },
  ];

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await driverService.getAllDrivers();
      const formattedDrivers = data.map((driver: any) => ({
        ...driver,
        name: `${driver.first_name} ${driver.last_name}`,
        dateBirth: driver.birth_date || new Date().toISOString().split("T")[0],
        email: driver.email,
        verified: driver.otp_verified,
        status: driver.status?.toLowerCase(),
        picture: driver.picture,
        public_id: driver.public_id,
        verificationProgress: driver.verificationProgress,
        verificationStatus: driver.verificationStatus,
        imageLoaded: !!driver.picture,
      }));
      setDrivers(formattedDrivers);
    } catch (error) {
      console.error("Failed to load drivers:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load drivers",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (driver: Driver) => {
    confirmDialog({
      message: `Are you sure you want to delete ${driver.name}?`,
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDelete(driver),
    });
  };

  const handleDelete = async (driver: Driver) => {
    try {
      await driverService.deleteDriver(driver.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Driver ${driver.name} deleted successfully`,
        life: 3000,
      });
      loadDrivers();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: error.message || "Failed to delete driver",
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
      status: { value: null, matchMode: FilterMatchMode.EQUALS },
    });
  };

  const toggleMenu = (event: React.MouseEvent, driver: Driver) => {
    setSelectedDriver(driver);
    menu.current?.toggle(event);
  };

  const formatDate = (value: string) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getInitials = (first: string, last: string) => {
    return ((first?.charAt(0) || "") + (last?.charAt(0) || "")).toUpperCase();
  };

  const nameBodyTemplate = (rowData: Driver) => {
    return (
      <div className="flex align-items-center gap-2">
        {rowData.imageLoaded && rowData.picture ? (
          <Avatar
            image={rowData.picture}
            size="normal"
            shape="circle"
            onError={() => {
              const updatedDrivers = drivers.map((d) =>
                d.id === rowData.id ? { ...d, imageLoaded: false } : d
              );
              setDrivers(updatedDrivers);
            }}
          />
        ) : (
          <Avatar
            label={getInitials(rowData.first_name, rowData.last_name)}
            size="normal"
            shape="circle"
            style={{ backgroundColor: "#9c27b0", color: "#ffffff" }}
          />
        )}
        <span>{rowData.name}</span>
      </div>
    );
  };

  const verifiedBodyTemplate = (rowData: Driver) => {
    return (
      <Tag
        value={rowData.verified ? "Verified" : "Not Verified"}
        severity={rowData.verified ? "success" : "warning"}
      />
    );
  };

  const actionBodyTemplate = (rowData: Driver) => {
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
          placeholder="Search drivers..."
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
          <h5>Driver Management</h5>
          <DataTable
            value={drivers}
            paginator
            rows={10}
            dataKey="id"
            filters={filters}
            filterDisplay="menu"
            loading={loading}
            responsiveLayout="scroll"
            globalFilterFields={["name", "email", "status"]}
            header={header}
            emptyMessage="No drivers found."
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
              field="dateBirth"
              header="Date of Birth"
              body={(rowData) => formatDate(rowData.dateBirth)}
              sortable
              style={{ minWidth: "12rem" }}
            />
            <Column
              field="email"
              header="Email"
              sortable
              filter
              filterPlaceholder="Search by email"
              style={{ minWidth: "12rem" }}
            />
            <Column
              field="verificationProgress"
              header="Verification Progress"
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="verified"
              header="Verified"
              body={verifiedBodyTemplate}
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

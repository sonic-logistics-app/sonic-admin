"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { FilterMatchMode } from "primereact/api";
import OrderService from "@/services/OrderService";

interface Order {
  id: number;
  order_id: string;
  order_status: string;
  price_fees: number;
  package?: {
    delivery_type?: string;
  };
  user?: {
    first_name?: string;
    last_name?: string;
  };
  driver?: {
    first_name?: string;
    last_name?: string;
  };
  created_at?: string;
}

export default function OrderListPage() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const orderService = new OrderService();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    order_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    order_status: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load orders",
        life: 3000,
      });
    } finally {
      setLoading(false);
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
      order_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
      order_status: { value: null, matchMode: FilterMatchMode.EQUALS },
    });
  };

  const formatCurrency = (value: number) => {
    if (typeof value !== "number") return "";
    const price = value
      .toLocaleString("en-NG", { style: "currency", currency: "NGN" })
      .split("");
    price.splice(1, 0, " ");
    return price.join("");
  };

  const getSeverity = (status: string): "success" | "info" | "warning" | "danger" | undefined => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "CONFIRMED":
        return "info";
      case "IN_TRANSIT":
        return "info";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "danger";
      case "IN_PAYMENT":
        return "info";
      case "PICKUP":
        return "warning";
      default:
        return undefined;
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return "pi pi-exclamation-triangle";
      case "CONFIRMED":
        return "pi pi-info-circle";
      case "IN_TRANSIT":
        return "pi pi-spinner";
      case "DELIVERED":
        return "pi pi-check";
      case "CANCELLED":
        return "pi pi-times";
      case "IN_PAYMENT":
        return "pi pi-credit-card";
      case "PICKUP":
        return "pi pi-box";
      default:
        return "pi pi-info-circle";
    }
  };

  const statusBodyTemplate = (rowData: Order) => {
    return (
      <Tag
        value={rowData.order_status}
        severity={getSeverity(rowData.order_status)}
        icon={getIcon(rowData.order_status)}
      />
    );
  };

  const priceBodyTemplate = (rowData: Order) => {
    return formatCurrency(rowData.price_fees);
  };

  const customerBodyTemplate = (rowData: Order) => {
    const firstName = rowData.user?.first_name || "";
    const lastName = rowData.user?.last_name || "";
    return `${firstName} ${lastName}`.trim() || "N/A";
  };

  const driverBodyTemplate = (rowData: Order) => {
    const firstName = rowData.driver?.first_name || "";
    const lastName = rowData.driver?.last_name || "";
    return `${firstName} ${lastName}`.trim() || "N/A";
  };

  const packageBodyTemplate = (rowData: Order) => {
    return rowData.package?.delivery_type || "N/A";
  };

  const dateBodyTemplate = (rowData: Order) => {
    if (!rowData.created_at) return "N/A";
    return new Date(rowData.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const onRowClick = (event: any) => {
    router.push(`/order/${event.data.id}`);
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
          placeholder="Search orders..."
          style={{ width: "100%" }}
        />
      </span>
    </div>
  );

  return (
    <div className="grid">
      <Toast ref={toast} />

      <div className="col-12">
        <div className="card">
          <h5>Order Management</h5>
          <DataTable
            value={orders}
            paginator
            rows={10}
            dataKey="id"
            filters={filters}
            filterDisplay="menu"
            loading={loading}
            responsiveLayout="scroll"
            globalFilterFields={["order_id", "order_status"]}
            header={header}
            emptyMessage="No orders found."
            rowHover
            onRowClick={onRowClick}
            className="cursor-pointer"
          >
            <Column
              field="order_id"
              header="Order ID"
              sortable
              filter
              filterPlaceholder="Search by ID"
              style={{ minWidth: "12rem" }}
            />
            <Column
              field="customer"
              header="Customer"
              body={customerBodyTemplate}
              style={{ minWidth: "12rem" }}
            />
            <Column
              field="driver"
              header="Driver"
              body={driverBodyTemplate}
              style={{ minWidth: "12rem" }}
            />
            <Column
              field="price_fees"
              header="Total Payment"
              body={priceBodyTemplate}
              sortable
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="order_status"
              header="Status"
              body={statusBodyTemplate}
              sortable
              filter
              filterPlaceholder="Filter by status"
              style={{ minWidth: "12rem" }}
            />
            <Column
              field="package"
              header="Package Type"
              body={packageBodyTemplate}
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="created_at"
              header="Date"
              body={dateBodyTemplate}
              sortable
              style={{ minWidth: "10rem" }}
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
}

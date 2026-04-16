"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";

interface RecentOrder {
  id: number;
  order_id: string;
  status: string;
  total_payment: number;
  package_category: string;
  fullname_customer: string;
  fullname_driver: string;
}

interface RecentOrdersProps {
  orders: RecentOrder[];
  loading: boolean;
  onRowClick: (event: any) => void;
}

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

export default function RecentOrders({ orders, loading, onRowClick }: RecentOrdersProps) {
  return (
    <div className="card">
      <h5>Recent Orders</h5>
      <DataTable
        value={orders}
        rows={5}
        paginator
        responsiveLayout="scroll"
        loading={loading}
        rowHover
        dataKey="id"
        onRowClick={onRowClick}
        className="cursor-pointer"
      >
        <Column field="fullname_customer" header="Customer" style={{ width: "25%" }} />
        <Column field="fullname_driver" header="Driver" style={{ width: "25%" }} />
        <Column
          field="total_payment"
          header="Total Payment"
          body={(rowData) => formatCurrency(rowData.total_payment)}
          style={{ width: "20%" }}
        />
        <Column
          field="status"
          header="Status"
          body={(rowData) => (
            <Tag
              value={rowData.status}
              severity={getSeverity(rowData.status)}
              icon={getIcon(rowData.status)}
            />
          )}
          style={{ width: "15%" }}
        />
        <Column
          field="package_category"
          header="Package Category"
          style={{ width: "15%" }}
        />
      </DataTable>
    </div>
  );
}

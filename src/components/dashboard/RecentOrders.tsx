"use client";

import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonLoader from "@/components/shared/SkeletonLoader";

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

export default function RecentOrders({ orders, loading, onRowClick }: RecentOrdersProps) {
  const columns = [
    {
      field: "fullname_customer",
      header: "Customer",
      width: "25%",
    },
    {
      field: "fullname_driver",
      header: "Driver",
      width: "25%",
    },
    {
      field: "total_payment",
      header: "Total Payment",
      width: "20%",
      body: (rowData: RecentOrder) => formatCurrency(rowData.total_payment),
    },
    {
      field: "status",
      header: "Status",
      width: "15%",
      body: (rowData: RecentOrder) => <StatusBadge status={rowData.status} />,
    },
    {
      field: "package_category",
      header: "Package Category",
      width: "15%",
    },
  ];

  return (
    <div className="mb-6 w-full">
      <h2 className="text-[18px] font-semibold text-[#111827] mb-4">Recent Orders</h2>
      {loading ? (
        <SkeletonLoader type="table" rows={5} />
      ) : (
        <DataTable
          data={orders.slice(0, 5)}
          columns={columns}
          loading={false}
          onRowClick={(rowData) => onRowClick({ data: rowData })}
          emptyMessage="No recent orders"
          className="w-full"
        />
      )}
    </div>
  );
}

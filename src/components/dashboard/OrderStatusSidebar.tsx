"use client";

interface OrderStatus {
  status: string;
  total: number;
}

interface OrderStatusSidebarProps {
  ordersByStatus: OrderStatus[];
  loading: boolean;
  error: string;
}

const statusConfig: Record<string, any> = {
  PENDING: {
    label: "Pending",
    icon: "pi pi-clock",
    bgColor: "bg-[#FEF3C7]",
    borderColor: "border-[#F59E0B]",
    textColor: "text-[#D97706]",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: "pi pi-check",
    bgColor: "bg-[#D1FAE5]",
    borderColor: "border-[#10B981]",
    textColor: "text-[#059669]",
  },
  IN_TRANSIT: {
    label: "In Transit",
    icon: "pi pi-truck",
    bgColor: "bg-[#DBEAFE]",
    borderColor: "border-[#3B82F6]",
    textColor: "text-[#2563EB]",
  },
  PICKUP: {
    label: "Ready for Pickup",
    icon: "pi pi-box",
    bgColor: "bg-[#EDE9FE]",
    borderColor: "border-[#8B5CF6]",
    textColor: "text-[#7C3AED]",
  },
  DELIVERED: {
    label: "Delivered",
    icon: "pi pi-check",
    bgColor: "bg-[#D1FAE5]",
    borderColor: "border-[#10B981]",
    textColor: "text-[#059669]",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: "pi pi-times",
    bgColor: "bg-[#FEE2E2]",
    borderColor: "border-[#EF4444]",
    textColor: "text-[#DC2626]",
  },
  IN_PAYMENT: {
    label: "In Payment",
    icon: "pi pi-credit-card",
    bgColor: "bg-[#E0E7FF]",
    borderColor: "border-[#6366F1]",
    textColor: "text-[#4F46E5]",
  },
};

export default function OrderStatusSidebar({ ordersByStatus, loading, error }: OrderStatusSidebarProps) {
  return (
    <div className="col-12 xl:col-4">
      <div className="card">
        <h2 className="text-[18px] font-semibold text-[#111827] mb-4">Order Status</h2>
        
        {loading ? (
          <div className="text-center py-4">
            <i className="pi pi-spinner pi-spin text-2xl" />
            <p className="mt-2">Loading order status...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <i className="pi pi-exclamation-triangle text-red-500 text-2xl" />
            <p className="mt-2 text-red-500">{error}</p>
          </div>
        ) : (
          <ul className="list-none p-0 m-0">
            {ordersByStatus.map((statusItem) => {
              const config = statusConfig[statusItem.status];
              return (
                <li
                  key={statusItem.status}
                  className={`flex flex-col md:flex-row md:items-center md:justify-between py-3 px-4 border-l-4 rounded-2xl mb-3 ${
                    config?.bgColor || "bg-gray-100"
                  } ${config?.borderColor || "border-gray-500"}`}
                >
                  <div>
                    <span className="text-[#525866] font-medium mr-2 mb-1 md:mb-0">
                      {config?.label || statusItem.status}
                    </span>
                    <div className="mt-1 text-[24px] font-bold text-[#111827]">
                      {statusItem.total}
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center">
                    <span
                      className={`ml-3 font-medium ${
                        config?.textColor || "text-gray-500"
                      }`}
                    >
                      <i
                        className={config?.icon || "pi pi-info-circle"}
                        style={{ fontSize: "1.5rem" }}
                      />
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

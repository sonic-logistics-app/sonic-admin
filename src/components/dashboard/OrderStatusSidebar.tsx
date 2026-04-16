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
    bgColor: "bg-yellow-100",
    borderColor: "border-orange-500",
    textColor: "text-orange-500",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: "pi pi-check",
    bgColor: "bg-green-100",
    borderColor: "border-green-500",
    textColor: "text-green-500",
  },
  IN_TRANSIT: {
    label: "In Transit",
    icon: "pi pi-truck",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-500",
    textColor: "text-blue-500",
  },
  PICKUP: {
    label: "Ready for Pickup",
    icon: "pi pi-box",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-500",
    textColor: "text-purple-500",
  },
  DELIVERED: {
    label: "Delivered",
    icon: "pi pi-check",
    bgColor: "bg-green-100",
    borderColor: "border-green-500",
    textColor: "text-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: "pi pi-times",
    bgColor: "bg-red-100",
    borderColor: "border-red-500",
    textColor: "text-red-500",
  },
  IN_PAYMENT: {
    label: "In Payment",
    icon: "pi pi-credit-card",
    bgColor: "bg-indigo-100",
    borderColor: "border-indigo-500",
    textColor: "text-indigo-500",
  },
};

export default function OrderStatusSidebar({ ordersByStatus, loading, error }: OrderStatusSidebarProps) {
  return (
    <div className="col-12 xl:col-4">
      <div className="card">
        <div className="flex justify-content-between align-items-center mb-2">
          <h5>Order Status</h5>
        </div>

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
                  className={`flex flex-column py-3 px-4 border-left-3 border-round-lg md:flex-row md:align-items-center md:justify-content-between mb-3 ${
                    config?.bgColor || "bg-gray-100"
                  } ${config?.borderColor || "border-gray-500"}`}
                >
                  <div>
                    <span className="text-700 font-regular mr-2 mb-1 md:mb-0">
                      {config?.label || statusItem.status}
                    </span>
                    <div className="mt-1 text-2xl font-semibold">
                      {statusItem.total}
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0 flex align-items-center">
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

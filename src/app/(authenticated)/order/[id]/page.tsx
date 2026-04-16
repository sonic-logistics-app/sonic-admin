"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Timeline } from "primereact/timeline";
import OrderService from "@/services/OrderService";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const orderService = new OrderService();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderDetails(Number(params.id));
      setOrder(data);
    } catch (error) {
      console.error("Failed to load order:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load order details",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateOrderCode = async () => {
    try {
      setGeneratingCode(true);
      await orderService.generateOrderCode(Number(params.id));
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Order verification code generated successfully",
        life: 3000,
      });
      // Reload order to get updated data
      loadOrder();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to generate order code",
        life: 3000,
      });
    } finally {
      setGeneratingCode(false);
    }
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

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: "3rem" }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="card">
        <h5>Order not found</h5>
        <Button label="Back to List" icon="pi pi-arrow-left" onClick={() => router.push("/order")} />
      </div>
    );
  }

  const timelineEvents = [
    { status: "Order Placed", date: order.created_at, icon: "pi pi-shopping-cart" },
    { status: "Confirmed", date: order.confirmed_at, icon: "pi pi-check" },
    { status: "In Transit", date: order.in_transit_at, icon: "pi pi-truck" },
    { status: "Delivered", date: order.delivered_at, icon: "pi pi-check-circle" },
  ].filter((event) => event.date);

  return (
    <div className="grid">
      <Toast ref={toast} />

      <div className="col-12">
        <Card>
          <div className="flex justify-content-between align-items-center mb-4">
            <div className="flex align-items-center gap-3">
              <Button
                icon="pi pi-arrow-left"
                rounded
                text
                onClick={() => router.push("/order")}
              />
              <div>
                <h5 className="m-0">Order #{order.order_id}</h5>
                <Tag
                  value={order.order_status}
                  severity={getSeverity(order.order_status)}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                label="Generate Code"
                icon="pi pi-qrcode"
                onClick={generateOrderCode}
                loading={generatingCode}
                disabled={order.order_status === "DELIVERED" || order.order_status === "CANCELLED"}
              />
            </div>
          </div>

          <Divider />

          <div className="grid">
            <div className="col-12 md:col-6">
              <Card title="Customer Information" className="h-full">
                <div className="field">
                  <label className="font-semibold">Name</label>
                  <p>
                    {order.user?.first_name} {order.user?.last_name}
                  </p>
                </div>
                <div className="field">
                  <label className="font-semibold">Email</label>
                  <p>{order.user?.email || "N/A"}</p>
                </div>
                <div className="field">
                  <label className="font-semibold">Phone</label>
                  <p>{order.user?.phone_number || "N/A"}</p>
                </div>
              </Card>
            </div>

            <div className="col-12 md:col-6">
              <Card title="Driver Information" className="h-full">
                <div className="field">
                  <label className="font-semibold">Name</label>
                  <p>
                    {order.driver?.first_name} {order.driver?.last_name}
                  </p>
                </div>
                <div className="field">
                  <label className="font-semibold">Email</label>
                  <p>{order.driver?.email || "N/A"}</p>
                </div>
                <div className="field">
                  <label className="font-semibold">Phone</label>
                  <p>{order.driver?.phone_number || "N/A"}</p>
                </div>
              </Card>
            </div>

            <div className="col-12">
              <Card title="Package Details">
                <div className="grid">
                  <div className="col-12 md:col-4">
                    <label className="font-semibold">Delivery Type</label>
                    <p>{order.package?.delivery_type || "N/A"}</p>
                  </div>
                  <div className="col-12 md:col-4">
                    <label className="font-semibold">Weight</label>
                    <p>{order.package?.weight || "N/A"}</p>
                  </div>
                  <div className="col-12 md:col-4">
                    <label className="font-semibold">Dimensions</label>
                    <p>{order.package?.dimensions || "N/A"}</p>
                  </div>
                  <div className="col-12">
                    <label className="font-semibold">Description</label>
                    <p>{order.package?.description || "N/A"}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="col-12 md:col-6">
              <Card title="Pickup Location">
                <p>{order.pickup_address || "N/A"}</p>
              </Card>
            </div>

            <div className="col-12 md:col-6">
              <Card title="Delivery Location">
                <p>{order.delivery_address || "N/A"}</p>
              </Card>
            </div>

            <div className="col-12 md:col-6">
              <Card title="Payment Information">
                <div className="field">
                  <label className="font-semibold">Total Amount</label>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(order.price_fees)}
                  </p>
                </div>
                <div className="field">
                  <label className="font-semibold">Payment Method</label>
                  <p>{order.payment_method || "N/A"}</p>
                </div>
                <div className="field">
                  <label className="font-semibold">Payment Status</label>
                  <Tag
                    value={order.payment_status || "Pending"}
                    severity={order.payment_status === "PAID" ? "success" : "warning"}
                  />
                </div>
              </Card>
            </div>

            <div className="col-12 md:col-6">
              <Card title="Order Timeline">
                {timelineEvents.length > 0 ? (
                  <Timeline
                    value={timelineEvents}
                    content={(item) => (
                      <div>
                        <p className="font-semibold">{item.status}</p>
                        <p className="text-sm text-500">
                          {new Date(item.date).toLocaleString()}
                        </p>
                      </div>
                    )}
                    marker={(item) => (
                      <span
                        className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1"
                        style={{ backgroundColor: "var(--primary-color)" }}
                      >
                        <i className={item.icon} />
                      </span>
                    )}
                  />
                ) : (
                  <p>No timeline data available</p>
                )}
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Avatar } from "primereact/avatar";
import { InputTextarea } from "primereact/inputtextarea";
import { Dialog } from "primereact/dialog";
import DriverService from "@/services/DriverService";

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const driverService = new DriverService();

  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifyDialogVisible, setVerifyDialogVisible] = useState(false);
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (params.id) {
      loadDriver();
    }
  }, [params.id]);

  const loadDriver = async () => {
    try {
      setLoading(true);
      const data = await driverService.getDriverById(params.id as string);
      setDriver(data.driver || data);
    } catch (error) {
      console.error("Failed to load driver:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load driver details",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      await driverService.verifyDriver(driver.id, {
        verification_status: "approved",
      });
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Driver verified successfully",
        life: 3000,
      });
      setVerifyDialogVisible(false);
      loadDriver();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to verify driver",
        life: 3000,
      });
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Please provide a rejection reason",
        life: 3000,
      });
      return;
    }

    try {
      await driverService.rejectDriver(driver.id, {
        rejection_reason: rejectionReason,
      });
      toast.current?.show({
        severity: "info",
        summary: "Rejected",
        detail: "Driver rejected",
        life: 3000,
      });
      setRejectDialogVisible(false);
      setRejectionReason("");
      loadDriver();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to reject driver",
        life: 3000,
      });
    }
  };

  const getInitials = (first: string, last: string) => {
    return ((first?.charAt(0) || "") + (last?.charAt(0) || "")).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: "3rem" }} />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="card">
        <h5>Driver not found</h5>
        <Button label="Back to List" icon="pi pi-arrow-left" onClick={() => router.push("/driver")} />
      </div>
    );
  }

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
                onClick={() => router.push("/driver")}
              />
              <div className="flex align-items-center gap-3">
                {driver.picture ? (
                  <Avatar image={driver.picture} size="xlarge" shape="circle" />
                ) : (
                  <Avatar
                    label={getInitials(driver.first_name, driver.last_name)}
                    size="xlarge"
                    shape="circle"
                    style={{ backgroundColor: "#9c27b0", color: "#ffffff" }}
                  />
                )}
                <div>
                  <h5 className="m-0">
                    {driver.first_name} {driver.last_name}
                  </h5>
                  <Tag
                    value={driver.otp_verified ? "Verified" : "Not Verified"}
                    severity={driver.otp_verified ? "success" : "warning"}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                label="Verify Driver"
                icon="pi pi-check"
                severity="success"
                onClick={() => setVerifyDialogVisible(true)}
                disabled={driver.otp_verified}
              />
              <Button
                label="Reject"
                icon="pi pi-times"
                severity="danger"
                onClick={() => setRejectDialogVisible(true)}
              />
            </div>
          </div>

          <Divider />

          <div className="grid">
            <div className="col-12 md:col-6">
              <h6 className="text-500 mb-2">Email</h6>
              <p className="mt-0 mb-4">{driver.email || "N/A"}</p>
            </div>

            <div className="col-12 md:col-6">
              <h6 className="text-500 mb-2">Phone Number</h6>
              <p className="mt-0 mb-4">{driver.phone_number || "N/A"}</p>
            </div>

            <div className="col-12 md:col-6">
              <h6 className="text-500 mb-2">Date of Birth</h6>
              <p className="mt-0 mb-4">
                {driver.birth_date
                  ? new Date(driver.birth_date).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            <div className="col-12 md:col-6">
              <h6 className="text-500 mb-2">Status</h6>
              <p className="mt-0 mb-4">{driver.status || "N/A"}</p>
            </div>

            <div className="col-12 md:col-6">
              <h6 className="text-500 mb-2">Verification Progress</h6>
              <p className="mt-0 mb-4">{driver.verificationProgress || "Not Started"}</p>
            </div>

            <div className="col-12 md:col-6">
              <h6 className="text-500 mb-2">Public ID</h6>
              <p className="mt-0 mb-4">{driver.public_id || "N/A"}</p>
            </div>

            {driver.address && (
              <div className="col-12">
                <h6 className="text-500 mb-2">Address</h6>
                <p className="mt-0 mb-4">{driver.address}</p>
              </div>
            )}
          </div>

          <Divider />

          <div className="grid">
            <div className="col-12 md:col-4">
              <Card title="Total Deliveries" className="text-center">
                <h2 className="m-0">{driver.total_deliveries || 0}</h2>
              </Card>
            </div>
            <div className="col-12 md:col-4">
              <Card title="Rating" className="text-center">
                <h2 className="m-0">
                  {driver.rating ? `${driver.rating} ⭐` : "N/A"}
                </h2>
              </Card>
            </div>
            <div className="col-12 md:col-4">
              <Card title="Earnings" className="text-center">
                <h2 className="m-0">₦ {driver.total_earnings || 0}</h2>
              </Card>
            </div>
          </div>
        </Card>
      </div>

      {/* Verify Dialog */}
      <Dialog
        header="Verify Driver"
        visible={verifyDialogVisible}
        style={{ width: "450px" }}
        onHide={() => setVerifyDialogVisible(false)}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              outlined
              onClick={() => setVerifyDialogVisible(false)}
            />
            <Button
              label="Verify"
              icon="pi pi-check"
              severity="success"
              onClick={handleVerify}
            />
          </div>
        }
      >
        <p>
          Are you sure you want to verify{" "}
          <strong>
            {driver.first_name} {driver.last_name}
          </strong>
          ?
        </p>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        header="Reject Driver"
        visible={rejectDialogVisible}
        style={{ width: "450px" }}
        onHide={() => {
          setRejectDialogVisible(false);
          setRejectionReason("");
        }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              outlined
              onClick={() => {
                setRejectDialogVisible(false);
                setRejectionReason("");
              }}
            />
            <Button
              label="Reject"
              icon="pi pi-times"
              severity="danger"
              onClick={handleReject}
            />
          </div>
        }
      >
        <div className="field">
          <label htmlFor="rejection_reason" className="font-semibold">
            Rejection Reason
          </label>
          <InputTextarea
            id="rejection_reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            className="w-full"
            placeholder="Enter reason for rejection..."
          />
        </div>
      </Dialog>
    </div>
  );
}

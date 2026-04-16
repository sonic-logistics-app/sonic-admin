"use client";

import { useState } from "react";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { useAuthStore } from "@/stores/authStore";

interface ChangePasswordDialogProps {
  visible: boolean;
  onHide: () => void;
  toast: React.RefObject<Toast | null>;
}

export default function ChangePasswordDialog({
  visible,
  onHide,
  toast,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { changePassword, isLoading } = useAuthStore();

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleHide = () => {
    resetForm();
    onHide();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please fill in all password fields",
        life: 3000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "New passwords do not match",
        life: 3000,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Password must be at least 6 characters",
        life: 3000,
      });
      return;
    }

    const result = await changePassword({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_new_password: confirmPassword,
    });

    if (result.success) {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Password changed successfully",
        life: 3000,
      });
      handleHide();
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Password Change Failed",
        detail: result.message,
        life: 3000,
      });
    }
  };

  return (
    <Dialog
      header="Change Password"
      visible={visible}
      style={{ width: "450px" }}
      onHide={handleHide}
      modal
    >
      <form onSubmit={handleChangePassword}>
        <div className="field">
          <label htmlFor="currentPassword" className="block text-900 font-medium mb-2">
            Current Password *
          </label>
          <Password
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full"
            inputClassName="w-full"
            placeholder="Enter current password"
            feedback={false}
            toggleMask
            required
          />
        </div>

        <div className="field">
          <label htmlFor="newPassword" className="block text-900 font-medium mb-2">
            New Password *
          </label>
          <Password
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full"
            inputClassName="w-full"
            placeholder="Enter new password"
            toggleMask
            required
          />
        </div>

        <div className="field">
          <label htmlFor="confirmPassword" className="block text-900 font-medium mb-2">
            Confirm New Password *
          </label>
          <Password
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full"
            inputClassName="w-full"
            placeholder="Confirm new password"
            feedback={false}
            toggleMask
            required
          />
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            label="Cancel"
            icon="pi pi-times"
            outlined
            onClick={handleHide}
            type="button"
          />
          <Button
            label="Change Password"
            icon="pi pi-check"
            type="submit"
            loading={isLoading}
          />
        </div>
      </form>
    </Dialog>
  );
}

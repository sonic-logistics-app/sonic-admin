"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { Dialog } from "primereact/dialog";
import { useAuthStore } from "@/stores/authStore";

export default function ProfilePage() {
  const toast = useRef<Toast>(null);
  const { user, updateProfile, changePassword, isLoading } = useAuthStore();

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Password form state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please fill in all fields",
        life: 3000,
      });
      return;
    }

    const result = await updateProfile({
      first_name: firstName,
      last_name: lastName,
      email: email,
    });

    if (result.success) {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Profile updated successfully",
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Update Failed",
        detail: result.message,
        life: 3000,
      });
    }
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
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
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
    <div className="grid">
      <Toast ref={toast} />

      <div className="col-12">
        <Card>
          <div className="flex align-items-center justify-content-between mb-4">
            <h5 className="m-0">Profile Settings</h5>
          </div>

          <Divider />

          {/* Profile Information */}
          <div className="mb-5">
            <h6 className="text-900 mb-3">Personal Information</h6>
            <form onSubmit={handleUpdateProfile}>
              <div className="grid">
                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="firstName" className="block text-900 font-medium mb-2">
                      First Name *
                    </label>
                    <InputText
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="lastName" className="block text-900 font-medium mb-2">
                      Last Name *
                    </label>
                    <InputText
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="field">
                    <label htmlFor="email" className="block text-900 font-medium mb-2">
                      Email Address *
                    </label>
                    <InputText
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div className="col-12">
                  <Button
                    label="Update Profile"
                    icon="pi pi-save"
                    type="submit"
                    loading={isLoading}
                  />
                </div>
              </div>
            </form>
          </div>

          <Divider />

          {/* Security Settings */}
          <div className="mt-5">
            <h6 className="text-900 mb-3">Security Settings</h6>
            <div className="flex align-items-center justify-content-between p-3 bg-gray-50 border-round">
              <div>
                <div className="text-900 font-medium mb-1">Password</div>
                <div className="text-600 text-sm">
                  Change your password to keep your account secure
                </div>
              </div>
              <Button
                label="Change Password"
                icon="pi pi-lock"
                outlined
                onClick={() => setShowPasswordDialog(true)}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog
        header="Change Password"
        visible={showPasswordDialog}
        style={{ width: "450px" }}
        onHide={() => {
          setShowPasswordDialog(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }}
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
              onClick={() => {
                setShowPasswordDialog(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
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
    </div>
  );
}

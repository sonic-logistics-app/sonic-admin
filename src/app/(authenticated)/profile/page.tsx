"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { useAuthStore } from "@/stores/authStore";
import ChangePasswordDialog from "@/components/profile/ChangePasswordDialog";

export default function ProfilePage() {
  const toast = useRef<Toast>(null);
  const { user, updateProfile, isLoading } = useAuthStore();

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

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

      <ChangePasswordDialog
        visible={showPasswordDialog}
        onHide={() => setShowPasswordDialog(false)}
        toast={toast}
      />
    </div>
  );
}

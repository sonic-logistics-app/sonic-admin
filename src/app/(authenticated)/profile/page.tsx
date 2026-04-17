"use client";

import { useState, useEffect, useRef } from "react";
import ProfileService, { AdminProfile } from "@/services/ProfileService";
import Toast, { ToastRef } from "@/components/shared/Toast";
import Button from "@/components/shared/Button";

export default function ProfilePage() {
  const toast = useRef<ToastRef>(null);
  const profileService = new ProfileService();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profileFormData, setProfileFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
  });

  const [passwordFormData, setPasswordFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setProfileFormData({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      });
    } catch (error) {
      console.error("❌ Failed to load profile:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load profile",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!profileFormData.email.trim() || !profileFormData.first_name.trim() || !profileFormData.last_name.trim()) {
        toast.current?.show({
          severity: "error",
          summary: "Validation Error",
          detail: "All fields are required",
          life: 3000,
        });
        return;
      }

      setSavingProfile(true);
      const updated = await profileService.updateProfile(profileFormData);
      setProfile(updated);
      setIsEditingProfile(false);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Profile updated successfully",
        life: 3000,
      });
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to update profile",
        life: 3000,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!passwordFormData.current_password.trim() || !passwordFormData.new_password.trim() || !passwordFormData.confirm_new_password.trim()) {
        toast.current?.show({
          severity: "error",
          summary: "Validation Error",
          detail: "All password fields are required",
          life: 3000,
        });
        return;
      }

      if (passwordFormData.new_password !== passwordFormData.confirm_new_password) {
        toast.current?.show({
          severity: "error",
          summary: "Validation Error",
          detail: "New passwords do not match",
          life: 3000,
        });
        return;
      }

      if (passwordFormData.new_password.length < 6) {
        toast.current?.show({
          severity: "error",
          summary: "Validation Error",
          detail: "New password must be at least 6 characters",
          life: 3000,
        });
        return;
      }

      setSavingPassword(true);
      await profileService.changePassword(passwordFormData);
      setPasswordFormData({
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      });
      setIsChangingPassword(false);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Password changed successfully",
        life: 3000,
      });
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to change password",
        life: 3000,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-[#525866]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-[#525866]">Profile not found</p>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-[24px] font-bold text-[#111827]">Admin Profile</h1>
          <p className="text-[13px] text-[#525866] mt-1">Manage your account settings</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-semibold text-[#111827]">Profile Information</h2>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8]"
              >
                <i className="pi pi-pencil mr-2" />
                Edit
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={profileFormData.email}
                  onChange={(e) =>
                    setProfileFormData({ ...profileFormData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* First Name */}
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={profileFormData.first_name}
                  onChange={(e) =>
                    setProfileFormData({ ...profileFormData, first_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={profileFormData.last_name}
                  onChange={(e) =>
                    setProfileFormData({ ...profileFormData, last_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E1E4EA]">
                <button
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileFormData({
                      email: profile.email,
                      first_name: profile.first_name,
                      last_name: profile.last_name,
                    });
                  }}
                  className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <p className="text-[13px] text-[#111827]">{profile.email}</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <p className="text-[13px] text-[#111827]">
                  {profile.first_name} {profile.last_name}
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Account ID
                </label>
                <p className="text-[13px] font-mono text-[#525866]">{profile.id}</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Member Since
                </label>
                <p className="text-[13px] text-[#111827]">{formatDate(profile.created_at)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-semibold text-[#111827]">Security</h2>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8]"
              >
                <i className="pi pi-lock mr-2" />
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Current Password *
                </label>
                <input
                  type="password"
                  value={passwordFormData.current_password}
                  onChange={(e) =>
                    setPasswordFormData({ ...passwordFormData, current_password: e.target.value })
                  }
                  placeholder="Enter your current password"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  value={passwordFormData.new_password}
                  onChange={(e) =>
                    setPasswordFormData({ ...passwordFormData, new_password: e.target.value })
                  }
                  placeholder="Enter your new password"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
                <p className="text-[11px] text-[#525866] mt-1">Minimum 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={passwordFormData.confirm_new_password}
                  onChange={(e) =>
                    setPasswordFormData({ ...passwordFormData, confirm_new_password: e.target.value })
                  }
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E1E4EA]">
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordFormData({
                      current_password: "",
                      new_password: "",
                      confirm_new_password: "",
                    });
                  }}
                  className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] text-[#525866]">
                Keep your account secure by regularly updating your password.
              </p>
              <div className="bg-[#F3F4F6] rounded-lg p-3">
                <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">
                  Password Requirements
                </p>
                <ul className="text-[12px] text-[#525866] mt-2 space-y-1">
                  <li>• Minimum 6 characters</li>
                  <li>• Must be different from current password</li>
                  <li>• Confirmation must match new password</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

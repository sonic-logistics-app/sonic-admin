"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import CustomerService, { CreateUserData } from "@/services/CustomerService";
import Toast, { ToastRef } from "@/components/shared/Toast";

export default function CreateUserPage() {
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const customerService = new CustomerService();

  const [formData, setFormData] = useState<CreateUserData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    is_verified: false,
    provider: "email",
    otp_verified: false,
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof CreateUserData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.current?.show({
          severity: "error",
          summary: "File Too Large",
          detail: "Profile image must be less than 5MB",
          life: 3000,
        });
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast.current?.show({
          severity: "error",
          summary: "Invalid File Type",
          detail: "Only JPEG, PNG, and JPG files are allowed",
          life: 3000,
        });
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "First name, last name, email, and phone are required",
        life: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const userData = {
        ...formData,
        profile_image: profileImage || undefined,
      };

      const result = await customerService.createUser(userData);
      
      if (result.success) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "User created successfully",
          life: 3000,
        });
        setTimeout(() => {
          router.push("/user");
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to create user");
      }
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to create user",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-[#111827]">Create New User</h1>
            <p className="text-[13px] text-[#525866] mt-1">Add a new user to the system</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB] transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Profile Image</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#E1E4EA] flex items-center justify-center overflow-hidden">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="pi pi-user text-[#525866] text-2xl" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="profile_image"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="profile_image"
                  className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB] transition-colors cursor-pointer inline-block"
                >
                  Choose Image
                </label>
                <p className="text-[11px] text-[#525866] mt-2">
                  JPEG, PNG, JPG up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="e.g., +2348012345678"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Password (Optional)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Leave blank for auto-generated password"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Account Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Login Provider
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="email">Email/Password</option>
                  <option value="google">Google</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_verified"
                    checked={formData.is_verified}
                    onChange={(e) => handleInputChange('is_verified', e.target.checked)}
                    className="w-4 h-4 rounded border-[#E1E4EA] text-[#2563EB] cursor-pointer"
                  />
                  <label htmlFor="is_verified" className="text-[13px] text-[#111827] cursor-pointer">
                    Mark as verified
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="otp_verified"
                    checked={formData.otp_verified}
                    onChange={(e) => handleInputChange('otp_verified', e.target.checked)}
                    className="w-4 h-4 rounded border-[#E1E4EA] text-[#2563EB] cursor-pointer"
                  />
                  <label htmlFor="otp_verified" className="text-[13px] text-[#111827] cursor-pointer">
                    Mark OTP as verified
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <i className="pi pi-spinner pi-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <i className="pi pi-check" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
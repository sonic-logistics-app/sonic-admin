"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DriverService, { CreateDriverData } from "@/services/DriverService";
import Toast, { ToastRef } from "@/components/shared/Toast";

interface FileUpload {
  file: File | null;
  preview: string;
}

export default function CreateDriverPage() {
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const driverService = new DriverService();

  const [formData, setFormData] = useState<CreateDriverData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    is_verified: false,
    status: "AVAILABLE",
    kyc_status: "pending",
    national_id_number: "",
    bank_verification: "",
    vehicle_type: "CAR",
    brand_name: "",
    model_name: "",
    model_year: "",
    model_color: "",
    model_plate_number: "",
    model_seat_capacity: "4",
    nin_name: "",
    bvn_number: "",
    account_holder_name: "",
    bank_name: "",
    bank_code: "",
    account_type: "SAVINGS",
    account_number: "",
  });

  const [files, setFiles] = useState<{
    profile_image: FileUpload;
    national_id_image: FileUpload;
    driver_license_image: FileUpload;
    vehicle_image: FileUpload;
    vehicle_certificate: FileUpload;
    selfie_image: FileUpload;
  }>({
    profile_image: { file: null, preview: "" },
    national_id_image: { file: null, preview: "" },
    driver_license_image: { file: null, preview: "" },
    vehicle_image: { file: null, preview: "" },
    vehicle_certificate: { file: null, preview: "" },
    selfie_image: { file: null, preview: "" },
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof CreateDriverData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.current?.show({
          severity: "error",
          summary: "File Too Large",
          detail: "File must be less than 5MB",
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

      const reader = new FileReader();
      reader.onload = (e) => {
        setFiles(prev => ({
          ...prev,
          [field]: {
            file,
            preview: e.target?.result as string
          }
        }));
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
      const driverData = {
        ...formData,
        profile_image: files.profile_image.file || undefined,
        national_id_image: files.national_id_image.file || undefined,
        driver_license_image: files.driver_license_image.file || undefined,
        vehicle_image: files.vehicle_image.file || undefined,
        vehicle_certificate: files.vehicle_certificate.file || undefined,
        selfie_image: files.selfie_image.file || undefined,
      };

      const result = await driverService.createDriver(driverData);
      
      if (result.success) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Driver created successfully",
          life: 3000,
        });
        setTimeout(() => {
          router.push("/driver");
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to create driver");
      }
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to create driver",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const FileUploadField = ({ 
    label, 
    field, 
    required = false 
  }: { 
    label: string; 
    field: keyof typeof files; 
    required?: boolean;
  }) => (
    <div>
      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
        {label} {required && "*"}
      </label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 border-2 border-dashed border-[#E1E4EA] rounded-lg flex items-center justify-center overflow-hidden">
          {files[field].preview ? (
            <img
              src={files[field].preview}
              alt={label}
              className="w-full h-full object-cover"
            />
          ) : (
            <i className="pi pi-image text-[#525866] text-xl" />
          )}
        </div>
        <div>
          <input
            type="file"
            id={field}
            accept="image/jpeg,image/png,image/jpg"
            onChange={(e) => handleFileChange(field, e)}
            className="hidden"
          />
          <label
            htmlFor={field}
            className="px-3 py-2 border border-[#E1E4EA] rounded-lg text-[12px] font-semibold text-[#525866] hover:bg-[#F9FAFB] transition-colors cursor-pointer inline-block"
          >
            Choose File
          </label>
          <p className="text-[10px] text-[#525866] mt-1">
            JPEG, PNG, JPG up to 5MB
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-[#111827]">Create New Driver</h1>
            <p className="text-[13px] text-[#525866] mt-1">Add a new driver to the system</p>
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
                  placeholder="e.g., +2349012345678"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Password (Optional)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Leave blank for auto-generated"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Document Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  National ID Number
                </label>
                <input
                  type="text"
                  value={formData.national_id_number}
                  onChange={(e) => handleInputChange('national_id_number', e.target.value)}
                  placeholder="e.g., 12345678901"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  BVN Number
                </label>
                <input
                  type="text"
                  value={formData.bvn_number}
                  onChange={(e) => handleInputChange('bvn_number', e.target.value)}
                  placeholder="e.g., 12345678901"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  NIN Name
                </label>
                <input
                  type="text"
                  value={formData.nin_name}
                  onChange={(e) => handleInputChange('nin_name', e.target.value)}
                  placeholder="Full name on NIN"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Bank Verification Number
                </label>
                <input
                  type="text"
                  value={formData.bank_verification}
                  onChange={(e) => handleInputChange('bank_verification', e.target.value)}
                  placeholder="Bank verification number"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Vehicle Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Vehicle Type
                </label>
                <select
                  value={formData.vehicle_type}
                  onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="CAR">Car</option>
                  <option value="BIKE">Bike</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brand_name}
                  onChange={(e) => handleInputChange('brand_name', e.target.value)}
                  placeholder="e.g., Toyota"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Model Name
                </label>
                <input
                  type="text"
                  value={formData.model_name}
                  onChange={(e) => handleInputChange('model_name', e.target.value)}
                  placeholder="e.g., Corolla"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Model Year
                </label>
                <input
                  type="text"
                  value={formData.model_year}
                  onChange={(e) => handleInputChange('model_year', e.target.value)}
                  placeholder="e.g., 2020"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.model_color}
                  onChange={(e) => handleInputChange('model_color', e.target.value)}
                  placeholder="e.g., White"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Plate Number
                </label>
                <input
                  type="text"
                  value={formData.model_plate_number}
                  onChange={(e) => handleInputChange('model_plate_number', e.target.value)}
                  placeholder="e.g., ABC-123-XY"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Seat Capacity
                </label>
                <input
                  type="text"
                  value={formData.model_seat_capacity}
                  onChange={(e) => handleInputChange('model_seat_capacity', e.target.value)}
                  placeholder="e.g., 4"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Bank Account Information */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Bank Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={formData.account_holder_name}
                  onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                  placeholder="Full name on account"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => handleInputChange('bank_name', e.target.value)}
                  placeholder="e.g., GTBank"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => handleInputChange('account_number', e.target.value)}
                  placeholder="e.g., 1234567890"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Bank Code
                </label>
                <input
                  type="text"
                  value={formData.bank_code}
                  onChange={(e) => handleInputChange('bank_code', e.target.value)}
                  placeholder="e.g., 058"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Account Type
                </label>
                <select
                  value={formData.account_type}
                  onChange={(e) => handleInputChange('account_type', e.target.value)}
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="SAVINGS">Savings</option>
                  <option value="CURRENT">Current</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Document Uploads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadField label="Profile Image" field="profile_image" />
              <FileUploadField label="National ID Image" field="national_id_image" />
              <FileUploadField label="Driver License Image" field="driver_license_image" />
              <FileUploadField label="Vehicle Image" field="vehicle_image" />
              <FileUploadField label="Vehicle Certificate" field="vehicle_certificate" />
              <FileUploadField label="Selfie Image" field="selfie_image" />
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Account Settings</h2>
            <div className="flex items-center gap-6">
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

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  KYC Status
                </label>
                <select
                  value={formData.kyc_status}
                  onChange={(e) => handleInputChange('kyc_status', e.target.value)}
                  className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
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
                  Create Driver
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
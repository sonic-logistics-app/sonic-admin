"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import VendorService, { CreateVendorData } from "@/services/VendorService";
import Toast, { ToastRef } from "@/components/shared/Toast";

interface FileUpload {
  file: File | null;
  preview: string;
}

interface MenuCategory {
  name: string;
  description: string;
  is_active: boolean;
}

export default function CreateVendorPage() {
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const vendorService = new VendorService();

  const [formData, setFormData] = useState<CreateVendorData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    business_type: "restaurant",
    description: "",
    status: "pending_approval",
    kyc_status: "pending",
    latitude: "",
    longitude: "",
    minimum_order: "500",
    is_accepting_orders: false,
    is_open: false,
    onboarding_completed: false,
    business_registration_number: "",
    tax_identification_number: "",
    bank_name: "",
    account_name: "",
    account_number: "",
    bank_code: "",
    owner_first_name: "",
    owner_last_name: "",
    owner_email: "",
    owner_password: "",
    owner_role: "owner",
  });

  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([
    { name: "Main Courses", description: "Our signature dishes", is_active: true },
    { name: "Beverages", description: "Drinks and refreshments", is_active: true },
  ]);

  const [files, setFiles] = useState<{
    logo_image: FileUpload;
    cover_image: FileUpload;
    business_registration_doc: FileUpload;
    tax_id_doc: FileUpload;
    owner_id_doc: FileUpload;
    bank_verification_doc: FileUpload;
    owner_profile_image: FileUpload;
  }>({
    logo_image: { file: null, preview: "" },
    cover_image: { file: null, preview: "" },
    business_registration_doc: { file: null, preview: "" },
    tax_id_doc: { file: null, preview: "" },
    owner_id_doc: { file: null, preview: "" },
    bank_verification_doc: { file: null, preview: "" },
    owner_profile_image: { file: null, preview: "" },
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof CreateVendorData, value: string | boolean) => {
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

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (field.includes('_doc')) {
        allowedTypes.push('application/pdf');
      }

      if (!allowedTypes.includes(file.type)) {
        toast.current?.show({
          severity: "error",
          summary: "Invalid File Type",
          detail: field.includes('_doc') 
            ? "Only JPEG, PNG, JPG, and PDF files are allowed" 
            : "Only JPEG, PNG, and JPG files are allowed",
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

  const addMenuCategory = () => {
    setMenuCategories(prev => [...prev, { name: "", description: "", is_active: true }]);
  };

  const updateMenuCategory = (index: number, field: keyof MenuCategory, value: string | boolean) => {
    setMenuCategories(prev => prev.map((cat, i) => 
      i === index ? { ...cat, [field]: value } : cat
    ));
  };

  const removeMenuCategory = (index: number) => {
    setMenuCategories(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Name, email, phone, and address are required",
        life: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const vendorData = {
        ...formData,
        menu_categories: JSON.stringify(menuCategories.filter(cat => cat.name.trim())),
        logo_image: files.logo_image.file || undefined,
        cover_image: files.cover_image.file || undefined,
        business_registration_doc: files.business_registration_doc.file || undefined,
        tax_id_doc: files.tax_id_doc.file || undefined,
        owner_id_doc: files.owner_id_doc.file || undefined,
        bank_verification_doc: files.bank_verification_doc.file || undefined,
        owner_profile_image: files.owner_profile_image.file || undefined,
      };

      const result = await vendorService.createVendor(vendorData);
      
      if (result.success) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Vendor created successfully",
          life: 3000,
        });
        setTimeout(() => {
          router.push("/vendor");
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to create vendor");
      }
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to create vendor",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const FileUploadField = ({ 
    label, 
    field, 
    required = false,
    acceptPdf = false
  }: { 
    label: string; 
    field: keyof typeof files; 
    required?: boolean;
    acceptPdf?: boolean;
  }) => (
    <div>
      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
        {label} {required && "*"}
      </label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 border-2 border-dashed border-[#E1E4EA] rounded-lg flex items-center justify-center overflow-hidden">
          {files[field].preview ? (
            files[field].file?.type === 'application/pdf' ? (
              <i className="pi pi-file-pdf text-red-500 text-2xl" />
            ) : (
              <img
                src={files[field].preview}
                alt={label}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <i className="pi pi-image text-[#525866] text-xl" />
          )}
        </div>
        <div>
          <input
            type="file"
            id={field}
            accept={acceptPdf ? "image/jpeg,image/png,image/jpg,application/pdf" : "image/jpeg,image/png,image/jpg"}
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
            {acceptPdf ? "JPEG, PNG, JPG, PDF up to 5MB" : "JPEG, PNG, JPG up to 5MB"}
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
            <h1 className="text-[24px] font-bold text-[#111827]">Create New Vendor</h1>
            <p className="text-[13px] text-[#525866] mt-1">Add a new vendor to the system</p>
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
          {/* Basic Information */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Mama's Kitchen"
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
                  placeholder="vendor@example.com"
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
                  placeholder="+2347012345678"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Business Type *
                </label>
                <select
                  value={formData.business_type}
                  onChange={(e) => handleInputChange('business_type', e.target.value)}
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="grocery">Grocery</option>
                  <option value="gadget">Gadget</option>
                  <option value="flowers">Flowers</option>
                  <option value="baby">Baby</option>
                  <option value="personal_care">Personal Care</option>
                  <option value="beverages">Beverages</option>
                  <option value="shop">Shop</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Lagos Street, Victoria Island"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the vendor"
                  rows={3}
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Location & Settings */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Location & Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  placeholder="6.5244"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  placeholder="3.3792"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Minimum Order (₦)
                </label>
                <input
                  type="text"
                  value={formData.minimum_order}
                  onChange={(e) => handleInputChange('minimum_order', e.target.value)}
                  placeholder="500"
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
                  <option value="pending_approval">Pending Approval</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  KYC Status
                </label>
                <select
                  value={formData.kyc_status}
                  onChange={(e) => handleInputChange('kyc_status', e.target.value)}
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_accepting_orders"
                    checked={formData.is_accepting_orders}
                    onChange={(e) => handleInputChange('is_accepting_orders', e.target.checked)}
                    className="w-4 h-4 rounded border-[#E1E4EA] text-[#2563EB] cursor-pointer"
                  />
                  <label htmlFor="is_accepting_orders" className="text-[13px] text-[#111827] cursor-pointer">
                    Accepting Orders
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_open"
                    checked={formData.is_open}
                    onChange={(e) => handleInputChange('is_open', e.target.checked)}
                    className="w-4 h-4 rounded border-[#E1E4EA] text-[#2563EB] cursor-pointer"
                  />
                  <label htmlFor="is_open" className="text-[13px] text-[#111827] cursor-pointer">
                    Currently Open
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="onboarding_completed"
                    checked={formData.onboarding_completed}
                    onChange={(e) => handleInputChange('onboarding_completed', e.target.checked)}
                    className="w-4 h-4 rounded border-[#E1E4EA] text-[#2563EB] cursor-pointer"
                  />
                  <label htmlFor="onboarding_completed" className="text-[13px] text-[#111827] cursor-pointer">
                    Onboarding Completed
                  </label>
                </div>
              </div>
            </div>
          </div>
          {/* Business Details */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Business Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Business Registration Number
                </label>
                <input
                  type="text"
                  value={formData.business_registration_number}
                  onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
                  placeholder="RC123456"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Tax Identification Number
                </label>
                <input
                  type="text"
                  value={formData.tax_identification_number}
                  onChange={(e) => handleInputChange('tax_identification_number', e.target.value)}
                  placeholder="12345678901"
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
                  placeholder="GTBank"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.account_name}
                  onChange={(e) => handleInputChange('account_name', e.target.value)}
                  placeholder="Mama's Kitchen Ltd"
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
                  placeholder="1234567890"
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
                  placeholder="058"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Owner Account */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Owner Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Owner First Name
                </label>
                <input
                  type="text"
                  value={formData.owner_first_name}
                  onChange={(e) => handleInputChange('owner_first_name', e.target.value)}
                  placeholder="John"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Owner Last Name
                </label>
                <input
                  type="text"
                  value={formData.owner_last_name}
                  onChange={(e) => handleInputChange('owner_last_name', e.target.value)}
                  placeholder="Doe"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Owner Email
                </label>
                <input
                  type="email"
                  value={formData.owner_email}
                  onChange={(e) => handleInputChange('owner_email', e.target.value)}
                  placeholder="owner@example.com"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Owner Password
                </label>
                <input
                  type="password"
                  value={formData.owner_password}
                  onChange={(e) => handleInputChange('owner_password', e.target.value)}
                  placeholder="password123"
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                  Owner Role
                </label>
                <select
                  value={formData.owner_role}
                  onChange={(e) => handleInputChange('owner_role', e.target.value)}
                  className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>
          </div>

          {/* Menu Categories */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-semibold text-[#111827]">Menu Categories</h2>
              <button
                type="button"
                onClick={addMenuCategory}
                className="px-3 py-1 bg-[#2563EB] text-white rounded-lg text-[12px] font-semibold hover:bg-[#1d4ed8] transition-colors"
              >
                Add Category
              </button>
            </div>
            <div className="space-y-4">
              {menuCategories.map((category, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-[#E1E4EA] rounded-lg">
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateMenuCategory(index, 'name', e.target.value)}
                      placeholder="Main Courses"
                      className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={category.description}
                      onChange={(e) => updateMenuCategory(index, 'description', e.target.value)}
                      placeholder="Our signature dishes"
                      className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`category_active_${index}`}
                        checked={category.is_active}
                        onChange={(e) => updateMenuCategory(index, 'is_active', e.target.checked)}
                        className="w-4 h-4 rounded border-[#E1E4EA] text-[#2563EB] cursor-pointer"
                      />
                      <label htmlFor={`category_active_${index}`} className="text-[12px] text-[#111827] cursor-pointer">
                        Active
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMenuCategory(index)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-[12px]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* File Uploads */}
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
            <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Document Uploads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadField label="Logo Image" field="logo_image" />
              <FileUploadField label="Cover Image" field="cover_image" />
              <FileUploadField label="Business Registration Document" field="business_registration_doc" acceptPdf />
              <FileUploadField label="Tax ID Document" field="tax_id_doc" acceptPdf />
              <FileUploadField label="Owner ID Document" field="owner_id_doc" />
              <FileUploadField label="Bank Verification Document" field="bank_verification_doc" acceptPdf />
              <FileUploadField label="Owner Profile Image" field="owner_profile_image" />
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
                  Create Vendor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
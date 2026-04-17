"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import FAQService, { FAQFormData } from "@/services/FAQService";
import Toast, { ToastRef } from "@/components/shared/Toast";
import Button from "@/components/shared/Button";

const categories = [
  "General",
  "Account",
  "Orders",
  "Payment",
  "Vendors",
  "Drivers",
  "Support",
];

const defaultFormData: FAQFormData = {
  question: "",
  answer: "",
  category: "General",
};

export default function FAQCreatePage() {
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const faqService = new FAQService();

  const [formData, setFormData] = useState<FAQFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      if (!formData.question.trim() || !formData.answer.trim()) {
        toast.current?.show({
          severity: "error",
          summary: "Validation Error",
          detail: "Question and answer are required",
          life: 3000,
        });
        return;
      }

      setLoading(true);
      await faqService.createFAQ(formData);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "FAQ created successfully",
        life: 3000,
      });
      router.push("/faq");
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to create FAQ",
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
            <h1 className="text-[24px] font-bold text-[#111827]">Create New FAQ</h1>
            <p className="text-[13px] text-[#525866] mt-1">Add a new frequently asked question</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
        </div>

        {/* Form */}
        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Question */}
          <div>
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Question *
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              placeholder="e.g., How do I track my order?"
              className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Answer *
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              placeholder="Enter the detailed answer..."
              rows={8}
              className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E1E4EA]">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create FAQ"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

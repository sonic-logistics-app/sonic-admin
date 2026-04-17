"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import FAQService, { FAQ, FAQFormData } from "@/services/FAQService";
import Toast, { ToastRef } from "@/components/shared/Toast";

const categories = [
  "General",
  "Account",
  "Orders",
  "Payment",
  "Vendors",
  "Drivers",
  "Support",
];

export default function FAQEditPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const faqService = new FAQService();

  const [faq, setFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState<FAQFormData>({
    question: "",
    answer: "",
    category: "General",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFAQ();
  }, [params.id]);

  const loadFAQ = async () => {
    try {
      setLoading(true);
      const faqId = params.id as string;
      const data = await faqService.getFAQById(faqId);
      setFAQ(data);
      if (data) {
        setFormData({
          question: data.question,
          answer: data.answer,
          category: data.category,
        });
      }
    } catch (error) {
      console.error("❌ Failed to load FAQ:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load FAQ details",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

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

      setSaving(true);
      if (faq) {
        await faqService.updateFAQ(faq.id, formData);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "FAQ updated successfully",
          life: 3000,
        });
        router.push(`/faq/${faq.id}`);
      }
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to update FAQ",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-[#525866]">Loading FAQ details...</p>
        </div>
      </div>
    );
  }

  if (!faq) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-[#525866]">FAQ not found</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8]"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-[#111827]">Edit FAQ</h1>
            <p className="text-[13px] text-[#525866] mt-1">ID: {faq.id}</p>
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
              disabled={saving}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update FAQ"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

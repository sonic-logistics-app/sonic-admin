"use client";

import { useState, useEffect } from "react";
import FAQService, { FAQ, FAQFormData } from "@/services/FAQService";

interface FAQFormDialogProps {
  visible: boolean;
  editMode: boolean;
  faq: FAQ | null;
  onHide: () => void;
  onSave: () => void;
  toast: React.RefObject<any>;
}

const defaultFormData: FAQFormData = {
  question: "",
  answer: "",
  category: "General",
};

const categories = [
  "General",
  "Account",
  "Orders",
  "Payment",
  "Vendors",
  "Drivers",
  "Support",
];

export default function FAQFormDialog({
  visible,
  editMode,
  faq,
  onHide,
  onSave,
  toast,
}: FAQFormDialogProps) {
  const faqService = new FAQService();

  const [formData, setFormData] = useState<FAQFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editMode && faq) {
        setFormData({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
        });
      } else {
        setFormData(defaultFormData);
      }
    }
  }, [visible, editMode, faq]);

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

      if (editMode && faq) {
        await faqService.updateFAQ(faq.id, formData);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "FAQ updated successfully",
          life: 3000,
        });
      } else {
        await faqService.createFAQ(formData);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "FAQ created successfully",
          life: 3000,
        });
      }
      onHide();
      onSave();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to save FAQ",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onHide}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl border border-[#E1E4EA] w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E1E4EA] sticky top-0 bg-white">
          <h2 className="text-[18px] font-semibold text-[#111827]">
            {editMode ? "Edit FAQ" : "Create New FAQ"}
          </h2>
          <button
            onClick={onHide}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <i className="pi pi-times text-[#525866]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
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
              rows={6}
              className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB] resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#E1E4EA] sticky bottom-0 bg-white">
          <button
            onClick={onHide}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : editMode ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

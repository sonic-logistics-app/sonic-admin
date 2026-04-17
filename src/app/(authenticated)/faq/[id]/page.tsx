"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import FAQService, { FAQ } from "@/services/FAQService";
import Toast, { ToastRef } from "@/components/shared/Toast";
import Button from "@/components/shared/Button";

export default function FAQDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const faqService = new FAQService();

  const [faq, setFAQ] = useState<FAQ | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFAQ();
  }, [params.id]);

  const loadFAQ = async () => {
    try {
      setLoading(true);
      const faqId = params.id as string;
      const data = await faqService.getFAQById(faqId);
      setFAQ(data);
    } catch (error) {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
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
            <h1 className="text-[24px] font-bold text-[#111827]">FAQ Details</h1>
            <p className="text-[13px] text-[#525866] mt-1">ID: {faq.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/faq/${faq.id}/edit`)}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8]"
            >
              <i className="pi pi-pencil mr-2" />
              Edit
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB]"
            >
              Back
            </button>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-4">
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Category
            </label>
            <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
              {faq.category}
            </span>
          </div>
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-4">
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Created
            </label>
            <p className="text-[13px] text-[#111827]">{formatDate(faq.created_at)}</p>
          </div>
          <div className="bg-white border border-[#E1E4EA] rounded-lg p-4">
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Last Updated
            </label>
            <p className="text-[13px] text-[#111827]">{formatDate(faq.updated_at)}</p>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
          <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Question</h2>
          <p className="text-[15px] text-[#111827] leading-relaxed">{faq.question}</p>
        </div>

        {/* Answer */}
        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6">
          <h2 className="text-[16px] font-semibold text-[#111827] mb-4">Answer</h2>
          <p className="text-[13px] text-[#525866] leading-relaxed whitespace-pre-wrap">
            {faq.answer}
          </p>
        </div>
      </div>
    </>
  );
}

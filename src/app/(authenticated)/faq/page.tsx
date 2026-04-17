"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import FAQService, { FAQ } from "@/services/FAQService";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Button from "@/components/shared/Button";

export default function FAQListPage() {
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const faqService = new FAQService();

  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "primary" | "danger" | "success";
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "primary",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const categories = [
    "General",
    "Account",
    "Orders",
    "Payment",
    "Vendors",
    "Drivers",
    "Support",
  ];

  useEffect(() => {
    loadFAQs();
  }, []);

  useEffect(() => {
    let filtered = faqs;

    if (categoryFilter !== "") {
      filtered = filtered.filter(faq => faq.category === categoryFilter);
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFAQs(filtered);
    setPagination((prev) => ({ ...prev, page: 1, total: filtered.length }));
  }, [searchQuery, categoryFilter, faqs]);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const data = await faqService.getAllFAQs();
      setFAQs(data || []);
      setFilteredFAQs(data || []);
      setPagination((prev) => ({ ...prev, total: (data || []).length }));
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load FAQs",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (faq: FAQ) => {
    setConfirmDialog({
      visible: true,
      title: "Confirm Deletion",
      message: `Are you sure you want to delete this FAQ? This action cannot be undone.`,
      onConfirm: () => handleDelete(faq),
      variant: "danger",
    });
  };

  const handleDelete = async (faq: FAQ) => {
    try {
      await faqService.deleteFAQ(faq.id);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "FAQ deleted successfully",
        life: 3000,
      });
      loadFAQs();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: error.message || "Failed to delete FAQ",
        life: 3000,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const paginatedData = filteredFAQs.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const columns = [
    {
      field: "question",
      header: "Question",
      sortable: true,
      body: (rowData: FAQ) => (
        <span className="text-[13px] font-semibold text-[#111827] line-clamp-2">
          {rowData.question}
        </span>
      ),
    },
    {
      field: "category",
      header: "Category",
      sortable: true,
      body: (rowData: FAQ) => (
        <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
          {rowData.category}
        </span>
      ),
    },
    {
      field: "answer",
      header: "Answer",
      sortable: false,
      body: (rowData: FAQ) => (
        <span className="text-[12px] text-[#525866] line-clamp-2">
          {rowData.answer}
        </span>
      ),
    },
    {
      field: "created_at",
      header: "Created",
      sortable: true,
      body: (rowData: FAQ) => formatDate(rowData.created_at),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      body: (rowData: FAQ) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/faq/${rowData.id}`);
            }}
            className="text-[#2563EB] hover:underline text-[13px] font-semibold"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/faq/${rowData.id}/edit`);
            }}
            className="text-[#2563EB] hover:underline text-[13px] font-semibold"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(rowData);
            }}
            className="text-[#DC2626] hover:underline text-[13px] font-semibold"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={confirmDialog.visible}
        onHide={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmVariant={confirmDialog.variant}
        icon={confirmDialog.variant === "danger" ? "pi-exclamation-triangle" : "pi-check-circle"}
      />

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[#111827]">FAQ Management</h1>
          <Button onClick={() => router.push("/faq/create")}>
            <i className="pi pi-plus mr-2" />
            New FAQ
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[250px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search FAQs by question or answer..."
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Data Table */}
        <DataTable
          data={paginatedData}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPaginationChange={setPagination}
          emptyMessage="No FAQs found"
        />
      </div>
    </>
  );
}

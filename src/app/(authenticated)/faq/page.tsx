"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import FAQService, { FAQ } from "@/lib/api/admin/faq";
import DataTable from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import Toast, { ToastRef } from "@/components/shared/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Button from "@/components/shared/Button";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import { useDebounce } from "@/hooks/useDebounce";

export default function FAQListPage() {
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const faqService = new FAQService();

  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
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
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const categories = ["General", "Account", "Orders", "Payment", "Vendors", "Drivers", "Support"];

  useEffect(() => {
    loadFAQs(pagination.page, debouncedSearch, categoryFilter);
  }, [pagination.page, debouncedSearch, categoryFilter]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, categoryFilter]);

  const loadFAQs = async (page: number, search: string, category: string) => {
    try {
      setLoading(true);
      const result = await faqService.getAllFAQs({
        page, limit: pagination.limit,
        search: search || undefined,
        category: category || undefined,
      });
      setFAQs(result.data || []);
      setPagination((prev) => ({ ...prev, total: result.meta.total }));
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to load FAQs", life: 3000 });
    } finally {
      setInitialLoad(false);
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
      toast.current?.show({ severity: "success", summary: "Success", detail: "FAQ deleted successfully", life: 3000 });
      loadFAQs(pagination.page, debouncedSearch, categoryFilter);
    } catch (error: any) {
      toast.current?.show({ severity: "error", summary: "Delete Failed", detail: error.message || "Failed to delete FAQ", life: 3000 });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Server handles pagination

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

      <div className="flex flex-col gap-4 h-full min-h-0">
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
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search FAQs by question or answer..." />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-medium text-[#525866] focus:outline-none focus:border-[#2563EB] bg-white">
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Data Table */}
        {initialLoad && loading ? (
          <SkeletonLoader type="table" rows={10} />
        ) : (
          <DataTable
            data={faqs}
            columns={columns}
            loading={false}
            pagination={pagination}
            onPaginationChange={(newPagination) => setPagination(newPagination)}
            emptyMessage="No FAQs found"
            className="flex-1 min-h-0"
          />
        )}
      </div>
    </>
  );
}

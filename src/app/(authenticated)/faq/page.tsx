"use client";

import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { FilterMatchMode } from "primereact/api";
import FAQService, { FAQ } from "@/services/FAQService";
import FAQFormDialog from "@/components/faq/FAQFormDialog";

export default function FAQListPage() {
  const toast = useRef<Toast>(null);
  const menu = useRef<Menu>(null);
  const faqService = new FAQService();

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    question: { value: null, matchMode: FilterMatchMode.CONTAINS },
    category: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const menuItems = [
    {
      label: "Edit",
      icon: "pi pi-pencil",
      command: () => {
        if (selectedFAQ) {
          handleEdit(selectedFAQ);
        }
      },
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: () => {
        if (selectedFAQ) {
          confirmDelete(selectedFAQ);
        }
      },
    },
  ];

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const data = await faqService.getAllFAQs();
      setFaqs(data || []);
    } catch (error) {
      console.error("Failed to load FAQs:", error);
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

  const handleCreate = () => {
    setSelectedFAQ(null);
    setEditMode(false);
    setShowDialog(true);
  };

  const handleEdit = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setEditMode(true);
    setShowDialog(true);
  };

  const confirmDelete = (faq: FAQ) => {
    confirmDialog({
      message: `Are you sure you want to delete this FAQ?`,
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDelete(faq),
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

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters: any = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const clearFilter = () => {
    setGlobalFilterValue("");
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      question: { value: null, matchMode: FilterMatchMode.CONTAINS },
      category: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const toggleMenu = (event: React.MouseEvent, faq: FAQ) => {
    setSelectedFAQ(faq);
    menu.current?.toggle(event);
  };

  const questionBodyTemplate = (rowData: FAQ) => {
    return (
      <div className="max-w-20rem">
        <div className="text-900 font-medium mb-1">{rowData.question}</div>
        <div className="text-600 text-sm line-height-3">
          {rowData.answer.length > 100
            ? `${rowData.answer.substring(0, 100)}...`
            : rowData.answer}
        </div>
      </div>
    );
  };

  const categoryBodyTemplate = (rowData: FAQ) => {
    return rowData.category ? (
      <Tag value={rowData.category} severity="info" />
    ) : (
      <span className="text-500">-</span>
    );
  };

  const actionBodyTemplate = (rowData: FAQ) => {
    return (
      <Button
        icon="pi pi-ellipsis-v"
        rounded
        text
        onClick={(e) => toggleMenu(e, rowData)}
      />
    );
  };

  const header = (
    <div className="flex justify-content-between flex-column sm:flex-row">
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          outlined
          onClick={clearFilter}
        />
        <Button
          type="button"
          icon="pi pi-plus"
          label="New FAQ"
          onClick={handleCreate}
        />
      </div>
      <span className="p-input-icon-left mb-2">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Search FAQs..."
          style={{ width: "100%" }}
        />
      </span>
    </div>
  );

  return (
    <div className="grid">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="col-12">
        <div className="card">
          <h5>FAQ Management</h5>
          <DataTable
            value={faqs}
            paginator
            rows={10}
            dataKey="id"
            filters={filters}
            filterDisplay="menu"
            loading={loading}
            responsiveLayout="scroll"
            globalFilterFields={["question", "answer", "category"]}
            header={header}
            emptyMessage="No FAQs found."
            rowHover
          >
            <Column
              field="question"
              header="Question & Answer"
              body={questionBodyTemplate}
              sortable
              filter
              filterPlaceholder="Search by question"
              style={{ minWidth: "25rem" }}
            />
            <Column
              field="category"
              header="Category"
              body={categoryBodyTemplate}
              sortable
              filter
              filterPlaceholder="Search by category"
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="created_at"
              header="Created"
              sortable
              style={{ minWidth: "12rem" }}
              body={(rowData: FAQ) => new Date(rowData.created_at).toLocaleDateString()}
            />
            <Column
              body={actionBodyTemplate}
              exportable={false}
              style={{ minWidth: "8rem" }}
              header="Action"
            />
          </DataTable>

          <Menu model={menuItems} popup ref={menu} />
        </div>
      </div>

      <FAQFormDialog
        visible={showDialog}
        editMode={editMode}
        faq={selectedFAQ}
        onHide={() => setShowDialog(false)}
        onSave={() => {
          setShowDialog(false);
          loadFAQs();
        }}
        toast={toast}
      />
    </div>
  );
}
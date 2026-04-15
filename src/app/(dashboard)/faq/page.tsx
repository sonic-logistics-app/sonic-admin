"use client";

import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { FilterMatchMode } from "primereact/api";
import FAQService, { FAQ, FAQFormData } from "@/services/FAQService";

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

  // Form state
  const [formData, setFormData] = useState<FAQFormData>({
    question: "",
    answer: "",
    category: "",
    is_active: true,
    order_index: 0,
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
    setFormData({
      question: "",
      answer: "",
      category: "",
      is_active: true,
      order_index: 0,
    });
    setEditMode(false);
    setShowDialog(true);
  };

  const handleEdit = (faq: FAQ) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "",
      is_active: faq.is_active,
      order_index: faq.order_index || 0,
    });
    setEditMode(true);
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editMode && selectedFAQ) {
        await faqService.updateFAQ(selectedFAQ.id, formData);
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
      setShowDialog(false);
      loadFAQs();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to save FAQ",
        life: 3000,
      });
    }
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

  const statusBodyTemplate = (rowData: FAQ) => {
    return (
      <Tag
        value={rowData.is_active ? "Active" : "Inactive"}
        severity={rowData.is_active ? "success" : "danger"}
      />
    );
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
              field="order_index"
              header="Order"
              sortable
              style={{ minWidth: "8rem" }}
            />
            <Column
              field="is_active"
              header="Status"
              body={statusBodyTemplate}
              sortable
              style={{ minWidth: "8rem" }}
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

      {/* FAQ Form Dialog */}
      <Dialog
        header={editMode ? "Edit FAQ" : "Create New FAQ"}
        visible={showDialog}
        style={{ width: "700px" }}
        onHide={() => setShowDialog(false)}
        modal
      >
        <div className="grid">
          <div className="col-12">
            <div className="field">
              <label htmlFor="question" className="block text-900 font-medium mb-2">
                Question *
              </label>
              <InputText
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full"
                placeholder="Enter the question"
                required
              />
            </div>
          </div>

          <div className="col-12">
            <div className="field">
              <label htmlFor="answer" className="block text-900 font-medium mb-2">
                Answer *
              </label>
              <InputTextarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="w-full"
                placeholder="Enter the answer"
                rows={5}
                required
              />
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="category" className="block text-900 font-medium mb-2">
                Category
              </label>
              <InputText
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full"
                placeholder="Enter category (optional)"
              />
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="orderIndex" className="block text-900 font-medium mb-2">
                Display Order
              </label>
              <InputNumber
                id="orderIndex"
                value={formData.order_index}
                onValueChange={(e) => setFormData({ ...formData, order_index: e.value || 0 })}
                className="w-full"
                placeholder="Enter display order"
                min={0}
              />
            </div>
          </div>

          <div className="col-12">
            <div className="field-checkbox">
              <Checkbox
                id="isActive"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.checked || false })}
              />
              <label htmlFor="isActive" className="ml-2">
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            label="Cancel"
            icon="pi pi-times"
            outlined
            onClick={() => setShowDialog(false)}
          />
          <Button
            label={editMode ? "Update" : "Create"}
            icon="pi pi-check"
            onClick={handleSave}
          />
        </div>
      </Dialog>
    </div>
  );
}
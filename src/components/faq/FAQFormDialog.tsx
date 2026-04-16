"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import FAQService, { FAQ, FAQFormData } from "@/services/FAQService";

interface FAQFormDialogProps {
  visible: boolean;
  editMode: boolean;
  faq: FAQ | null;
  onHide: () => void;
  onSave: () => void;
  toast: React.RefObject<Toast | null>;
}

export default function FAQFormDialog({
  visible,
  editMode,
  faq,
  onHide,
  onSave,
  toast,
}: FAQFormDialogProps) {
  const faqService = new FAQService();

  const [formData, setFormData] = useState<FAQFormData>({
    question: "",
    answer: "",
    category: "",
  });

  useEffect(() => {
    if (visible) {
      if (editMode && faq) {
        setFormData({
          question: faq.question,
          answer: faq.answer,
          category: faq.category || "",
        });
      } else {
        setFormData({
          question: "",
          answer: "",
          category: "",
        });
      }
    }
  }, [visible, editMode, faq]);

  const handleSave = async () => {
    try {
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
      onSave();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to save FAQ",
        life: 3000,
      });
    }
  };

  return (
    <Dialog
      header={editMode ? "Edit FAQ" : "Create New FAQ"}
      visible={visible}
      style={{ width: "700px" }}
      onHide={onHide}
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

        <div className="col-12">
          <div className="field">
            <label htmlFor="category" className="block text-900 font-medium mb-2">
              Category
            </label>
            <InputText
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full"
              placeholder="Enter category (e.g., general, account, billing)"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-content-end gap-2 mt-4">
        <Button
          label="Cancel"
          icon="pi pi-times"
          outlined
          onClick={onHide}
        />
        <Button
          label={editMode ? "Update" : "Create"}
          icon="pi pi-check"
          onClick={handleSave}
        />
      </div>
    </Dialog>
  );
}

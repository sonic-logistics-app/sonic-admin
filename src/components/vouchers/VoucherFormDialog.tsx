"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import VoucherService, {
  Voucher,
  VoucherFormData,
} from "@/services/VoucherService";

interface VoucherFormDialogProps {
  visible: boolean;
  editMode: boolean;
  voucher: Voucher | null;
  onHide: () => void;
  onSave: () => void;
  toast: React.RefObject<Toast | null>;
}

const discountTypes = [
  { label: "Percentage", value: "PERCENTAGE" },
  { label: "Fixed Amount", value: "FIXED_AMOUNT" },
];

const defaultFormData: VoucherFormData = {
  code: "",
  title: "",
  description: "",
  discount_type: "PERCENTAGE",
  discount_value: 0,
  minimum_order_amount: 0,
  maximum_discount_amount: 0,
  usage_limit: 0,
  valid_from: "",
  valid_until: "",
  is_active: true,
};

export default function VoucherFormDialog({
  visible,
  editMode,
  voucher,
  onHide,
  onSave,
  toast,
}: VoucherFormDialogProps) {
  const voucherService = new VoucherService();

  const [formData, setFormData] = useState<VoucherFormData>({
    ...defaultFormData,
  });

  useEffect(() => {
    if (visible) {
      if (editMode && voucher) {
        setFormData({
          code: voucher.code,
          title: voucher.title,
          description: voucher.description || "",
          discount_type: voucher.discount_type,
          discount_value: voucher.discount_value,
          minimum_order_amount: voucher.minimum_order_amount || 0,
          maximum_discount_amount: voucher.maximum_discount_amount || 0,
          usage_limit: voucher.usage_limit || 0,
          valid_from: voucher.valid_from || "",
          valid_until: voucher.valid_until || "",
          is_active: voucher.is_active,
        });
      } else {
        setFormData({ ...defaultFormData });
      }
    }
  }, [visible, editMode, voucher]);

  const handleSave = async () => {
    try {
      if (editMode && voucher) {
        await voucherService.updateVoucher(voucher.id, formData);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Voucher updated successfully",
          life: 3000,
        });
      } else {
        await voucherService.createVoucher(formData);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Voucher created successfully",
          life: 3000,
        });
      }
      onHide();
      onSave();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to save voucher",
        life: 3000,
      });
    }
  };

  return (
    <Dialog
      header={editMode ? "Edit Voucher" : "Create New Voucher"}
      visible={visible}
      style={{ width: "600px" }}
      onHide={onHide}
      modal
    >
      <div className="grid">
        <div className="col-12 md:col-6">
          <div className="field">
            <label htmlFor="code" className="block text-900 font-medium mb-2">
              Voucher Code *
            </label>
            <InputText
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="w-full"
              placeholder="Enter voucher code"
              required
            />
          </div>
        </div>

        <div className="col-12 md:col-6">
          <div className="field">
            <label htmlFor="title" className="block text-900 font-medium mb-2">
              Title *
            </label>
            <InputText
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full"
              placeholder="Enter voucher title"
              required
            />
          </div>
        </div>

        <div className="col-12">
          <div className="field">
            <label
              htmlFor="description"
              className="block text-900 font-medium mb-2"
            >
              Description
            </label>
            <InputText
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full"
              placeholder="Enter voucher description"
            />
          </div>
        </div>

        <div className="col-12 md:col-6">
          <div className="field">
            <label
              htmlFor="discountType"
              className="block text-900 font-medium mb-2"
            >
              Discount Type *
            </label>
            <Dropdown
              id="discountType"
              value={formData.discount_type}
              options={discountTypes}
              onChange={(e) =>
                setFormData({ ...formData, discount_type: e.value })
              }
              className="w-full"
              placeholder="Select discount type"
            />
          </div>
        </div>

        <div className="col-12 md:col-6">
          <div className="field">
            <label
              htmlFor="discountValue"
              className="block text-900 font-medium mb-2"
            >
              Discount Value *
            </label>
            <InputNumber
              id="discountValue"
              value={formData.discount_value}
              onValueChange={(e) =>
                setFormData({ ...formData, discount_value: e.value || 0 })
              }
              className="w-full"
              placeholder="Enter discount value"
              min={0}
              max={formData.discount_type === "PERCENTAGE" ? 100 : undefined}
            />
          </div>
        </div>

        <div className="col-12 md:col-6">
          <div className="field">
            <label
              htmlFor="validFrom"
              className="block text-900 font-medium mb-2"
            >
              Valid From *
            </label>
            <Calendar
              id="validFrom"
              value={formData.valid_from ? new Date(formData.valid_from) : null}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  valid_from: e.value?.toISOString() || "",
                })
              }
              className="w-full"
              showIcon
              dateFormat="yy-mm-dd"
            />
          </div>
        </div>

        <div className="col-12 md:col-6">
          <div className="field">
            <label
              htmlFor="validUntil"
              className="block text-900 font-medium mb-2"
            >
              Valid Until *
            </label>
            <Calendar
              id="validUntil"
              value={
                formData.valid_until ? new Date(formData.valid_until) : null
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  valid_until: e.value?.toISOString() || "",
                })
              }
              className="w-full"
              showIcon
              dateFormat="yy-mm-dd"
            />
          </div>
        </div>

        <div className="col-12 md:col-6">
          <div className="field">
            <label
              htmlFor="minOrder"
              className="block text-900 font-medium mb-2"
            >
              Minimum Order Amount
            </label>
            <InputNumber
              id="minOrder"
              value={formData.minimum_order_amount}
              onValueChange={(e) =>
                setFormData({ ...formData, minimum_order_amount: e.value || 0 })
              }
              className="w-full"
              placeholder="Enter minimum order amount"
              min={0}
              mode="currency"
              currency="NGN"
            />
          </div>
        </div>

        <div className="col-12 md:col-6">
          <div className="field">
            <label
              htmlFor="usageLimit"
              className="block text-900 font-medium mb-2"
            >
              Usage Limit
            </label>
            <InputNumber
              id="usageLimit"
              value={formData.usage_limit}
              onValueChange={(e) =>
                setFormData({ ...formData, usage_limit: e.value || 0 })
              }
              className="w-full"
              placeholder="Enter usage limit (0 = unlimited)"
              min={0}
            />
          </div>
        </div>

        <div className="col-12">
          <div className="field-checkbox">
            <Checkbox
              id="isActive"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.checked || false })
              }
            />
            <label htmlFor="isActive" className="ml-2">
              Active
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-content-end gap-2 mt-4">
        <Button label="Cancel" icon="pi pi-times" outlined onClick={onHide} />
        <Button
          label={editMode ? "Update" : "Create"}
          icon="pi pi-check"
          onClick={handleSave}
        />
      </div>
    </Dialog>
  );
}

"use client";

import React, { useImperativeHandle, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import VendorService, { Vendor } from "@/services/VendorService";

export interface VendorActionMenuProps {
  vendor: Vendor | null;
  onAction: () => void;
  toast: React.RefObject<Toast | null>;
}

export interface VendorActionMenuRef {
  toggle: (event: React.SyntheticEvent) => void;
}

const VendorActionMenu = React.forwardRef<VendorActionMenuRef, VendorActionMenuProps>(
  ({ vendor, onAction, toast }, ref) => {
    const router = useRouter();
    const menuRef = useRef<Menu>(null);
    const vendorService = new VendorService();

    useImperativeHandle(ref, () => ({
      toggle: (event: React.SyntheticEvent) => {
        menuRef.current?.toggle(event);
      },
    }));

    const handleApprove = async (v: Vendor) => {
      try {
        await vendorService.approveVendor(v.id);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: `Vendor ${v.name} approved successfully`,
          life: 3000,
        });
        onAction();
      } catch {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to approve vendor",
          life: 3000,
        });
      }
    };

    const handleReject = async (v: Vendor) => {
      try {
        await vendorService.rejectVendor(v.id, {
          reason: "Does not meet requirements",
        });
        toast.current?.show({
          severity: "info",
          summary: "Rejected",
          detail: `Vendor ${v.name} rejected`,
          life: 3000,
        });
        onAction();
      } catch {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to reject vendor",
          life: 3000,
        });
      }
    };

    const handleSuspend = async (v: Vendor) => {
      try {
        await vendorService.suspendVendor(v.id, {
          reason: "Suspended by admin",
        });
        toast.current?.show({
          severity: "warn",
          summary: "Suspended",
          detail: `Vendor ${v.name} suspended`,
          life: 3000,
        });
        onAction();
      } catch {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to suspend vendor",
          life: 3000,
        });
      }
    };

    const handleDelete = async (v: Vendor) => {
      try {
        await vendorService.deleteVendor(v.id);
        toast.current?.show({
          severity: "success",
          summary: "Deleted",
          detail: `Vendor ${v.name} deleted successfully`,
          life: 3000,
        });
        onAction();
      } catch {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete vendor",
          life: 3000,
        });
      }
    };

    const confirmDelete = (v: Vendor) => {
      confirmDialog({
        message: `Are you sure you want to delete ${v.name}?`,
        header: "Confirm Deletion",
        icon: "pi pi-exclamation-triangle",
        acceptClassName: "p-button-danger",
        accept: () => handleDelete(v),
      });
    };

    const menuItems = [
      {
        label: "View Details",
        icon: "pi pi-eye",
        command: () => {
          if (vendor) {
            router.push(`/vendor/${vendor.id}`);
          }
        },
      },
      {
        label: "Approve",
        icon: "pi pi-check",
        command: () => {
          if (vendor) handleApprove(vendor);
        },
      },
      {
        label: "Reject",
        icon: "pi pi-times",
        command: () => {
          if (vendor) handleReject(vendor);
        },
      },
      {
        label: "Suspend",
        icon: "pi pi-ban",
        command: () => {
          if (vendor) handleSuspend(vendor);
        },
      },
      {
        separator: true,
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        command: () => {
          if (vendor) confirmDelete(vendor);
        },
      },
    ];

    return <Menu model={menuItems} popup ref={menuRef} />;
  }
);

VendorActionMenu.displayName = "VendorActionMenu";

export default VendorActionMenu;

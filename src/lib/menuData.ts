import { MenuModel } from "@/types/menu";

export const menuData: MenuModel[] = [
  {
    label: "Menu",
    items: [
      { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/" },
      { label: "Customer", icon: "pi pi-fw pi-user", to: "/user" },
      { label: "Driver", icon: "pi pi-fw pi-car", to: "/driver" },
      { label: "Vendor", icon: "pi pi-fw pi-shop", to: "/vendor" },
      { label: "Voucher", icon: "pi pi-fw pi-ticket", to: "/voucher" },
      { label: "Package", icon: "pi pi-fw pi-box", to: "/package" },
      { label: "Order", icon: "pi pi-fw pi-truck", to: "/order" },
    ],
  },
];

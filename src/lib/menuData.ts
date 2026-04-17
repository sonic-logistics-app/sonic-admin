import { MenuModel } from "@/types/menu";

export const menuData: MenuModel[] = [
  {
    label: "Menu",
    items: [
      { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/dashboard" },
      { label: "Customer", icon: "pi pi-fw pi-user", to: "/user" },
      { label: "Driver", icon: "pi pi-fw pi-car", to: "/driver" },
      { label: "Vendor", icon: "pi pi-fw pi-shop", to: "/vendor" },
      { label: "Order", icon: "pi pi-fw pi-truck", to: "/order" },
      { label: "Voucher", icon: "pi pi-fw pi-ticket", to: "/voucher" },
      { label: "FAQ", icon: "pi pi-fw pi-question-circle", to: "/faq" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Seed Data", icon: "pi pi-fw pi-database", to: "/seed" },
      { label: "API Docs", icon: "pi pi-fw pi-book", to: "/api-docs" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", icon: "pi pi-fw pi-user-edit", to: "/profile" },
      { label: "Support", icon: "pi pi-fw pi-phone", to: "/support" },
      { label: "Logout", icon: "pi pi-fw pi-sign-out", commandKey: "logout" },
    ],
  },
];

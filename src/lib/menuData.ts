import { MenuModel } from "@/types/menu";
import { devToolsVisible } from "@/lib/devTools";

export const menuData: MenuModel[] = [
  {
    label: "Menu",
    items: [
      { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/dashboard" },
      { label: "User", icon: "pi pi-fw pi-user", to: "/user" },
      { label: "Mover", icon: "pi pi-fw pi-car", to: "/driver" },
      { label: "Business Partner", icon: "pi pi-fw pi-shop", to: "/vendor" },
      { label: "Order", icon: "pi pi-fw pi-truck", to: "/order" },
      { label: "Transaction", icon: "pi pi-fw pi-credit-card", to: "/transaction" },
      { label: "Voucher", icon: "pi pi-fw pi-ticket", to: "/voucher" },
      { label: "FAQ", icon: "pi pi-fw pi-question-circle", to: "/faq" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Audit Log", icon: "pi pi-fw pi-history", to: "/audit-log", permission: "audit.read" },
      { label: "Team", icon: "pi pi-fw pi-users", to: "/team", permission: "admin.manage" },
      { label: "API Docs", icon: "pi pi-fw pi-book", to: "/api-docs", visible: devToolsVisible },
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

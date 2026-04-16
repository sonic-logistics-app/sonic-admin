"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "primereact/menu";
import AdminAuth from "@/lib/auth/admin-auth";
import AppSubmenu from "./AppSubmenu";
import { MenuModel, MenuItem } from "@/types/menu";

interface AppMenuProps {
  model: MenuModel[];
  onMenuItemClick?: (event: { originalEvent: React.MouseEvent; item: MenuItem }) => void;
}

export default function AppMenu({ model, onMenuItemClick }: AppMenuProps) {
  const router = useRouter();
  const menu = useRef<Menu>(null);
  const user = AdminAuth.getUser();

  const userMenuItems = [
    {
      label: "Profile",
      icon: "pi pi-user",
      command: () => router.push("/profile"),
    },
    {
      label: "Settings",
      icon: "pi pi-cog",
      command: () => router.push("/settings"),
    },
    { separator: true },
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: async () => {
        await AdminAuth.logout();
        router.push("/login");
      },
    },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center space-x-3 no-underline">
          <Image
            src="/images/logo-dark.svg"
            alt="Logo"
            width={40}
            height={30}
            priority
          />
          <span className="text-lg font-bold text-gray-800">SONIC ADMIN</span>
        </Link>
      </div>

      {/* Menu items */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <AppSubmenu
          items={model}
          root={true}
          onMenuItemClick={onMenuItemClick}
        />
      </div>

      {/* User profile card */}
      <div className="border-t border-gray-200 p-3">
        <button
          type="button"
          onClick={(e) => menu.current?.toggle(e)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-left"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() : "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user ? `${user.first_name} ${user.last_name}` : "Admin"}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user?.email || "admin@sonic.com"}
            </div>
          </div>
          <i className="pi pi-ellipsis-v text-gray-400 text-sm" />
        </button>
        <Menu model={userMenuItems} popup ref={menu} />
      </div>
    </div>
  );
}

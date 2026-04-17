"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminAuth from "@/lib/auth/admin-auth";
import AppSubmenu from "./AppSubmenu";
import { MenuModel, MenuItem } from "@/types/menu";

interface AppMenuProps {
  model: MenuModel[];
  onMenuItemClick?: (event: { originalEvent: React.MouseEvent; item: MenuItem }) => void;
}

export default function AppMenu({ model, onMenuItemClick }: AppMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await AdminAuth.logout();
    router.push("/login");
  };

  // Separate logout item from other menu items
  const processedModel = model.map(section => ({
    ...section,
    items: section.items.filter(item => item.commandKey !== "logout").map(item => ({
      ...item,
      command: item.commandKey === "logout" ? handleLogout : item.command,
    }))
  })).filter(section => section.items.length > 0); // Remove empty sections

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Logo Section */}
      <div className="px-5 py-4 flex-shrink-0 border-b border-[#E1E4EA]">
        <Link href="/dashboard" className="flex items-end gap-3 no-underline">
          <Image
            src="/sonic-logo.svg"
            alt="Logo"
            width={120}
            height={80}
            className="rounded-md"
            priority
          />
          <span className="text-[12px] font-semibold text-[#111827] pb-1">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <AppSubmenu
          items={processedModel}
          root={true}
          onMenuItemClick={onMenuItemClick}
        />
      </div>

      {/* Logout Button at Bottom */}
      <div className="px-3 py-4 border-t border-[#E1E4EA]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-[14px] rounded-lg transition-colors text-left text-[#DC2626] hover:bg-[#FEE2E2]"
        >
          <i className="pi pi-sign-out w-5 h-5 flex-shrink-0 text-[18px] leading-5 text-[#DC2626]" />
          <span className="flex-1">Logout</span>
        </button>
      </div>
    </div>
  );
}
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

  // Process menu items to handle logout command
  const processedModel = model.map(section => ({
    ...section,
    items: section.items.map(item => ({
      ...item,
      command: item.commandKey === "logout" ? handleLogout : item.command,
    }))
  }));

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Logo Section */}
      <div className="px-5 py-3 flex-shrink-0 border-b border-[#E1E4EA]">
        <Link href="/dashboard" className="flex items-center gap-3 no-underline">
          <Image
            src="/images/logo-dark.svg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-md"
            priority
          />
          <div className="flex flex-col">
            <span className="text-[16px] font-semibold text-[#111827]">Sonic Admin</span>
            <span className="text-[11px] text-[#525866]">Admin Portal</span>
          </div>
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
    </div>
  );
}
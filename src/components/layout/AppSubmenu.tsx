"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuItem } from "@/types/menu";

interface AppSubmenuProps {
  items: MenuItem[];
  root?: boolean;
  onMenuItemClick?: (event: { originalEvent: React.MouseEvent; item: MenuItem }) => void;
}

export default function AppSubmenu({ items, root = false, onMenuItemClick }: AppSubmenuProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const pathname = usePathname();

  const handleMenuItemClick = (event: React.MouseEvent, item: MenuItem, index: number) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (!item.to && !item.url) {
      event.preventDefault();
    }

    if (item.command) {
      item.command({ originalEvent: event, item });
    }

    setActiveIndex(index === activeIndex ? null : index);

    if (onMenuItemClick) {
      onMenuItemClick({ originalEvent: event, item });
    }
  };

  const isVisible = (item: MenuItem) => {
    return typeof item.visible === "function" ? item.visible() : item.visible !== false;
  };

  if (!items) return null;

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item, i) => {
        if (!isVisible(item)) return null;

        if (item.separator) {
          return (
            <li
              key={`separator${i}`}
              className="border-t border-[#E1E4EA] my-2"
              style={item.style}
              role="separator"
            />
          );
        }

        const isActive = pathname === item.to;
        const hasSubmenu = item.items && item.items.length > 0;

        return (
          <li key={item.label || i} role="none">
            {root ? (
              <>
                {item.items && (
                  <AppSubmenu
                    items={item.items}
                    onMenuItemClick={onMenuItemClick}
                  />
                )}
              </>
            ) : (
              <>
                {item.to ? (
                  <Link
                    href={item.to}
                    className={`flex items-center gap-3 px-4 py-3 text-[14px] rounded-lg transition-colors ${
                      isActive
                        ? "bg-gray-50 border-l-2 border-[#2563EB] font-semibold text-[#111827]"
                        : item.label === "Logout"
                        ? "text-[#DC2626] hover:bg-[#FEE2E2]"
                        : "text-[#525866] hover:bg-gray-50"
                    } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={item.style}
                    target={item.target}
                    role="menuitem"
                    onClick={(e) => handleMenuItemClick(e, item, i)}
                  >
                    {item.icon && <i className={`${item.icon} w-5 h-5 flex-shrink-0 text-[18px] leading-5 ${item.label === "Logout" ? "text-[#DC2626]" : ""}`} />}
                    <span className="flex-1">{item.label}</span>
                    {hasSubmenu && (
                      <i className="pi pi-angle-down text-xs" />
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={(e) => handleMenuItemClick(e, item, i)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[14px] rounded-lg transition-colors text-left ${
                      item.label === "Logout"
                        ? "text-[#DC2626] hover:bg-[#FEE2E2]"
                        : "text-[#525866] hover:bg-gray-50"
                    } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={item.style}
                    role="menuitem"
                    disabled={item.disabled}
                  >
                    {item.icon && <i className={`${item.icon} w-5 h-5 flex-shrink-0 text-[18px] leading-5 ${item.label === "Logout" ? "text-[#DC2626]" : ""}`} />}
                    <span className="flex-1">{item.label}</span>
                    {hasSubmenu && (
                      <i className="pi pi-angle-down text-xs" />
                    )}
                  </button>
                )}
                {hasSubmenu && activeIndex === i && (
                  <div className="ml-4 mt-1">
                    <AppSubmenu
                      items={item.items || []}
                      onMenuItemClick={onMenuItemClick}
                    />
                  </div>
                )}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

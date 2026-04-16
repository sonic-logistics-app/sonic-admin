"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuItem } from "@/types/menu";
import { Badge } from "primereact/badge";
import { Ripple } from "primereact/ripple";

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
    <ul className="space-y-1">
      {items.map((item, i) => {
        if (!isVisible(item)) return null;

        if (item.separator) {
          return (
            <li
              key={`separator${i}`}
              className="border-t border-gray-200 my-2"
              style={item.style}
              role="separator"
            />
          );
        }

        const isActive = pathname === item.to;
        const hasSubmenu = item.items && item.items.length > 0;

        return (
          <li
            key={item.label || i}
            className={`${root ? "mb-4" : ""}`}
            role="none"
          >
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
                    className={`flex items-center px-3 py-2.5 text-[15px] rounded-lg transition-colors duration-200 ${
                      isActive 
                        ? "bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={item.style}
                    target={item.target}
                    role="menuitem"
                    onClick={(e) => handleMenuItemClick(e, item, i)}
                  >
                    {item.icon && <i className={`${item.icon} mr-3 text-lg`} />}
                    <span className="flex-1">{item.label}</span>
                    {hasSubmenu && (
                      <i className="pi pi-angle-down text-sm" />
                    )}
                    {item.badge && <Badge value={item.badge} className="ml-2" />}
                  </Link>
                ) : (
                  <a
                    href={item.url || "#"}
                    className={`flex items-center px-3 py-2.5 text-[15px] rounded-lg transition-colors duration-200 ${
                      isActive 
                        ? "bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={item.style}
                    target={item.target}
                    role="menuitem"
                    onClick={(e) => handleMenuItemClick(e, item, i)}
                  >
                    {item.icon && <i className={`${item.icon} mr-3 text-lg`} />}
                    <span className="flex-1">{item.label}</span>
                    {hasSubmenu && (
                      <i className="pi pi-angle-down text-sm" />
                    )}
                    {item.badge && <Badge value={item.badge} className="ml-2" />}
                  </a>
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

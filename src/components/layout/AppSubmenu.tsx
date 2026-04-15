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
    <ul>
      {items.map((item, i) => {
        if (!isVisible(item)) return null;

        if (item.separator) {
          return (
            <li
              key={`separator${i}`}
              className="p-menu-separator"
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
            className={`${
              root
                ? "layout-menuitem-category"
                : activeIndex === i && !item.to && !item.disabled
                ? "active-menuitem"
                : ""
            } ${isActive ? "active-route" : ""}`}
            role="none"
          >
            {root ? (
              <>
                <div className="layout-menuitem-root-text">{item.label}</div>
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
                    className={`p-ripple ${item.class || ""} ${
                      item.disabled ? "p-disabled" : ""
                    }`}
                    style={item.style}
                    target={item.target}
                    role="menuitem"
                    onClick={(e) => handleMenuItemClick(e, item, i)}
                  >
                    {item.icon && <i className={item.icon} />}
                    <span>{item.label}</span>
                    {hasSubmenu && (
                      <i className="pi pi-fw pi-angle-down menuitem-toggle-icon" />
                    )}
                    {item.badge && <Badge value={item.badge} />}
                    <Ripple />
                  </Link>
                ) : (
                  <a
                    href={item.url || "#"}
                    className={`p-ripple ${item.class || ""} ${
                      item.disabled ? "p-disabled" : ""
                    }`}
                    style={item.style}
                    target={item.target}
                    role="menuitem"
                    onClick={(e) => handleMenuItemClick(e, item, i)}
                  >
                    {item.icon && <i className={item.icon} />}
                    <span>{item.label}</span>
                    {hasSubmenu && (
                      <i className="pi pi-fw pi-angle-down menuitem-toggle-icon" />
                    )}
                    {item.badge && <Badge value={item.badge} />}
                    <Ripple />
                  </a>
                )}
                {hasSubmenu && activeIndex === i && (
                  <AppSubmenu
                    items={item.items || []}
                    onMenuItemClick={onMenuItemClick}
                  />
                )}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

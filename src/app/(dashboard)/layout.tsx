"use client";

import { useState, useEffect } from "react";
import AppTopbar from "@/components/layout/AppTopbar";
import AppMenu from "@/components/layout/AppMenu";
import AppFooter from "@/components/layout/AppFooter";
import { menuData } from "@/lib/menuData";
import "@/styles/layout.scss";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [layoutMode] = useState("static");
  const [menuActive, setMenuActive] = useState(false);
  const [staticMenuInactive, setStaticMenuInactive] = useState(false);
  const [overlayMenuActive, setOverlayMenuActive] = useState(false);
  const [mobileMenuActive, setMobileMenuActive] = useState(false);

  const isDesktop = () => {
    return typeof window !== "undefined" && window.innerWidth >= 992;
  };

  const onWrapperClick = () => {
    if (!menuActive) {
      setOverlayMenuActive(false);
      setMobileMenuActive(false);
    }
    setMenuActive(false);
  };

  const onMenuToggle = (event: React.MouseEvent) => {
    setMenuActive(true);

    if (isDesktop()) {
      if (layoutMode === "overlay") {
        setOverlayMenuActive(!overlayMenuActive);
        setMobileMenuActive(false);
      } else if (layoutMode === "static") {
        setStaticMenuInactive(!staticMenuInactive);
      }
    } else {
      setMobileMenuActive(!mobileMenuActive);
    }

    event.preventDefault();
  };

  const onSidebarClick = () => {
    setMenuActive(true);
  };

  const onMenuItemClick = () => {
    setOverlayMenuActive(false);
    setMobileMenuActive(false);
  };

  useEffect(() => {
    if (mobileMenuActive) {
      document.body.classList.add("body-overflow-hidden");
    } else {
      document.body.classList.remove("body-overflow-hidden");
    }
  }, [mobileMenuActive]);

  const containerClass = `layout-wrapper ${
    layoutMode === "overlay" ? "layout-overlay" : ""
  } ${layoutMode === "static" ? "layout-static" : ""} ${
    staticMenuInactive && layoutMode === "static"
      ? "layout-static-sidebar-inactive"
      : ""
  } ${
    overlayMenuActive && layoutMode === "overlay"
      ? "layout-overlay-sidebar-active"
      : ""
  } ${mobileMenuActive ? "layout-mobile-sidebar-active" : ""}`;

  return (
    <div className={containerClass} onClick={onWrapperClick}>
      <AppTopbar onMenuToggle={onMenuToggle} />
      
      <div className="layout-sidebar" onClick={onSidebarClick}>
        <AppMenu model={menuData} onMenuItemClick={onMenuItemClick} />
      </div>

      <div className="layout-main-container">
        <div className="layout-main">{children}</div>
        <AppFooter />
      </div>

      {mobileMenuActive && (
        <div className="layout-mask p-component-overlay" />
      )}
    </div>
  );
}

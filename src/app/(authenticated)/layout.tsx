"use client";

import { useState, useEffect } from "react";
import AppMenu from "@/components/layout/AppMenu";
import AppFooter from "@/components/layout/AppFooter";
import Breadcrumb from "@/components/layout/Breadcrumb";
import KeyboardShortcuts from "@/components/shared/KeyboardShortcuts";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { menuData } from "@/lib/menuData";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuActive, setMenuActive] = useState(false);
  const [staticMenuInactive, setStaticMenuInactive] = useState(false);
  const [mobileMenuActive, setMobileMenuActive] = useState(false);

  const onWrapperClick = () => {
    if (!menuActive) {
      setMobileMenuActive(false);
    }
    setMenuActive(false);
  };

  const onSidebarClick = () => {
    setMenuActive(true);
  };

  const onMenuItemClick = () => {
    setMobileMenuActive(false);
  };

  useEffect(() => {
    if (mobileMenuActive) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [mobileMenuActive]);

  return (
    <ProtectedRoute>
      <KeyboardShortcuts />
      <div className="flex min-h-screen bg-gray-50" onClick={onWrapperClick}>
        {/* Mobile hamburger */}
        <button
          type="button"
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-100 lg:hidden"
          onClick={(e) => {
            e.stopPropagation();
            setMobileMenuActive(!mobileMenuActive);
          }}
        >
          <i className="pi pi-bars text-gray-600 text-lg" />
        </button>

        {/* Sidebar */}
        <div
          className={`fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 z-40 ${
            mobileMenuActive ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 ${staticMenuInactive ? "lg:-translate-x-full" : ""}`}
          onClick={onSidebarClick}
        >
          <AppMenu model={menuData} onMenuItemClick={onMenuItemClick} />
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ${
            staticMenuInactive ? "lg:ml-0" : "lg:ml-64"
          }`}
        >
          <div className="min-h-screen">
            <div className="p-6">
              <Breadcrumb />
              {children}
            </div>
            <AppFooter />
          </div>
        </div>

        {/* Mobile Overlay */}
        {mobileMenuActive && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setMobileMenuActive(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

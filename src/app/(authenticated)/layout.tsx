"use client";

import { useState, useEffect } from "react";
import AppMenu from "@/components/layout/AppMenu";
import Breadcrumb from "@/components/layout/Breadcrumb";
import KeyboardShortcuts from "@/components/shared/KeyboardShortcuts";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ConnectionStatus from "@/components/shared/ConnectionStatus";
import { menuData } from "@/lib/menuData";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuActive, setMenuActive] = useState(false);
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
      <ConnectionStatus />
      <div className="flex h-screen overflow-hidden" onClick={onWrapperClick}>
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
          className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#E1E4EA] flex-shrink-0 transform transition-transform duration-300 z-40 ${
            mobileMenuActive ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:relative lg:transform-none`}
          onClick={onSidebarClick}
        >
          <AppMenu model={menuData} onMenuItemClick={onMenuItemClick} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <main className="flex-1 overflow-y-auto bg-[#FBFBFB] w-full">
            <div className="px-3 py-4 md:px-5 md:py-5 flex flex-col gap-4 w-full">
              <Breadcrumb />
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Overlay */}
        {mobileMenuActive && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setMobileMenuActive(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

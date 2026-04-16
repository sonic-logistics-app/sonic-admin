"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import AdminAuth from "@/lib/auth/admin-auth";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { BreadCrumb } from "primereact/breadcrumb";
import { useRef } from "react";

interface AppTopbarProps {
  onMenuToggle: (event: React.MouseEvent) => void;
}

export default function AppTopbar({ onMenuToggle }: AppTopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = AdminAuth.getUser();
  const menu = useRef<Menu>(null);

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Dashboard", url: "/dashboard" }];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");

      breadcrumbs.push({
        label,
        url: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();
  const breadcrumbHome = { icon: "pi pi-home", url: "/dashboard" };

  const userMenuItems = [
    {
      label: "Profile",
      icon: "pi pi-user",
      command: () => {
        router.push("/profile");
      },
    },
    {
      label: "Settings",
      icon: "pi pi-cog",
      command: () => {
        router.push("/settings");
      },
    },
    {
      separator: true,
    },
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: async () => {
        await AdminAuth.logout();
        router.push("/login");
      },
    },
  ];

  const toggleUserMenu = (event: React.MouseEvent) => {
    menu.current?.toggle(event);
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white">
      <Link href="/dashboard" className="flex items-center space-x-3">
        <Image
          src="/images/logo-dark.svg"
          alt="Logo"
          width={47}
          height={35}
          priority
        />
        <span className="text-xl font-bold text-gray-800">SONIC ADMIN</span>
      </Link>

      {/* Breadcrumb Navigation */}
      <div className="hidden md:block flex-1 mx-4">
        <BreadCrumb
          model={breadcrumbItems}
          home={breadcrumbHome}
          className="p-0 bg-transparent border-none"
        />
      </div>

      <div className="flex items-center space-x-2">
        {/* Mobile Menu Button */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          onClick={onMenuToggle}
          type="button"
        >
          <i className="pi pi-bars text-gray-600" />
        </button>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-4">
          <button 
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-600"
            type="button"
            title="Keyboard Shortcuts: Alt+H (Home), Alt+U (Users), Alt+D (Drivers), Alt+V (Vendors), Alt+O (Orders), Cmd/Ctrl+K (Search)"
          >
            <i className="pi pi-question-circle" />
            <span>Help</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-600" type="button">
            <i className="pi pi-calendar" />
            <span>Events</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-600" type="button">
            <i className="pi pi-cog" />
            <span>Settings</span>
          </button>
          
          <button
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-600"
            type="button"
            onClick={toggleUserMenu}
          >
            <i className="pi pi-user" />
            <span>
              {user ? `${user.first_name} ${user.last_name}` : "Profile"}
            </span>
          </button>
        </div>
        
        <Menu model={userMenuItems} popup ref={menu} />
      </div>
    </div>
  );
}

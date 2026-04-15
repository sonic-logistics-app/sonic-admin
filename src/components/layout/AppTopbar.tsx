"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useRef } from "react";

interface AppTopbarProps {
  onMenuToggle: (event: React.MouseEvent) => void;
}

export default function AppTopbar({ onMenuToggle }: AppTopbarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const menu = useRef<Menu>(null);

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
        // Navigate to settings page when implemented
        console.log("Settings clicked");
      },
    },
    {
      separator: true,
    },
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: async () => {
        await logout();
        router.push("/login");
      },
    },
  ];

  const toggleUserMenu = (event: React.MouseEvent) => {
    menu.current?.toggle(event);
  };

  return (
    <div className="layout-topbar">
      <Link href="/" className="layout-topbar-logo">
        <Image
          src="/images/logo-dark.svg"
          alt="Logo"
          width={47}
          height={35}
          priority
        />
        <span>SONIC ADMIN</span>
      </Link>
      
      <button
        className="p-link layout-menu-button layout-topbar-button"
        onClick={onMenuToggle}
        type="button"
      >
        <i className="pi pi-bars" />
      </button>

      <button
        className="p-link layout-topbar-menu-button layout-topbar-button"
        type="button"
      >
        <i className="pi pi-ellipsis-v" />
      </button>

      <ul className="layout-topbar-menu hidden lg:flex origin-top">
        <li>
          <button className="p-link layout-topbar-button" type="button">
            <i className="pi pi-calendar" />
            <span>Events</span>
          </button>
        </li>
        <li>
          <button className="p-link layout-topbar-button" type="button">
            <i className="pi pi-cog" />
            <span>Settings</span>
          </button>
        </li>
        <li>
          <button 
            className="p-link layout-topbar-button" 
            type="button"
            onClick={toggleUserMenu}
          >
            <i className="pi pi-user" />
            <span>{user ? `${user.first_name} ${user.last_name}` : "Profile"}</span>
          </button>
          <Menu model={userMenuItems} popup ref={menu} />
        </li>
      </ul>
    </div>
  );
}

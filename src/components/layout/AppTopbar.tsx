"use client";

import Link from "next/link";
import Image from "next/image";

interface AppTopbarProps {
  onMenuToggle: (event: React.MouseEvent) => void;
}

export default function AppTopbar({ onMenuToggle }: AppTopbarProps) {
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
          <button className="p-link layout-topbar-button" type="button">
            <i className="pi pi-user" />
            <span>Profile</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

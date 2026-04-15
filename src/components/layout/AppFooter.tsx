"use client";

import Image from "next/image";

export default function AppFooter() {
  return (
    <div className="layout-footer">
      <Image
        src="/images/logo-dark.svg"
        alt="Logo"
        height={20}
        width={27}
        className="mr-2"
      />
      by
      <span className="font-medium ml-2">Sonic Mega Logistics</span>
    </div>
  );
}

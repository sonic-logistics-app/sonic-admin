"use client";

import Image from "next/image";

export default function AppFooter() {
  return (
    <div className="flex items-center justify-center py-4 px-6 bg-white border-t text-sm text-gray-600">
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

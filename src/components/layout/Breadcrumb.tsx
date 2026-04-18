"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  user: "Users",
  driver: "Drivers",
  vendor: "Vendors",
  order: "Orders",
  voucher: "Vouchers",
  faq: "FAQ",
  support: "Support",
  profile: "Profile",
  create: "Create",
  "api-docs": "API Documentation",
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const breadcrumbs: BreadcrumbItem[] = [];

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const href = `/${segments.slice(0, index + 1).join("/")}`;

    if (!isNaN(Number(segment))) {
      breadcrumbs.push({ label: `#${segment}` });
      return;
    }

    const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, href: isLast ? undefined : href });
  });

  return (
    <nav className="flex mb-2" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-2 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-[16px] text-gray-500 hover:text-gray-700 no-underline"
          >
            <i className="pi pi-home text-[18px]" />
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={index}>
            <li>
              <div className="flex items-center">
                <i className="pi pi-angle-right text-gray-400 text-[16px]" />
              </div>
            </li>
            <li className="inline-flex items-center">
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-[16px] font-medium text-gray-500 hover:text-gray-700 no-underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[16px] font-semibold text-gray-900">
                  {crumb.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

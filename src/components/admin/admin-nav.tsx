"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Settings" },
] as const;

/**
 * Admin navigation. The active-link highlight needs the pathname, which is
 * request data on dynamic routes, so it streams in behind Suspense while a
 * plain version of the same links is prerendered.
 */
export function AdminNav() {
  return (
    <Suspense fallback={<NavLinks pathname={null} />}>
      <ActiveNavLinks />
    </Suspense>
  );
}

function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Admin" className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
      {links.map((link) => {
        const active =
          pathname !== null &&
          (link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white",
              active && "bg-white/15 text-white",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoIcon } from "@/components/layout/logo";
import { siteConfig } from "@/lib/config";
import { signOut } from "../login/actions";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50">
      <header className="bg-brand-dark text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 font-bold">
              <LogoIcon className="size-7" />
              {siteConfig.name} <span className="font-normal text-brand-accent">Admin</span>
            </Link>
            <div className="flex items-center gap-1 md:hidden">
              <HeaderActions />
            </div>
          </div>
          <AdminNav />
          <div className="ml-auto hidden items-center gap-1 md:flex">
            <HeaderActions />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

function HeaderActions() {
  const itemClass =
    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white";
  return (
    <>
      <Link href="/" target="_blank" className={itemClass}>
        <ExternalLink className="size-4" />
        <span className="hidden sm:inline">View shop</span>
      </Link>
      <form action={signOut}>
        <button type="submit" className={itemClass}>
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </form>
    </>
  );
}

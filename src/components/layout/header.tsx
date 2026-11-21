import Link from "next/link";
import { mainNav } from "@/lib/config";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-muted hover:text-brand-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <SearchBar className="ml-auto hidden w-full max-w-sm md:block" />

        <div className="ml-auto md:ml-0">
          <CartButton />
        </div>
      </div>

      {/* Mobile: full-width search + quick links */}
      <div className="space-y-2 px-4 pb-3 md:hidden">
        <SearchBar />
        <nav aria-label="Main mobile" className="flex gap-4 text-sm font-medium text-slate-600">
          {mainNav.map((item) => (
            <Link key={item.href} href={item.href} className="py-1 hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";
import { mainNav } from "@/lib/config";
import { getCategories } from "@/lib/data/catalog";
import { CartButton } from "./cart-button";
import { CategoryMenu } from "./category-menu";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";

const desktopLink =
  "rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-muted hover:text-brand-dark";
const mobileLink = "py-1 text-sm font-medium text-slate-600 hover:text-primary";

/** Nav links with the Categories dropdown inserted right after "Shop". */
function NavItems({
  categories,
  linkClass,
}: {
  categories: Awaited<ReturnType<typeof getCategories>>;
  linkClass: string;
}) {
  return mainNav.map((item) => (
    <span key={item.href} className="contents">
      <Link href={item.href} className={linkClass}>
        {item.label}
      </Link>
      {item.href === "/shop" && <CategoryMenu categories={categories} triggerClassName={linkClass} />}
    </span>
  ));
}

export async function Header() {
  // Cached ("use cache" + tag), so this doesn't slow pages down; the admin
  // panel refreshes it whenever categories change.
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          <NavItems categories={categories} linkClass={desktopLink} />
        </nav>

        <SearchBar className="ml-auto hidden w-full max-w-sm md:block" />

        <div className="ml-auto md:ml-0">
          <CartButton />
        </div>
      </div>

      {/* Mobile: full-width search + quick links */}
      <div className="space-y-2 px-4 pb-3 md:hidden">
        <SearchBar />
        <nav aria-label="Main mobile" className="flex items-center gap-4">
          <NavItems categories={categories} linkClass={mobileLink} />
        </nav>
      </div>
    </header>
  );
}

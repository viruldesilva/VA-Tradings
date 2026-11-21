import Link from "next/link";
import type { Category } from "@/lib/types/database";
import { cn } from "@/lib/utils";

/** Horizontally scrollable category chips; keeps search + sort in the URL. */
export function CategoryFilter({
  categories,
  active,
  params,
}: {
  categories: Category[];
  active?: string;
  params: Record<string, string>;
}) {
  const hrefFor = (slug?: string) => {
    const next = new URLSearchParams(params);
    if (slug) next.set("category", slug);
    else next.delete("category");
    const qs = next.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  const chip = (isActive: boolean) =>
    cn(
      "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition-colors",
      isActive
        ? "bg-brand-dark text-white ring-brand-dark"
        : "bg-white text-slate-700 ring-foreground/10 hover:ring-primary hover:text-primary",
    );

  return (
    <nav aria-label="Categories" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <Link href={hrefFor()} className={chip(!active)} aria-current={!active ? "page" : undefined}>
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={hrefFor(c.slug)}
          className={chip(active === c.slug)}
          aria-current={active === c.slug ? "page" : undefined}
        >
          {c.name}
        </Link>
      ))}
    </nav>
  );
}

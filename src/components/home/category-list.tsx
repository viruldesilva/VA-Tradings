import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Category } from "@/lib/types/database";

export function CategoryList({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={`/shop?category=${category.slug}`}
            className="flex items-center justify-between rounded-xl bg-white px-4 py-4 font-medium text-brand-dark ring-1 ring-foreground/10 transition hover:text-primary hover:ring-primary"
          >
            {category.name}
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

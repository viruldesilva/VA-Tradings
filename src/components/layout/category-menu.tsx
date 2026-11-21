"use client";

import Link from "next/link";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { ChevronDown, LayoutGrid } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Category } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const itemClass =
  "flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-slate-700 outline-hidden select-none data-highlighted:bg-muted data-highlighted:text-brand-dark";

/** "Categories" dropdown in the header; each item links to /shop?category=… */
export function CategoryMenu({
  categories,
  triggerClassName,
}: {
  categories: Pick<Category, "id" | "name" | "slug">[];
  triggerClassName?: string;
}) {
  if (categories.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:text-brand-dark",
          triggerClassName,
        )}
      >
        Categories
        <ChevronDown className="size-4 transition-transform in-data-popup-open:rotate-180" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60 p-1.5">
        <MenuPrimitive.LinkItem
          closeOnClick
          render={<Link href="/shop" />}
          className={cn(itemClass, "gap-2 font-medium")}
        >
          <LayoutGrid className="size-4 text-primary" aria-hidden />
          All products
        </MenuPrimitive.LinkItem>
        <DropdownMenuSeparator />
        {categories.map((category) => (
          <MenuPrimitive.LinkItem
            key={category.id}
            closeOnClick
            render={<Link href={`/shop?category=${category.slug}`} />}
            className={itemClass}
          >
            {category.name}
          </MenuPrimitive.LinkItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

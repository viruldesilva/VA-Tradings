"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PRODUCT_SORTS, type ProductSort } from "@/lib/data/catalog-options";

/** Changes ?sort= while keeping the other filters. */
export function SortSelect({ value, params }: { value: ProductSort; params: Record<string, string> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(sort: string) {
    const next = new URLSearchParams(params);
    if (sort === "newest") next.delete("sort");
    else next.set("sort", sort);
    const qs = next.toString();
    startTransition(() => router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false }));
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Sort</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={pending}
        className="h-9 rounded-lg border border-input bg-white px-2 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
      >
        {PRODUCT_SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}

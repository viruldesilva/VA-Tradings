import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  brands: string[];
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Other active filters (q, category, sort) to preserve when applying. */
  params: Record<string, string>;
};

/** Brand + price-range filter. A plain GET form, so it works without JavaScript. */
export function ShopFilters({ brands, brand, minPrice, maxPrice, params }: Props) {
  const active = Boolean(brand || minPrice !== undefined || maxPrice !== undefined);
  const clearQs = new URLSearchParams(params).toString();
  const field =
    "h-9 rounded-lg border border-input bg-white px-2 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

  return (
    <form
      action="/shop"
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-3 ring-1 ring-foreground/10"
    >
      {Object.entries(params).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {brands.length > 0 && (
        <label className="grid gap-1 text-xs text-muted-foreground">
          Brand
          <select name="brand" defaultValue={brand ?? ""} className={`${field} min-w-36`}>
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="grid gap-1 text-xs text-muted-foreground">
        Price (Rs.)
        <div className="flex items-center gap-2">
          <input
            name="min"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            placeholder="Min"
            defaultValue={minPrice ?? ""}
            aria-label="Minimum price"
            className={`${field} w-24`}
          />
          <span aria-hidden>–</span>
          <input
            name="max"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            placeholder="Max"
            defaultValue={maxPrice ?? ""}
            aria-label="Maximum price"
            className={`${field} w-24`}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" className="h-9">
          Apply
        </Button>
        {active && (
          <Link
            href={clearQs ? `/shop?${clearQs}` : "/shop"}
            className="text-sm text-primary hover:underline"
          >
            Clear filters
          </Link>
        )}
      </div>
    </form>
  );
}

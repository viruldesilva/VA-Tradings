import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PriceSlider } from "./price-slider";

const STEP = 100;

type Props = {
  brands: string[];
  brand?: string;
  /** Cheapest / most expensive visible product, or null when the shop is empty. */
  priceBounds: { min: number; max: number } | null;
  minPrice?: number;
  maxPrice?: number;
  /** Other active filters (q, category, sort) to preserve when applying. */
  params: Record<string, string>;
};

/** Brand + price-range filter. A plain GET form; the slider submits it on release. */
export function ShopFilters({ brands, brand, priceBounds, minPrice, maxPrice, params }: Props) {
  const active = Boolean(brand || minPrice !== undefined || maxPrice !== undefined);
  const clearQs = new URLSearchParams(params).toString();

  const lo = priceBounds ? Math.floor(priceBounds.min / STEP) * STEP : 0;
  const hi = priceBounds ? Math.ceil(priceBounds.max / STEP) * STEP : 0;
  const showSlider = hi - lo >= STEP * 2;

  if (!showSlider && brands.length === 0) return null;

  return (
    <form
      action="/shop"
      method="get"
      className="flex flex-wrap items-end gap-x-6 gap-y-4 rounded-xl bg-white p-4 ring-1 ring-foreground/10"
    >
      {Object.entries(params).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {showSlider && (
        <PriceSlider
          // Remount when the URL's range changes (e.g. "Clear filters") so state resets.
          key={`${lo}-${hi}-${minPrice ?? ""}-${maxPrice ?? ""}`}
          min={lo}
          max={hi}
          step={STEP}
          valueMin={minPrice}
          valueMax={maxPrice}
        />
      )}

      {brands.length > 0 && (
        <label className="grid gap-1.5 text-xs text-muted-foreground">
          Brand
          <select
            name="brand"
            defaultValue={brand ?? ""}
            className="h-9 min-w-36 rounded-lg border border-input bg-white px-2 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex items-center gap-3">
        {brands.length > 0 && (
          <Button type="submit" className="h-9">
            Apply
          </Button>
        )}
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

import { Skeleton } from "@/components/ui/skeleton";
import type { ShopProduct } from "@/lib/data/catalog";
import { ProductCard } from "./product-card";

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4";

export function ProductGrid({
  products,
  priorityCount = 0,
  headingLevel,
}: {
  products: ShopProduct[];
  /** Number of above-the-fold images to load eagerly. */
  priorityCount?: number;
  headingLevel?: 2 | 3;
}) {
  return (
    <div className={GRID}>
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < priorityCount} headingLevel={headingLevel} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={GRID} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl bg-white ring-1 ring-foreground/10">
          <Skeleton className="aspect-square rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

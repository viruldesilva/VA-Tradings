import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { CategoryFilter } from "@/components/shop/category-filter";
import { SortSelect } from "@/components/shop/sort-select";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories, getProducts } from "@/lib/data/catalog";
import { parseSort } from "@/lib/data/catalog-options";

type ShopSearchParams = PageProps<"/shop">["searchParams"];

async function readFilters(searchParams: ShopSearchParams) {
  const sp = await searchParams;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  return {
    q: str(sp.q)?.slice(0, 100),
    category: str(sp.category),
    sort: parseSort(sp.sort),
  };
}

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const { q, category } = await readFilters(searchParams);
  const categoryName = category
    ? (await getCategories()).find((c) => c.slug === category)?.name
    : undefined;

  return {
    title: q ? `Search: ${q}` : (categoryName ?? "Shop all products"),
    description: categoryName
      ? `Buy ${categoryName.toLowerCase()} online in Sri Lanka. Cash on Delivery island-wide.`
      : "Browse all tech accessories. Cash on Delivery island-wide in Sri Lanka.",
    alternates: { canonical: category ? `/shop?category=${category}` : "/shop" },
    robots: q ? { index: false, follow: true } : undefined,
  };
}

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<ShopSkeleton />}>
        <ShopContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ShopContent({ searchParams }: { searchParams: ShopSearchParams }) {
  const { q, category, sort } = await readFilters(searchParams);
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: category, search: q, sort }),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);
  const params: Record<string, string> = {};
  if (q) params.q = q;
  if (activeCategory) params.category = activeCategory.slug;
  if (sort !== "newest") params.sort = sort;

  const title = q ? `Results for “${q}”` : (activeCategory?.name ?? "All products");

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "product" : "products"}
            {q && (
              <>
                {" · "}
                <Link
                  href={activeCategory ? `/shop?category=${activeCategory.slug}` : "/shop"}
                  className="text-primary hover:underline"
                >
                  Clear search
                </Link>
              </>
            )}
          </p>
        </div>
        <SortSelect value={sort} params={params} />
      </div>

      {categories.length > 0 && (
        <div className="mb-6">
          <CategoryFilter categories={categories} active={activeCategory?.slug} params={params} />
        </div>
      )}

      {products.length > 0 ? (
        <ProductGrid products={products} priorityCount={4} headingLevel={2} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-12 text-center ring-1 ring-foreground/10">
          <SearchX className="size-10 text-slate-300" aria-hidden />
          <p className="font-medium text-brand-dark">No products found</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try a different search or category, or message us on WhatsApp and we&apos;ll find it for
            you.
          </p>
          <Link href="/shop" className="text-sm font-semibold text-primary hover:underline">
            View all products
          </Link>
        </div>
      )}
    </>
  );
}

function ShopSkeleton() {
  return (
    <>
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-6 h-4 w-24" />
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <ProductGridSkeleton />
    </>
  );
}

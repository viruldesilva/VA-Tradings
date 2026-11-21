import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Banknote, ChevronRight, Truck } from "lucide-react";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPurchase } from "@/components/product/product-purchase";
import { ProductWarranty } from "@/components/product/product-warranty";
import { SectionHeading } from "@/components/shop/section-heading";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductBySlug, getRelatedProducts, type ShopProduct } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { getSiteUrl } from "@/lib/env";
import { formatLKR } from "@/lib/format";
import { JsonLd } from "@/lib/seo/json-ld";
import { siteConfig } from "@/lib/config";

type Params = PageProps<"/product/[slug]">["params"];

const summarize = (text: string, max = 160) => {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
};

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const description =
    summarize(product.description) ||
    `Buy ${product.name} for ${formatLKR(product.price)}. Cash on Delivery island-wide in Sri Lanka.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: product.name, description, url: `/product/${product.slug}` },
  };
}

export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetails({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, related] = await Promise.all([getSettings(), getRelatedProducts(product)]);
  const productUrl = `${getSiteUrl()}/product/${product.slug}`;

  return (
    <>
      <ProductJsonLd product={product} url={productUrl} />
      <Breadcrumbs product={product} />

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <p className="text-2xl font-bold text-brand-dark">{formatLKR(product.price)}</p>
              {product.in_stock ? (
                <Badge className="bg-green-100 text-green-800">In stock</Badge>
              ) : (
                <Badge variant="destructive">Out of stock</Badge>
              )}
            </div>
          </div>

          <ProductWarranty warrantyMonths={product.warranty_months} condition={product.condition} />

          <ProductPurchase
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images[0] ?? null,
              inStock: product.in_stock,
            }}
            productUrl={productUrl}
            whatsappNumber={settings.whatsapp_number}
          />

          <ul className="grid gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <Truck className="size-4 text-primary" aria-hidden />
              Island-wide delivery
              {settings.delivery_fee > 0 && <> · {formatLKR(settings.delivery_fee)}</>}
            </li>
            <li className="flex items-center gap-2">
              <Banknote className="size-4 text-primary" aria-hidden />
              Cash on Delivery available
            </li>
          </ul>

          {product.description && (
            <section>
              <h2 className="mb-2 font-semibold text-brand-dark">Description</h2>
              <div className="text-sm leading-relaxed whitespace-pre-line text-slate-700">
                {product.description}
              </div>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeading
            title="You may also like"
            href={`/shop?category=${product.categories?.slug}`}
          />
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}

function Breadcrumbs({ product }: { product: ShopProduct }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/shop" className="hover:text-primary">
            Shop
          </Link>
        </li>
        {product.categories && (
          <>
            <ChevronRight className="size-3.5" aria-hidden />
            <li>
              <Link href={`/shop?category=${product.categories.slug}`} className="hover:text-primary">
                {product.categories.name}
              </Link>
            </li>
          </>
        )}
        <ChevronRight className="size-3.5" aria-hidden />
        <li aria-current="page" className="line-clamp-1 text-brand-dark">
          {product.name}
        </li>
      </ol>
    </nav>
  );
}

function ProductJsonLd({ product, url }: { product: ShopProduct; url: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: summarize(product.description, 500) || undefined,
        image: product.images,
        url,
        category: product.categories?.name,
        brand: { "@type": "Brand", name: siteConfig.name },
        offers: {
          "@type": "Offer",
          price: product.price.toFixed(2),
          priceCurrency: "LKR",
          itemCondition: {
            new: "https://schema.org/NewCondition",
            used: "https://schema.org/UsedCondition",
            refurbished: "https://schema.org/RefurbishedCondition",
          }[product.condition],
          availability: product.in_stock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url,
        },
      }}
    />
  );
}

function ProductSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      <Skeleton className="aspect-square rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

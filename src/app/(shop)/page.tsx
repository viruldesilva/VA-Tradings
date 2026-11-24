import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/shop/section-heading";
import { getProducts } from "@/lib/data/catalog";

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
        <LatestProducts />
      </div>
    </>
  );
}

async function LatestProducts() {
  const products = await getProducts({ limit: 8 });

  return (
    <section>
      <SectionHeading title="New arrivals" href="/shop" />
      {products.length > 0 ? (
        <ProductGrid products={products} priorityCount={2} />
      ) : (
        <p className="rounded-xl bg-white p-10 text-center text-muted-foreground ring-1 ring-foreground/10">
          New products are coming soon. Message us on WhatsApp for anything you need, or{" "}
          <Link href="/shop" className="text-primary underline">
            browse the shop
          </Link>
          .
        </p>
      )}
    </section>
  );
}

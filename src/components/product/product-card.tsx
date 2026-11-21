import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { ShopProduct } from "@/lib/data/catalog";
import { formatLKR } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  priority,
  headingLevel = 3,
}: {
  product: ShopProduct;
  priority?: boolean;
  /** Use 2 when the grid sits directly under the page's h1. */
  headingLevel?: 2 | 3;
}) {
  const cover = product.images[0];
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-slate-100">
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            priority={priority}
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-105",
              !product.in_stock && "opacity-60",
            )}
          />
        ) : (
          <ImageOff className="absolute inset-0 m-auto size-8 text-slate-300" aria-hidden />
        )}
        {!product.in_stock && (
          <span className="absolute top-2 left-2 rounded-full bg-brand-dark/85 px-2 py-0.5 text-[11px] font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.categories && (
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {product.categories.name}
          </p>
        )}
        <Heading className="line-clamp-2 text-sm font-medium text-brand-dark group-hover:text-primary">
          {product.name}
        </Heading>
        <p className="mt-auto pt-1 font-bold text-brand-dark">{formatLKR(product.price)}</p>
      </div>
    </Link>
  );
}

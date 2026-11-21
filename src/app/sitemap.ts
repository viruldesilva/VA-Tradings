import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data/catalog";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ limit: 5000 }),
  ]);

  const staticPages = ["", "/shop", "/about", "/contact", "/delivery", "/returns", "/privacy", "/terms"];

  return [
    ...staticPages.map((path) => ({ url: `${base}${path}` })),
    ...categories.map((c) => ({ url: `${base}/shop?category=${c.slug}` })),
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.created_at,
      images: p.images.slice(0, 1),
    })),
  ];
}

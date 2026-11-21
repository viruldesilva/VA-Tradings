import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config";
import { getProductBySlug } from "@/lib/data/catalog";
import { formatLKR } from "@/lib/format";

export const alt = "Product photo and price";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The OG renderer supports PNG/JPEG but not WebP/AVIF.
const isRenderable = (url?: string) => !!url && /\.(png|jpe?g)$/i.test(url);

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  const photo = product?.images.find(isRenderable);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0F172A", color: "white" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 700 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 12, background: "#2563EB" }}>
              {siteConfig.shortName}
            </div>
            {siteConfig.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ fontSize: product && product.name.length > 40 ? 48 : 60, fontWeight: 700, lineHeight: 1.1 }}>
              {product?.name ?? siteConfig.tagline}
            </div>
            {product && (
              <div style={{ display: "flex" }}>
                <div style={{ background: "#FACC15", color: "#0F172A", fontSize: 44, fontWeight: 700, padding: "8px 24px", borderRadius: 16 }}>
                  {formatLKR(product.price)}
                </div>
              </div>
            )}
          </div>
          <div style={{ fontSize: 26, color: "#94A3B8" }}>Cash on Delivery · Island-wide delivery</div>
        </div>
        {photo && (
          <div style={{ display: "flex", width: 520, height: "100%", background: "white", alignItems: "center", justifyContent: "center" }}>
            <img src={photo} alt="" width={520} height={630} style={{ objectFit: "contain" }} />
          </div>
        )}
      </div>
    ),
    size,
  );
}

import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config";

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 32, width: "100%", height: "100%", padding: 80, background: "#0F172A", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 700 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 16, background: "#2563EB" }}>
            {siteConfig.shortName}
          </div>
          {siteConfig.name}
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>{siteConfig.tagline}</div>
        <div style={{ display: "flex" }}>
          <div style={{ background: "#FACC15", color: "#0F172A", fontSize: 32, fontWeight: 700, padding: "10px 24px", borderRadius: 14 }}>
            Cash on Delivery island-wide
          </div>
        </div>
      </div>
    ),
    size,
  );
}

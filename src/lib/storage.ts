/** Helpers for the product-images Supabase Storage bucket (safe on client and server). */

export const PRODUCT_IMAGES_BUCKET = "product-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGES_PER_PRODUCT = 10;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const PUBLIC_PREFIX = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;

/** Public URL → object path inside the bucket, or null if it isn't one of ours. */
export function storagePathFromUrl(url: string): string | null {
  try {
    const { pathname, origin } = new URL(url);
    if (origin !== new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin) return null;
    if (!pathname.startsWith(PUBLIC_PREFIX)) return null;
    return decodeURIComponent(pathname.slice(PUBLIC_PREFIX.length));
  } catch {
    return null;
  }
}

export function isProductImageUrl(url: string): boolean {
  return storagePathFromUrl(url) !== null;
}

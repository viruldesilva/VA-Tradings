"use client";

import Image from "next/image";
import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_PRODUCT,
  PRODUCT_IMAGES_BUCKET,
  storagePathFromUrl,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

type Props = {
  images: string[];
  onChange: Dispatch<SetStateAction<string[]>>;
  error?: string;
};

/**
 * Uploads straight from the browser to Supabase Storage (admin session + RLS),
 * then keeps an ordered list of public URLs. The first image is the cover.
 */
export function ImageUploader({ images, onChange, error }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Images uploaded in this session and not yet saved: safe to delete right away.
  const unsaved = useRef(new Set<string>());

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploadError(null);

    const room = MAX_IMAGES_PER_PRODUCT - images.length;
    const files = Array.from(fileList);
    const problems: string[] = [];
    if (files.length > room) problems.push(`Only ${MAX_IMAGES_PER_PRODUCT} images allowed.`);

    const valid = files.slice(0, Math.max(room, 0)).filter((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        problems.push(`${file.name}: use JPG, PNG, WebP or AVIF.`);
        return false;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        problems.push(`${file.name}: larger than 5 MB.`);
        return false;
      }
      return true;
    });

    setUploading((n) => n + valid.length);
    const urls = await Promise.all(
      valid.map(async (file) => {
        const path = `products/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
        const { error } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(path, file, { cacheControl: "31536000", contentType: file.type });
        setUploading((n) => n - 1);
        if (error) {
          problems.push(`${file.name}: upload failed (${error.message}).`);
          return null;
        }
        const url = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
        unsaved.current.add(url);
        return url;
      }),
    );

    const uploaded = urls.filter((u): u is string => u !== null);
    if (uploaded.length) onChange((prev) => [...prev, ...uploaded]);
    if (problems.length) setUploadError(problems.join(" "));
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(url: string) {
    onChange((prev) => prev.filter((u) => u !== url));
    // Previously saved images are deleted from storage when the product is saved.
    if (unsaved.current.has(url)) {
      unsaved.current.delete(url);
      const path = storagePathFromUrl(url);
      if (path) void supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
    }
  }

  function move(index: number, direction: -1 | 1) {
    onChange((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const canAdd = images.length + uploading < MAX_IMAGES_PER_PRODUCT;

  return (
    <div className="grid gap-2">
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((url, i) => (
          <li
            key={url}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10"
          >
            <Image src={url} alt={`Product image ${i + 1}`} fill sizes="160px" className="object-cover" />
            {i === 0 && (
              <span className="absolute top-1 left-1 rounded bg-brand-dark/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                Cover
              </span>
            )}
            <Button
              type="button"
              size="icon-xs"
              variant="secondary"
              aria-label={`Remove image ${i + 1}`}
              onClick={() => remove(url)}
              className="absolute top-1 right-1 bg-white/90"
            >
              <X />
            </Button>
            <div className="absolute inset-x-1 bottom-1 flex justify-between">
              <Button
                type="button"
                size="icon-xs"
                variant="secondary"
                aria-label={`Move image ${i + 1} left`}
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className="bg-white/90"
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                size="icon-xs"
                variant="secondary"
                aria-label={`Move image ${i + 1} right`}
                disabled={i === images.length - 1}
                onClick={() => move(i, 1)}
                className="bg-white/90"
              >
                <ChevronRight />
              </Button>
            </div>
          </li>
        ))}

        {Array.from({ length: uploading }, (_, i) => (
          <li
            key={`uploading-${i}`}
            className="grid aspect-square place-items-center rounded-lg bg-muted ring-1 ring-foreground/10"
          >
            <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Uploading" />
          </li>
        ))}

        {canAdd && (
          <li>
            <label
              className={cn(
                "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                "focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/50",
              )}
            >
              <ImagePlus className="size-6" />
              Add images
              <input
                ref={inputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                multiple
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          </li>
        )}
      </ul>

      {(uploadError || error) && (
        <p className="text-sm text-destructive">{uploadError ?? error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Up to {MAX_IMAGES_PER_PRODUCT} images, 5 MB each. The first image is the cover; use the
        arrows to reorder.
      </p>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="grid gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
        {current ? (
          <Image
            key={current}
            src={current}
            alt={images.length > 1 ? `${name}, photo ${active + 1} of ${images.length}` : name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            priority={active === 0}
            className="object-contain"
          />
        ) : (
          <ImageOff className="absolute inset-0 m-auto size-12 text-slate-300" aria-hidden />
        )}
      </div>

      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Product photos">
          {images.map((url, i) => (
            <li key={url} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-lg bg-slate-100 ring-2 ring-transparent transition sm:size-20",
                  i === active ? "ring-primary" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

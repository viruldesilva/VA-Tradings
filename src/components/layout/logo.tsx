import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex shrink-0 items-center gap-2 font-bold tracking-tight", className)}
    >
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm text-white">
        <span aria-hidden>{siteConfig.shortName}</span>
      </span>
      <span className="text-lg text-brand-dark">{siteConfig.name}</span>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import logoIcon from "../../../public/brand/va-icon.png";

/** Brand icon on its own (decorative: pair it with the shop name nearby). */
export function LogoIcon({ className }: { className?: string }) {
  return <Image src={logoIcon} alt="" priority className={cn("size-9", className)} />;
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex shrink-0 items-center gap-2 font-bold tracking-tight", className)}
    >
      <LogoIcon />
      <span className="text-lg text-brand-dark">{siteConfig.name}</span>
    </Link>
  );
}

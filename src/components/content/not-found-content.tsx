import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold text-brand-dark">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        This page or product doesn&apos;t exist, or it may have been removed.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/shop" className={buttonVariants({ className: "h-10 px-5" })}>
          Browse the shop
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline", className: "h-10 px-5" })}>
          Home
        </Link>
      </div>
    </div>
  );
}

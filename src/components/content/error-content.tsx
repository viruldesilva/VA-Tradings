"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

export function ErrorContent({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-brand-dark">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        Sorry, we couldn&apos;t load this page. Please try again. If it keeps happening, contact us on
        WhatsApp.
      </p>
      {error.digest && <p className="mt-2 text-xs text-muted-foreground">Reference: {error.digest}</p>}
      <div className="mt-6 flex gap-3">
        <Button onClick={() => retry()} className="h-10 px-5">
          Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline", className: "h-10 px-5" })}>
          Home
        </Link>
      </div>
    </div>
  );
}

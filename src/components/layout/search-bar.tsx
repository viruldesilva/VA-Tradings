import Form from "next/form";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Submits to /shop?q=... with client-side navigation (next/form). */
export function SearchBar({ className }: { className?: string }) {
  return (
    <Form action="/shop" role="search" className={cn("relative", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        name="q"
        placeholder="Search chargers, cases, earbuds…"
        aria-label="Search products"
        className="h-10 rounded-full bg-muted pl-9 text-base md:text-sm"
      />
    </Form>
  );
}

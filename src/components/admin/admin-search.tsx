"use client";

import Form from "next/form";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/** GET search form that keeps the current ?q= value. Wrap in <Suspense>. */
export function AdminSearch({ action, placeholder }: { action: string; placeholder: string }) {
  const q = useSearchParams().get("q") ?? "";

  return (
    <Form action={action} role="search" className="relative w-full sm:max-w-xs">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        key={q}
        type="search"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        aria-label={placeholder}
        className="bg-white pl-8"
      />
    </Form>
  );
}

"use client";

import { ErrorContent } from "@/components/content/error-content";

export default function ShopError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorContent {...props} />;
}

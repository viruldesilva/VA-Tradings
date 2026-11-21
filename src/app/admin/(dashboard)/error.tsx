"use client";

import { ErrorContent } from "@/components/content/error-content";

export default function AdminError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorContent {...props} />;
}

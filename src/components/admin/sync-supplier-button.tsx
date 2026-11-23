"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerSupplierSync } from "@/app/admin/(dashboard)/products/actions";

export function SyncSupplierButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ message: string; ok: boolean } | null>(null);

  function handleSync() {
    setResult(null);
    startTransition(async () => {
      const res = await triggerSupplierSync();
      if (!res) {
        setResult({ message: "Sync finished.", ok: true });
        return;
      }
      setResult({ message: res.message ?? (res.ok ? "Synced successfully" : "Sync failed"), ok: res.ok });
      if (res.ok) {
        setTimeout(() => setResult(null), 6000);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={handleSync}
        className="h-9 gap-1.5"
      >
        <RefreshCw className={`size-4 ${pending ? "animate-spin text-primary" : ""}`} />
        <span>{pending ? "Syncing..." : "Sync Supplier Stock"}</span>
      </Button>
      {result && (
        <span
          className={`text-xs ${
            result.ok ? "text-green-600 font-medium" : "text-destructive"
          }`}
          role="status"
        >
          {result.message}
        </span>
      )}
    </div>
  );
}

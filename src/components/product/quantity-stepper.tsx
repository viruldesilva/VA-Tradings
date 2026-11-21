"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_QTY_PER_ITEM } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (qty: number) => void;
  disabled?: boolean;
  size?: "sm" | "default";
  label?: string;
};

export function QuantityStepper({ value, onChange, disabled, size = "default", label = "Quantity" }: Props) {
  const btn = cn(
    "grid place-items-center text-brand-dark transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent",
    size === "sm" ? "size-8" : "size-11",
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-lg border bg-white", disabled && "opacity-50")}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" />
      </button>
      <span
        className={cn("text-center font-semibold tabular-nums", size === "sm" ? "w-8 text-sm" : "w-10")}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= MAX_QTY_PER_ITEM}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

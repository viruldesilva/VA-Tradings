"use client";

import { useState } from "react";
import { formatLKR } from "@/lib/format";

type Props = {
  /** Lowest / highest possible price (rounded to `step`). */
  min: number;
  max: number;
  step?: number;
  /** Currently applied range, if any. */
  valueMin?: number;
  valueMax?: number;
};

const THUMB =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-md";

/**
 * Two-handle price slider inside a GET form. Applies when a handle is released;
 * only submits min/max when they differ from the full range (keeps URLs clean).
 */
export function PriceSlider({ min, max, step = 100, valueMin, valueMax }: Props) {
  const [low, setLow] = useState(clamp(valueMin ?? min, min, max));
  const [high, setHigh] = useState(clamp(valueMax ?? max, min, max));

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const submit = (el: HTMLInputElement) => el.form?.requestSubmit();

  return (
    <div className="grid min-w-56 flex-1 gap-1.5 sm:max-w-sm">
      <div className="flex items-baseline justify-between text-xs text-muted-foreground">
        <span>Price range</span>
        <span className="text-sm font-semibold text-primary">
          {formatLKR(low)} – {formatLKR(high)}
        </span>
      </div>

      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(e) => setLow(Math.min(Number(e.target.value), high - step))}
          onPointerUp={(e) => submit(e.currentTarget)}
          onKeyUp={(e) => submit(e.currentTarget)}
          className={`pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent focus-visible:outline-none [&::-webkit-slider-thumb]:focus-visible:ring-4 [&::-webkit-slider-thumb]:focus-visible:ring-ring/50 ${THUMB}`}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(e) => setHigh(Math.max(Number(e.target.value), low + step))}
          onPointerUp={(e) => submit(e.currentTarget)}
          onKeyUp={(e) => submit(e.currentTarget)}
          className={`pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent focus-visible:outline-none [&::-webkit-slider-thumb]:focus-visible:ring-4 [&::-webkit-slider-thumb]:focus-visible:ring-ring/50 ${THUMB}`}
        />
      </div>

      {/* Disabled inputs aren't submitted, so the URL only gets a bound that was changed. */}
      <input type="hidden" name="min" value={low} disabled={low <= min} />
      <input type="hidden" name="max" value={high} disabled={high >= max} />
    </div>
  );
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

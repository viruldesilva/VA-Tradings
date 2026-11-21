import Link from "next/link";
import { Banknote, MessageCircle, Truck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";

const perks = [
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: Truck, label: "Island-wide delivery" },
  { icon: MessageCircle, label: "WhatsApp support" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-dark text-white">
      <div
        aria-hidden
        className="absolute -top-24 -right-24 size-80 rounded-full bg-primary/40 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -left-16 size-72 rounded-full bg-brand-accent/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <p className="inline-block rounded-full bg-brand-accent px-3 py-1 text-xs font-semibold text-brand-dark">
          Pay when it arrives
        </p>
        <h1 className="mt-4 max-w-xl text-3xl leading-tight font-bold tracking-tight sm:text-5xl">
          {siteConfig.tagline}
        </h1>
        <p className="mt-4 max-w-lg text-slate-300">
          Chargers, cables, earbuds, phone cases and more, delivered to your door anywhere in Sri
          Lanka.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/shop" className={buttonVariants({ size: "lg", className: "h-11 px-6 text-base" })}>
            Shop now
          </Link>
          <Link
            href="/track"
            className={buttonVariants({
              size: "lg",
              variant: "outline",
              className: "h-11 border-white/30 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white",
            })}
          >
            Track my order
          </Link>
        </div>
        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
          {perks.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="size-4 text-brand-accent" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

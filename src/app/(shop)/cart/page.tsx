import { CartView } from "@/components/cart/cart-view";

export const metadata = { title: "Your cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">Your cart</h1>
      <CartView />
    </div>
  );
}

"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { cartStore, type CartItem } from "@/lib/cart/store";

type CartContextValue = {
  items: CartItem[];
  /** False during server render / hydration, when the saved cart isn't loaded yet. */
  hydrated: boolean;
  /** Total number of units in the cart. */
  count: number;
  /** Display-only subtotal (the server recalculates on checkout). */
  subtotal: number;
  addItem: typeof cartStore.add;
  setQty: typeof cartStore.setQty;
  removeItem: typeof cartStore.remove;
  clear: typeof cartStore.clear;
};

const subscribeNoop = () => () => {};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );

  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      count: items.reduce((sum, i) => sum + i.qty, 0),
      subtotal: items.reduce((sum, i) => sum + i.qty * i.price, 0),
      addItem: cartStore.add,
      setQty: cartStore.setQty,
      removeItem: cartStore.remove,
      clear: cartStore.clear,
    }),
    [items, hydrated],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

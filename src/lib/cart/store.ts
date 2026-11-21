/**
 * Cart storage in localStorage, exposed as an external store so React can
 * subscribe with useSyncExternalStore (hydration-safe, syncs across tabs).
 * Prices here are for display only; the server re-fetches real prices.
 */

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
};

export const MAX_QTY_PER_ITEM = 20;

const STORAGE_KEY = "cart:v1";
const EMPTY: CartItem[] = [];

let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.productId === "string" &&
    typeof v.slug === "string" &&
    typeof v.name === "string" &&
    typeof v.price === "number" &&
    typeof v.qty === "number" &&
    v.qty > 0
  );
}

function read(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(items: CartItem[]) {
  cache = items;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked (private mode): keep the in-memory cart.
  }
  listeners.forEach((listener) => listener());
}

const clampQty = (qty: number) =>
  Math.max(1, Math.min(MAX_QTY_PER_ITEM, Math.floor(qty)));

export const cartStore = {
  getSnapshot(): CartItem[] {
    return (cache ??= read());
  },

  getServerSnapshot(): CartItem[] {
    return EMPTY;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        cache = null;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },

  add(item: Omit<CartItem, "qty">, qty = 1) {
    const items = cartStore.getSnapshot();
    const existing = items.find((i) => i.productId === item.productId);
    write(
      existing
        ? items.map((i) =>
            i.productId === item.productId ? { ...i, ...item, qty: clampQty(i.qty + qty) } : i,
          )
        : [...items, { ...item, qty: clampQty(qty) }],
    );
  },

  setQty(productId: string, qty: number) {
    write(
      cartStore
        .getSnapshot()
        .map((i) => (i.productId === productId ? { ...i, qty: clampQty(qty) } : i)),
    );
  },

  remove(productId: string) {
    write(cartStore.getSnapshot().filter((i) => i.productId !== productId));
  },

  clear() {
    write(EMPTY);
  },

  /** Updates names/prices/images to what the server says is current. */
  syncFromServer(lines: { productId: string; name: string; price: number; image: string | null; available: boolean }[]) {
    const byId = new Map(lines.filter((l) => l.available).map((l) => [l.productId, l]));
    let changed = false;
    const next = cartStore.getSnapshot().map((item) => {
      const line = byId.get(item.productId);
      if (!line) return item;
      if (line.price === item.price && line.name === item.name && line.image === item.image) return item;
      changed = true;
      return { ...item, name: line.name, price: line.price, image: line.image };
    });
    if (changed) write(next);
  },
};

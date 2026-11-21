"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatLKR, whatsappUrl } from "@/lib/format";
import { QuantityStepper } from "./quantity-stepper";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string | null;
    inStock: boolean;
  };
  productUrl: string;
  whatsappNumber: string | null;
};

export function ProductPurchase({ product, productUrl, whatsappNumber }: Props) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      qty,
    );
    setAdded(true);
  }

  const whatsappMessage = [
    `Hi, I'd like to order:`,
    `${product.name} × ${qty} (${formatLKR(product.price * qty)})`,
    productUrl,
  ].join("\n");

  return (
    <div className="grid gap-3">
      {product.inStock && (
        <div className="flex items-center gap-3">
          <QuantityStepper
            value={qty}
            onChange={(q) => {
              setQty(q);
              setAdded(false);
            }}
          />
          <Button onClick={handleAdd} className="h-11 flex-1 text-base">
            {added ? <Check /> : <ShoppingCart />}
            {added ? "Added to cart" : "Add to cart"}
          </Button>
        </div>
      )}

      {added && (
        <p className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
          Added {qty} to your cart.
          <Link href="/cart" className="font-semibold underline">
            View cart
          </Link>
        </p>
      )}

      {!product.inStock && (
        <Button disabled className="h-11 text-base">
          Out of stock
        </Button>
      )}

      {whatsappNumber && (
        <a
          href={whatsappUrl(
            whatsappNumber,
            product.inStock
              ? whatsappMessage
              : `Hi, is ${product.name} coming back in stock?\n${productUrl}`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({
            variant: "outline",
            className: "h-11 border-[#25D366] bg-[#25D366]/10 text-base text-[#075E54] hover:bg-[#25D366]/20",
          })}
        >
          <WhatsAppIcon className="size-5" />
          {product.inStock ? "Order on WhatsApp" : "Ask on WhatsApp"}
        </a>
      )}
    </div>
  );
}

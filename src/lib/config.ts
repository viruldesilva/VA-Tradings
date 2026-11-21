/** Shop-wide constants. Change the name/tagline here and it updates everywhere. */
export const siteConfig = {
  name: "VA Tradings",
  tagline: "Tech accessories, delivered island-wide",
  description:
    "Phone cases, chargers, earbuds, cables and more. Island-wide delivery in Sri Lanka with Cash on Delivery.",
  currency: "LKR",
  locale: "en-LK",
  /**
   * Business details for the Contact/Policy pages (PayHere checks these).
   * Fill in address and email before going live; empty values are hidden.
   */
  business: {
    address: "",
    email: "",
    hours: "Monday to Saturday, 9.00 am – 6.00 pm",
    deliveryDays: "2–5 working days",
    returnDays: 7,
  },
  policiesUpdated: "21 November 2026",
} as const;

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/track", label: "Track order" },
] as const;

export const footerNav = {
  shop: [
    { href: "/shop", label: "All products" },
    { href: "/track", label: "Track my order" },
    { href: "/cart", label: "Cart" },
  ],
  info: [
    { href: "/about", label: "About us" },
    { href: "/contact", label: "Contact" },
    { href: "/delivery", label: "Delivery info" },
    { href: "/returns", label: "Returns & refunds" },
    { href: "/privacy", label: "Privacy policy" },
    { href: "/terms", label: "Terms & conditions" },
  ],
} as const;

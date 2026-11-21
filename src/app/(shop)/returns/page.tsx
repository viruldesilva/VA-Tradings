import Link from "next/link";
import { ContentPage } from "@/components/content/content-page";
import { siteConfig } from "@/lib/config";

export const metadata = { title: "Return & refund policy", description: "How returns, exchanges and refunds work." };

export default function ReturnsPage() {
  const days = siteConfig.business.returnDays;
  return (
    <ContentPage title="Return & refund policy" showUpdated>
      <p>We want you to be happy with your purchase. If something isn&apos;t right, we&apos;ll help.</p>
      <h2>Damaged, faulty or wrong items</h2>
      <p>
        If your item arrives damaged, doesn&apos;t work, or isn&apos;t what you ordered, contact us
        within <strong>{days} days</strong> of delivery with your order number and a photo or video of
        the problem. We&apos;ll arrange a replacement or a full refund, including delivery costs.
      </p>
      <h2>Change of mind</h2>
      <p>
        Unused items in their original, unopened packaging can be returned within {days} days of
        delivery. The customer pays the return delivery cost. Opened items, earphones/earbuds (for
        hygiene reasons) and items damaged by misuse can&apos;t be returned for change of mind.
      </p>
      <h2>How to request a return</h2>
      <ul>
        <li><Link href="/contact">Contact us</Link> with your order number and the reason.</li>
        <li>We&apos;ll confirm whether the return is accepted and how to send the item back.</li>
        <li>Once we receive and check the item, we process your refund or replacement.</li>
      </ul>
      <h2>Refunds</h2>
      <p>
        Card payments are refunded to the same card through our payment provider; banks can take
        5–10 working days to show it. Cash on Delivery orders are refunded by bank transfer. Refunds
        are processed within 7 working days of approval.
      </p>
      <h2>Cancellations</h2>
      <p>
        You can cancel free of charge any time before your order ships. If you paid online, we refund
        the full amount.
      </p>
    </ContentPage>
  );
}

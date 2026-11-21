import Link from "next/link";
import { ContentPage } from "@/components/content/content-page";
import { siteConfig } from "@/lib/config";

export const metadata = { title: "Terms & conditions", description: "Terms for buying from our online shop." };

export default function TermsPage() {
  return (
    <ContentPage title="Terms & conditions" showUpdated>
      <p>
        By placing an order on this website you agree to these terms. The website is operated by{" "}
        {siteConfig.name}, Sri Lanka.
      </p>
      <h2>Orders</h2>
      <p>
        An order is accepted once we confirm it with you by phone or WhatsApp. We may cancel an order
        if a product becomes unavailable, if we can&apos;t reach you to confirm, or if there is an
        obvious pricing error. If you paid online, we refund the full amount.
      </p>
      <h2>Prices and payment</h2>
      <p>
        All prices are in Sri Lankan Rupees (LKR) and include applicable taxes. The delivery fee is
        shown at checkout. You can pay by Cash on Delivery or online by card through PayHere.
      </p>
      <h2>Product information</h2>
      <p>
        We describe products as accurately as we can. Colours and packaging may differ slightly from
        photos. Manufacturer warranties, where offered, are handled according to the manufacturer&apos;s
        terms.
      </p>
      <h2>Delivery, returns and refunds</h2>
      <p>
        See our <Link href="/delivery">Delivery information</Link> and{" "}
        <Link href="/returns">Return &amp; refund policy</Link>.
      </p>
      <h2>Liability</h2>
      <p>
        To the extent allowed by law, our liability for any order is limited to the amount paid for
        that order.
      </p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of Sri Lanka.</p>
      <h2>Contact</h2>
      <p>
        Questions about these terms? <Link href="/contact">Contact us</Link>.
      </p>
    </ContentPage>
  );
}

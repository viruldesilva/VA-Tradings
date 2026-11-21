import Link from "next/link";
import { ContentPage } from "@/components/content/content-page";
import { siteConfig } from "@/lib/config";

export const metadata = {
  title: "About us",
  description: `${siteConfig.name} sells tech accessories online with island-wide delivery in Sri Lanka.`,
};

export default function AboutPage() {
  return (
    <ContentPage title={`About ${siteConfig.name}`} intro="Tech accessories, made easy to buy in Sri Lanka.">
      <p>
        {siteConfig.name} is an online shop for everyday tech accessories: chargers, cables, earbuds,
        phone cases, power banks and more. We pick useful products at fair prices and deliver them to
        your door anywhere in Sri Lanka.
      </p>
      <h2>How it works</h2>
      <ul>
        <li>Browse the <Link href="/shop">shop</Link> and place your order online, or message us on WhatsApp.</li>
        <li>We call or message you to confirm the order and delivery address.</li>
        <li>Your order is packed and handed to our courier, usually within {siteConfig.business.deliveryDays}.</li>
        <li>Pay in cash when it arrives, or pay online by card.</li>
      </ul>
      <h2>Questions?</h2>
      <p>
        We&apos;re happy to help you choose the right accessory for your phone or laptop.{" "}
        <Link href="/contact">Contact us</Link> any time.
      </p>
    </ContentPage>
  );
}

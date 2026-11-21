import Link from "next/link";
import { ContentPage } from "@/components/content/content-page";
import { siteConfig } from "@/lib/config";

export const metadata = { title: "Privacy policy", description: "How we collect and use your personal information." };

export default function PrivacyPage() {
  return (
    <ContentPage title="Privacy policy" showUpdated>
      <p>
        This policy explains what personal information {siteConfig.name} collects when you use this
        website and how we use it.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Order details: your name, mobile number, delivery address, city and any notes you add.</li>
        <li>The items you order and the amounts paid.</li>
        <li>Your cart is stored only in your own browser until you place an order.</li>
      </ul>
      <h2>Card payments</h2>
      <p>
        Online payments are processed by PayHere. Your card details are entered on PayHere&apos;s
        secure page and are never sent to or stored by us. PayHere may ask for your email address to
        send a receipt.
      </p>
      <h2>How we use it</h2>
      <ul>
        <li>To confirm, deliver and support your order (including calls or WhatsApp messages about it).</li>
        <li>To share your name, phone and address with our courier for delivery.</li>
        <li>To keep records required for accounting and legal purposes.</li>
      </ul>
      <p>We do not sell your information or send marketing messages without your permission.</p>
      <h2>How long we keep it</h2>
      <p>We keep order records for as long as needed for the purposes above and for legal requirements.</p>
      <h2>Your choices</h2>
      <p>
        You can ask us to see, correct or delete your personal information by{" "}
        <Link href="/contact">contacting us</Link>. We may need to keep some order records where the
        law requires it.
      </p>
      <h2>Changes</h2>
      <p>We may update this policy. The date at the top shows the latest version.</p>
    </ContentPage>
  );
}

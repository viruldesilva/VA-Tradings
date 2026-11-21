import Link from "next/link";
import { ContactDetails } from "@/components/content/contact-details";
import { ContentPage } from "@/components/content/content-page";
import { siteConfig } from "@/lib/config";

export const metadata = { title: "Contact us", description: `Contact ${siteConfig.name} by WhatsApp or phone.` };

export default function ContactPage() {
  return (
    <ContentPage title="Contact us" intro="The fastest way to reach us is WhatsApp.">
      <ContactDetails />
      <p>
        Have an order already? Use <Link href="/track">Track my order</Link> with your order number and
        phone number, or include your order number when you message us.
      </p>
    </ContentPage>
  );
}

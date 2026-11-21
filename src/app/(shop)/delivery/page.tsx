import { ContentPage } from "@/components/content/content-page";
import { siteConfig } from "@/lib/config";
import { getSettings } from "@/lib/data/settings";
import { formatLKR } from "@/lib/format";

export const metadata = { title: "Delivery information", description: "Delivery times, fees and Cash on Delivery details." };

export default function DeliveryPage() {
  return (
    <ContentPage title="Delivery information" showUpdated>
      <DeliveryFee />
      <h2>Where we deliver</h2>
      <p>We deliver island-wide to all districts in Sri Lanka through our courier partners.</p>
      <h2>How long it takes</h2>
      <p>
        Most orders arrive within <strong>{siteConfig.business.deliveryDays}</strong> after we confirm
        them. Remote areas, public holidays and bad weather can add a little time. We&apos;ll let you
        know if your order will take longer.
      </p>
      <h2>Order confirmation</h2>
      <p>
        After you order, we call or WhatsApp the number you gave to confirm the order and address.
        Please keep your phone reachable; orders we can&apos;t confirm may be cancelled.
      </p>
      <h2>Cash on Delivery</h2>
      <p>
        Pay the courier in cash when your parcel arrives. Please have the exact amount ready if you
        can. You can also pay online by card at checkout.
      </p>
      <h2>Tracking</h2>
      <p>
        When your order ships, we add a tracking number you can see on the Track my order page.
      </p>
    </ContentPage>
  );
}

async function DeliveryFee() {
  const { delivery_fee } = await getSettings();
  return (
    <p className="rounded-xl bg-primary/5 p-4 text-brand-dark">
      Delivery fee: <strong>{delivery_fee > 0 ? `${formatLKR(delivery_fee)} per order` : "Free"}</strong>, anywhere in Sri Lanka.
    </p>
  );
}

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { siteConfig } from "@/lib/config";
import { getSettings } from "@/lib/data/settings";
import { whatsappUrl } from "@/lib/format";

/** Contact info from settings + config. Items without a value are hidden. */
export async function ContactDetails() {
  const settings = await getSettings();
  const { address, email, hours } = siteConfig.business;

  const items = [
    settings.whatsapp_number && {
      icon: <WhatsAppIcon className="size-5" />,
      label: "WhatsApp",
      value: settings.whatsapp_number,
      href: whatsappUrl(settings.whatsapp_number, `Hi ${siteConfig.name}!`),
    },
    settings.shop_phone && {
      icon: <Phone className="size-5" />,
      label: "Phone",
      value: settings.shop_phone,
      href: `tel:${settings.shop_phone}`,
    },
    email && { icon: <Mail className="size-5" />, label: "Email", value: email, href: `mailto:${email}` },
    address && { icon: <MapPin className="size-5" />, label: "Address", value: address },
    { icon: <Clock className="size-5" />, label: "Hours", value: hours },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; href?: string }[];

  return (
    <ul className="not-prose grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.label} className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-foreground/10">
          <span className="text-primary">{item.icon}</span>
          <span>
            <span className="block text-xs font-medium text-muted-foreground">{item.label}</span>
            {item.href ? (
              <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="font-medium !text-brand-dark !no-underline hover:!text-primary">
                {item.value}
              </a>
            ) : (
              <span className="font-medium whitespace-pre-line text-brand-dark">{item.value}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

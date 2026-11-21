import { siteConfig } from "@/lib/config";
import { getSettings } from "@/lib/data/settings";
import { whatsappUrl } from "@/lib/format";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

/** Floating "chat on WhatsApp" button. Hidden until a number is set in settings. */
export async function WhatsAppButton() {
  const { whatsapp_number } = await getSettings();
  if (!whatsapp_number) return null;

  return (
    <a
      href={whatsappUrl(whatsapp_number, `Hi ${siteConfig.name}, I have a question.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-50 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#25D366]/40 focus-visible:outline-none"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}

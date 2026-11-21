import Link from "next/link";
import { cacheLife } from "next/cache";
import { Phone } from "lucide-react";
import { footerNav, siteConfig } from "@/lib/config";
import { getSettings } from "@/lib/data/settings";

export async function Footer() {
  "use cache";
  cacheLife("hours");

  const settings = await getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-brand-dark text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="text-lg font-bold text-white">{siteConfig.name}</p>
          <p className="mt-2 max-w-sm text-sm">{siteConfig.description}</p>
          {settings.shop_phone && (
            <a
              href={`tel:${settings.shop_phone}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-white hover:text-brand-accent"
            >
              <Phone className="size-4" />
              {settings.shop_phone}
            </a>
          )}
        </div>

        <FooterLinks title="Shop" links={footerNav.shop} />
        <FooterLinks title="Information" links={footerNav.info} />
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-400">
          © {year} {siteConfig.name}. All prices in LKR. Cash on Delivery available island-wide.
        </p>
      </div>
    </footer>
  );
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-brand-accent">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

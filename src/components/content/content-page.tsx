import { siteConfig } from "@/lib/config";

/** Layout for text pages (About, policies). Styles plain h2/p/ul children. */
export function ContentPage({
  title,
  intro,
  showUpdated,
  children,
}: {
  title: string;
  intro?: string;
  showUpdated?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-brand-dark">{title}</h1>
      {intro && <p className="mt-3 text-lg text-slate-600">{intro}</p>}
      {showUpdated && (
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {siteConfig.policiesUpdated}</p>
      )}
      <div className="mt-8 space-y-4 text-slate-700 [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-brand-dark [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </article>
  );
}

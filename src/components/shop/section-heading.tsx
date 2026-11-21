import Link from "next/link";

export function SectionHeading({
  title,
  href,
  linkLabel = "View all",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-xl font-bold tracking-tight text-brand-dark sm:text-2xl">{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-semibold text-primary hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

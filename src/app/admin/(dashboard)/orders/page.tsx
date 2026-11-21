import Link from "next/link";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/admin/list-skeleton";
import { OrdersTable } from "@/components/admin/orders-table";
import { PageHeader } from "@/components/admin/page-header";
import { countOrdersByStatus, listOrders } from "@/lib/data/admin/orders";
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from "@/lib/orders/status";
import type { OrderStatus } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export const metadata = { title: "Orders" };

type Props = PageProps<"/admin/orders">;

export default function AdminOrdersPage({ searchParams }: Props) {
  return (
    <>
      <PageHeader title="Orders" />
      <Suspense fallback={<ListSkeleton />}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Orders({ searchParams }: { searchParams: Props["searchParams"] }) {
  const { status: raw } = await searchParams;
  const status = ORDER_STATUSES.includes(raw as OrderStatus) ? (raw as OrderStatus) : undefined;
  const [orders, counts] = await Promise.all([listOrders(status), countOrdersByStatus()]);

  const tabs: { key: OrderStatus | "all"; label: string; href: string }[] = [
    { key: "all", label: "All", href: "/admin/orders" },
    ...ORDER_STATUSES.map((s) => ({ key: s, label: ORDER_STATUS_LABELS[s], href: `/admin/orders?status=${s}` })),
  ];

  return (
    <div className="grid gap-4">
      <nav aria-label="Filter by status" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((tab) => {
          const active = (status ?? "all") === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ring-1",
                active ? "bg-brand-dark text-white ring-brand-dark" : "bg-white ring-foreground/10 hover:ring-primary",
              )}
            >
              {tab.label} <span className={active ? "text-slate-300" : "text-muted-foreground"}>{counts[tab.key]}</span>
            </Link>
          );
        })}
      </nav>
      <OrdersTable
        orders={orders}
        emptyText={status ? `No "${ORDER_STATUS_LABELS[status]}" orders.` : "No orders yet."}
      />
    </div>
  );
}

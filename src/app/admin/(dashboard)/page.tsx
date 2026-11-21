import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { ListSkeleton } from "@/components/admin/list-skeleton";
import { OrdersTable } from "@/components/admin/orders-table";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats } from "@/lib/data/admin/orders";
import { formatMonth } from "@/lib/dates";
import { formatLKR } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default function AdminHomePage() {
  return (
    <>
      <PageHeader title="Dashboard">
        <Link href="/admin/products/new" className={buttonVariants({ className: "h-9" })}>
          <Plus /> Add product
        </Link>
      </PageHeader>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </>
  );
}

async function Dashboard() {
  const stats = await getDashboardStats();
  const month = formatMonth(stats.monthStart);

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Orders today" value={String(stats.todayOrders)} />
        <StatCard label="Pending orders" value={String(stats.pendingOrders)} note="New + bought, not shipped yet" />
        <StatCard label={`Revenue · ${month}`} value={formatLKR(stats.monthRevenue)} note="Incl. delivery, excl. cancelled" />
        <StatCard
          label={`Profit · ${month}`}
          value={formatLKR(stats.monthProfit)}
          note={
            stats.itemsWithoutCost > 0
              ? `${stats.itemsWithoutCost} item(s) without supplier price not counted`
              : "Selling price − supplier price"
          }
        />
      </div>
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-semibold">Latest orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <OrdersTable orders={stats.recent} />
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <ListSkeleton rows={4} />
    </div>
  );
}

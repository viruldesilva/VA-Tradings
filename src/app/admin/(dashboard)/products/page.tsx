import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { AdminSearch } from "@/components/admin/admin-search";
import { ListSkeleton } from "@/components/admin/list-skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { ProductsTable } from "@/components/admin/products-table";
import { buttonVariants } from "@/components/ui/button";
import { listAdminProducts } from "@/lib/data/admin/products";

export const metadata = { title: "Products" };

export default function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  return (
    <>
      <PageHeader title="Products">
        <Suspense>
          <AdminSearch action="/admin/products" placeholder="Search products" />
        </Suspense>
        <Link href="/admin/products/new" className={buttonVariants({ className: "h-9" })}>
          <Plus /> Add product
        </Link>
      </PageHeader>

      <Suspense fallback={<ListSkeleton />}>
        <ProductsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ProductsList({
  searchParams,
}: {
  searchParams: PageProps<"/admin/products">["searchParams"];
}) {
  const { q } = await searchParams;
  const search = typeof q === "string" ? q : undefined;
  const products = await listAdminProducts(search);
  return <ProductsTable products={products} search={search} />;
}

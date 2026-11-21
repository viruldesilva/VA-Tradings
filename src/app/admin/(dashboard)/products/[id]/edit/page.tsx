import { Suspense } from "react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ListSkeleton } from "@/components/admin/list-skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/lib/data/admin/categories";
import { getAdminProduct } from "@/lib/data/admin/products";
import { saveProduct } from "../../actions";

export const metadata = { title: "Edit product" };

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  return (
    <>
      <PageHeader title="Edit product" />
      <Suspense fallback={<ListSkeleton rows={8} />}>
        <EditProductForm params={params} />
      </Suspense>
    </>
  );
}

async function EditProductForm({
  params,
}: {
  params: PageProps<"/admin/products/[id]/edit">["params"];
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const [product, categories] = await Promise.all([getAdminProduct(id), listCategories()]);
  if (!product) notFound();

  return (
    <ProductForm
      action={saveProduct.bind(null, product.id)}
      categories={categories}
      product={product}
    />
  );
}

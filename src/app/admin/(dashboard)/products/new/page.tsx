import { Suspense } from "react";
import { ListSkeleton } from "@/components/admin/list-skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/lib/data/admin/categories";
import { saveProduct } from "../actions";

export const metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Add product" />
      <Suspense fallback={<ListSkeleton rows={8} />}>
        <NewProductForm />
      </Suspense>
    </>
  );
}

async function NewProductForm() {
  const categories = await listCategories();
  return <ProductForm action={saveProduct.bind(null, null)} categories={categories} />;
}

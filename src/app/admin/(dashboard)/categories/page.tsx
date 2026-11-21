import { Suspense } from "react";
import { AddCategoryForm, CategoryList } from "@/components/admin/category-manager";
import { ListSkeleton } from "@/components/admin/list-skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { listCategoriesWithCounts } from "@/lib/data/admin/categories";
import { removeCategory, saveCategory } from "./actions";

export const metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return (
    <>
      <PageHeader title="Categories" description="Group products so customers can browse them." />
      <div className="grid gap-4">
        <AddCategoryForm action={saveCategory.bind(null, null)} />
        <Suspense fallback={<ListSkeleton rows={4} />}>
          <Categories />
        </Suspense>
      </div>
    </>
  );
}

async function Categories() {
  const categories = await listCategoriesWithCounts();
  return (
    <CategoryList
      categories={categories.map((category) => ({
        ...category,
        saveAction: saveCategory.bind(null, category.id),
        deleteAction: removeCategory.bind(null, category.id),
      }))}
    />
  );
}

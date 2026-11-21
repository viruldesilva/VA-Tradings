"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import type { ActionState } from "@/lib/action-state";
import type { CategoryWithCount } from "@/lib/data/admin/categories";
import { ConfirmDeleteButton } from "./confirm-delete-button";
import { FormMessage } from "./form-field";

type SaveAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export type CategoryRowData = CategoryWithCount & {
  saveAction: SaveAction;
  deleteAction: () => Promise<ActionState>;
};

export function AddCategoryForm({ action }: { action: SaveAction }) {
  const { state, pending, onSubmit } = useActionForm(action);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const err = (f: string) => state?.fieldErrors?.[f]?.[0];

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="grid gap-3 rounded-xl bg-white p-4 ring-1 ring-foreground/10"
    >
      <p className="font-medium">Add a category</p>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <Input name="name" placeholder="Name, e.g. Chargers" aria-label="Category name" aria-invalid={!!err("name")} />
          {err("name") && <p className="mt-1 text-sm text-destructive">{err("name")}</p>}
        </div>
        <div>
          <Input name="slug" placeholder="Slug (optional)" aria-label="Category slug" aria-invalid={!!err("slug")} />
          {err("slug") && <p className="mt-1 text-sm text-destructive">{err("slug")}</p>}
        </div>
        <Button type="submit" disabled={pending} className="h-9">
          <Plus /> {pending ? "Adding…" : "Add"}
        </Button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

export function CategoryList({ categories }: { categories: CategoryRowData[] }) {
  if (categories.length === 0) {
    return (
      <p className="rounded-xl bg-white p-10 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
        No categories yet.
      </p>
    );
  }

  return (
    <ul className="divide-y rounded-xl bg-white ring-1 ring-foreground/10">
      {categories.map((category) => (
        <CategoryRow key={`${category.id}:${category.name}:${category.slug}`} category={category} />
      ))}
    </ul>
  );
}

function CategoryRow({ category }: { category: CategoryRowData }) {
  const [editing, setEditing] = useState(false);
  const { state, pending, onSubmit } = useActionForm(async (prev, formData) => {
    const result = await category.saveAction(prev, formData);
    if (result?.ok) setEditing(false);
    return result;
  });
  const err = (f: string) => state?.fieldErrors?.[f]?.[0];

  if (editing) {
    return (
      <li className="p-4">
        <form onSubmit={onSubmit} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <Input name="name" defaultValue={category.name} aria-label="Category name" aria-invalid={!!err("name")} autoFocus />
            {err("name") && <p className="mt-1 text-sm text-destructive">{err("name")}</p>}
          </div>
          <div>
            <Input name="slug" defaultValue={category.slug} aria-label="Category slug" aria-invalid={!!err("slug")} />
            {err("slug") && <p className="mt-1 text-sm text-destructive">{err("slug")}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-9" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-9" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
        {state && !state.ok && <div className="mt-2"><FormMessage state={state} /></div>}
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{category.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          /{category.slug} · {category.productCount}{" "}
          {category.productCount === 1 ? "product" : "products"}
        </p>
      </div>
      <Button variant="ghost" size="icon-sm" aria-label={`Edit ${category.name}`} onClick={() => setEditing(true)}>
        <Pencil />
      </Button>
      <ConfirmDeleteButton
        action={category.deleteAction}
        label={`Delete ${category.name}`}
        title="Delete this category?"
        description={
          category.productCount > 0 ? (
            <>
              <strong>{category.name}</strong> has {category.productCount}{" "}
              {category.productCount === 1 ? "product" : "products"}. They won&apos;t be deleted,
              just left without a category.
            </>
          ) : (
            <>
              <strong>{category.name}</strong> will be permanently deleted.
            </>
          )
        }
      />
    </li>
  );
}

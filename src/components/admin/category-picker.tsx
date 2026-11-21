"use client";

import Link from "next/link";
import { useRef, useState, useTransition, type KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { quickCreateCategory } from "@/app/admin/(dashboard)/categories/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/lib/types/database";
import { NativeSelect } from "./form-field";

type Props = {
  categories: Category[];
  defaultValue: string | null;
  error?: string;
};

/**
 * Category dropdown for the product form, with an inline "+ New category"
 * that creates the category on the server and selects it straight away.
 * Submits as the `category_id` field of the surrounding form.
 */
export function CategoryPicker({ categories: initial, defaultValue, error }: Props) {
  const [categories, setCategories] = useState(initial);
  const [value, setValue] = useState(defaultValue ?? "");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setAdding(true);
    setAddError(null);
    // Focus after the input renders.
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function closeAdd() {
    setAdding(false);
    setNewName("");
    setAddError(null);
  }

  function add() {
    const name = newName.trim();
    if (!name) return setAddError("Enter a category name");

    // Already exists? Just select it instead of creating a duplicate.
    const existing = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setValue(existing.id);
      return closeAdd();
    }

    startTransition(async () => {
      const result = await quickCreateCategory(name);
      if (!result.ok) return setAddError(result.message);
      setCategories((prev) =>
        [...prev, result.category].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setValue(result.category.id);
      closeAdd();
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // This sits inside the product form: Enter must add the category, not submit the product.
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeAdd();
    }
  }

  return (
    <div className="grid gap-2">
      <NativeSelect
        id="category_id"
        name="category_id"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={!!error}
      >
        <option value="">No category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </NativeSelect>

      {adding ? (
        <div className="grid gap-2 rounded-lg bg-muted p-2">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="New category name"
              aria-label="New category name"
              aria-invalid={!!addError}
              maxLength={80}
              className="bg-white"
            />
            <Button type="button" onClick={add} disabled={pending} className="h-9">
              {pending ? "Adding…" : "Add"}
            </Button>
          </div>
          {addError && <p className="text-sm text-destructive">{addError}</p>}
          <button
            type="button"
            onClick={closeAdd}
            className="justify-self-start text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <Plus className="size-3.5" /> New category
          </button>
          <Link href="/admin/categories" className="text-muted-foreground hover:text-foreground">
            Manage categories
          </Link>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

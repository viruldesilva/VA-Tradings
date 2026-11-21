"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useActionForm } from "@/hooks/use-action-form";
import type { ActionState } from "@/lib/action-state";
import type { AdminProduct } from "@/lib/data/admin/products";
import { formatLKR } from "@/lib/format";
import { slugify } from "@/lib/slug";
import type { Category } from "@/lib/types/database";
import { cn } from "@/lib/utils";
import { CategoryPicker } from "./category-picker";
import { FormField, FormMessage } from "./form-field";
import { ImageUploader } from "./image-uploader";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  categories: Category[];
  product?: AdminProduct | null;
};

export function ProductForm({ action, categories, product }: Props) {
  const { state, pending, onSubmit } = useActionForm(action);
  const errors = state?.fieldErrors ?? {};
  const err = (field: string) => errors[field]?.[0];

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [supplierPrice, setSupplierPrice] = useState(
    product?.product_private?.supplier_price?.toString() ?? "",
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);

  const profit =
    price !== "" && supplierPrice !== "" ? Number(price) - Number(supplierPrice) : null;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]" noValidate>
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="grid content-start gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField label="Name" htmlFor="name" error={err("name")}>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!err("name")}
                required
              />
            </FormField>

            <FormField
              label="URL slug"
              htmlFor="slug"
              error={err("slug")}
              hint="Leave blank to generate from the name."
            >
              <Input
                id="slug"
                name="slug"
                defaultValue={product?.slug ?? ""}
                placeholder={slugify(name) || "e.g. usb-c-fast-charger-20w"}
                aria-invalid={!!err("slug")}
              />
            </FormField>

            <FormField label="Description" htmlFor="description" error={err("description")}>
              <Textarea
                id="description"
                name="description"
                rows={6}
                defaultValue={product?.description ?? ""}
                aria-invalid={!!err("description")}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader images={images} onChange={setImages} error={err("images")} />
          </CardContent>
        </Card>
      </div>

      <div className="grid content-start gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField label="Selling price (Rs.)" htmlFor="price" error={err("price")}>
              <Input
                id="price"
                name="price"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-invalid={!!err("price")}
                required
              />
            </FormField>

            <FormField
              label="Supplier price (Rs.)"
              htmlFor="supplier_price"
              error={err("supplier_price")}
              hint="Private: never shown to customers."
            >
              <Input
                id="supplier_price"
                name="supplier_price"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={supplierPrice}
                onChange={(e) => setSupplierPrice(e.target.value)}
                aria-invalid={!!err("supplier_price")}
              />
            </FormField>

            <FormField label="Supplier URL" htmlFor="supplier_url" error={err("supplier_url")}>
              <Input
                id="supplier_url"
                name="supplier_url"
                type="url"
                inputMode="url"
                placeholder="https://"
                defaultValue={product?.product_private?.supplier_url ?? ""}
                aria-invalid={!!err("supplier_url")}
              />
            </FormField>

            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
              <span className="text-muted-foreground">Profit per item</span>
              <span
                className={cn(
                  "font-semibold",
                  profit !== null && profit < 0 && "text-destructive",
                  profit !== null && profit > 0 && "text-green-700",
                )}
              >
                {profit === null || Number.isNaN(profit) ? "—" : formatLKR(profit)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organisation</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="category_id">Category</Label>
              <CategoryPicker
                categories={categories}
                defaultValue={product?.category_id ?? null}
                error={err("category_id")}
              />
            </div>

            <SwitchRow
              name="in_stock"
              label="In stock"
              hint="Out-of-stock products stay visible but can't be ordered."
              defaultChecked={product?.in_stock ?? true}
            />
            <SwitchRow
              name="is_visible"
              label="Visible in shop"
              hint="Hidden products are only visible to you."
              defaultChecked={product?.is_visible ?? true}
            />
          </CardContent>
        </Card>

        <FormMessage state={state} />

        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className={buttonVariants({ variant: "outline", className: "h-10 flex-1" })}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={pending} className="h-10 flex-1">
            {pending ? "Saving…" : product ? "Save changes" : "Add product"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function SwitchRow({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <Label htmlFor={name}>{label}</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch id={name} name={name} defaultChecked={defaultChecked} />
    </div>
  );
}

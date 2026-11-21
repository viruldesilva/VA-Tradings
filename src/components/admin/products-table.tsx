import Image from "next/image";
import Link from "next/link";
import { ImageOff, Pencil } from "lucide-react";
import { removeProduct } from "@/app/admin/(dashboard)/products/actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminProduct } from "@/lib/data/admin/products";
import { formatLKR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ConfirmDeleteButton } from "./confirm-delete-button";

export function ProductsTable({ products, search }: { products: AdminProduct[]; search?: string }) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl bg-white p-10 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
        {search ? `No products match "${search}".` : "No products yet. Add your first one!"}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">
              <span className="sr-only">Image</span>
            </TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="hidden lg:table-cell">Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="hidden text-right md:table-cell">Supplier</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead className="w-20">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const supplierPrice = product.product_private?.supplier_price ?? null;
            const profit = supplierPrice === null ? null : product.price - supplierPrice;

            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <ImageOff className="absolute inset-0 m-auto size-4 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-56 whitespace-normal">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="font-medium hover:text-primary"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {!product.in_stock && <Badge variant="destructive">Out of stock</Badge>}
                    {!product.is_visible && <Badge variant="secondary">Hidden</Badge>}
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {product.categories?.name ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatLKR(product.price)}</TableCell>
                <TableCell className="hidden text-right text-muted-foreground tabular-nums md:table-cell">
                  {supplierPrice === null ? "—" : formatLKR(supplierPrice)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    profit !== null && profit < 0 && "text-destructive",
                    profit !== null && profit > 0 && "text-green-700",
                  )}
                >
                  {profit === null ? "—" : formatLKR(profit)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      aria-label={`Edit ${product.name}`}
                      className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                    >
                      <Pencil />
                    </Link>
                    <ConfirmDeleteButton
                      action={removeProduct.bind(null, product.id)}
                      label={`Delete ${product.name}`}
                      title="Delete this product?"
                      description={
                        <>
                          <strong>{product.name}</strong> and its images will be permanently
                          deleted. Past orders keep their item details.
                        </>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

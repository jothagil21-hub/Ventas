import { AppShell } from "@/components/app-shell";
import { ProductForm } from "@/components/product-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const bound = updateProduct.bind(null, product.id);

  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-semibold">Editar producto</h1>
      <p className="mb-6 text-sm text-slate-600">{product.name}</p>
      <ProductForm
        action={bound}
        categories={categories}
        submitLabel="Guardar cambios"
        initial={{
          name: product.name,
          sku: product.sku,
          categoryId: product.categoryId,
          costPrice: product.costPrice.toString(),
          salePrice: product.salePrice.toString(),
          taxRate: product.taxRate,
          active: product.active,
          photoUrl: product.photoUrl,
        }}
      />
    </AppShell>
  );
}

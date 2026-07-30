import { AppShell } from "@/components/app-shell";
import { ProductForm } from "@/components/product-form";
import { prisma } from "@/lib/prisma";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-semibold">Nuevo producto</h1>
      <p className="mb-6 text-sm text-slate-600">
        Completa la ficha comercial del producto
      </p>
      <ProductForm
        action={createProduct}
        categories={categories}
        submitLabel="Crear producto"
      />
    </AppShell>
  );
}

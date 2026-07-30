import { AppShell } from "@/components/app-shell";
import { QuickLookup } from "@/components/quick-lookup";
import { prisma } from "@/lib/prisma";

export default async function ConsultaPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const lookup = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    photoUrl: p.photoUrl,
    salePrice: p.salePrice.toString(),
    taxRate: p.taxRate,
    categoryName: p.category.name,
  }));

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Consulta rápida
        </h1>
        <p className="text-sm text-slate-600">
          Busca productos del catálogo para el mostrador
        </p>
      </div>
      <QuickLookup products={lookup} />
    </AppShell>
  );
}

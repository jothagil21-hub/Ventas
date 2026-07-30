import { AppShell } from "@/components/app-shell";
import { QuickLookup } from "@/components/quick-lookup";
import { prisma } from "@/lib/prisma";

export default async function ConsultaPage() {
  const [products, stocks, branches] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.stockBalance.findMany(),
    prisma.branch.findMany({
      where: { active: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
  ]);

  const lookup = products.map((p) => {
    const byBranch = branches.map((b) => ({
      branchName: b.name,
      quantity:
        stocks.find((s) => s.productId === p.id && s.branchId === b.id)
          ?.quantity ?? 0,
    }));
    const stockTotal = byBranch.reduce((sum, row) => sum + row.quantity, 0);

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      photoUrl: p.photoUrl,
      salePrice: p.salePrice.toString(),
      taxRate: p.taxRate,
      categoryName: p.category.name,
      stockTotal,
      stockByBranch: byBranch,
    };
  });

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

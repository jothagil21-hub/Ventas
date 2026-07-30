import { AppShell } from "@/components/app-shell";
import { StockTransferForm } from "@/components/stock-transfer-form";
import { requireAdmin } from "@/lib/auth-helpers";
import { branchTypeLabel } from "@/lib/inventory-labels";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TrasladoInventarioPage() {
  await requireAdmin();

  const [products, branches] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.branch.findMany({
      where: { active: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <AppShell>
      <div className="mb-6">
        <Link
          href="/inventario"
          className="text-sm text-teal-700 hover:underline"
        >
          ← Inventario
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Traslado</h1>
        <p className="text-sm text-slate-600">
          Mueve stock entre bodega y puntos de venta
        </p>
      </div>
      <StockTransferForm
        products={products.map((p) => ({
          id: p.id,
          label: `${p.sku} — ${p.name}`,
        }))}
        branches={branches.map((b) => ({
          id: b.id,
          label: `${b.name} (${branchTypeLabel(b.type)})`,
        }))}
      />
    </AppShell>
  );
}

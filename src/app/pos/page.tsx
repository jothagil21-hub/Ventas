import { AppShell } from "@/components/app-shell";
import { PosTerminal } from "@/components/pos-terminal";
import { requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { BranchType } from "@/generated/prisma/client";
import Link from "next/link";

export default async function PosPage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string }>;
}) {
  await requireSession();
  const { branchId: queryBranchId } = await searchParams;

  const stores = await prisma.branch.findMany({
    where: { active: true, type: BranchType.STORE },
    orderBy: { name: "asc" },
  });

  const branchId =
    stores.find((s) => s.id === queryBranchId)?.id ?? stores[0]?.id;

  const [products, stocks] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    branchId
      ? prisma.stockBalance.findMany({ where: { branchId } })
      : Promise.resolve([]),
  ]);

  const stockMap = new Map(stocks.map((s) => [s.productId, s.quantity]));

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">POS</h1>
          <p className="text-sm text-slate-600">
            Facturación de mostrador con descuento de inventario
          </p>
        </div>
        <Link
          href="/facturas"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Historial de facturas
        </Link>
      </div>

      {stores.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-slate-500">
          No hay puntos de venta activos. Crea una ubicación tipo “Punto de
          venta”.
        </p>
      ) : (
        <PosTerminal
          key={branchId}
          branches={stores.map((s) => ({ id: s.id, name: s.name }))}
          initialBranchId={branchId}
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            photoUrl: p.photoUrl,
            salePrice: Number(p.salePrice),
            taxRate: p.taxRate,
            stock: stockMap.get(p.id) ?? 0,
          }))}
        />
      )}
    </AppShell>
  );
}

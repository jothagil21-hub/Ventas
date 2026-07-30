import { AppShell } from "@/components/app-shell";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-helpers";
import { branchTypeLabel } from "@/lib/inventory-labels";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function InventarioPage() {
  const session = await auth();
  const admin = isAdmin(session?.user?.role);

  const [branches, products, stocks] = await Promise.all([
    prisma.branch.findMany({
      where: { active: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.stockBalance.findMany(),
  ]);

  const qty = (productId: string, branchId: string) =>
    stocks.find((s) => s.productId === productId && s.branchId === branchId)
      ?.quantity ?? 0;

  const totalFor = (productId: string) =>
    stocks
      .filter((s) => s.productId === productId)
      .reduce((sum, s) => sum + s.quantity, 0);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Inventario</h1>
          <p className="text-sm text-slate-600">
            Existencias por producto y ubicación
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/inventario/movimientos"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Movimientos
          </Link>
          {admin ? (
            <>
              <Link
                href="/inventario/ajuste"
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                Entrada / ajuste
              </Link>
              <Link
                href="/inventario/traslado"
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
              >
                Traslado
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              {branches.map((b) => (
                <th key={b.id} className="px-4 py-3 font-medium">
                  <span className="block">{b.name}</span>
                  <span className="text-xs font-normal text-slate-400">
                    {branchTypeLabel(b.type)}
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {product.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                {branches.map((b) => (
                  <td key={b.id} className="px-4 py-3 tabular-nums">
                    {qty(product.id, b.id)}
                  </td>
                ))}
                <td className="px-4 py-3 font-semibold tabular-nums">
                  {totalFor(product.id)}
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + branches.length}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No hay productos activos.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

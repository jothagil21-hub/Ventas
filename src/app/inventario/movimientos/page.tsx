import { AppShell } from "@/components/app-shell";
import { movementTypeLabel, branchTypeLabel } from "@/lib/inventory-labels";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MovimientosPage() {
  const movements = await prisma.stockMovement.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      branch: true,
      user: { select: { name: true } },
    },
  });

  return (
    <AppShell>
      <div className="mb-6">
        <Link
          href="/inventario"
          className="text-sm text-teal-700 hover:underline"
        >
          ← Inventario
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Movimientos</h1>
        <p className="text-sm text-slate-600">
          Últimos 100 movimientos de inventario
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Ubicación</th>
              <th className="px-4 py-3 font-medium">Cantidad</th>
              <th className="px-4 py-3 font-medium">Saldo</th>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Nota</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id} className="border-t border-slate-100">
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                  {m.createdAt.toLocaleString("es-CO")}
                </td>
                <td className="px-4 py-3">{movementTypeLabel(m.type)}</td>
                <td className="px-4 py-3">
                  <span className="font-medium">{m.product.name}</span>
                  <span className="ml-2 font-mono text-xs text-slate-500">
                    {m.product.sku}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {m.branch.name}
                  <span className="ml-1 text-xs text-slate-400">
                    ({branchTypeLabel(m.branch.type)})
                  </span>
                </td>
                <td
                  className={`px-4 py-3 tabular-nums font-medium ${
                    m.quantity < 0 ? "text-red-600" : "text-emerald-700"
                  }`}
                >
                  {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                </td>
                <td className="px-4 py-3 tabular-nums">{m.balanceAfter}</td>
                <td className="px-4 py-3 text-slate-600">
                  {m.user?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">{m.note ?? "—"}</td>
              </tr>
            ))}
            {movements.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Aún no hay movimientos.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

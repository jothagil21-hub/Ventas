import { AppShell } from "@/components/app-shell";
import { formatCOP } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/sales";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import Link from "next/link";

export default async function FacturasPage() {
  await requireSession();

  const invoices = await prisma.invoice.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      branch: true,
      user: { select: { name: true } },
    },
  });

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Facturas POS</h1>
          <p className="text-sm text-slate-600">Últimas 50 ventas</p>
        </div>
        <Link
          href="/pos"
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Nueva venta
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Número</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Sucursal</th>
              <th className="px-4 py-3 font-medium">Cajero</th>
              <th className="px-4 py-3 font-medium">Pago</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-mono text-xs">{inv.number}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {inv.createdAt.toLocaleString("es-CO")}
                </td>
                <td className="px-4 py-3">{inv.branch.name}</td>
                <td className="px-4 py-3">{inv.user.name}</td>
                <td className="px-4 py-3">
                  {paymentMethodLabel(inv.paymentMethod)}
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatCOP(inv.total.toString())}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/facturas/${inv.id}`}
                    className="text-teal-700 hover:underline"
                  >
                    Ver ticket
                  </Link>
                </td>
              </tr>
            ))}
            {invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Aún no hay facturas.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

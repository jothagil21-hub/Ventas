import { formatCOP, formatTaxRate } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/sales";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PrintButton } from "@/components/print-button";

export default async function FacturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      branch: { include: { company: true } },
      user: { select: { name: true } },
    },
  });

  if (!invoice) notFound();

  const company = invoice.branch.company;

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-6 print:max-w-none print:px-0 print:py-0">
        <div className="flex flex-wrap gap-2 print:hidden">
          <Link
            href="/pos"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            ← POS
          </Link>
          <Link
            href="/facturas"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Historial
          </Link>
          <PrintButton />
        </div>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:shadow-none">
          <header className="border-b border-dashed border-slate-300 pb-4 text-center">
            <p className="text-xs tracking-widest text-slate-500 uppercase">
              Ticket POS
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">
              {company.name}
            </h1>
            <p className="text-sm text-slate-600">NIT {company.nit}</p>
            <p className="mt-2 text-sm text-slate-600">
              {invoice.branch.name}
              {invoice.branch.address ? ` · ${invoice.branch.address}` : ""}
            </p>
          </header>

          <div className="mt-4 space-y-1 text-sm text-slate-700">
            <p>
              <span className="text-slate-500">Número:</span>{" "}
              <span className="font-mono font-medium">{invoice.number}</span>
            </p>
            <p>
              <span className="text-slate-500">Fecha:</span>{" "}
              {invoice.createdAt.toLocaleString("es-CO")}
            </p>
            <p>
              <span className="text-slate-500">Cajero:</span> {invoice.user.name}
            </p>
            <p>
              <span className="text-slate-500">Pago:</span>{" "}
              {paymentMethodLabel(invoice.paymentMethod)}
            </p>
            {invoice.customerName ? (
              <p>
                <span className="text-slate-500">Cliente:</span>{" "}
                {invoice.customerName}
                {invoice.customerDocument
                  ? ` · ${invoice.customerDocument}`
                  : ""}
              </p>
            ) : null}
          </div>

          <table className="mt-5 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 font-medium">Ítem</th>
                <th className="py-2 text-right font-medium">Cant</th>
                <th className="py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2 pr-2">
                    <p className="font-medium text-slate-900">
                      {item.productName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.sku} · {formatCOP(item.unitPrice.toString())} · IVA{" "}
                      {formatTaxRate(item.taxRate)}
                    </p>
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="py-2 text-right tabular-nums font-medium">
                    {formatCOP(item.lineTotal.toString())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd>{formatCOP(invoice.subtotal.toString())}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">IVA</dt>
              <dd>{formatCOP(invoice.taxTotal.toString())}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatCOP(invoice.total.toString())}</dd>
            </div>
          </dl>

          <p className="mt-6 text-center text-xs text-slate-400">
            Documento POS interno — no es factura electrónica DIAN
          </p>
        </article>
      </div>
    </div>
  );
}

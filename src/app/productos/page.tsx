import { AppShell } from "@/components/app-shell";
import { ProductPhoto } from "@/components/product-photo";
import { prisma } from "@/lib/prisma";
import { formatCOP, formatTaxRate } from "@/lib/format";
import Link from "next/link";
import { toggleProductActive } from "./actions";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Productos</h1>
          <p className="text-sm text-slate-600">
            Catálogo comercial compartido entre sucursales
          </p>
        </div>
        <Link
          href="/productos/nuevo"
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Nuevo producto
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Compra</th>
              <th className="px-4 py-3 font-medium">Venta</th>
              <th className="px-4 py-3 font-medium">IVA</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductPhoto
                      src={product.photoUrl}
                      alt={product.name}
                      size="sm"
                    />
                    <span className="font-medium text-slate-900">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                <td className="px-4 py-3">{product.category.name}</td>
                <td className="px-4 py-3">
                  {formatCOP(product.costPrice.toString())}
                </td>
                <td className="px-4 py-3">
                  {formatCOP(product.salePrice.toString())}
                </td>
                <td className="px-4 py-3">{formatTaxRate(product.taxRate)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.active
                        ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                        : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
                    }
                  >
                    {product.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/productos/${product.id}/editar`}
                      className="text-teal-700 hover:underline"
                    >
                      Editar
                    </Link>
                    <form action={toggleProductActive.bind(null, product.id)}>
                      <button
                        type="submit"
                        className="text-slate-500 hover:underline"
                      >
                        {product.active ? "Desactivar" : "Activar"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No hay productos. Crea el primero.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

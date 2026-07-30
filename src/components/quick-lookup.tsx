"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ProductPhoto } from "@/components/product-photo";
import { formatCOP, formatTaxRate } from "@/lib/format";

export type LookupProduct = {
  id: string;
  name: string;
  sku: string;
  photoUrl: string | null;
  salePrice: string;
  taxRate: number;
  categoryName: string;
  stockTotal: number;
  stockByBranch: { branchName: string; quantity: number }[];
};

export function QuickLookup({ products }: { products: LookupProduct[] }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const results = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    );
  }, [products, deferred]);

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="lookup"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Buscar por nombre o SKU
        </label>
        <input
          id="lookup"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej. DEMO-001 o nombre del producto"
          autoFocus
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 shadow-sm outline-none ring-teal-600 focus:ring-2"
        />
        <p className="mt-2 text-sm text-slate-500">
          {results.length} producto{results.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((product) => (
          <article
            key={product.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="relative h-56 w-full shrink-0 overflow-hidden bg-slate-50">
              <ProductPhoto
                src={product.photoUrl}
                alt={product.name}
                size="fill"
              />
            </div>
            <div className="p-4">
              <p className="font-mono text-xs text-teal-700">{product.sku}</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {product.name}
              </h2>
              <p className="text-sm text-slate-500">{product.categoryName}</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">
                {formatCOP(product.salePrice)}
              </p>
              <p className="text-xs text-slate-500">
                IVA {formatTaxRate(product.taxRate)}
              </p>
              <p className="mt-3 text-sm font-medium text-slate-800">
                Stock total: {product.stockTotal}
              </p>
              <ul className="mt-1 space-y-0.5 text-xs text-slate-500">
                {product.stockByBranch.map((row) => (
                  <li key={row.branchName}>
                    {row.branchName}: {row.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-10 text-center text-slate-500">
          No se encontraron productos activos con esa búsqueda.
        </p>
      ) : null}
    </div>
  );
}

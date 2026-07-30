"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { completeSaleAction, type PosFormState } from "@/app/pos/actions";
import { formatCOP } from "@/lib/format";
import { ProductPhoto } from "@/components/product-photo";

export type PosProduct = {
  id: string;
  name: string;
  sku: string;
  photoUrl: string | null;
  salePrice: number;
  taxRate: number;
  stock: number;
};

export type PosBranch = {
  id: string;
  name: string;
};

type CartLine = {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  taxRate: number;
  quantity: number;
  stock: number;
};

export function PosTerminal({
  branches,
  products,
  initialBranchId,
}: {
  branches: PosBranch[];
  products: PosProduct[];
  initialBranchId?: string;
}) {
  const router = useRouter();
  const [branchId, setBranchId] = useState(
    initialBranchId ?? branches[0]?.id ?? "",
  );
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [customerName, setCustomerName] = useState("");
  const [customerDocument, setCustomerDocument] = useState("");
  const [state, formAction, pending] = useActionState(
    completeSaleAction,
    {} as PosFormState,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    );
  }, [products, query]);

  const productsForBranch = useMemo(() => {
    // stock already filtered server-side per selected branch via key remount
    return filtered;
  }, [filtered]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;
    for (const line of cart) {
      const lineSub = Math.round(line.unitPrice * line.quantity);
      const lineTax = Math.round(lineSub * (line.taxRate / 100));
      subtotal += lineSub;
      taxTotal += lineTax;
    }
    return { subtotal, taxTotal, total: subtotal + taxTotal };
  }, [cart]);

  function addProduct(product: PosProduct) {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((l) =>
          l.productId === product.id
            ? { ...l, quantity: l.quantity + 1, stock: product.stock }
            : l,
        );
      }
      if (product.stock <= 0) return prev;
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unitPrice: product.salePrice,
          taxRate: product.taxRate,
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
  }

  function setQty(productId: string, quantity: number) {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.productId !== productId) return l;
          const qty = Math.max(0, Math.min(quantity, l.stock));
          return { ...l, quantity: qty };
        })
        .filter((l) => l.quantity > 0),
    );
  }

  function onBranchChange(id: string) {
    setBranchId(id);
    setCart([]);
    router.push(`/pos?branchId=${id}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Punto de venta
            </label>
            <select
              className="input w-full"
              value={branchId}
              onChange={(e) => onBranchChange(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Buscar producto
            </label>
            <input
              className="input w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nombre o SKU"
            />
          </div>
        </div>

        <div className="grid max-h-[28rem] gap-2 overflow-y-auto sm:grid-cols-2">
          {productsForBranch.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addProduct(product)}
              disabled={product.stock <= 0}
              className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-slate-50">
                <ProductPhoto
                  src={product.photoUrl}
                  alt={product.name}
                  size="fill"
                />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-xs text-teal-700">{product.sku}</p>
                <p className="truncate font-medium text-slate-900">
                  {product.name}
                </p>
                <p className="text-sm text-slate-700">
                  {formatCOP(product.salePrice)}
                </p>
                <p className="text-xs text-slate-500">
                  Stock: {product.stock}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Carrito</h2>
        <div className="mt-3 space-y-3">
          {cart.length === 0 ? (
            <p className="text-sm text-slate-500">
              Agrega productos para iniciar la venta.
            </p>
          ) : (
            cart.map((line) => (
              <div
                key={line.productId}
                className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{line.name}</p>
                  <p className="text-xs text-slate-500">
                    {line.sku} · {formatCOP(line.unitPrice)} + IVA {line.taxRate}
                    %
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={line.stock}
                  value={line.quantity}
                  onChange={(e) =>
                    setQty(line.productId, Number(e.target.value) || 0)
                  }
                  className="input w-20 text-center"
                />
              </div>
            ))
          )}
        </div>

        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd>{formatCOP(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">IVA</dt>
            <dd>{formatCOP(totals.taxTotal)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatCOP(totals.total)}</dd>
          </div>
        </dl>

        <form action={formAction} className="mt-4 grid gap-3">
          <input type="hidden" name="branchId" value={branchId} />
          <input
            type="hidden"
            name="linesJson"
            value={JSON.stringify(
              cart.map((l) => ({
                productId: l.productId,
                quantity: l.quantity,
              })),
            )}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Medio de pago
            </label>
            <select
              name="paymentMethod"
              className="input w-full"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="TRANSFER">Transferencia</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Cliente (opcional)
            </label>
            <input
              name="customerName"
              className="input w-full"
              placeholder="Nombre"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Documento (opcional)
            </label>
            <input
              name="customerDocument"
              className="input w-full"
              placeholder="CC / NIT"
              value={customerDocument}
              onChange={(e) => setCustomerDocument(e.target.value)}
            />
          </div>

          {state.error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || cart.length === 0 || !branchId}
            className="rounded-lg bg-teal-700 px-4 py-3 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {pending ? "Facturando…" : "Cobrar y generar ticket"}
          </button>
        </form>
      </section>
    </div>
  );
}

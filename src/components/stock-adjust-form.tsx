"use client";

import { useActionState } from "react";
import type { InventoryFormState } from "@/app/inventario/actions";
import { adjustStockAction } from "@/app/inventario/actions";

type Option = { id: string; label: string };

export function StockAdjustForm({
  products,
  branches,
}: {
  products: Option[];
  branches: Option[];
}) {
  const [state, formAction, pending] = useActionState(
    adjustStockAction,
    {} as InventoryFormState,
  );

  return (
    <form
      action={formAction}
      className="grid max-w-xl gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Field label="Producto" error={state.fieldErrors?.productId?.[0]}>
        <select name="productId" required className="input" defaultValue="">
          <option value="" disabled>
            Seleccionar…
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Ubicación" error={state.fieldErrors?.branchId?.[0]}>
        <select name="branchId" required className="input" defaultValue="">
          <option value="" disabled>
            Seleccionar…
          </option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tipo de movimiento" error={state.fieldErrors?.mode?.[0]}>
        <select name="mode" className="input" defaultValue="entry">
          <option value="entry">Entrada (sumar unidades)</option>
          <option value="set">Ajuste (dejar en esta cantidad)</option>
        </select>
      </Field>

      <Field label="Cantidad" error={state.fieldErrors?.quantity?.[0]}>
        <input
          name="quantity"
          type="number"
          min="0"
          step="1"
          required
          className="input"
        />
      </Field>

      <Field label="Nota (opcional)">
        <input name="note" className="input" placeholder="Ej. compra proveedor" />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Registrar movimiento"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

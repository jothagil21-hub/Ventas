"use client";

import { useActionState, useEffect, useState } from "react";
import type { ProductFormState } from "@/app/productos/actions";
import { ProductPhoto } from "@/components/product-photo";
import { TAX_RATES } from "@/lib/format";

type CategoryOption = { id: string; name: string };

type Props = {
  action: (
    prev: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  categories: CategoryOption[];
  initial?: {
    name: string;
    sku: string;
    categoryId: string;
    costPrice: string;
    salePrice: string;
    taxRate: number;
    active: boolean;
    photoUrl?: string | null;
  };
  submitLabel: string;
};

export function ProductForm({
  action,
  categories,
  initial,
  submitLabel,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onPhotoChange(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
  }

  const shownPhoto = previewUrl ?? initial?.photoUrl ?? null;

  return (
    <form
      action={formAction}
      className="grid max-w-2xl gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Field label="Nombre" error={state.fieldErrors?.name?.[0]}>
        <input
          name="name"
          required
          defaultValue={initial?.name}
          className="input"
        />
      </Field>

      <Field label="SKU" error={state.fieldErrors?.sku?.[0]}>
        <input
          name="sku"
          required
          defaultValue={initial?.sku}
          className="input uppercase"
        />
      </Field>

      <Field label="Categoría" error={state.fieldErrors?.categoryId?.[0]}>
        <select
          name="categoryId"
          required
          defaultValue={initial?.categoryId}
          className="input"
        >
          <option value="">Seleccionar…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Precio de compra"
          error={state.fieldErrors?.costPrice?.[0]}
        >
          <input
            name="costPrice"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={initial?.costPrice ?? "0"}
            className="input"
          />
        </Field>
        <Field
          label="Precio de venta"
          error={state.fieldErrors?.salePrice?.[0]}
        >
          <input
            name="salePrice"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={initial?.salePrice}
            className="input"
          />
        </Field>
      </div>

      <Field label="IVA" error={state.fieldErrors?.taxRate?.[0]}>
        <select
          name="taxRate"
          defaultValue={String(initial?.taxRate ?? 19)}
          className="input"
        >
          {TAX_RATES.map((rate) => (
            <option key={rate} value={rate}>
              {rate}%
            </option>
          ))}
        </select>
      </Field>

      <Field label="Foto">
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-teal-800"
        />
        {shownPhoto ? (
          <div className="mt-3">
            {previewUrl ? (
              // Local blob preview (not yet uploaded)
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Vista previa"
                className="h-24 w-24 rounded-lg object-cover ring-1 ring-slate-200"
              />
            ) : (
              <ProductPhoto
                src={shownPhoto}
                alt="Foto actual"
                size="md"
                className="ring-1 ring-slate-200"
              />
            )}
          </div>
        ) : null}
      </Field>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          name="active"
          type="checkbox"
          defaultChecked={initial?.active ?? true}
          className="size-4 rounded border-slate-300 text-teal-700"
        />
        Producto activo
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Guardando…" : submitLabel}
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

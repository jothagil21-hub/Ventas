"use client";

import { useActionState } from "react";
import type { CategoryFormState } from "@/app/categorias/actions";

type Props = {
  action: (
    prev: CategoryFormState,
    formData: FormData,
  ) => Promise<CategoryFormState>;
  initial?: { name: string; active: boolean };
  submitLabel: string;
};

export function CategoryForm({ action, initial, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="grid max-w-lg gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Nombre</label>
        <input
          name="name"
          required
          defaultValue={initial?.name}
          className="input"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-xs text-red-600">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          name="active"
          type="checkbox"
          defaultChecked={initial?.active ?? true}
          className="size-4 rounded border-slate-300 text-teal-700"
        />
        Categoría activa
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

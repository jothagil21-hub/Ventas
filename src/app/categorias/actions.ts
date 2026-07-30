"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

const categorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  active: z.boolean(),
});

export type CategoryFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.category.create({ data: parsed.data });
  } catch {
    return { error: "No se pudo crear la categoría. ¿Nombre duplicado?" };
  }

  revalidatePath("/categorias");
  revalidatePath("/productos");
  redirect("/categorias");
}

export async function updateCategory(
  id: string,
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.category.update({ where: { id }, data: parsed.data });
  } catch {
    return { error: "No se pudo actualizar la categoría." };
  }

  revalidatePath("/categorias");
  revalidatePath("/productos");
  redirect("/categorias");
}

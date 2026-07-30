"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { TAX_RATES } from "@/lib/format";
import { saveProductPhoto } from "@/lib/uploads";

const productSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  sku: z.string().min(1, "El SKU es obligatorio"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  costPrice: z.coerce.number().nonnegative("Precio de compra inválido"),
  salePrice: z.coerce.number().positive("Precio de venta inválido"),
  taxRate: z.coerce
    .number()
    .refine((v) => (TAX_RATES as readonly number[]).includes(v), "IVA inválido"),
  active: z.boolean(),
});

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseActive(formData: FormData) {
  return formData.get("active") === "on" || formData.get("active") === "true";
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    sku: String(formData.get("sku") ?? "").trim().toUpperCase(),
    categoryId: String(formData.get("categoryId") ?? ""),
    costPrice: formData.get("costPrice"),
    salePrice: formData.get("salePrice"),
    taxRate: formData.get("taxRate"),
    active: parseActive(formData),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const photoUrl = await saveProductPhoto(formData.get("photo") as File | null);
    await prisma.product.create({
      data: {
        ...parsed.data,
        photoUrl,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORMATO_IMAGEN") {
      return { error: "La foto debe ser JPG, PNG, WEBP o GIF." };
    }
    if (error instanceof Error && error.message === "IMAGEN_GRANDE") {
      return { error: "La foto no puede superar 5 MB." };
    }
    return { error: "No se pudo crear el producto. ¿SKU duplicado?" };
  }

  revalidatePath("/productos");
  revalidatePath("/consulta");
  redirect("/productos");
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    sku: String(formData.get("sku") ?? "").trim().toUpperCase(),
    categoryId: String(formData.get("categoryId") ?? ""),
    costPrice: formData.get("costPrice"),
    salePrice: formData.get("salePrice"),
    taxRate: formData.get("taxRate"),
    active: parseActive(formData),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const photoUrl = await saveProductPhoto(formData.get("photo") as File | null);
    await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(photoUrl ? { photoUrl } : {}),
      },
    });
  } catch {
    return { error: "No se pudo actualizar el producto. ¿SKU duplicado?" };
  }

  revalidatePath("/productos");
  revalidatePath("/consulta");
  redirect("/productos");
}

export async function toggleProductActive(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  await prisma.product.update({
    where: { id },
    data: { active: !product.active },
  });
  revalidatePath("/productos");
  revalidatePath("/consulta");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
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

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: string }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function mapProductError(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case "FORMATO_IMAGEN":
        return "La foto debe ser JPG, PNG, WEBP o GIF.";
      case "IMAGEN_GRANDE":
        return "La foto no puede superar 5 MB.";
      case "BLOB_NO_CONFIGURADO":
        return "Falta configurar BLOB_READ_WRITE_TOKEN en Vercel para guardar fotos.";
      case "FALLO_SUBIDA":
        return "No se pudo subir la foto. Intenta de nuevo.";
      case "SKU_DUPLICADO":
        return "Ya existe un producto con ese SKU.";
    }
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "Ya existe un producto con ese SKU.";
  }

  console.error("product save error", error);
  return "No se pudo guardar el producto.";
}

async function assertSkuAvailable(sku: string, excludeId?: string) {
  const existing = await prisma.product.findUnique({ where: { sku } });
  if (existing && existing.id !== excludeId) {
    throw new Error("SKU_DUPLICADO");
  }
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
    await assertSkuAvailable(parsed.data.sku);

    let photoUrl: string | null = null;
    try {
      photoUrl = await saveProductPhoto(formData.get("photo") as File | null);
    } catch (photoError) {
      // Si hay archivo y falla la subida, avisamos; no inventamos "SKU duplicado"
      return { error: mapProductError(photoError) };
    }

    await prisma.product.create({
      data: {
        ...parsed.data,
        photoUrl,
      },
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: mapProductError(error) };
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
    await assertSkuAvailable(parsed.data.sku, id);

    let photoUrl: string | null = null;
    try {
      photoUrl = await saveProductPhoto(formData.get("photo") as File | null);
    } catch (photoError) {
      return { error: mapProductError(photoError) };
    }

    await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(photoUrl ? { photoUrl } : {}),
      },
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: mapProductError(error) };
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

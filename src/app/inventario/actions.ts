"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-helpers";
import { addStockEntry, setStockQuantity, transferStock } from "@/lib/inventory";

export type InventoryFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const entrySchema = z.object({
  productId: z.string().min(1),
  branchId: z.string().min(1),
  quantity: z.coerce.number().int().nonnegative("Cantidad inválida"),
  note: z.string().optional(),
  mode: z.enum(["entry", "set"]),
});

const transferSchema = z.object({
  productId: z.string().min(1),
  fromBranchId: z.string().min(1),
  toBranchId: z.string().min(1),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
  note: z.string().optional(),
});

function mapInventoryError(error: unknown): string {
  if (!(error instanceof Error)) return "No se pudo completar la operación.";
  switch (error.message) {
    case "STOCK_INSUFICIENTE":
      return "Stock insuficiente en la ubicación de origen.";
    case "CANTIDAD_INVALIDA":
      return "Cantidad inválida.";
    case "MISMA_UBICACION":
      return "Origen y destino deben ser distintos.";
    default:
      return "No se pudo completar la operación.";
  }
}

export async function adjustStockAction(
  _prev: InventoryFormState,
  formData: FormData,
): Promise<InventoryFormState> {
  const session = await requireAdmin();

  const parsed = entrySchema.safeParse({
    productId: String(formData.get("productId") ?? ""),
    branchId: String(formData.get("branchId") ?? ""),
    quantity: formData.get("quantity"),
    note: String(formData.get("note") ?? "").trim() || undefined,
    mode: String(formData.get("mode") ?? "entry"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.mode === "entry" && parsed.data.quantity <= 0) {
    return { fieldErrors: { quantity: ["La entrada debe ser mayor a 0"] } };
  }

  try {
    if (parsed.data.mode === "set") {
      await setStockQuantity({
        productId: parsed.data.productId,
        branchId: parsed.data.branchId,
        quantity: parsed.data.quantity,
        note: parsed.data.note,
        userId: session.user.id,
      });
    } else {
      await addStockEntry({
        productId: parsed.data.productId,
        branchId: parsed.data.branchId,
        quantity: parsed.data.quantity,
        note: parsed.data.note,
        userId: session.user.id,
      });
    }
  } catch (error) {
    return { error: mapInventoryError(error) };
  }

  revalidatePath("/inventario");
  revalidatePath("/inventario/movimientos");
  revalidatePath("/consulta");
  redirect("/inventario");
}

export async function transferStockAction(
  _prev: InventoryFormState,
  formData: FormData,
): Promise<InventoryFormState> {
  const session = await requireAdmin();

  const parsed = transferSchema.safeParse({
    productId: String(formData.get("productId") ?? ""),
    fromBranchId: String(formData.get("fromBranchId") ?? ""),
    toBranchId: String(formData.get("toBranchId") ?? ""),
    quantity: formData.get("quantity"),
    note: String(formData.get("note") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await transferStock({
      ...parsed.data,
      userId: session.user.id,
    });
  } catch (error) {
    return { error: mapInventoryError(error) };
  }

  revalidatePath("/inventario");
  revalidatePath("/inventario/movimientos");
  revalidatePath("/consulta");
  redirect("/inventario");
}

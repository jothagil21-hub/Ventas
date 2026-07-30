"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSession } from "@/lib/auth-helpers";
import { createPosSale } from "@/lib/sales";
import { PaymentMethod } from "@/generated/prisma/client";

export type PosFormState = {
  error?: string;
};

const saleSchema = z.object({
  branchId: z.string().min(1),
  paymentMethod: z.enum(["CASH", "CARD", "TRANSFER"]),
  customerName: z.string().optional(),
  customerDocument: z.string().optional(),
  linesJson: z.string().min(1),
});

const linesSchema = z
  .array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
    }),
  )
  .min(1);

function mapSaleError(error: unknown): string {
  if (!(error instanceof Error)) return "No se pudo completar la venta.";
  switch (error.message) {
    case "CARRITO_VACIO":
      return "El carrito está vacío.";
    case "SUCURSAL_INVALIDA":
      return "Punto de venta inválido o inactivo.";
    case "NO_ES_PUNTO_VENTA":
      return "Solo se puede vender desde un punto de venta (no bodega).";
    case "PRODUCTO_INVALIDO":
      return "Hay productos inválidos o inactivos en el carrito.";
    case "CANTIDAD_INVALIDA":
      return "Cantidad inválida.";
    case "STOCK_INSUFICIENTE":
      return "Stock insuficiente en el punto de venta para uno o más productos.";
    default:
      return "No se pudo completar la venta.";
  }
}

export async function completeSaleAction(
  _prev: PosFormState,
  formData: FormData,
): Promise<PosFormState> {
  const session = await requireSession();

  const parsed = saleSchema.safeParse({
    branchId: String(formData.get("branchId") ?? ""),
    paymentMethod: String(formData.get("paymentMethod") ?? ""),
    customerName: String(formData.get("customerName") ?? "").trim() || undefined,
    customerDocument:
      String(formData.get("customerDocument") ?? "").trim() || undefined,
    linesJson: String(formData.get("linesJson") ?? ""),
  });

  if (!parsed.success) {
    return { error: "Datos de venta incompletos." };
  }

  let lines: { productId: string; quantity: number }[];
  try {
    lines = linesSchema.parse(JSON.parse(parsed.data.linesJson));
  } catch {
    return { error: "El carrito no es válido." };
  }

  try {
    const invoice = await createPosSale({
      branchId: parsed.data.branchId,
      userId: session.user.id,
      paymentMethod: parsed.data.paymentMethod as PaymentMethod,
      customerName: parsed.data.customerName,
      customerDocument: parsed.data.customerDocument,
      lines,
    });

    revalidatePath("/inventario");
    revalidatePath("/inventario/movimientos");
    revalidatePath("/consulta");
    revalidatePath("/pos");
    revalidatePath("/facturas");
    redirect(`/facturas/${invoice.id}`);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return { error: mapSaleError(error) };
  }
}

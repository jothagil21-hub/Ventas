import { BranchType } from "@/generated/prisma/client";

export function branchTypeLabel(type: BranchType | string) {
  return type === "WAREHOUSE" ? "Bodega" : "Punto de venta";
}

export function movementTypeLabel(type: string) {
  switch (type) {
    case "ENTRY":
      return "Entrada";
    case "ADJUSTMENT":
      return "Ajuste";
    case "TRANSFER_OUT":
      return "Traslado (salida)";
    case "TRANSFER_IN":
      return "Traslado (entrada)";
    case "SALE":
      return "Venta";
    default:
      return type;
  }
}

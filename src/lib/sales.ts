import { prisma } from "@/lib/prisma";
import { applyStockDelta } from "@/lib/inventory";
import {
  BranchType,
  PaymentMethod,
  Prisma,
  StockMovementType,
} from "@/generated/prisma/client";

export type SaleLineInput = {
  productId: string;
  quantity: number;
};

function roundMoney(n: number) {
  return Math.round(n);
}

async function nextInvoiceNumber(tx: Prisma.TransactionClient) {
  const count = await tx.invoice.count();
  return `POS-${String(count + 1).padStart(6, "0")}`;
}

export async function createPosSale(params: {
  branchId: string;
  userId: string;
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerDocument?: string;
  lines: SaleLineInput[];
}) {
  if (!params.lines.length) throw new Error("CARRITO_VACIO");

  return prisma.$transaction(async (tx) => {
    const branch = await tx.branch.findUnique({
      where: { id: params.branchId },
      include: { company: true },
    });

    if (!branch || !branch.active) throw new Error("SUCURSAL_INVALIDA");
    if (branch.type !== BranchType.STORE) throw new Error("NO_ES_PUNTO_VENTA");

    const productIds = params.lines.map((l) => l.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    if (products.length !== new Set(productIds).size) {
      throw new Error("PRODUCTO_INVALIDO");
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    let taxTotal = 0;

    const itemRows = params.lines.map((line) => {
      if (line.quantity <= 0) throw new Error("CANTIDAD_INVALIDA");
      const product = productMap.get(line.productId)!;
      const unitPrice = Number(product.salePrice);
      const lineSubtotal = roundMoney(unitPrice * line.quantity);
      const lineTax = roundMoney(lineSubtotal * (product.taxRate / 100));
      const lineTotal = lineSubtotal + lineTax;
      subtotal += lineSubtotal;
      taxTotal += lineTax;
      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: line.quantity,
        unitPrice,
        taxRate: product.taxRate,
        lineSubtotal,
        lineTax,
        lineTotal,
      };
    });

    const total = subtotal + taxTotal;
    const number = await nextInvoiceNumber(tx);

    const invoice = await tx.invoice.create({
      data: {
        number,
        branchId: params.branchId,
        userId: params.userId,
        paymentMethod: params.paymentMethod,
        customerName: params.customerName,
        customerDocument: params.customerDocument,
        subtotal,
        taxTotal,
        total,
        items: {
          create: itemRows,
        },
      },
      include: {
        items: true,
        branch: { include: { company: true } },
        user: { select: { name: true, email: true } },
      },
    });

    for (const line of itemRows) {
      await applyStockDelta(tx, {
        productId: line.productId,
        branchId: params.branchId,
        delta: -line.quantity,
        type: StockMovementType.SALE,
        note: `Venta ${number}`,
        userId: params.userId,
      });
    }

    return invoice;
  });
}

export function paymentMethodLabel(method: PaymentMethod | string) {
  switch (method) {
    case "CASH":
      return "Efectivo";
    case "CARD":
      return "Tarjeta";
    case "TRANSFER":
      return "Transferencia";
    default:
      return method;
  }
}

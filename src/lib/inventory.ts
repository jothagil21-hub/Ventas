import { prisma } from "@/lib/prisma";
import { Prisma, StockMovementType } from "@/generated/prisma/client";
import { randomUUID } from "crypto";

type Tx = Prisma.TransactionClient;

export async function applyStockDelta(
  tx: Tx,
  params: {
    productId: string;
    branchId: string;
    delta: number;
    type: StockMovementType;
    note?: string;
    userId?: string;
    transferGroupId?: string;
    allowNegative?: boolean;
  },
) {
  const existing = await tx.stockBalance.findUnique({
    where: {
      productId_branchId: {
        productId: params.productId,
        branchId: params.branchId,
      },
    },
  });

  const current = existing?.quantity ?? 0;
  const next = current + params.delta;

  if (!params.allowNegative && next < 0) {
    throw new Error("STOCK_INSUFICIENTE");
  }

  await tx.stockBalance.upsert({
    where: {
      productId_branchId: {
        productId: params.productId,
        branchId: params.branchId,
      },
    },
    create: {
      productId: params.productId,
      branchId: params.branchId,
      quantity: next,
    },
    update: { quantity: next },
  });

  await tx.stockMovement.create({
    data: {
      type: params.type,
      productId: params.productId,
      branchId: params.branchId,
      quantity: params.delta,
      balanceAfter: next,
      note: params.note,
      userId: params.userId,
      transferGroupId: params.transferGroupId,
    },
  });

  return next;
}

/** Entrada o ajuste: quantity es el nuevo saldo absoluto. */
export async function setStockQuantity(params: {
  productId: string;
  branchId: string;
  quantity: number;
  note?: string;
  userId?: string;
  asEntry?: boolean;
}) {
  if (params.quantity < 0) throw new Error("CANTIDAD_INVALIDA");

  return prisma.$transaction(async (tx) => {
    const existing = await tx.stockBalance.findUnique({
      where: {
        productId_branchId: {
          productId: params.productId,
          branchId: params.branchId,
        },
      },
    });
    const current = existing?.quantity ?? 0;
    const delta = params.quantity - current;
    const type =
      params.asEntry || current === 0
        ? StockMovementType.ENTRY
        : StockMovementType.ADJUSTMENT;

    return applyStockDelta(tx, {
      productId: params.productId,
      branchId: params.branchId,
      delta,
      type,
      note: params.note,
      userId: params.userId,
      allowNegative: true,
    });
  });
}

/** Entrada relativa: suma unidades (compra / ingreso). */
export async function addStockEntry(params: {
  productId: string;
  branchId: string;
  quantity: number;
  note?: string;
  userId?: string;
}) {
  if (params.quantity <= 0) throw new Error("CANTIDAD_INVALIDA");

  return prisma.$transaction(async (tx) =>
    applyStockDelta(tx, {
      productId: params.productId,
      branchId: params.branchId,
      delta: params.quantity,
      type: StockMovementType.ENTRY,
      note: params.note,
      userId: params.userId,
    }),
  );
}

export async function transferStock(params: {
  productId: string;
  fromBranchId: string;
  toBranchId: string;
  quantity: number;
  note?: string;
  userId?: string;
}) {
  if (params.quantity <= 0) throw new Error("CANTIDAD_INVALIDA");
  if (params.fromBranchId === params.toBranchId) {
    throw new Error("MISMA_UBICACION");
  }

  const transferGroupId = randomUUID();

  return prisma.$transaction(async (tx) => {
    await applyStockDelta(tx, {
      productId: params.productId,
      branchId: params.fromBranchId,
      delta: -params.quantity,
      type: StockMovementType.TRANSFER_OUT,
      note: params.note,
      userId: params.userId,
      transferGroupId,
    });

    await applyStockDelta(tx, {
      productId: params.productId,
      branchId: params.toBranchId,
      delta: params.quantity,
      type: StockMovementType.TRANSFER_IN,
      note: params.note,
      userId: params.userId,
      transferGroupId,
    });

    return transferGroupId;
  });
}

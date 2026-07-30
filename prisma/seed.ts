import "dotenv/config";
import {
  BranchType,
  PrismaClient,
  Role,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL no está definida");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  const sellerHash = await bcrypt.hash("vendedor123", 10);

  await prisma.user.upsert({
    where: { email: "admin@ventas.local" },
    update: {},
    create: {
      email: "admin@ventas.local",
      name: "Administrador",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "vendedor@ventas.local" },
    update: {},
    create: {
      email: "vendedor@ventas.local",
      name: "Vendedor Demo",
      passwordHash: sellerHash,
      role: Role.SELLER,
    },
  });

  const company = await prisma.company.upsert({
    where: { id: "seed-company" },
    update: {},
    create: {
      id: "seed-company",
      name: "Comercial Demo SAS",
      nit: "900123456-1",
    },
  });

  const warehouse = await prisma.branch.upsert({
    where: { id: "seed-warehouse" },
    update: {
      name: "Bodega Central",
      type: BranchType.WAREHOUSE,
      active: true,
    },
    create: {
      id: "seed-warehouse",
      name: "Bodega Central",
      address: "Calle 1 #1-10, Bogotá",
      active: true,
      type: BranchType.WAREHOUSE,
      companyId: company.id,
    },
  });

  const existingStores = await prisma.branch.count({
    where: { companyId: company.id, type: BranchType.STORE },
  });

  if (existingStores === 0) {
    await prisma.branch.createMany({
      data: [
        {
          name: "Sucursal Centro",
          address: "Calle 10 #5-20, Bogotá",
          active: true,
          type: BranchType.STORE,
          companyId: company.id,
        },
        {
          name: "Sucursal Norte",
          address: "Av. 19 #120-45, Bogotá",
          active: true,
          type: BranchType.STORE,
          companyId: company.id,
        },
      ],
    });
  } else {
    await prisma.branch.updateMany({
      where: {
        companyId: company.id,
        NOT: { id: warehouse.id },
      },
      data: { type: BranchType.STORE },
    });
  }

  const category = await prisma.category.upsert({
    where: { name: "General" },
    update: {},
    create: { name: "General", active: true },
  });

  const product = await prisma.product.upsert({
    where: { sku: "DEMO-001" },
    update: {},
    create: {
      name: "Producto de demostración",
      sku: "DEMO-001",
      costPrice: 10000,
      salePrice: 15000,
      taxRate: 19,
      active: true,
      categoryId: category.id,
    },
  });

  const stockCount = await prisma.stockBalance.count({
    where: { productId: product.id, branchId: warehouse.id },
  });

  if (stockCount === 0) {
    await prisma.stockBalance.create({
      data: {
        productId: product.id,
        branchId: warehouse.id,
        quantity: 50,
      },
    });
    await prisma.stockMovement.create({
      data: {
        type: "ENTRY",
        productId: product.id,
        branchId: warehouse.id,
        quantity: 50,
        balanceAfter: 50,
        note: "Carga inicial seed",
      },
    });
  }

  console.log("Seed completado.");
  console.log("Admin: admin@ventas.local / admin123");
  console.log("Vendedor: vendedor@ventas.local / vendedor123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import "dotenv/config";
import { PrismaClient, Role } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

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

  const existingBranches = await prisma.branch.count({
    where: { companyId: company.id },
  });

  if (existingBranches === 0) {
    await prisma.branch.createMany({
      data: [
        {
          name: "Sucursal Centro",
          address: "Calle 10 #5-20, Bogotá",
          active: true,
          companyId: company.id,
        },
        {
          name: "Sucursal Norte",
          address: "Av. 19 #120-45, Bogotá",
          active: true,
          companyId: company.id,
        },
      ],
    });
  }

  const category = await prisma.category.upsert({
    where: { name: "General" },
    update: {},
    create: { name: "General", active: true },
  });

  await prisma.product.upsert({
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

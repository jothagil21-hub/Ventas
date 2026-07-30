"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { BranchType } from "@/generated/prisma/client";

const branchSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  address: z.string().optional(),
  active: z.boolean(),
  type: z.enum(["WAREHOUSE", "STORE"]),
});

export type BranchFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createBranch(
  _prev: BranchFormState,
  formData: FormData,
): Promise<BranchFormState> {
  await requireAdmin();
  const parsed = branchSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim() || undefined,
    active: formData.get("active") === "on",
    type: String(formData.get("type") ?? "STORE"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const company = await prisma.company.findFirst();
  if (!company) {
    return { error: "No hay empresa configurada. Ejecuta el seed." };
  }

  await prisma.branch.create({
    data: {
      name: parsed.data.name,
      address: parsed.data.address,
      active: parsed.data.active,
      type: parsed.data.type as BranchType,
      companyId: company.id,
    },
  });

  revalidatePath("/sucursales");
  revalidatePath("/inventario");
  redirect("/sucursales");
}

export async function updateBranch(
  id: string,
  _prev: BranchFormState,
  formData: FormData,
): Promise<BranchFormState> {
  await requireAdmin();
  const parsed = branchSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim() || undefined,
    active: formData.get("active") === "on",
    type: String(formData.get("type") ?? "STORE"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.branch.update({
    where: { id },
    data: {
      name: parsed.data.name,
      address: parsed.data.address,
      active: parsed.data.active,
      type: parsed.data.type as BranchType,
    },
  });
  revalidatePath("/sucursales");
  revalidatePath("/inventario");
  redirect("/sucursales");
}

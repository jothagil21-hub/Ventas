"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

const branchSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  address: z.string().optional(),
  active: z.boolean(),
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
      ...parsed.data,
      companyId: company.id,
    },
  });

  revalidatePath("/sucursales");
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
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.branch.update({ where: { id }, data: parsed.data });
  revalidatePath("/sucursales");
  redirect("/sucursales");
}

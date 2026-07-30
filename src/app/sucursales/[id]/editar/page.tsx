import { AppShell } from "@/components/app-shell";
import { BranchForm } from "@/components/branch-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateBranch } from "../../actions";

export default async function EditBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) notFound();

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold">Editar ubicación</h1>
      <BranchForm
        action={updateBranch.bind(null, branch.id)}
        submitLabel="Guardar cambios"
        initial={{
          name: branch.name,
          address: branch.address,
          active: branch.active,
          type: branch.type,
        }}
      />
    </AppShell>
  );
}

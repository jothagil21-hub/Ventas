import { AppShell } from "@/components/app-shell";
import { BranchForm } from "@/components/branch-form";
import { createBranch } from "../actions";

export default function NewBranchPage() {
  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold">Nueva ubicación</h1>
      <BranchForm action={createBranch} submitLabel="Crear ubicación" />
    </AppShell>
  );
}

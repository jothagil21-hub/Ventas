import { AppShell } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function BranchesPage() {
  const [company, branches] = await Promise.all([
    prisma.company.findFirst(),
    prisma.branch.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Sucursales</h1>
          <p className="text-sm text-slate-600">
            {company
              ? `${company.name} · NIT ${company.nit}`
              : "Sin empresa configurada"}
          </p>
        </div>
        <Link
          href="/sucursales/nueva"
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Nueva sucursal
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">{branch.name}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {branch.address || "Sin dirección"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {branch.active ? "Activa" : "Inactiva"} · Stock en fase 2
                </p>
              </div>
              <Link
                href={`/sucursales/${branch.id}/editar`}
                className="text-sm text-teal-700 hover:underline"
              >
                Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

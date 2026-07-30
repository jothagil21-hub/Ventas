import { AppShell } from "@/components/app-shell";
import { CategoryForm } from "@/components/category-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateCategory } from "../../actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold">Editar categoría</h1>
      <CategoryForm
        action={updateCategory.bind(null, category.id)}
        submitLabel="Guardar cambios"
        initial={{ name: category.name, active: category.active }}
      />
    </AppShell>
  );
}

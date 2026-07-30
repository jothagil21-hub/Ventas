import { AppShell } from "@/components/app-shell";
import { CategoryForm } from "@/components/category-form";
import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold">Nueva categoría</h1>
      <CategoryForm action={createCategory} submitLabel="Crear categoría" />
    </AppShell>
  );
}

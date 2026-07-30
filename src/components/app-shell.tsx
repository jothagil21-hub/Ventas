import { auth } from "@/auth";
import { logoutAction } from "@/app/login/actions";
import Link from "next/link";
import { isAdmin } from "@/lib/auth-helpers";

const sellerLinks = [
  { href: "/consulta", label: "Consulta rápida" },
  // { href: "/pos", label: "POS" },
  { href: "/facturas", label: "Facturas" },  
  { href: "/inventario", label: "Inventario" },
];

const adminLinks = [
  { href: "/consulta", label: "Consulta rápida" },
  // { href: "/pos", label: "POS" },
  { href: "/facturas", label: "Facturas" },  
  { href: "/productos", label: "Productos" },
  { href: "/categorias", label: "Categorías" },
  { href: "/sucursales", label: "Ubicaciones" },
  { href: "/inventario", label: "Inventario" },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const admin = isAdmin(session?.user?.role);
  const links = admin ? adminLinks : sellerLinks;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f0fdfa_0%,#f8fafc_28%,#f1f5f9_100%)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div>
            <Link href="/consulta" className="text-lg font-semibold text-teal-800">
              Ventas
            </Link>
            <p className="text-xs text-slate-500">
              {session?.user?.name} ·{" "}
              {admin ? "Administrador" : "Vendedor"}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800"
              >
                {link.label}
              </Link>
            ))}
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

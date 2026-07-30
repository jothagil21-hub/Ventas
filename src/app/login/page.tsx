import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#ecfdf5_0%,_#f8fafc_55%,_#e2e8f0_100%)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-lg shadow-slate-200/60 backdrop-blur">
        <p className="text-sm font-semibold tracking-wide text-teal-700 uppercase">
          Sistema de Ventas
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Iniciar sesión
        </h1>
        <p className="mt-1 mb-6 text-sm text-slate-600">
          Catálogo y consulta para sucursales
        </p>
        <LoginForm />
      </div>
    </main>
  );
}

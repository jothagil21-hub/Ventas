# Sistema de Ventas

App web multi-sucursal (Colombia). **Fase 1:** fundación + catálogo comercial + consulta rápida.

## Requisitos

- Node.js 22+
- npm

> En desarrollo se usa **SQLite** (no requiere PostgreSQL local). El esquema Prisma está listo para pasar a Postgres en producción.

## Arranque

```bash
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Usuarios seed

| Rol | Correo | Contraseña |
|---|---|---|
| Admin | `admin@ventas.local` | `admin123` |
| Vendedor | `vendedor@ventas.local` | `vendedor123` |

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run db:migrate` | Migraciones Prisma |
| `npm run db:seed` | Datos iniciales |
| `npm run db:setup` | Migrar + seed |

## Módulos Fase 1

- Login y roles (Admin / Vendedor)
- Sucursales (sin stock)
- Categorías y productos (foto, SKU, precios, IVA)
- Consulta rápida para mostrador

Contrato de producto: [docs/plans/2026-07-30-001-feat-ventas-fase1-catalogo-plan.md](docs/plans/2026-07-30-001-feat-ventas-fase1-catalogo-plan.md)

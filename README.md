# Sistema de Ventas

App web multi-sucursal (Colombia): catálogo, inventario, POS.

## Requisitos

- Node.js 22+
- npm
- **PostgreSQL** (Neon, Supabase, Vercel Postgres, Prisma Postgres o local)

## Arranque

1. Copia variables de entorno:

```bash
cp .env.example .env
```

2. Pon tu `DATABASE_URL` de Postgres en `.env` (debe incluir SSL en la nube, p. ej. `?sslmode=require`).

3. Instala, migra y siembra:

```bash
npm install
npx prisma generate
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
| `npm run db:migrate` | Migraciones en desarrollo |
| `npm run db:migrate:deploy` | Aplicar migraciones (CI / Vercel) |
| `npm run db:seed` | Datos iniciales |
| `npm run db:setup` | `migrate deploy` + seed |

## Deploy en Vercel (resumen)

1. Variables: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` (URL del deploy)
2. Build command sugerido: `prisma generate && prisma migrate deploy && next build`
3. Fotos de productos: configura `BLOB_READ_WRITE_TOKEN` (Vercel Blob). Sin eso las fotos no persisten en producción.

## Base de datos

- Provider: **PostgreSQL** (Prisma 7 + `@prisma/adapter-pg`)
- Migraciones SQLite antiguas: `prisma/migrations_sqlite_backup/` (solo referencia)

## Módulos

### Fase 1
- Login y roles (Admin / Vendedor)
- Ubicaciones (bodega / punto de venta)
- Categorías y productos (foto, SKU, precios, IVA)
- Consulta rápida para mostrador

### Fase 2
- Inventario por ubicación
- Entrada / ajuste / traslados
- Historial de movimientos

### Fase 3
- POS (Admin y Vendedor)
- Ticket imprimible con IVA y medio de pago
- Historial de facturas
- Descuento de stock por punto de venta

Contrato Fase 1: [docs/plans/2026-07-30-001-feat-ventas-fase1-catalogo-plan.md](docs/plans/2026-07-30-001-feat-ventas-fase1-catalogo-plan.md)

Contrato Fase 2: [docs/plans/2026-07-30-002-feat-ventas-fase2-inventario-plan.md](docs/plans/2026-07-30-002-feat-ventas-fase2-inventario-plan.md)

Contrato Fase 3: [docs/plans/2026-07-30-003-feat-ventas-fase3-pos-plan.md](docs/plans/2026-07-30-003-feat-ventas-fase3-pos-plan.md)

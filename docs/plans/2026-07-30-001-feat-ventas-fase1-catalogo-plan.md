---
title: Sistema de Ventas Fase 1 - Plan
artifact_contract: ce-unified-plan/v1
artifact_readiness: requirements-only
product_contract_source: ce-brainstorm
date: 2026-07-30
---

# Sistema de Ventas Fase 1 - Plan

## Goal Capsule

**Objective:** Entregar una app web para una empresa colombiana multi-sucursal con catálogo comercial (foto, SKU, precios, IVA) y consulta rápida de mostrador, sobre fundación de empresa/sucursales y roles Admin/Vendedor.

**Product authority:** Decisiones de brainstorming 2026-07-30 (enfoque C).

**Open blockers:** Ninguno para Fase 1. PostgreSQL de producción queda pendiente de hosting; desarrollo usa SQLite.

## Product Contract

### Context

Sistema de ventas construido por fases: catálogo → inventario mixto → factura POS → factura electrónica DIAN.

### Settled decisions

| Decision | Value | Provenance |
|---|---|---|
| Operación | Multi-sucursal, misma empresa | session-settled |
| Inventario futuro | Mixto (bodega + stock por sucursal) | session-settled |
| País | Colombia | session-settled |
| Plataforma | App web | session-settled |
| Enfoque Fase 1 | Fundación + catálogo + consulta rápida | session-settled |
| Roles | Admin (CRUD) / Vendedor (consulta) | session-settled |
| Precios | Globales entre sucursales | session-settled |
| Ficha producto | Comercial: nombre, foto, SKU, categoría, precios, IVA, activo | session-settled |

### Actors

- **Admin:** gestiona sucursales, categorías y productos.
- **Vendedor:** consulta el catálogo (listado + búsqueda rápida).

### In scope (Fase 1)

- Login con roles Admin y Vendedor
- Empresa (nombre, NIT) y sucursales (alta/listado; sin stock)
- Categorías de producto
- Productos: nombre, foto, SKU, categoría, precio compra, precio venta, IVA (0/5/19), activo/inactivo
- Catálogo compartido entre sucursales
- Consulta rápida por nombre o SKU (foto + precio venta); productos inactivos ocultos

### Out of scope

- Inventario, bodega, traslados, existencias
- POS, cobro, factura POS / impresión fiscal
- Factura electrónica DIAN
- Variantes, código de barras, unidades de medida
- Multi-empresa / SaaS
- App nativa o de escritorio
- Precios distintos por sucursal

### Success criteria

1. Admin crea categorías y productos con foto y precios.
2. SKU único; producto inactivo no aparece en la consulta del vendedor.
3. Vendedor busca por nombre/SKU y ve foto + precio venta.
4. Existen al menos 2 sucursales registradas (sin stock).
5. Vendedor no puede crear/editar productos ni sucursales.

### Roadmap

1. **Fase 1 (hecho en código):** auth, empresa/sucursales, catálogo, consulta rápida
2. **Fase 2:** bodega + stock por ubicación + traslados
3. **Fase 3:** POS + factura POS elaborada (campos fiscales Colombia)
4. **Fase 4:** factura electrónica DIAN

### Credenciales de ingreso (seed)

Usuarios creados con `npm run db:setup` / `npm run db:seed`. App en [http://localhost:3000](http://localhost:3000).

| Rol | Correo | Contraseña |
|---|---|---|
| Admin | `admin@ventas.local` | `admin123` |
| Vendedor | `vendedor@ventas.local` | `vendedor123` |

### Technical notes (implementation)

- Next.js App Router + TypeScript + Tailwind
- Prisma + SQLite en desarrollo (`file:./prisma/dev.db`); migrar a PostgreSQL en producción cambiando provider/URL
- Auth.js (Credentials) con JWT y roles
- Fotos en `public/uploads`

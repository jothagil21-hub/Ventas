---
title: Sistema de Ventas Fase 2 - Inventario - Plan
artifact_contract: ce-unified-plan/v1
artifact_readiness: requirements-only
product_contract_source: ce-brainstorm
date: 2026-07-30
---

# Sistema de Ventas Fase 2 - Inventario - Plan

## Goal Capsule

**Objective:** Inventario mixto con ubicaciones tipadas (bodega / punto de venta), stock por producto×ubicación, entradas/ajustes, traslados e historial de movimientos.

**Product authority:** Decisiones brainstorming Fase 2 (2026-07-30).

## Product Contract

### Settled decisions

| Decision | Value |
|---|---|
| Modelo de bodega | Ubicación (`Branch`) con tipo WAREHOUSE o STORE |
| Quién mueve stock | Solo Admin |
| Vendedor | Consulta existencias (matriz e historial); sin crear movimientos |
| Operaciones | Entrada/ajuste + traslados + historial |
| Consulta rápida | Muestra stock total y desglose por ubicación |

### In scope

- Tipo de ubicación: Bodega / Punto de venta
- Saldos `StockBalance` por producto y ubicación
- Entrada (sumar) y ajuste (dejar en cantidad)
- Traslado entre ubicaciones (salida + entrada vinculadas)
- Listado de movimientos
- Matriz de inventario
- Stock visible en consulta rápida

### Out of scope

- Descuento de stock por venta POS (Fase 3)
- Factura electrónica DIAN (Fase 4)
- Reservas / órdenes de traslado pendientes de aceptación

### Credenciales

| Rol | Correo | Contraseña |
|---|---|---|
| Admin | `admin@ventas.local` | `admin123` |
| Vendedor | `vendedor@ventas.local` | `vendedor123` |

### Roadmap

1. Fase 1 — Catálogo (hecho)
2. Fase 2 — Inventario (este plan)
3. Fase 3 — POS + factura POS
4. Fase 4 — Factura electrónica DIAN

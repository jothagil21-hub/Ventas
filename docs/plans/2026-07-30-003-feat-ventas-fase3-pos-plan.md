---
title: Sistema de Ventas Fase 3 - POS - Plan
artifact_contract: ce-unified-plan/v1
artifact_readiness: requirements-only
product_contract_source: ce-brainstorm
date: 2026-07-30
---

# Sistema de Ventas Fase 3 - POS - Plan

## Goal Capsule

**Objective:** Facturación POS con ticket elaborable/imprimible, descuento de stock en el punto de venta elegido, y historial de ventas.

## Settled decisions

| Decision | Value |
|---|---|
| Quién vende | Admin y Vendedor |
| Stock | Se elige punto de venta; se descuenta de esa ubicación |
| Ticket | Empresa (NIT), sucursal, ítems, IVA, totales, medio de pago; cliente opcional; vista imprimible |
| Medios de pago | Efectivo, tarjeta, transferencia (uno por venta) |

## In scope

- Pantalla POS (carrito, búsqueda, cobro)
- Numeración interna `POS-000001`
- Descuento de inventario con movimiento tipo SALE
- Ticket imprimible
- Historial de facturas

## Out of scope

- Factura electrónica DIAN
- Resolución/numeración fiscal formal DIAN
- Múltiples medios de pago por venta
- Devoluciones / notas crédito

## Credenciales

| Rol | Correo | Contraseña |
|---|---|---|
| Admin | `admin@ventas.local` | `admin123` |
| Vendedor | `vendedor@ventas.local` | `vendedor123` |

## Roadmap

1. Fase 1 — Catálogo (hecho)
2. Fase 2 — Inventario (hecho)
3. Fase 3 — POS (este plan)
4. Fase 4 — Factura electrónica DIAN

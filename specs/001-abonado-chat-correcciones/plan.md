# Implementation Plan: Abonado, Chat Asesor y Correcciones Deudas/Movimientos

**Branch**: `001-abonado-chat-correcciones` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-abonado-chat-correcciones/spec.md`

## Summary

Tres incrementos sobre la Web App de Google Apps Script: (1) mostrar el campo Abonado de solo lectura en los formularios de Deuda (las fórmulas de Sheets siguen siendo dueñas de F-H), (2) mini-chat con Gemini en la sección Asesor IA del Dashboard con un prompt rico (dashboard + deudas + últimos movimientos) e historial de sesión, y (3) correcciones de datos: omitir la fila 2 de fórmulas en Dashboard, filtrar la fila fantasma de Deudas, resolver el nombre deudor en movimientos con badge en Visualizar, y documentar la relación `deuda_id` entre tablas separadas.

## Technical Context

**Language/Version**: JavaScript (Apps Script V8, ECMAScript 2020) — sin `import`/`export` (`sourceType: "script"`).

**Primary Dependencies**: Google Apps Script (`SpreadsheetApp`, `LockService`, `UrlFetchApp`, `HtmlService`, `PropertiesService`, `Session`, `Utilities`); frontend Bootstrap 5.3 + Chart.js (CDN); Gemini REST API v1beta.

**Storage**: Google Sheets (hojas `Movimientos`, `Categorias`, `Deudas`), `SPREADSHEET_ID` en Script Properties. F-H de Deudas = ArrayFormulas (solo lectura para la app).

**Testing**: Sin tests en el repo; única verificación automatizada: `npx --yes eslint src/`.

**Target Platform**: Web App de Google Apps Script (deploy `MYSELF`), horario `America/Bogota`.

**Project Type**: Web app (SPA frontend en parciales HTML + backend Apps Script global).

**Constraints**: `no-undef` como error (globos listados en `eslint.config.js`); lint solo cubre `src/**/*.js`; solo `npx --yes ...`; respuestas/docs en español.

**Scale/Scope**: 8 archivos backend JS, 17 parciales HTML; ~+1 archivo backend nuevo (AsesorIA.js) y ~6 archivos tocados.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` sigue en plantilla sin personalizar (según AGENTS.md, ignórala salvo petición). Se aplica la guía de estilo real del repo (`docs/004-guias/05-estilo-javascript.md`):

| Regla | Estado |
|---|---|
| Sin `import`/`export`; `/* exported */` + `/* global */` | ✅ se cumple en todas las tareas |
| `no-undef` sin nuevos globos no listados | ✅ solo servicios ya en `eslint.config.js` |
| Lint `npx --yes eslint src/` sin errores | ✅ T001 (baseline) y T014 (final) |
| Sin Python / sin `npm run` / sin binarios globales | ✅ |
| Credenciales nunca en el repo | ✅ sin cambios de config |
| Fórmulas F-H de Deudas intactas | ✅ FR-002 verificado en T004/T014 |

Sin violaciones → sin tabla de justificación.

## Project Structure

### Documentation (this feature)

```text
specs/001-abonado-chat-correcciones/
├── plan.md              # Este archivo
├── spec.md              # Historias y requerimientos
└── tasks.md             # Lista de tareas (generada con setup-tasks.sh)
```

### Source Code (repository root)

```text
src/
├── backend/
│   ├── AsesorIA.js       # NUEVO — preguntarAsesor() con prompt rico (US2)
│   ├── Gemini.js         # Refactor — helper compartido de llamada API (US2)
│   ├── Dashboard.js      # Fix — leer desde fila 3 (US3)
│   ├── Deudas.js         # Fix — filtrar fila fantasma (US3)
│   ├── Movimientos.js    # Fix — resolver nombre deudor (US3)
│   └── (resto sin cambios)
└── frontend/
    ├── deudas.html       # US1 — campo Abonado solo lectura + aclarativa
    ├── js-deudas.html    # US1 — poblar/clear del campo
    ├── dashboard.html    # US2 — markup del chat (reemplaza botón único)
    ├── js-dashboard.html # US2 — lógica del chat + chips
    └── js-visualizar.html# US3 — badge "Deuda: X"
docs/
└── 001-requisitos/03-estructura-tablas.md  # US3 — relación deuda_id + fila 2
```

**Structure Decision**: Sin nuevas carpetas; se añade un módulo backend (`AsesorIA.js`) siguiendo el patrón de módulos globales existente y se editan parciales HTML ya incluidos por `app.html` (no cambia el orden de includes).

## Complexity Tracking

Sin violaciones de constitución → tabla vacía.

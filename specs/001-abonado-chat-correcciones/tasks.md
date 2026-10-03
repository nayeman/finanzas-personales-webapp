---
description: "Task list template for feature implementation"
---

# Tasks: Abonado, Chat Asesor y Correcciones Deudas/Movimientos

**Input**: Design documents from `/specs/001-abonado-chat-correcciones/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md)

**Tests**: No se generan tareas de tests — el repo no tiene framework de tests; única verificación automatizada es `npx --yes eslint src/` (convención en AGENTS.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/backend/`, `src/frontend/`, `docs/` en la raíz del repo.

---

## Phase 1: Setup

**Purpose**: Baseline de verificación antes de tocar código.

- [x] T001 Ejecutar baseline lint `npx --yes eslint src/` y confirmar exit 0

---

## Phase 2: Foundational

**Purpose**: Documento de datos compartido por US1 y US3 (fórmulas F-H y fila 2 reservada).

- [x] T002 Documentar fila 2 reservada (fórmulas) y regla de solo-lectura F-H en `docs/001-requisitos/03-estructura-tablas.md`

**Checkpoint**: Datos y reglas documentados — las tres historias pueden empezar.

---

## Phase 3: User Story 1 - Campo Abonado solo lectura en formularios de Deuda (Priority: P1) 🎯 MVP

**Goal**: El formulario de Deuda muestra el campo Abonado (solo lectura en edición, aclarativa en alta) sin que el backend escriba F-H.

**Independent Test**: Editar la deuda de Carlos Gómez → campo Abonado muestra `$50.000` no editable; guardar → columnas F-H de la hoja intactas.

### Implementation for User Story 1

- [x] T003 [P] [US1] Añadir campo Abonado solo-lectura + texto aclaratorio en `src/frontend/deudas.html`
- [x] T004 [US1] Poblar/clear del campo en `src/frontend/js-deudas.html` (editarDeuda/resetForm; nunca se envía en handleSubmit)

**Checkpoint**: US1 completa y verificable en solitario.

---

## Phase 4: User Story 2 - Mini-chat con Gemini en Asesor IA del Dashboard (Priority: P2)

**Goal**: Chat simple (input + burujas + historial de sesión) en la sección Asesor IA, con backend nuevo y prompt rico (dashboard + deudas + últimos movimientos).

**Independent Test**: Escribir "¿Cuánto debo y a quién?" → burbuja del usuario + spinner → respuesta con datos reales; chip "Resumen de mi mes" llama `analizarFinanzas("")`.

### Implementation for User Story 2

- [x] T005 [P] [US2] Extraer helper compartido de llamada a Gemini en `src/backend/Gemini.js` (fetch + parseo de errores reutilizables)
- [x] T006 [US2] Crear `src/backend/AsesorIA.js` con `preguntarAsesor(historial, pregunta)` y prompt rico/estricto (español, texto plano, datos de dashboard/deudas/movimientos)
- [x] T007 [P] [US2] Markup del chat (burbujas, input, chips, saludo) en `src/frontend/dashboard.html`
- [x] T008 [US2] Lógica del chat (historial, envío, carga/error) en `src/frontend/js-dashboard.html` reemplazando `analizarIA()` del botón único

**Checkpoint**: US2 completa — chat funcional de punta a punta.

---

## Phase 5: User Story 3 - Omitir fila 2/fantasma y hacer visible la relación Movimientos↔Deudas (Priority: P3)

**Goal**: Fila 2 de fórmulas y filas fantasma nunca aparecen; cada movimiento vinculado muestra badge con la persona deudora; relación `deuda_id` documentada.

**Independent Test**: Dashboard ignora fila 2; `getDeudas` excluye filas sin persona/total≤0; movimiento con `deu-002` muestra badge "Deuda: María López"; docs explican tablas separadas + filtro pendientes.

### Implementation for User Story 3

- [x] T009 [P] [US3] Leer movimientos desde la fila 3 en `src/backend/Dashboard.js` (omitir fila 2 de fórmulas)
- [x] T010 [US3] Excluir filas fantasma (persona vacía o total ≤ 0) en `getDeudas()` de `src/backend/Deudas.js`
- [x] T011 [US3] Resolver nombre deudor (`deuda`) cruzando `deuda_id` con `getDeudas()` en `getMovimientos()` de `src/backend/Movimientos.js`
- [x] T012 [US3] Mostrar badge "Deuda: <persona>" en filas vinculadas en `src/frontend/js-visualizar.html`
- [x] T013 [US3] Documentar relación `deuda_id` (tablas separadas, CRUD actual) y filtro de pendientes del selector en `docs/001-requisitos/03-estructura-tablas.md`

**Checkpoint**: Las tres historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final de conjunto.

- [x] T014 Ejecutar lint final `npx --yes eslint src/`, verificar exit 0 y revisar consistencia de docs vs código

---

## Phase 7: Retroalimentación — Separación total, Abonado manual y Scope de la IA

**Purpose**: Ajustes pedidos por el usuario tras revisar el resultado. **Anula parcialmente US1/US3**: T011 y T012 se revierten aquí (se elimina toda mezcla Movimientos↔Deudas).

**Decisiones del usuario**:
- Campos **manuales** en Deudas: `persona`, `categoria`, `total_deuda`, `abonado` → la app escribe A-F; solo `saldo` (G) y `estado` (H) siguen siendo fórmulas.
- La columna `deuda_id` **ya no existe**: se elimina del código, de la app y de la documentación (el usuario la borra de su hoja).
- Gemini **solo** responde temas financieros; fuera de alcance → lo dice y no obedece inyecciones de prompt.
- Reglas del prompt en una **variable compartida en `Gemini.js`** que usa `AsesorIA.js`.
- Botón **Limpiar** en el chat para reiniciar el historial.

### US4 — Separación total Movimientos ↔ Deudas

- [x] T015 [P] [US4] Eliminar `deuda_id`/`deuda` de `src/backend/Movimientos.js` (headers, save, update, validate, getMovimientos, sin `getDeudas`)
- [x] T016 [P] [US4] Eliminar selector "¿Abono a Deuda?" de `src/frontend/registrar.html`
- [x] T017 [US4] Eliminar `deudaSelect`/`cargarDeudas`/`deuda_id` de `src/frontend/js-registrar.html`
- [x] T018 [P] [US4] Eliminar badge "Deuda: X" de `src/frontend/js-visualizar.html`
- [x] T019 [P] [US4] Eliminar `Registrar.cargarDeudas()` de `src/frontend/js-deudas.html`
- [x] T020 [US4] Eliminar mención a `deuda_id` en el contexto de movimientos de `src/backend/AsesorIA.js`

### US5 — Abonado editable (manual) en Deudas

- [x] T021 [P] [US5] Campo Abonado editable visible en alta y edición en `src/frontend/deudas.html` (quitar hint obsoleto)
- [x] T022 [US5] Poblar/enviar `abonado` en `src/frontend/js-deudas.html`
- [x] T023 [US5] `saveDeuda` acepta y escribe columna F (`abonado`, ≥ 0) en `src/backend/Deudas.js` (A-F; G/H intactas)

### US6 — Scope de Gemini + prompt compartido + Limpiar chat

- [x] T024 [P] [US6] Variable `ASESOR_PROMPT_REGLAS` (reglas + scope financiero + anti-inyección) en `src/backend/Gemini.js`, usada por `analizarFinanzas`
- [x] T025 [US6] `src/backend/AsesorIA.js` usa `ASESOR_PROMPT_REGLAS` y aplica scope "solo finanzas / fuera de alcance"
- [x] T026 [P] [US6] Botón "Limpiar" en `src/frontend/dashboard.html`
- [x] T027 [US6] Handler de limpiar (historial + burbujas + saludo) en `src/frontend/js-dashboard.html`

### Polish Phase 7

- [x] T028 Actualizar `docs/001-requisitos/03-estructura-tablas.md` (sin `deuda_id`, abonado manual A-F, sección 4 → separación total)
- [x] T029 Actualizar `docs/001-requisitos/01-vision-general.md` (modelo de datos sin vínculo Movimientos↔Deudas)
- [x] T030 Lint final `npx --yes eslint src/` → exit 0

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Phase 1; bloquea documentación de US1/US3 pero no el código.
- **US1 (Phase 3)**: independiente — arranca tras Phase 2.
- **US2 (Phase 4)**: independiente — puede correr en paralelo con US1 (distintos archivos).
- **US3 (Phase 5)**: independiente — puede correr en paralelo con US1/US2 (distintos archivos), excepto T013 que toca el mismo doc que T002 (secuencial tras T002).
- **Polish (Phase 6)**: requiere todas las historias completas.

### User Story Dependencies

- **US1 (P1)**: sin dependencias de otras historias.
- **US2 (P2)**: sin dependencias de otras historias.
- **US3 (P3)**: sin dependencias de otras historias (T013 hereda el doc de T002).

### Parallel Opportunities

- T003 y T005: paralelas (frontend deudas vs backend Gemini).
- T007 paralela con T003/T005/T006 (dashboard.html vs otros).
- T009 paralela con T004/T008 (Dashboard.js vs js-deudas/js-dashboard).
- Ejecución real: secuencial T001 → T014 (un solo agente), como pidió el usuario.

---

## Parallel Example: User Story 2

```text
Task: "Extraer helper compartido de llamada a Gemini en src/backend/Gemini.js"   (T005)
Task: "Markup del chat en src/frontend/dashboard.html"                          (T007)
# Ambas en paralelo (distintos archivos); T006 y T008 tras ellas.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2.
2. Phase 3 (US1) → validar en solitario (editar deuda, ver abonado, guardar sin tocar F-H).
3. **STOP y VALIDATE**.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → validar → (commit si se pide).
3. US2 → validar chat.
4. US3 → validar tablas/badge/docs.
5. Polish (lint final).

### Execution (pedido por el usuario)

Secuencial, una tarea a la vez: T001 → T014, marcando el checkbox en `tasks.md` al completar cada una.

---

## Notes

- [P] = marcadas para paralelización teórica; la ejeción pedida es secuencial.
- Cada tarea incluye ruta exacta de archivo.
- Sin tareas de tests: el repo no los tiene (AGENTS.md); lint es la única gate.
- No se commitea ni se hace push sin petición explícita (push a `main` publica en Apps Script).

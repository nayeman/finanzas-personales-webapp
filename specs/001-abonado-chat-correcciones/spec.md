# Feature Specification: Abonado, Chat Asesor y Correcciones Deudas/Movimientos

**Feature Branch**: `001-abonado-chat-correcciones`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: campo abonado en formularios de deuda, mini-chat con Gemini en el Dashboard, omisión de fila de fórmulas (fila 2) y visibilidad de la relación Movimientos↔Deudas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el campo "Abonado" en los formularios de Deuda (Priority: P1)

Como usuario, al crear o editar una deuda quiero ver el campo **Abonado** en el formulario (solo lectura) para saber cuánto se ha pagado, entendiendo que ese valor lo calculan las fórmulas de la hoja Sheets y la app no lo escribe.

**Why this priority**: Es la petición original #1; es de bajo riesgo (solo frontend) y da visibilidad de un dato que ya existe en la hoja.

**Independent Test**: Abrir pestaña Deudas → "+ Editar" en la deuda de Carlos Gómez → el campo "Abonado" muestra `$50.000` sin posibilidad de editarlo; al guardar, `saveDeuda` sigue escribiendo solo A-E (columnas F-H intactas).

**Acceptance Scenarios**:

1. **Given** deuda existente con abonado calculado, **When** se abre Editar Deuda, **Then** el campo Abonado muestra el valor actual y es de solo lectura.
2. **Given** formulario en modo "Nueva Deuda", **When** se renderiza, **Then** se muestra un texto aclaratorio de que Abonado/Saldo/Estado los calcula la hoja (sin campo editable).
3. **Given** cualquier guardado (alta o edición), **When** se ejecuta `saveDeuda`, **Then** NO se escriben las columnas F (abonado), G (saldo) ni H (estado).

---

### User Story 2 - Mini-chat con Gemini en la sección Asesor IA (Priority: P2)

Como usuario, quiero un chat simple dentro de la sección "Asesor Financiero IA" del Dashboard donde haga preguntas y Gemini responda con un prompt más rico y profundo (dashboard + deudas + últimos movimientos), con historial de la conversación en pantalla.

**Why this priority**: Petición original #2; agrega valor de IA conversacional reemplazando el botón único de análisis.

**Independent Test**: Ir al Dashboard → escribir "¿Cuánto debo y a quién?" en el chat → enviar → aparece burbuja del usuario y después la respuesta de Gemini con datos reales de deudas; el historial se conserva durante la sesión.

**Acceptance Scenarios**:

1. **Given** el Dashboard abierto, **When** el usuario escribe una pregunta y envía, **Then** se muestra su burbuja y una indicación de carga, y luego la respuesta del asesor.
2. **Given** el chat vacío, **When** se carga la sección, **Then** hay un saludo inicial y un chip "Resumen de mi mes" que llama `analizarFinanzas("")`.
3. **Given** falta `GEMINI_API_KEY`, **When** se envía una pregunta, **Then** se muestra el error sin romper la UI.
4. **Given** la conversación en curso, **When** se envía otra pregunta, **Then** el backend recibe el historial (últimas ~10 intervenciones) para respuesta con contexto.

---

### User Story 3 - Omitir fila de fórmulas y hacer visible la relación Movimientos↔Deudas (Priority: P3)

Como usuario, quiero que (a) la fila 2 de las hojas (fila de fórmulas, protegida/oculta) nunca aparezca en la app, (b) no aparezca la fila fantasma sin nombre en la tabla de Deudas, y (c) en Visualizar se vea a qué deuda pertenece cada movimiento (badge), documentando además la relación `deuda_id` entre tablas separadas en los docs.

**Why this priority**: Corrige defectos visibles y documenta la arquitectura de datos; no bloquea las historias anteriores.

**Independent Test**: Con una fila 2 que contenga fórmulas en Movimientos/Deudas, el Dashboard y las tablas no la muestran; la fila sin persona/total 0 no aparece en Deudas; un movimiento con `deuda_id = deu-002` muestra el badge "Deuda: María López" en Visualizar.

**Acceptance Scenarios**:

1. **Given** la hoja Movimientos con fila 2 de fórmulas, **When** se carga el Dashboard, **Then** los cálculos leen desde la fila 3 (omite fila 2).
2. **Given** una fila de Deudas sin persona o con total ≤ 0, **When** se llama `getDeudas`, **Then** esa fila se excluye del resultado.
3. **Given** un movimiento con `deuda_id != "None"`, **When** se renderiza en Visualizar, **Then** se muestra el badge con el nombre de la persona deudora.
4. **Given** las tablas Movimientos y Deudas separadas, **When** se consulta `docs/001-requisitos/03-estructura-tablas.md`, **Then** documenta la relación `deuda_id` y por qué el selector de abonos solo lista deudas pendientes.

### Edge Cases

- Deuda recién creada (abonado = $0 por fórmula) → el campo en edición muestra `$0`.
- Historial de chat largo → se recortan las intervenciones más antiguas (máx. ~10) antes de enviar a Gemini.
- Movimiento cuyo `deuda_id` apunta a una deuda eliminada → badge muestra "Deuda eliminada" sin romper la fila.
- Fila fantasma con id `DEU-` pero persona vacía → excluida por el filtro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El formulario de Deuda MUST mostrar el campo Abonado como solo lectura en modo edición, con el valor actual.
- **FR-002**: El backend NO MUST escribir las columnas F/G/H de la hoja Deudas (fórmulas de Sheets son dueñas de abonado/saldo/estado).
- **FR-003**: La app MUST ofrecer un chat en la sección Asesor IA del Dashboard (input + burbujas + historial de sesión).
- **FR-004**: `preguntarAsesor(historial, pregunta)` MUST construir un prompt rico: balance/mes del Dashboard, deudas pendientes con saldos, últimos movimientos, e instrucciones de estilo (texto plano, español, sin markdown).
- **FR-005**: La llamada a Gemini MUST reutilizar un helper compartido en `Gemini.js` (una sola implementación de fetch/parseo de errores).
- **FR-006**: `getDashboard()` MUST leer movimientos desde la fila 3 (omitir la fila 2 de fórmulas).
- **FR-007**: `getDeudas()` MUST excluir filas sin persona o con `total_deuda <= 0`.
- **FR-008**: `getMovimientos()` MUST resolver el nombre de la persona deudora para cada `deuda_id` (campo `deuda`).
- **FR-009**: Visualizar MUST mostrar un badge "Deuda: <persona>" en movimientos vinculados a una deuda.
- **FR-010**: Los docs (`docs/001-requisitos/03-estructura-tablas.md`) MUST documentar la relación `deuda_id` entre tablas separadas y el filtro de deudas pendientes del selector.

### Key Entities

- **Deuda**: id, persona, categoria_id, total_deuda (A-E, app) + abonado/saldo/estado (F-H, fórmulas Sheets).
- **Movimiento**: id, fecha, tipo, categoria_id, descripcion, valor, metodo_pago, deuda_id → FK hacia Deuda (`DEU-*` o `None`).
- **Conversación (chat)**: historial en memoria del navegador `{rol, texto}`; no se persiste.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El abonado es visible en el form de edición sin escribir F-H (verificable con un solo guardado: columnas F-H sin cambios).
- **SC-002**: El chat responde preguntas con datos reales (deudas/saldos) en ≤ ~2 round-trips visibles (carga → respuesta).
- **SC-003**: Ni la fila 2 ni la fila fantasma aparecen en Dashboard, tabla de Deudas ni selector de abonos.
- **SC-004**: `npx --yes eslint src/` pasa sin errores.

## Assumptions

- Las ArrayFormulas de F-H existen en el libro y siguen siendo la única fuente de verdad de abonado/saldo/estado.
- La fila 2 de Movimientos y Deudas está reservada (fórmulas), protegida y oculta; la app siempre lee desde la fila 3.
- Categorías empiezan en fila 2 con encabezados en fila 1 (no cambia).
- El chat no persiste historial entre recargas (sesión del navegador).
- Sin tests unitarios: la única verificación automatizada es el lint (convención del repo, AGENTS.md).

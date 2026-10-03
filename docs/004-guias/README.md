# Guías del proyecto — 004-guias

Paso a paso simple y directo para arrancar el proyecto **control-renal-diario** (Control Financiero): scripts de Google Sheets con Google Apps Script, desarrollados en local con `npx` y `clasp`. Sin Python, sin instalaciones globales y sin package.json.

## Índice

1. [01 — Reproducir la aplicación](./01-entorno-npx.md) — requisitos, hoja, configuración, encabezados, Git y lint.
2. [02 — Despliegue con clasp](./02-despliegue-clasp.md) — ciclo diario `pull`/`push`/`version`/`deploy` y CI/CD con secretos.
3. [03 — Autocompletado y LSP](./03-autocompletado-lsp.md) — `jsconfig.json` + `@types/google-apps-script` para autocompletar `SpreadsheetApp`.
4. [04 — Bitácora del proyecto](./04-bitacora-proyecto.md) — objetivo, pasos realizados, estado actual y próximos pasos.
5. [05 — Estilo de JavaScript](./05-estilo-javascript.md) — convenciones de código y comentarios.

## Estructura del proyecto

```text
control-renal-diario/
├── jsconfig.json           # checkJs + types google-apps-script (autocompletado)
├── eslint.config.js        # lint de src/
├── .gitignore              # node_modules/, .clasp.json, .clasprc.json
├── .claspignore            # evita subir configuración local
├── src/
│   ├── appsscript.json     # manifiesto Apps Script
│   ├── backend/
│   │   ├── main.js          # Punto de entrada web (doGet) e inclusión de parciales
│   │   ├── utils.js         # Helpers genéricos (fechas, etc)
│   │   ├── sheets/
│   │   │   ├── sheets.js    # Constantes y helper para abrir hojas
│   │   │   ├── movimientos.js  # CRUD histórico de ingresos y gastos
│   │   │   ├── deudas.js    # Manejo de deudas y saldos
│   │   │   ├── dashboard.js # Lógica y cálculos del resumen financiero
│   │   │   └── categorias.js # Manejo de la hoja Categorias
│   │   └── ai/
│   │       ├── gemini.js    # Integración con Google Gemini AI
│   │       └── asesoria.js  # Asesor IA (preguntarAsesor)
│   └── frontend/
│       ├── app.html         # Plantilla principal
│       ├── layout/          # header.html, footer.html, css.html
│       ├── pages/           # dashboard, registrar, deudas, visualizar (HTML)
│       └── scripts/         # js-*.html, lógica de cada módulo
├── docs/
│   └── 004-guias/          # estas guías
└── .github/workflows/      # CI (ci.yml); deploy.yml solo en copias privadas
```

## ¿Por qué `npx` y no `npm` de siempre?

**Decisión del proyecto: `npx` es el único ejecutor de herramientas; `npm` no se usa en ningún comando.**

- **Elegimos `npx`** porque ejecuta clasp/eslint sin instalarlos globalmente, sin binarios sueltos en el sistema y sin scripts intermedios: `npx --yes @google/clasp push` corre exactamente la herramienta que el proyecto necesita, nada más.
- **Consecuencia de la decisión**: No hay `package.json` en la raíz. `npm install`, `npm run` y `npm ci` no aparecen en ningún archivo del repo. Todo lo que se *ejecuta* va por `npx --yes ...`; los únicos archivos de dependencia son los `.d.ts` de autocompletado, descargados directamente con `curl` (ver [guía 03](./03-autocompletado-lsp.md)).

Guía de estilo: [JavaScript](./05-estilo-javascript.md).

## Reglas del repo

- Comandos de clasp y toda herramienta siempre: `npx --yes ...` — única forma de ejecución del proyecto.
- Cero Python: no existe `pyproject.toml`, `.python-version` ni archivos `.py`.
- `.clasp.json` y `.clasprc.json` son credenciales: jamás se commitean (ya están en `.gitignore`).
- No hay `package.json` en la raíz. Las únicas verificaciones automatizadas son el lint ejecutado con `npx`.

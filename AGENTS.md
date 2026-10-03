# AGENTS.md

## Qué es este repo

- Web App de **Google Apps Script** hecha en local; el código vive en `src/` y sube con **clasp**. Manifiesto: `src/appsscript.json` (runtime V8, `America/Bogota`).
- Todo el material (README, docs, comentarios) está en **español**: responde en español.
- Node >= 20. **No hay tests**: la única verificación automatizada es el lint.

## Comandos (`npx` obligatorio)

La única forma de ejecutar herramientas es `npx --yes ...`. No hay `package.json` en la raíz: no uses `npm install`, `npm run`, ni binarios globales (`clasp`, `eslint`). Decisión registrada en `docs/004-guias/README.md`.

```bash
npx --yes eslint src/                   # lint — única verificación; CI lo corre en PRs a main
npx --yes @google/clasp login           # OAuth; token en ~/.clasprc.json
npx --yes @google/clasp push            # subir código a Apps Script
npx --yes @google/clasp pull            # bajar cambios del editor web
npx --yes @google/clasp open-script     # abrir editor web
npx --yes @google/clasp version "<msg>" # instantánea inmutable
```

## Despliegue y credenciales

- **Push a `main` publica en Apps Script**: `.github/workflows/deploy.yml` escribe los secretos `CLASPRC_JSON`/`CLASP_JSON` y corre `clasp push --force` + `clasp version`. `--force` pisa el remoto sin confirmación → el repo es la única fuente de verdad; no edites a mano en script.google.com.
- PR a `main` → solo lint (`.github/workflows/ci.yml`).
- `.clasp.json` (local) y `~/.clasprc.json` son credenciales: ya están en `.gitignore`; **nunca** los commitees. Si cambias de script o de máquina, regenera `.clasp.json` y actualiza el secreto `CLASP_JSON`.

## Código en `src/`

- Apps Script no tiene módulos: `sourceType: "script"` en `eslint.config.js` → **sin `import`/`export`**, todo en scope global.
- `no-undef` es **error** y los globos de Apps Script (`SpreadsheetApp`, `Logger`, …) están listados a mano en `eslint.config.js:11`. Si usas un servicio que falte (p. ej. `TrashApp`), añádelo a `globals` o declara `/* global X */`.
- El lint solo cubre `src/**/*.js` (`eslint.config.js:6`): un `.js` en la raíz pasa desapercibido por CI.
- Puntos de entrada se declaran en `/* exported ... */` al inicio del archivo — ver `src/backend/WebApp.js`.
- Tipos/autocompletado: `jsconfig.json` con `checkJs` + `node_modules/@types/google-apps-script`. Ese `node_modules` **no se instala con npm**: se descarga con un `curl` (ver `docs/004-guias/03-autocompletado-lsp.md`). Si el LSP no resuelve `SpreadsheetApp`, reinstala esos tipos.

## Clasping

- El `.clasp.json` local usa `rootDir: "src"`: clasp sube los archivos desde `src/` y conserva las carpetas `backend/` y `frontend/`.
- El destino de Sheets se lee desde la propiedad `SPREADSHEET_ID`; el backend usa la primera pestaña. Un `.env` local no está disponible en el runtime de Google.
- Ante contradicción entre docs y config, manda la config ejecutable. Docs desactualizados ya detectados: `docs/004-guias/README.md` menciona un `package.json` de la raíz (no existe) y `README.md:60` enlaza `specs/001-node-clasp-sheets/` (no existe).

## Dónde mirar

- Guías de trabajo: `docs/004-guias/` (01 entorno, 02 despliegue, 03 LSP, 05 estilo JavaScript).
- Requisitos de negocio: `docs/001-requisitos/`.
- `.specify/` y `.opencode/commands/speckit.*` son plantillas de spec-kit sin personalizar (la constitución sigue en plantilla): ignósalas salvo que el usuario pida ese flujo.

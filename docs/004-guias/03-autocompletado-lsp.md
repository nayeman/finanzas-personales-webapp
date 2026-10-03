# 03 — Autocompletado y LSP para Apps Script (solo npx y curl)

Objetivo: que tu editor autocompletice `SpreadsheetApp`, `Logger` y el resto de servicios de Apps Script mientras escribes en `src/` — **usando solo `npx` y `curl`**.

## 1. Descargar los tipos con curl

`npx` descarga herramientas a su caché temporal y no deja archivos en el proyecto; para que el LSP encuentre `@types/google-apps-script`, hay que materializarlo una vez en `node_modules/@types/` con `curl`:

```bash
mkdir -p node_modules/@types/google-apps-script
curl -sL https://registry.npmjs.org/@types/google-apps-script/-/google-apps-script-2.0.13.tgz \
  | tar -xz --strip-components=1 -C node_modules/@types/google-apps-script
```

- Es **un solo comando**, sin `package.json`, sin `package-lock.json` y sin gestor de paquetes.
- `node_modules/` ya está en `.gitignore` (no se commitea).
- Para actualizar los tipos: repite el comando con la versión nueva (se consulta en `https://registry.npmjs.org/@types/google-apps-script/latest`).

## 2. Crear `jsconfig.json` en la raíz

```json
{
  "compilerOptions": {
    "checkJs": true,
    "target": "ES2020",
    "module": "none",
    "typeRoots": ["./node_modules/@types"],
    "types": ["google-apps-script"]
  },
  "include": ["src/**/*.js"]
}
```

- `checkJs`: analiza los `.js` como código con tipos.
- `types: ["google-apps-script"]`: carga solo los tipos de Apps Script.

## 3. Verificar el autocompletado

1. Abrir `src/backend/WebApp.js`.
2. Escribir `SpreadsheetApp.` → el editor (LSP) debe ofrecer `getActiveSpreadsheet()`, `getActive()`, etc.

## 4. Habilitar el LSP en opencode

Crear `opencode.json` en la raíz:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "lsp": true
}
```

Guardado el archivo: **reinicia opencode** (la config se carga al arrancar). En el panel derecho debe dejar de decir "LSPs are disabled".

## 5. Lint relacionado

```bash
npx --yes eslint src/
```

`eslint.config.js` en la raíz ignora `node_modules/` y `dist/`. Lint: `npx --yes eslint src/`.

Siguiente: volver al [índice de guías](./README.md).

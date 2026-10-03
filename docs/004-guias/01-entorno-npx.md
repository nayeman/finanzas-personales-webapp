# 01 — Reproducir la aplicación

Esta guía prepara una copia local, conecta un proyecto de Apps Script y crea los encabezados de la primera pestaña de Google Sheets.

## Requisitos

- Git instalado.
- Node.js 20 o superior; incluye `npx`.
- Cuenta de Google con permiso para crear Apps Script y editar la hoja.
- API de Google Apps Script activada en <https://script.google.com/home/usersettings>.

Comprueba Git y Node:

```bash
git --version
node --version
```

No instales `clasp` ni ESLint globalmente. En este repositorio se ejecutan con `npx --yes`.

## 1. Obtener el código

```bash
git clone <URL_DEL_REPOSITORIO> control-renal-diario
cd control-renal-diario
```

Si ya tienes el repositorio, entra a su carpeta y actualízalo con `git pull`.

## 2. Crear o elegir la hoja

En Google Sheets, crea un nuevo documento o elige uno existente. La aplicación buscará automáticamente las pestañas por su nombre (`Movimientos`, `Categorias`, `Deudas`).

El ID está en la URL, entre `/spreadsheets/d/` y la siguiente `/`. Cópialo para agregarlo directamente a las propiedades del proyecto Apps Script en el paso 4. No hace falta crear un archivo `.env`.

## 3. Autorizar y vincular clasp

```bash
npx --yes @google/clasp login
npx --yes @google/clasp create --type webapp --title "Mi Dinero" --rootDir src
```

Autoriza la cuenta de Google en el navegador. `create` genera un proyecto nuevo de Apps Script y `.clasp.json` local.

Si vas a conectar un proyecto de Apps Script que ya existe, usa `npx --yes @google/clasp clone <SCRIPT_ID> --rootDir src` en una carpeta vacía. `clasp clone` descarga el proyecto remoto; no reemplaza a `git clone` para obtener este repositorio.

## 4. Configurar Variables de Entorno (Propiedades) en Apps Script

Abre el proyecto con:

```bash
npx --yes @google/clasp open-script
```

En **Configuración del proyecto (⚙️) → Propiedades de la secuencia de comandos**, haz clic en "Editar propiedades de script" y agrega las siguientes variables:

| Propiedad | Valor | Obligatorio |
| --- | --- | --- |
| `SPREADSHEET_ID` | El ID de tu Google Sheets (está en la URL del documento). | Sí |
| `GEMINI_API_KEY` | Tu token de [aistudio.google.com](https://aistudio.google.com/app/apikey) | No (solo si usas el análisis de IA) |

Guarda las propiedades. El código buscará automáticamente las pestañas por sus nombres predeterminados definidos en el código.

## 5. Preparar la hoja y subir el código

En tu Google Sheets debes crear 3 pestañas: `Movimientos`, `Categorias` y `Deudas`. Los encabezados exactos que debes poner en la fila 1 de cada una están detallados en [03-estructura-tablas.md](../001-requisitos/03-estructura-tablas.md). La app asume que las hojas existen, no las crea automáticamente.

```bash
npx --yes @google/clasp push
```

Al hacer push, tu código local se sincronizará con Apps Script. 
La aplicación guardará los registros que crees en el formulario web directamente en la hoja `Movimientos`.

`clasp push` solo sincroniza archivos. Para crear o actualizar la implementación de la Web App, sigue [02 — Despliegue con clasp](./02-despliegue-clasp.md).

El manifiesto actual limita el acceso a `MYSELF`. Para compartir la aplicación con otras personas, configura el acceso en `src/appsscript.json` y crea una implementación nueva. Asegúrate también de que la cuenta que ejecuta la aplicación tenga permiso sobre la hoja.

## 6. Validar y registrar cambios

El único control automatizado del proyecto es ESLint:

```bash
npx --yes eslint src/
git status --short
```

No hay un formateador configurado; conserva el formato del archivo y corrige el lint antes del commit. Agrega solo los archivos que quieras guardar:

```bash
git add <rutas-de-archivos>
git commit -m "docs: document local setup"
```

`.clasp.json` y `~/.clasprc.json` son locales: nunca los agregues al commit. Si tienes un `.env` local antiguo, no lo agregues; la aplicación no lo lee. Un push a `main` inicia el despliegue automático descrito en la guía 02.

Siguiente: [02 — Despliegue con clasp](./02-despliegue-clasp.md).

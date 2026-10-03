# Control Financiero Personal

Web App para llevar mis finanzas personales sin instalar nada: registro ingresos, gastos y deudas desde una interfaz simple, y un asesor de IA responde con mis propios datos.

Todo corre sobre **Google Workspace**: los datos viven en Google Sheets y el código en Google Apps Script.

## Qué hace

- **Movimientos**: registrar ingresos y gastos en segundos.
- **Deudas**: total, abonado y saldo de cada persona o entidad.
- **Dashboard**: balance del mes, tarjetas de ingresos/gastos y gráfico de evolución.
- **Asesor IA** (Google Gemini): preguntas en lenguaje natural — *"¿en qué gasté más este mes?"*, *"¿cuánto le debo a Ana?"*.

## Cómo está hecho

| Parte | Tecnología |
|---|---|
| Frontend | HTML + Bootstrap 5 + Chart.js (HTML Service) |
| Backend | Google Apps Script (V8) |
| Datos | Google Sheets (`Movimientos`, `Categorias`, `Deudas`) |
| IA | Gemini API desde `UrlFetchApp` |

El código se edita en local y se sube con [clasp](https://github.com/google/clasp).

## Requisitos

- Node.js >= 20 y git
- Cuenta de Google

## Instalación

```bash
# 1. Entrar con tu cuenta de Google
npx --yes @google/clasp login

# 2. Crear el proyecto de Apps Script
npx --yes @google/clasp create --type webapp --title "Control Financiero Personal" --rootDir src

# 3. Subir el código
npx --yes @google/clasp push
```

Luego, en el editor de Apps Script (**Configuración del proyecto → Propiedades de la secuencia de comandos**) guarda:

- `SPREADSHEET_ID`: el ID de tu hoja de Google Sheets (está en la URL del documento).
- `GEMINI_API_KEY`: tu clave de [Google AI Studio](https://aistudio.google.com/apikey).

No hace falta `.env`: Apps Script no lee archivos locales.

## Estructura

```
src/
├── appsscript.json    # manifiesto (V8, America/Bogota)
├── backend/           # lógica: CRUD, dashboard, Gemini
└── frontend/          # vistas HTML + JS enlazado
docs/
├── 001-requisitos/     # requisitos y estructura de tablas
└── 004-guias/         # guías: entorno, despliegue, LSP
```

## Desarrollo

```bash
npx --yes eslint src/                   # lint (única verificación)
npx --yes @google/clasp push            # subir cambios
npx --yes @google/clasp pull            # bajar cambios del editor
npx --yes @google/clasp open-script     # abrir el editor web
```

## Seguridad

`.clasp.json`, `~/.clasprc.json` y `.env` contienen credenciales: van en `.gitignore` y **nunca** se commitean.

## Documentación

- [Guías de trabajo](./docs/004-guias/README.md)
- [Requisitos y estructura de tablas](./docs/001-requisitos/03-estructura-tablas.md)

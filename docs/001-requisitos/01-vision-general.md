# Control Financiero Personal: visión general

> **Control Financiero Personal Inteligente** es una Web App desarrollada con Google Apps Script que permite gestionar ingresos, gastos y deudas desde una interfaz centralizada. Utiliza Google Sheets para almacenar y consultar la información financiera, y Gemini para analizar los datos registrados, generar resúmenes y responder preguntas sobre los hábitos financieros del usuario.

## 🎯 Objetivos principales
1. **Registro Rápido:** Formulario unificado para registrar ingresos y gastos sin abrir Google Sheets.
2. **Dashboard Visual:** Resumen financiero del mes con gráficos de evolución por día y filtro histórico.
3. **Gestión de Deudas:** Control exacto de cuánto se debe y a quién, con abonado manual; saldo y estado se recalculan con fórmulas de la hoja.
4. **Análisis IA:** Integración nativa con Google Gemini para que actúe como asesor financiero personal usando los datos reales.

## 🏛️ Arquitectura
* **Frontend:** HTML, Bootstrap 5, Chart.js. Single Page Application con pestañas (Dashboard, Movimientos, Deudas, Visualizar).
* **Backend:** Google Apps Script (V8). Interactúa directamente con la Spreadsheet activa mediante `SpreadsheetApp`.
* **Almacenamiento:** Google Sheets. Es la única fuente de la verdad. La App lee y escribe en las hojas `Movimientos`, `Categorias` y `Deudas`.
* **IA:** API de Google Gemini invocada desde Apps Script mediante `UrlFetchApp`.

## 📦 Modelo de Datos Resumido
* **Movimientos:** Registro histórico de cada transacción de dinero (Ingreso o Gasto). Tabla **independiente**: no guarda ninguna referencia a deudas.
* **Deudas:** Registro maestro de pasivos. Define a quién se le debe, el total y el abonado (campos manuales); saldo y estado se calculan automáticamente en Sheets con fórmulas propias de la hoja (sin vínculos con Movimientos).
* **Categorias:** Tabla maestra simple (solo Nombre) para clasificar las transacciones de forma coherente.

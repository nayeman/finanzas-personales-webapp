# Bitácora del proyecto — Control Financiero Personal

Este documento resume el objetivo y registra el avance del proyecto.

## Objetivo
Crear una aplicación web de Google Apps Script para llevar el control diario de ingresos, gastos y deudas, con almacenamiento seguro en Google Sheets y un dashboard de análisis usando Gemini AI.

## Avance
- [x] Crear estructura base de Google Apps Script con clasp.
- [x] Configurar linter y eslint.
- [x] Implementar módulo de Movimientos (Ingresos y Gastos).
- [x] Implementar módulo de Categorías.
- [x] Implementar conexión nativa con Gemini AI para resumen del mes.
- [x] Refactorizar la UI con un estilo moderno y Dashboard visual (Chart.js).
- [x] Añadir módulo de Deudas y relacionarlas con Movimientos.
- [x] Filtrado por mes en el Dashboard y tabla histórica diaria.
- [x] Limpieza de requerimientos y código fantasma de pruebas iniciales.

## Estado
Proyecto en fase de despliegue estable. Las hojas requeridas en el Sheet destino son:
- `Movimientos`
- `Categorias`
- `Deudas`

El sistema funciona con un frontend unificado que consolida la gestión financiera en una sola web app, evitando que el usuario deba abrir Google Sheets.
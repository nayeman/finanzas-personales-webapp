// CRUD de movimientos (ingresos y gastos) en la hoja Movimientos.
// Tabla independiente: no tiene relación con Deudas (sin deuda_id).
/* exported saveMovimiento, updateMovimiento, deleteMovimiento, getMovimientos, MOV_HEADERS, MOV_COL */
/* global getSheet, SHEET_NAMES, LockService, Session, Utilities, parseNumber, isValidDate, escapeFormulaText, getCategorias */

/**
 * Columnas de la hoja Movimientos en orden.
 * Exportado para que otros módulos (Dashboard.js) puedan derivar índices sin números mágicos.
 */
const MOV_HEADERS = ["id", "fecha", "tipo", "categoria", "categoria_id", "descripcion", "valor", "metodo_pago"];

/**
 * Mapa de nombre de columna → índice 0-based.
 * Ejemplo: MOV_COL.valor === 6
 * @type {Object.<string, number>}
 */
const MOV_COL = MOV_HEADERS.reduce((acc, h, i) => { acc[h] = i; return acc; }, {});

// ── Funciones públicas ──

/**
 * Guarda un nuevo movimiento en la hoja.
 * @param {{ tipo:string, valor:string|number, categoria_id:string, fecha:string, descripcion?:string, metodo_pago?:string }} data
 * @returns {{ row: number }} Número de fila donde se guardó.
 */
function saveMovimiento(data) {
  const v     = _validateMovimiento(data);
  const sheet = getSheet(SHEET_NAMES.movimientos);
  const id    = "MOV-" + Date.now();

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const row = sheet.getLastRow() + 1;
    sheet.getRange(row, 1, 1, MOV_HEADERS.length).setValues([[id, v.fecha, v.tipo, v.categoria, v.categoria_id, v.descripcion, v.valor, v.metodo_pago]]);
    return { row };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Actualiza un movimiento existente buscándolo por id en la columna A.
 * @param {{ id:string, tipo:string, valor:string|number, categoria_id:string, fecha:string, descripcion?:string, metodo_pago?:string }} data
 * @returns {{ row: number }} Número de fila actualizada.
 * @throws {Error} Si el id no existe.
 */
function updateMovimiento(data) {
  if (!data.id) throw new Error("Falta el id del movimiento.");
  const v     = _validateMovimiento(data);
  const sheet = getSheet(SHEET_NAMES.movimientos);
  const row   = _findRowById(sheet, data.id);
  if (!row) throw new Error(`No se encontró el movimiento ${data.id}.`);
  _writeRow(sheet, row, [v.fecha, v.tipo, v.categoria, v.categoria_id, v.descripcion, v.valor, v.metodo_pago]);
  return { row };
}

/**
 * Elimina un movimiento borrando su fila completa.
 * @param {string} id ID del movimiento (formato MOV-NNN).
 * @throws {Error} Si el id no existe.
 */
function deleteMovimiento(id) {
  if (!id) throw new Error("Falta el id del movimiento.");
  const sheet = getSheet(SHEET_NAMES.movimientos);
  const row   = _findRowById(sheet, id);
  if (!row) throw new Error(`No se encontró el movimiento ${id}.`);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { sheet.deleteRow(row); }
  finally { lock.releaseLock(); }
}

/**
 * Devuelve todos los movimientos como array de objetos, más recientes primero.
 * Resuelve el nombre de la categoría cruzando con la hoja Categorias.
 * @returns {Array<{id:string, fecha:string, tipo:string, categoria_id:string, categoria:string, descripcion:string, valor:number, metodo_pago:string}>}
 */
function getMovimientos() {
  const sheet = getSheet(SHEET_NAMES.movimientos);
  const last  = sheet.getLastRow();
  if (last < 3) return [];

  // Mapa id → nombre de categoría para resolver en el map() sin N llamadas extra.
  const cats = getCategorias().reduce((acc, c) => { acc[c.id] = c.nombre; return acc; }, {});
  const tz   = Session.getScriptTimeZone();
  const rows = sheet.getRange(3, 1, last - 2, MOV_HEADERS.length).getValues();

  return rows
    .filter((r) => r[MOV_COL.id] !== "")                 // excluir filas vacías
    .map((r) => ({
      id:           String(r[MOV_COL.id]),
      fecha:        r[MOV_COL.fecha] instanceof Date
                      ? Utilities.formatDate(r[MOV_COL.fecha], tz, "yyyy-MM-dd")
                      : String(r[MOV_COL.fecha]),
      tipo:         String(r[MOV_COL.tipo]),
      categoria_id: String(r[MOV_COL.categoria_id]),
      categoria:    String(r[MOV_COL.categoria] || cats[String(r[MOV_COL.categoria_id])] || ""),
      descripcion:  String(r[MOV_COL.descripcion] || ""),
      valor:        Number(r[MOV_COL.valor]) || 0,
      metodo_pago:  String(r[MOV_COL.metodo_pago] || ""),
    }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

// ── Helpers privados (prefijo _ = no llamar desde otros archivos) ──

/**
 * Escribe valores en columnas B-H de una fila usando LockService para concurrencia.
 * Centraliza el patrón lock → setValues → release que antes se duplicaba.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} row Número de fila (1-indexed).
 * @param {Array} values Array de 7 valores (sin id): fecha, tipo, categoria, categoria_id, descripcion, valor, metodo_pago.
 */
function _writeRow(sheet, row, values) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { sheet.getRange(row, 2, 1, values.length).setValues([values]); }
  finally { lock.releaseLock(); }
}

/**
 * Valida y normaliza los datos de un movimiento recibidos del navegador.
 * @param {Object} data Datos sin confiar del formulario.
 * @returns {{ fecha:string, tipo:string, categoria:string, categoria_id:string, descripcion:string, valor:number, metodo_pago:string }}
 * @throws {Error} Si algún campo obligatorio es inválido.
 */
function _validateMovimiento(data) {
  if (!data || typeof data !== "object") throw new Error("Datos inválidos.");

  const tipoRaw = String(data.tipo || "Ingreso");
  const tipo = tipoRaw.charAt(0).toUpperCase() + tipoRaw.slice(1).toLowerCase();
  if (!["Ingreso", "Gasto"].includes(tipo)) throw new Error("Tipo debe ser Ingreso o Gasto.");

  const fecha = String(data.fecha || "");
  if (!isValidDate(fecha)) throw new Error("La fecha no es válida.");

  const valor = /** @type {number} */ (parseNumber(data.valor, "Valor", true));
  if (valor <= 0) throw new Error("El valor debe ser mayor a 0.");

  const categoria_id = String(data.categoria_id || "CAT-008").trim();
  const cats = getCategorias();
  const catObj = cats.find(c => c.id === categoria_id);
  const categoria = catObj ? catObj.nombre : "Otros";

  const metodoRaw = String(data.metodo_pago || "Efectivo");
  const metodo_pago = metodoRaw.charAt(0).toUpperCase() + metodoRaw.slice(1).toLowerCase();

  return {
    fecha,
    tipo,
    categoria,
    categoria_id,
    descripcion: escapeFormulaText(data.descripcion),
    valor,
    metodo_pago
  };
}

/**
 * Busca el número de fila (1-indexed) cuya columna A coincide con el id.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} id
 * @returns {number|null} Número de fila o null si no se encuentra.
 */
function _findRowById(sheet, id) {
  const last = sheet.getLastRow();
  if (last < 3) return null;
  const ids = sheet.getRange(3, 1, last - 2, 1).getValues().flat();
  const idx = ids.indexOf(id);
  return idx === -1 ? null : idx + 3;
}

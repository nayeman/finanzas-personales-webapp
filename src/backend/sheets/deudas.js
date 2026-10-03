// CRUD de deudas en la hoja Deudas.
/* exported saveDeuda, getDeudas, deleteDeuda, DEUDAS_HEADERS, DEUDAS_COL */
/* global getSheet, SHEET_NAMES, LockService, parseNumber, Session, Utilities */

const DEUDAS_HEADERS = ["id", "persona", "categoria", "total_deuda", "abonado", "saldo", "estado", "fecha"];
const DEUDAS_COL = DEUDAS_HEADERS.reduce((acc, h, i) => { acc[h] = i; return acc; }, {});

/**
 * Calcula saldo y estado de una deuda a partir de sus montos.
 * Única fuente de verdad de la lógica: la usa al escribir y al leer.
 * @param {number} total_deuda
 * @param {number} abonado
 * @returns {{ saldo:number, estado:string }}
 */
function _saldoEstado(total_deuda, abonado) {
  const saldo = total_deuda - abonado;
  return { saldo, estado: saldo <= 0 ? "Pagado" : "Pendiente" };
}

/**
 * Fecha de hoy en yyyy-MM-dd usando la zona horaria del script.
 * @returns {string}
 */
function _hoyISO() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

/**
 * Normaliza una celda de fecha de la hoja a yyyy-MM-dd.
 * @param {*} valor Celda Date, texto o vacía.
 * @returns {string} yyyy-MM-dd o "" si está vacía.
 */
function _fechaISO(valor) {
  if (valor instanceof Date) return Utilities.formatDate(valor, Session.getScriptTimeZone(), "yyyy-MM-dd");
  return String(valor || "").trim();
}

/**
 * Escribe "fecha" en H1 solo si la hoja aún no lo tiene (columna nueva).
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet Hoja Deudas.
 */
function _asegurarCabeceraFecha(sheet) {
  const celda = sheet.getRange(1, DEUDAS_COL.fecha + 1);
  if (!celda.getValue()) celda.setValue("fecha");
}

/**
 * Guarda una deuda en la hoja (crea si no trae id y no existe; si no, actualiza).
 * Escribe las 8 columnas A-H; saldo (F) y estado (G) los calcula la app
 * con _saldoEstado: la hoja no contiene fórmulas.
 * @param {{ id?:string, persona:string, categoria?:string, total_deuda:string|number, abonado?:string|number }} data
 * @returns {{ id: string }} ID de la deuda creada o actualizada.
 * @throws {Error} Si los datos son inválidos o el abonado es negativo.
 */
function saveDeuda(data) {
  if (!data || typeof data !== "object") throw new Error("Datos inválidos.");

  const persona = String(data.persona || "").trim();
  if (!persona) throw new Error("Persona es obligatoria.");

  const total_deuda = /** @type {number} */ (parseNumber(data.total_deuda, "Total Deuda", true));
  if (total_deuda <= 0) throw new Error("El total de la deuda debe ser mayor a 0.");

  // Abonado: campo manual con default 0; no puede ser negativo ni mayor que el total.
  const abonado = data.abonado === "" || data.abonado == null
    ? 0
    : /** @type {number} */ (parseNumber(data.abonado, "Abonado"));
  if (!(abonado >= 0)) throw new Error("El abonado no puede ser negativo.");
  if (abonado > total_deuda) throw new Error("El abonado no puede superar el total de la deuda.");

  const categoria = String(data.categoria || "").trim() || "Otro";

  const sheet = getSheet(SHEET_NAMES.deudas);
  const id    = data.id && data.id.toUpperCase().startsWith("DEU-") ? data.id : "DEU-" + Date.now();
  
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    let targetRow = -1;
    if (data.id) {
      const last = sheet.getLastRow();
      if (last >= 2) {
        const ids = sheet.getRange(2, 1, last - 1, 1).getValues();
        const index = ids.findIndex(r => String(r[0]).toUpperCase() === id.toUpperCase());
        if (index !== -1) targetRow = index + 2;
      }
    }

    // Fecha de registro (H): una nueva es hoy; una existente conserva la suya
    // (si está vacía se rellena con hoy para migrar filas antiguas).
    let fecha = "";
    if (targetRow === -1) {
      targetRow = sheet.getLastRow() + 1;
    } else {
      fecha = _fechaISO(sheet.getRange(targetRow, DEUDAS_COL.fecha + 1).getValue());
    }
    if (!fecha) fecha = _hoyISO();
    _asegurarCabeceraFecha(sheet);

    const { saldo, estado } = _saldoEstado(total_deuda, abonado);
    sheet.getRange(targetRow, 1, 1, DEUDAS_HEADERS.length)
      .setValues([[id, persona, categoria, total_deuda, abonado, saldo, estado, fecha]]);
    return { id };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Elimina una deuda por ID.
 * @param {string} id ID de la deuda.
 */
function deleteDeuda(id) {
  if (!id) throw new Error("ID requerido");
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = getSheet(SHEET_NAMES.deudas);
    const last = sheet.getLastRow();
    if (last < 2) throw new Error("Hoja vacía o sin registros");

    const ids = sheet.getRange(2, 1, last - 1, 1).getValues();
    const index = ids.findIndex(r => String(r[0]).toUpperCase() === id.toUpperCase());
    if (index === -1) throw new Error("Deuda no encontrada");

    sheet.deleteRow(index + 2);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Devuelve todas las deudas como array de objetos.
 * Lee A-H desde la fila 2 y calcula saldo/estado con _saldoEstado:
 * no depende de ninguna fórmula de la hoja. La fecha (H) se normaliza a
 * yyyy-MM-dd; las filas antiguas sin fecha vuelven `fecha: ""`.
 * @returns {Array<{id:string, persona:string, categoria:string, total_deuda:number, abonado:number, saldo:number, estado:string, fecha:string}>}
 */
function getDeudas() {
  const sheet = getSheet(SHEET_NAMES.deudas);
  const last  = sheet.getLastRow();
  if (last < 2) return [];

  const rows = sheet.getRange(2, 1, last - 1, DEUDAS_COL.fecha + 1).getValues();

  return rows
    .filter((r) => String(r[DEUDAS_COL.id]) !== "")   // excluir filas vacías
    .map((r) => {
      const total_deuda = Number(r[DEUDAS_COL.total_deuda]) || 0;
      const abonado     = Number(r[DEUDAS_COL.abonado]) || 0;
      const { saldo, estado } = _saldoEstado(total_deuda, abonado);
      return {
        id:           String(r[DEUDAS_COL.id]),
        persona:      String(r[DEUDAS_COL.persona]),
        categoria:    String(r[DEUDAS_COL.categoria]),
        total_deuda,
        abonado,
        saldo,
        estado,
        fecha:        _fechaISO(r[DEUDAS_COL.fecha]),
      };
    });
}

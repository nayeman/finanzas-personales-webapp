// Helper central de Sheets: abre hojas por nombre con caché del Spreadsheet.
// El caché evita múltiples llamadas HTTP a la API de Google en la misma ejecución.
/* exported getSheet, SHEET_NAMES */
/* global PropertiesService, SpreadsheetApp */

const SHEET_NAMES = {
  movimientos:  "Movimientos",
  categorias:   "Categorias",
  deudas:       "Deudas"
};

/**
 * Instancia cacheada del Spreadsheet — se inicializa una sola vez por ejecución.
 * @type {GoogleAppsScript.Spreadsheet.Spreadsheet|null}
 */
let _ss = null;

/**
 * Abre el Spreadsheet usando el SPREADSHEET_ID de las propiedades del script.
 * Reutiliza la instancia cacheada en llamadas sucesivas (mismo request → 1 HTTP).
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 * @throws {Error} Si falta SPREADSHEET_ID en las propiedades del script.
 */
function _getSpreadsheet() {
  if (!_ss) {
    const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    if (!id) throw new Error("Configura SPREADSHEET_ID en las propiedades del script.");
    _ss = SpreadsheetApp.openById(id);
  }
  return _ss;
}

/**
 * Abre una pestaña del Spreadsheet por nombre.
 * @param {string} name Nombre de la pestaña — usar SHEET_NAMES.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} La pestaña solicitada.
 * @throws {Error} Si la pestaña no existe.
 */
function getSheet(name) {
  const sheet = _getSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error(`No existe la pestaña "${name}" en el spreadsheet.`);
  return sheet;
}

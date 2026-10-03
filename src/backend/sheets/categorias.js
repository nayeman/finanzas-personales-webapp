// Lee las categorías de la hoja Categorias.
/* exported getCategorias */
/* global getSheet, SHEET_NAMES */

/**
 * Devuelve los nombres de las categorías (columna única `nombre`).
 * Se usa para poblar los <select> de los formularios de Registrar y Deudas.
 * @returns {Array<string>}
 */
function getCategorias() {
  const sheet = getSheet(SHEET_NAMES.categorias);
  const last  = sheet.getLastRow();
  if (last < 2) return [];

  return sheet.getRange(2, 1, last - 1, 1).getValues().flat()
    .map((n) => String(n).trim())
    .filter((n) => n !== "");
}

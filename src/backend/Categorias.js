// Lee las categorías de la hoja Categorias.
/* exported getCategorias */
/* global getSheet, SHEET_NAMES */

/**
 * Devuelve todas las categorías.
 * Se usa en el formulario de Registrar y para resolver nombres en getMovimientos().
 * @returns {Array<{id:string, nombre:string}>}
 */
function getCategorias() {
  const sheet = getSheet(SHEET_NAMES.categorias);
  const last  = sheet.getLastRow();
  if (last < 2) return [];

  const rows = sheet.getRange(2, 1, last - 1, 2).getValues();
  return rows
    .filter((r) => r[0] !== "")
    .map((r) => ({
      id:     String(r[0]),
      nombre: String(r[1]),
    }));
}

// Utilidades numéricas y de texto compartidas entre módulos del backend.
/* exported parseNumber, isValidDate, escapeFormulaText */

/**
 * Convierte un campo numérico opcional u obligatorio.
 * @param {*} value Valor recibido del navegador.
 * @param {string} label Nombre del campo para el error.
 * @param {boolean} required Indica si el campo es obligatorio.
 * @param {boolean} [allowNegative=false] Permite valores negativos.
 * @returns {number|string} Número validado o texto vacío.
 */
function parseNumber(value, label, required, allowNegative = false) {
  if (value === "" || value == null) {
    if (required) throw new Error(`El campo ${label} es obligatorio.`);
    return "";
  }
  const number = Number(value);
  if (!Number.isFinite(number) || (!allowNegative && number < 0)) {
    throw new Error(`El valor de ${label} no es válido.`);
  }
  return number;
}

/**
 * Comprueba que una fecha ISO represente un día real.
 * @param {string} value Fecha en formato yyyy-MM-dd.
 * @returns {boolean}
 */
function isValidDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

/**
 * Evita que un texto se interprete como fórmula en Sheets.
 * @param {*} value Texto recibido del navegador.
 * @returns {string} Texto seguro para guardar.
 */
function escapeFormulaText(value) {
  const text = String(value || "").trim();
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

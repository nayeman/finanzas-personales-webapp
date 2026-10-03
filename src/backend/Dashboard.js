// Calcula el resumen financiero del mes actual para el Dashboard.
/* exported getDashboard */
/* global getSheet, SHEET_NAMES, Session, Utilities, MOV_COL */

/**
 * Devuelve el resumen financiero del mes en curso.
 * Lee los movimientos desde la fila 3 (la fila 2 está reservada para fórmulas).
 * @param {string} [filtroMes] Opcional. Mes en formato "yyyy-MM". Si no se envía, usa el mes actual.
 * @returns {{
 *   balance: number,
 *   ingresos: number,
 *   gastos: number,
 *   mesActual: string,
 *   historial: Array<{dia:string, ingresos:number, gastos:number}>
 * }}
 */
function getDashboard(filtroMes) {
  const tz         = Session.getScriptTimeZone();
  const hoy        = new Date();
  const mesActual  = filtroMes || Utilities.formatDate(hoy, tz, "yyyy-MM");

  // ── Movimientos del mes y agrupar historial ──
  // Columnas usadas: MOV_COL.fecha (1), MOV_COL.tipo (2), MOV_COL.valor (6)
  const movSheet = getSheet(SHEET_NAMES.movimientos);
  const movLast  = movSheet.getLastRow();
  let ingresos = 0;
  let gastos   = 0;
  const historialMap = {};
  
  // Inicializar todos los días del mes
  const [year, month] = mesActual.split("-");
  const numDays = new Date(year, month, 0).getDate();
  for (let i = 1; i <= numDays; i++) {
    const diaStr = i < 10 ? "0" + i : String(i);
    historialMap[diaStr] = { dia: diaStr, ingresos: 0, gastos: 0 };
  }

  // La fila 2 está reservada para las fórmulas del libro: siempre se lee desde la fila 3.
  if (movLast >= 3) {
    const rows = movSheet.getRange(3, 1, movLast - 2, MOV_COL.valor + 1).getValues();
    rows.forEach((r) => {
      const fechaRaw = r[MOV_COL.fecha];
      if (!fechaRaw) return;
      
      let mesFila, diaFila;
      if (fechaRaw instanceof Date) {
        mesFila = Utilities.formatDate(fechaRaw, tz, "yyyy-MM");
        diaFila = Utilities.formatDate(fechaRaw, tz, "dd");
      } else {
        const str = String(fechaRaw);
        mesFila = str.slice(0, 7); // yyyy-MM
        diaFila = str.slice(8, 10); // dd
      }

      if (mesFila === mesActual) {
        const tipo  = String(r[MOV_COL.tipo]).toLowerCase();
        const valor = Number(r[MOV_COL.valor]) || 0;
        
        if (tipo === "ingreso")     ingresos += valor;
        else if (tipo === "gasto")  gastos   += valor;
        
        if (historialMap[diaFila]) {
          if (tipo === "ingreso") historialMap[diaFila].ingresos += valor;
          else if (tipo === "gasto") historialMap[diaFila].gastos += valor;
        }
      }
    });
  }

  const historial = Object.values(historialMap).sort((a, b) => a.dia.localeCompare(b.dia));

  return { ingresos, gastos, balance: ingresos - gastos, historial, mesActual };
}

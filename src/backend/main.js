// Entrada global de Apps Script; sirve app.html e incluye sus parciales.
/* exported doGet, includePartial */

// Icono de pestaña: Apps Script ignora los <link rel="icon"> del HTML, hay que
// declararlo aquí con una URL pública y extensión de imagen (png o ico).
const FAVICON_URL = "https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f4b0.png";

/**
 * Crea la página de la aplicación web.
 * Apps Script llama esta función al abrir la Web App.
 * @returns {GoogleAppsScript.HTML.HtmlOutput} Página lista para mostrar.
 */
function doGet() {
  const salida = HtmlService.createTemplateFromFile("frontend/app")
    .evaluate()
    .setTitle("Mi Dinero")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    // Permite embeber la app en un iframe: en ese contexto se omite el banner
    // "This application was created by a Google Apps Script user".
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  try {
    salida.setFaviconUrl(FAVICON_URL);
  } catch (err) {
    Logger.log("No se pudo aplicar el favicon: " + err.message);
  }

  return salida;
}

/**
 * Carga un parcial HTML solicitado desde app.html.
 * @param {string} fileName Nombre del archivo sin la extensión .html.
 * @returns {string} Contenido HTML del parcial.
 */
function includePartial(fileName) {
  return HtmlService.createHtmlOutputFromFile(
    `frontend/${fileName}`,
  ).getContent();
}

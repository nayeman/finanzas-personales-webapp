// Entrada global de Apps Script; sirve app.html e incluye sus parciales.
/* exported doGet, includePartial */

/**
 * Crea la página de la aplicación web.
 * Apps Script llama esta función al abrir la Web App.
 * @returns {GoogleAppsScript.HTML.HtmlOutput} Página lista para mostrar.
 */
function doGet() {
  return HtmlService.createTemplateFromFile("frontend/app")
    .evaluate()
    .setTitle("Mi Dinero")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
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

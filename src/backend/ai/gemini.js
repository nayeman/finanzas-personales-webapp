// Integración con Google Gemini API para consejos financieros y extracción de facturas.
/* exported analizarFinanzas, llamarGemini, llamarGeminiConImagen, GEMINI_MODELO */
/* global getDashboard, PropertiesService, UrlFetchApp, ASESOR_PROMPT_REGLAS, formatCOPTexto */

/** Modelo Gemini por defecto para todas las llamadas del proyecto. */
const GEMINI_MODELO = "gemini-3.8-flash";

/**
 * Llama a la API de Gemini con el resumen financiero actual (análisis rápido).
 * @param {string} pregunta Pregunta o prompt del usuario.
 * @returns {string} Respuesta generada por la IA.
 */
function analizarFinanzas(pregunta) {
  // Obtenemos los datos actuales (usamos la misma función que alimenta el dashboard)
  const datos = getDashboard();
  const balanceTexto = [
    "Moneda: pesos colombianos (COP)",
    `Balance: ${formatCOPTexto(datos.balance)}`,
    `Ingresos: ${formatCOPTexto(datos.ingresos)}`,
    `Gastos: ${formatCOPTexto(datos.gastos)}`
  ].join("\n");

  const prompt = `${ASESOR_PROMPT_REGLAS}

DATOS DEL MES ACTUAL:
${balanceTexto}

Pregunta o petición: ${pregunta || "Hazme un breve resumen de mi situación y dame un consejo basándote en estos números."}`;

  return llamarGemini(prompt);
}

/**
 * Envía un prompt a la API de Gemini y devuelve el texto de la respuesta.
 * Helper compartido: lo usan analizarFinanzas (resumen) y preguntarAsesor (chat).
 * @param {string} prompt Texto completo del prompt (contexto + pregunta).
 * @param {number} [temperature=0.5] Temperatura de generación.
 * @returns {string} Respuesta en texto plano generada por la IA.
 * @throws {Error} Si falta la API key o la API devuelve un error.
 */
function llamarGemini(prompt, temperature = 0.5) {
  return _fetchGemini([{ text: prompt }], { temperature });
}

/**
 * Envía un prompt + imagen (base64) a la API de Gemini y devuelve la respuesta en texto.
 * El prompt va primero y la imagen después (orden recomendado por Google).
 * Pide JSON estructurado; el parsing y la validación de dominio corresponden
 * a factura.js, no a este transporte.
 * @param {string} prompt Texto completo del prompt.
 * @param {string} imagenBase64 Imagen codificada en base64 (sin prefijo data:).
 * @param {string} mimeType MIME de la imagen (image/png o image/jpeg).
 * @param {{ temperature?: number, modelo?: string, responseSchema?: Object }} [opts]
 *        temperature (def. 0), modelo (def. GEMINI_MODELO) y JSON Schema opcional.
 * @returns {string} Respuesta en texto (JSON) generada por la IA.
 * @throws {Error} Si falta la API key o la API devuelve un error.
 */
function llamarGeminiConImagen(prompt, imagenBase64, mimeType, opts = {}) {
  const parts = [
    { text: prompt },
    { inline_data: { mime_type: mimeType, data: imagenBase64 } }
  ];
  const opciones = Object.assign({ temperature: 0, responseMimeType: "application/json" }, opts);
  return _fetchGemini(parts, opciones);
}

/**
 * Transporte común a la API de Gemini (UrlFetchApp + manejo de errores).
 * La API key se lee de Script Properties y nunca se envía al frontend.
 * @param {Array<Object>} parts Parts del contenido (texto y/o inline_data).
 * @param {{ temperature?: number, modelo?: string, responseMimeType?: string, responseSchema?: Object }} [opts]
 * @returns {string} Texto de la primera parte de la respuesta.
 * @throws {Error} Si falta la key, la respuesta no es JSON o la API reporta error.
 */
function _fetchGemini(parts, opts = {}) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error("No hay GEMINI_API_KEY configurada. Pídele al administrador que la añada en Propiedades del script.");
  }

  const modelo = opts.modelo || GEMINI_MODELO;
  const generationConfig = { temperature: opts.temperature === undefined ? 0.5 : opts.temperature };
  if (opts.responseMimeType) generationConfig.responseMimeType = opts.responseMimeType;
  if (opts.responseSchema) generationConfig.responseSchema = opts.responseSchema;

  const payload = {
    contents: [{ parts }],
    generationConfig
  };

  const resp = UrlFetchApp.fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
    {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify(payload)
    }
  );

  let json;
  try {
    json = JSON.parse(resp.getContentText());
  } catch {
    throw new Error("Respuesta inválida de Gemini.");
  }

  if (json.error) {
    throw new Error(`Error de Gemini: ${json.error.message}`);
  }

  const partes = json.candidates && json.candidates[0] &&
    json.candidates[0].content && json.candidates[0].content.parts;
  if (partes && partes[0] && typeof partes[0].text === "string") {
    return partes[0].text;
  }
  return "No se pudo generar una respuesta.";
}

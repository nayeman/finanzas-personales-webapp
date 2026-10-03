// Integración con Google Gemini API para consejos financieros.
/* exported analizarFinanzas, llamarGemini */
/* global getDashboard, PropertiesService, UrlFetchApp, ASESOR_PROMPT_REGLAS, formatCOPTexto */

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
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error("No hay GEMINI_API_KEY configurada. Pídele al administrador que la añada en Propiedades del script.");
  }

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: { temperature }
  };

  const resp = UrlFetchApp.fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
    {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify(payload)
    }
  );

  const json = JSON.parse(resp.getContentText());
  if (json.error) {
    throw new Error(`Error de Gemini: ${json.error.message}`);
  }

  if (json.candidates && json.candidates[0].content && json.candidates[0].content.parts) {
    return json.candidates[0].content.parts[0].text;
  }
  return "No se pudo generar una respuesta.";
}

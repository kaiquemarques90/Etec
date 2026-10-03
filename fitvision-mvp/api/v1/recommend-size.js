import { apiResult, readInput, sendJson } from '../../src/services/recommendation-api.js';
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST'); return sendJson(response, 405, { error: 'Use POST para recomendar um tamanho.' });
  }
  if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) return sendJson(response, 415, { error: 'Use Content-Type: application/json.' });
  try {
    const { status, body } = apiResult(await readInput(request));
    return sendJson(response, status, body);
  } catch (error) { return sendJson(response, error.status || 400, { error: error.status ? error.message : 'JSON inválido ou requisição incompleta.' }); }
}

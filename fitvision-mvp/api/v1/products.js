import { products } from '../../src/domain/catalog.js';
import { sendJson } from '../../src/services/recommendation-api.js';
export default function handler(request, response) {
  if (request.method !== 'GET') { response.setHeader('Allow', 'GET'); return sendJson(response, 405, { error: 'Use GET para consultar o catálogo demonstrativo.' }); }
  return sendJson(response, 200, products);
}

import { products } from '../domain/catalog.js';
import { recommend } from '../domain/size-engine.js';
import { validateProduct } from '../domain/validation.js';

export const MAX_REQUEST_BYTES = 64 * 1024;
export function apiResult(input) {
  try {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Informe um objeto JSON.');
    let product = products.find(item => item.id === input.productId);
    // Custom products are ephemeral inputs, never writes to the public catalog.
    if (input.product) {
      validateProduct(input.product);
      if (input.product.id !== input.productId) throw new Error('Código e tabela de produto não correspondem.');
      product = input.product;
    }
    if (!product) return { status: 404, body: { error: 'Produto não encontrado.' } };
    return { status: 200, body: { ...recommend(input.userMeasurements, product, input.fitPreference), engineVersion: '1.0.0' } };
  } catch (error) { return { status: 400, body: { error: error.message } }; }
}
export function sendJson(response, status, body) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.statusCode = status; response.end(JSON.stringify(body));
}
export async function readInput(request) {
  if (request.body !== undefined) {
    const encoded = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
    if (Buffer.byteLength(encoded) > MAX_REQUEST_BYTES) throw Object.assign(new Error('Requisição muito grande.'), { status: 413 });
    return typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
  }
  const chunks = []; let size = 0;
  for await (const chunk of request) {
    size += Buffer.byteLength(chunk);
    if (size > MAX_REQUEST_BYTES) throw Object.assign(new Error('Requisição muito grande.'), { status: 413 });
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

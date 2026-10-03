import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, relative, sep } from 'node:path';
import recommendHandler from '../api/v1/recommend-size.js';
import productsHandler from '../api/v1/products.js';
import { sendJson } from '../src/services/recommendation-api.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const root = process.env.SERVE_DIST === '1' ? resolve(projectRoot, 'dist') : projectRoot;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.wasm': 'application/wasm', '.task': 'application/octet-stream' };
const configuration = JSON.parse(await readFile(resolve(projectRoot, 'vercel.json'), 'utf8'));
const headers = configuration.headers.find(entry => entry.source === '/(.*)').headers;

export const server = createServer(async (request, response) => {
  for (const { key, value } of headers) response.setHeader(key, value);
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (pathname === '/api/v1/products') return productsHandler(request, response);
    if (pathname === '/api/v1/recommend-size') return await recommendHandler(request, response);
    if (!['GET', 'HEAD'].includes(request.method)) return sendJson(response, 405, { error: 'Método não permitido.' });
    const path = resolve(root, '.' + decodeURIComponent(pathname === '/' ? '/index.html' : pathname));
    const local = relative(root, path);
    const allowed = ['index.html', 'styles.css', 'sw.js', 'offline-assets.json'].includes(local) || local.startsWith('src' + sep) || local.startsWith('public' + sep);
    if (local.startsWith('..') || local.split(/[\\/]/).some(part => part.startsWith('.')) || !allowed || (!Object.hasOwn(MIME, extname(path)) && local !== 'offline-assets.json')) {
      return sendJson(response, 404, { error: 'Arquivo não encontrado.' });
    }
    const content = await readFile(path);
    const type = MIME[extname(path)] || 'application/json';
    response.setHeader('Content-Type', type + (['.html', '.js', '.mjs', '.css', '.svg', '.json'].includes(extname(path)) ? '; charset=utf-8' : ''));
    response.setHeader('Cache-Control', 'no-cache');
    response.statusCode = 200; response.end(request.method === 'HEAD' ? undefined : content);
  } catch { sendJson(response, 404, { error: 'Arquivo não encontrado.' }); }
});
server.listen(Number(process.env.PORT) || 3000, '127.0.0.1', () => console.log(`FitVision: http://localhost:${Number(process.env.PORT) || 3000} (${process.env.SERVE_DIST === '1' ? 'build' : 'dev'})`));

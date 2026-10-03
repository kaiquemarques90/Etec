import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import handler from '../api/v1/recommend-size.js';
import { demoProfile } from '../src/domain/catalog.js';

const server = createServer(handler);
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
after(() => new Promise(resolve => server.close(resolve)));
const url = `http://127.0.0.1:${server.address().port}`;
test('handler serverless com POST, entrada válida e confidence não calibrada', async () => {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: 'tech', fitPreference: 'regular', userMeasurements: demoProfile }) });
  assert.equal(response.status, 200);
  const data = await response.json(); assert.equal(data.recommendedSize, 'P'); assert.equal(data.confidence, null);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('API rejeita método, formato, JSON quebrado e corpo acima do limite', async () => {
  assert.equal((await fetch(url)).status, 405);
  assert.equal((await fetch(url, { method: 'POST', body: '{}' })).status, 415);
  assert.equal((await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' })).status, 400);
  assert.equal((await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload: 'x'.repeat(70000) }) })).status, 413);
});

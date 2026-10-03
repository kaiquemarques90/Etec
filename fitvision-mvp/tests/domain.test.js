import { test } from 'node:test';
import assert from 'node:assert/strict';
import { products, demoProfile } from '../src/domain/catalog.js';
import { validateProduct } from '../src/domain/validation.js';
import { recommend } from '../src/domain/size-engine.js';
import { createSession, addLookItem } from '../src/domain/session.js';
import { garmentTransform } from '../src/features/virtual-tryon/geometry.js';
import { apiResult } from '../src/services/recommendation-api.js';

test('tabela vazia, tamanhos repetidos, preço inválido e imagem remota são rejeitados', () => {
  for (const changes of [{ variants: [] }, { variants: [products[0].variants[0], products[0].variants[0]] }, { price: -1 }, { image: 'https://example.com/garment.png' }]) assert.throws(() => validateProduct({ ...products[0], ...changes }));
});
test('cada dimensão relevante precisa caber: vestido e saia não usam apenas peito', () => {
  const dress = { ...products[0], category: 'dress', variants: [{ size: 'M', chest: 110, waist: 80, hips: 80, length: 100 }] };
  assert.equal(recommend(demoProfile, dress).recommendedSize, null);
  const skirt = { ...products[2], category: 'skirt' };
  assert.equal(recommend(demoProfile, skirt).fit.length, 2);
});
test('looks substituem a camada correspondente e preservam a jaqueta', () => {
  let look = addLookItem([], products[0], 'P');
  look = addLookItem(look, products[2], 'P');
  look = addLookItem(look, products[3], 'P');
  look = addLookItem(look, products[1], 'P');
  assert.equal(look.length, 3); assert.equal(look.some(item => item.product.id === 'tech'), false);
  const dress = { ...products[0], category: 'dress', id: 'dress' };
  look = addLookItem(look, dress, 'M');
  assert.deepEqual(look.map(item => item.product.id), ['vision', 'dress']);
});
test('sessões independentes não compartilham perfil, catálogo ou looks', () => {
  const a = createSession(), b = createSession(); a.profile.chest = 120; a.products[0].name = 'Editado';
  assert.equal(b.profile.chest, 88); assert.notEqual(a.products[0].name, b.products[0].name);
});
test('geometria alinha aos ombros sem alterar dimensões corporais', () => {
  const pose = Array.from({ length: 33 }, () => ({ x: .5, y: .5, visibility: 1 }));
  pose[11] = { x: .7, y: .3, visibility: 1 }; pose[12] = { x: .3, y: .3, visibility: 1 };
  pose[23].y = .65; pose[24].y = .65;
  const transform = garmentTransform(products[0], pose, { x: 0, y: 0, width: 500, height: 800 });
  assert.equal(transform.automatic, true); assert.equal(transform.x, 250); assert.equal(transform.y, 240); assert.ok(Math.abs(transform.scaleX - 1) < 1e-10);
  pose[11].visibility = .1;
  assert.equal(garmentTransform(products[0], pose, { x: 0, y: 0, width: 500, height: 800 }).automatic, false);
});
test('API usa o mesmo motor e rejeita produto desconhecido ou tabela com código diferente', () => {
  assert.equal(apiResult({ productId: 'tech', userMeasurements: demoProfile, fitPreference: 'oversized' }).body.recommendedSize, 'G');
  assert.equal(apiResult({ productId: 'missing', userMeasurements: demoProfile }).status, 404);
  assert.equal(apiResult({ productId: 'tech', product: products[1], userMeasurements: demoProfile }).status, 400);
  assert.equal(apiResult(null).status, 400);
});

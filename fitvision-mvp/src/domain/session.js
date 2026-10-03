import { products, demoProfile } from './catalog.js';
import { CATEGORY_RULES } from './validation.js';

/** In-memory session only: refreshing or resetting discards personal data. */
export function createSession() {
  return {
    products: structuredClone(products), profile: { ...demoProfile }, profileSource: 'demo', measurementSources: {},
    selectedId: products[0].id, preference: 'regular', look: [], savedLooks: [], cart: [],
    events: { recommendations: 0, tryons: 0, perSize: Object.create(null), perProduct: Object.create(null) }
  };
}
export function addLookItem(look, product, size) {
  const slot = CATEGORY_RULES[product.category].slot;
  return [...look.filter(item => {
    const existing = CATEGORY_RULES[item.product.category].slot;
    if (slot === 'full') return !['full', 'upper', 'lower'].includes(existing);
    if (['upper', 'lower'].includes(slot) && existing === 'full') return false;
    return existing !== slot;
  }), { product: structuredClone(product), size }];
}

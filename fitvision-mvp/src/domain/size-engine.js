import { CATEGORY_RULES, MEASUREMENT_NAMES, validateProfile, validateProduct } from './validation.js';
export { validateProfile } from './validation.js';

// Illustrative ease intervals in cm. Their accuracy must be assessed in real fitting trials.
const UPPER_EASE = { fitted: [4, 10], regular: [12, 18], loose: [18, 24], oversized: [24, 30] };
const LOWER_EASE = { fitted: [1, 4], regular: [4, 8], loose: [8, 12], oversized: [12, 18] };
const POLICIES = {
  top: UPPER_EASE, outerwear: UPPER_EASE, bottom: LOWER_EASE, skirt: LOWER_EASE,
  dress: { fitted: [3, 7], regular: [7, 12], loose: [12, 18], oversized: [18, 24] }
};
const SCORE_PENALTY = 4;

/**
 * Compare body and garment circumferences, never flat widths directly.
 * A negative ease is infeasible. Among feasible sizes choose the lowest weighted
 * distance from the desired ease interval. Catalog order is the documented tie-break.
 * compatibility is a heuristic score; confidence remains null until calibrated.
 */
export function recommend(profile, product, preference = 'regular') {
  validateProfile(profile);
  validateProduct(product);
  const policy = POLICIES[product.category];
  if (!Object.hasOwn(policy, preference)) throw new Error('Preferência de caimento inválida.');
  const [min, max] = policy[preference];
  const ranked = product.variants.map(variant => {
    let score = 0;
    let viable = true;
    const fit = Object.entries(CATEGORY_RULES[product.category].dimensions).map(([dimension, weight]) => {
      const ease = Math.round((variant[dimension] - profile[dimension]) * 10) / 10;
      if (ease < 0) viable = false;
      const distance = ease < min ? min - ease : ease > max ? ease - max : 0;
      score += weight * distance;
      return {
        dimension, body: profile[dimension], garment: variant[dimension], ease,
        desiredEase: [min, max],
        status: ease < 0 ? 'menor que o corpo' : ease < min ? 'mais justo' : ease > max ? 'mais amplo' : 'dentro da folga desejada'
      };
    });
    return { size: variant.size, score, viable, fit };
  }).sort((a, b) => a.score - b.score);
  const best = ranked.find(item => item.viable);
  const compatibility = best ? Math.max(0, Math.round(100 - best.score * SCORE_PENALTY)) : 0;
  return {
    recommendedSize: best?.size ?? null,
    compatibility, confidence: null,
    metric: 'Índice heurístico, não probabilidade de servir',
    fit: best?.fit ?? [],
    alternatives: ranked.filter(item => item !== best).map(item => ({
      ...item, description: item.viable ? item.fit.map(f => `${MEASUREMENT_NAMES[f.dimension]}: ${f.status}`).join('; ') : 'Menor que o corpo em uma ou mais dimensões'
    })),
    explanation: best
      ? `Menor penalidade entre os tamanhos viáveis para o caimento escolhido.${compatibility < 50 ? ' Compatibilidade baixa: confira a tabela antes de comprar.' : ''}`
      : 'Nenhum tamanho tem circunferências suficientes nas dimensões avaliadas.',
    limitations: ['Comprimento, ombros e elasticidade não avaliados pelo motor.', 'Políticas demonstrativas; sem validação em provas reais.']
  };
}

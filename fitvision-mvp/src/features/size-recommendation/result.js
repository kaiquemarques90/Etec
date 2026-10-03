import { $, escapeHtml } from '../../utils/dom.js';
import { MEASUREMENT_NAMES } from '../../domain/validation.js';
export function renderRecommendation(product, result, source) {
  $('recommendation').innerHTML = `
    <span class="eyebrow">${escapeHtml(product.name)}</span>
    <h3 class="result-heading">${result.recommendedSize ? 'Seu tamanho sugerido' : 'Fora da tabela disponível'}</h3>
    <div class="size-badge">${escapeHtml(result.recommendedSize ?? '—')}</div>
    <div class="score"><b>${result.compatibility}/100</b> de compatibilidade heurística</div>
    <p class="muted">${source === 'demo' ? 'Perfil fictício de demonstração. ' : ''}Não é probabilidade de servir. Não existe confiança estatística calibrada.</p>
    <p class="muted">${escapeHtml(result.explanation)}</p>
    ${result.fit.map(fit => `<div class="fit-line"><b>${MEASUREMENT_NAMES[fit.dimension]}</b> · ${fit.status}<br>Corpo ${fit.body} cm / peça ${fit.garment} cm<br>Folga de ${fit.ease} cm · intervalo desejado ${fit.desiredEase.join('–')} cm</div>`).join('')}
    <h3 class="alternatives-heading">Compare alternativas</h3>
    ${result.alternatives.map(item => `<span class="alternative">${escapeHtml(item.size)} · ${escapeHtml(item.description)}</span>`).join('')}
    <p class="muted">${result.limitations.join(' ')}</p>
    <details><summary>Ver tabela da peça</summary>${product.variants.map(variant => `<p class="muted"><b>${escapeHtml(variant.size)}</b>: ${Object.entries(variant).filter(([key]) => key !== 'size').map(([key, value]) => `${MEASUREMENT_NAMES[key] ?? key} ${value} cm`).join(' · ')}</p>`).join('')}</details>`;
}

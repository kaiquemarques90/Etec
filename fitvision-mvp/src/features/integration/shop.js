import { $, escapeHtml, imageMarkup, money } from '../../utils/dom.js';
import { recommend } from '../../domain/size-engine.js';

export function mountShop({ getState, getProduct, selectProduct, showStudio, addToCart, onRecommendation = () => {} }) {
  let requestId = 0;
  function render() {
    requestId++;
    const state = getState(), product = getProduct();
    $('shop-product').innerHTML = `<article class="shop-layout panel"><div class="shop-art">${imageMarkup(product)}</div><div><span class="eyebrow">VISION STUDIO · LOJA FICTÍCIA</span><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.description)}</p><p class="shop-price">${money(product.price)}</p><label>Escolha a peça<select id="shop-select">${state.products.map(item => `<option value="${escapeHtml(item.id)}" ${item.id === product.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select></label><label>Tamanho<select id="shop-size">${product.variants.map(variant => `<option>${escapeHtml(variant.size)}</option>`).join('')}</select></label><div class="shop-actions"><button id="shop-recommend" class="primary">Descobrir meu tamanho</button><button id="shop-tryon" class="text">Experimentar virtualmente ↗</button><button id="shop-cart" class="text">Adicionar ao carrinho demo +</button></div><p class="muted">${state.profileSource === 'demo' ? 'Usando perfil demonstrativo. Informe suas medidas no provador para personalizar.' : 'Usando suas medidas confirmadas nesta sessão.'}</p></div></article>`;
    $('shop-status').textContent = '';
    $('widget-code').textContent = `<script src="${location.origin}/public/fitvision.js" defer><\/script>\n<div data-fitvision-product="${product.id}"></div>`;
    $('shop-select').onchange = event => { selectProduct(event.target.value); render(); };
    $('shop-tryon').onclick = () => showStudio();
    $('shop-cart').onclick = () => { addToCart(product, $('shop-size').value); $('shop-status').textContent = 'Peça adicionada ao carrinho demonstrativo em Meus looks. Nenhuma compra realizada.'; };
    $('shop-recommend').onclick = async () => {
      const id = ++requestId, button = $('shop-recommend');
      button.disabled = true; $('shop-status').textContent = 'Comparando suas medidas com a tabela da peça…';
      const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 10000);
      let result, origin = 'API demonstrativa';
      try {
        const response = await fetch('/api/v1/recommend-size', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
          body: JSON.stringify({ productId: product.id, product: { ...product, image: undefined }, userMeasurements: state.profile, fitPreference: state.preference })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'API indisponível.');
        result = data;
      } catch {
        result = recommend(state.profile, product, state.preference); origin = 'motor local (API indisponível)';
      } finally { clearTimeout(timer); }
      if (id !== requestId) return;
      onRecommendation(result);
      button.disabled = false;
      if (result.recommendedSize) $('shop-size').value = result.recommendedSize;
      $('shop-status').textContent = result.recommendedSize
        ? `FitVision sugere ${result.recommendedSize} · índice heurístico ${result.compatibility}/100 · ${origin}. Não é probabilidade validada de servir.`
        : 'Nenhum tamanho adequado nas dimensões avaliadas. Confira a tabela e evite comprar pela recomendação.';
    };
  }
  return { render };
}

import { $, escapeHtml, imageMarkup } from './utils/dom.js';
import { createSession, addLookItem } from './domain/session.js';
import { recommend } from './domain/size-engine.js';
import { validateProfile } from './domain/validation.js';
import { createPreview } from './features/virtual-tryon/preview.js';
import { mountPhotoInput } from './features/body-profile/photo-input.js';
import { mountBodyAnalysis } from './features/body-analysis/body-analysis.js';
import { mountOutfits } from './features/outfits/outfits.js';
import { mountStoreManager } from './features/products/store-manager.js';
import { renderRecommendation } from './features/size-recommendation/result.js';
import { mountShop } from './features/integration/shop.js';
import { mountOffline } from './features/offline/offline.js';

let state = createSession();
let pendingEstimates = {};
const getState = () => state;
const getProduct = () => state.products.find(product => product.id === state.selectedId) || state.products[0];
const requestedProduct = new URLSearchParams(location.search).get('product');
if (state.products.some(product => product.id === requestedProduct)) state.selectedId = requestedProduct;

function show(view, focus = false) {
  if (!['studio', 'looks', 'shop', 'store'].includes(view)) return;
  if (view !== 'studio') analysis.stopCamera();
  document.querySelectorAll('.view').forEach(section => section.hidden = section.id !== view);
  document.querySelectorAll('[data-view]').forEach(button => {
    button.classList.toggle('active', button.dataset.view === view);
    if (button.dataset.view === view) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  if (view === 'shop') shop.render();
  if (view === 'store') { store.render(); renderStats(); }
  $(view).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  if (focus) $(view).querySelector('h2').focus({ preventScroll: true });
}

const preview = createPreview({ getItems: () => $('preview-mode').value === 'look' ? state.look.map(item => item.product) : [getProduct()] });
const analysis = mountBodyAnalysis({
  getPhoto: preview.getPhoto,
  setPhoto: source => { photoInput.clear(); preview.setPhoto(source); $('profile-status').textContent = 'Foto capturada localmente. Revise os resultados da análise antes de confirmar.'; },
  onPose: points => { preview.setPose(points); if (points) { state.events.tryons++; renderStats(); } },
  onEstimates: estimates => {
    pendingEstimates = { ...estimates };
    for (const [key, value] of Object.entries(estimates)) {
      $('profile-form').elements[key].value = value;
      markEstimate(key, true);
    }
    $('profile-status').textContent = 'Valores projetados estimados por imagem nos campos opcionais. Revise e corrija com fita métrica antes de confirmar. Circunferências continuam manuais.';
    $('profile-form').querySelector('details').open = true;
  }
});
const photoInput = mountPhotoInput({
  onChange: source => { analysis.reset(); preview.setPhoto(source); $('profile-status').textContent = source ? 'Foto carregada localmente. Clique em Detectar pose para analisar.' : 'Carregando foto local…'; },
  onError: message => { $('profile-status').textContent = message; }
});
const outfits = mountOutfits({ getState, onChange: preview.draw, showStudio: () => show('studio', true), tryLook: () => { $('preview-mode').value = 'look'; preview.draw(); } });
const store = mountStoreManager({ getState, onCatalogChange: () => {
  state.look = state.look.map(item => ({ ...item, product: structuredClone(state.products.find(product => product.id === item.product.id) || item.product) }));
  renderCatalog(); outfits.render(); update(false); shop.render();
} });
const shop = mountShop({ getState, getProduct, selectProduct, showStudio: () => show('studio', true), onRecommendation: result => { record(result); renderStats(); }, addToCart: (product, size) => {
  state.cart = addLookItem(state.cart, product, size); outfits.renderCart();
} });

function renderCatalog() {
  $('catalog').innerHTML = state.products.map(product => `<button class="product ${product.id === state.selectedId ? 'selected' : ''}" data-product="${escapeHtml(product.id)}" aria-pressed="${product.id === state.selectedId}"><div class="product-art">${imageMarkup(product)}</div><b>${escapeHtml(product.name)}</b><small>${escapeHtml(product.subtitle)}</small><span class="price">${product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · Demo</span></button>`).join('');
  $('catalog').querySelectorAll('[data-product]').forEach(button => button.onclick = () => selectProduct(button.dataset.product));
}
function selectProduct(id) {
  if (!state.products.some(product => product.id === id)) return;
  state.selectedId = id; $('preview-mode').value = 'piece'; renderCatalog(); update();
}
function record(result) {
  state.events.recommendations++;
  const productId = state.selectedId;
  state.events.perProduct[productId] = (Object.hasOwn(state.events.perProduct, productId) ? state.events.perProduct[productId] : 0) + 1;
  if (result.recommendedSize) {
    const size = result.recommendedSize;
    state.events.perSize[size] = (Object.hasOwn(state.events.perSize, size) ? state.events.perSize[size] : 0) + 1;
  }
}
function renderStats() {
  $('rec-count').textContent = state.events.recommendations;
  const sizes = Object.entries(state.events.perSize).map(([size, count]) => `${escapeHtml(size)}: ${count}`).join(' · ') || 'Nenhum';
  const products = Object.entries(state.events.perProduct).map(([id, count]) => `<li>${escapeHtml(state.products.find(product => product.id === id)?.name || 'Produto removido')}: ${count} cálculos</li>`).join('');
  $('session-stats').innerHTML = `<p>Poses válidas analisadas: <b>${state.events.tryons}</b></p><p>Tamanhos sugeridos: ${sizes}</p>${products ? `<ul>${products}</ul>` : ''}`;
}
function update(track = true) {
  try {
    const product = getProduct(), result = recommend(state.profile, product, state.preference);
    if (track) record(result);
    renderRecommendation(product, result, state.profileSource); renderStats(); preview.draw();
  } catch (error) { $('profile-status').textContent = error.message; }
}
function fillProfile() {
  for (const element of $('profile-form').querySelectorAll('input')) element.value = state.profile[element.name] ?? '';
  for (const key of ['shoulders', 'arm', 'leg']) markEstimate(key, state.measurementSources[key] === 'estimated-reviewed');
  $('preference').value = state.preference;
}
function resetControls() {
  for (const [id, value] of Object.entries({ scale: 100, position: 160, horizontal: 0, rotation: 0, opacity: 95 })) $(id).value = value;
  preview.draw();
}
function useDemo() {
  state.profile = { height: 174, chest: 88, waist: 72, hips: 87 }; state.profileSource = 'demo'; state.preference = 'regular'; state.measurementSources = {}; pendingEstimates = {};
  fillProfile(); $('profile-status').textContent = 'Perfil demonstrativo: medidas fictícias para apresentação.'; update();
}
$('profile-form').onsubmit = event => {
  event.preventDefault();
  try {
    const profile = Object.fromEntries([...new FormData(event.target)].filter(([, value]) => value !== '').map(([key, value]) => [key, Number(value)]));
    validateProfile(profile); state.profile = profile; state.profileSource = 'manual';
    state.measurementSources = Object.fromEntries(Object.keys(profile).map(key => [key, pendingEstimates[key] === profile[key] || state.measurementSources[key] === 'estimated-reviewed' ? 'estimated-reviewed' : 'manual']));
    $('profile-status').textContent = 'Medidas revisadas e confirmadas nesta sessão. Campos opcionais não influenciam o motor.'; update();
  } catch (error) { $('profile-status').textContent = error.message; }
};
$('preference').onchange = event => { state.preference = event.target.value; update(); };
$('start').onclick = () => { show('studio'); $('profile-form').elements.height.focus({ preventScroll: true }); };
$('demo-profile').onclick = () => { useDemo(); show('studio'); };
$('clear-photo').onclick = () => { analysis.reset(); photoInput.clear(); preview.setPhoto(null); $('profile-status').textContent = 'Foto removida. Medidas confirmadas permanecem na sessão.'; };
$('preview-mode').onchange = preview.draw;
$('reset-controls').onclick = resetControls;
$('download-preview').onclick = preview.exportImage;
$('add-look').onclick = () => {
  const product = getProduct(), result = recommend(state.profile, product, state.preference);
  if (!result.recommendedSize) { $('profile-status').textContent = 'Esta peça não tem tamanho adequado nas dimensões avaliadas.'; return; }
  state.look = addLookItem(state.look, product, result.recommendedSize);
  outfits.render(); preview.draw(); $('look-status').textContent = 'Peça adicionada ao look.'; show('looks', true);
};
$('reset').onclick = () => {
  store.close(); analysis.reset(); photoInput.clear(); state = createSession();
  pendingEstimates = {};
  fillProfile(); resetControls(); $('preview-mode').value = 'piece'; preview.reset();
  $('look-name').value = ''; $('profile-status').textContent = 'Dados pessoais removidos. Perfil fictício restaurado.';
  $('look-status').textContent = 'Looks e carrinho removidos da sessão.'; $('store-status').textContent = 'Catálogo fictício restaurado.';
  renderCatalog(); outfits.render(); store.render(); shop.render(); update(false); show('studio');
};
document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => show(button.dataset.view, true));
document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); show('studio', true); });
function markEstimate(key, estimated) {
  const label = $('profile-form').elements[key].closest('label');
  let badge = label.querySelector('[data-origin]');
  if (!badge) { badge = document.createElement('small'); badge.dataset.origin = 'true'; badge.className = 'measurement-origin'; label.append(badge); }
  badge.textContent = estimated ? 'Medida projetada estimada · revise' : '';
}
for (const key of ['shoulders', 'arm', 'leg']) $('profile-form').elements[key].addEventListener('input', () => { delete pendingEstimates[key]; state.measurementSources[key] = 'manual'; markEstimate(key, false); });
window.addEventListener('pagehide', () => { photoInput.clear(); preview.setPhoto(null); state = createSession(); });
window.addEventListener('pageshow', event => { if (event.persisted) $('reset').click(); });
mountOffline(); fillProfile(); renderCatalog(); outfits.render(); store.render(); update();
document.querySelector('[data-view=studio]').classList.add('active');
if (requestedProduct || location.hash === '#studio') show('studio');
if (requestedProduct && !state.products.some(product => product.id === requestedProduct)) $('profile-status').textContent = 'Este código de produto não está no catálogo público. Produtos personalizados só existem na sessão em que foram cadastrados. Exibindo uma peça demonstrativa.';

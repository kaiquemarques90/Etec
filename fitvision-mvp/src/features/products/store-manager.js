import { $, escapeHtml, money, imageMarkup, downloadJson } from '../../utils/dom.js';
import { CATEGORY_RULES, MEASUREMENT_NAMES, validateProduct } from '../../domain/validation.js';

/** Product administration is deliberately session-only; it never edits the public server catalog. */
export function mountStoreManager({ getState, onCatalogChange }) {
  const form = $('product-form'), dialog = $('product-dialog');
  let editingId = null, image = null, formVersion = 0;
  const category = () => form.elements.category.value;
  function renderRows(variants = []) {
    const dimensions = [...Object.keys(CATEGORY_RULES[category()].dimensions), 'length'];
    $('variant-head').innerHTML = `<tr><th>Tamanho</th>${dimensions.map(key => `<th>${MEASUREMENT_NAMES[key]}</th>`).join('')}<th>Ação</th></tr>`;
    $('variant-body').innerHTML = '';
    for (const variant of variants) appendRow(variant);
  }
  function appendRow(variant = { size: '' }) {
    if ($('variant-body').children.length >= 12) { $('product-form-status').textContent = 'Limite de 12 tamanhos.'; return; }
    const dimensions = [...Object.keys(CATEGORY_RULES[category()].dimensions), 'length'];
    const row = document.createElement('tr');
    row.innerHTML = `<td><input data-key="size" aria-label="Código do tamanho" maxlength="12" required value="${escapeHtml(variant.size)}"></td>${dimensions.map(key => `<td><input data-key="${key}" aria-label="${MEASUREMENT_NAMES[key]} do tamanho" type="number" min="${key === 'length' ? 10 : 5}" max="${key === 'length' ? 220 : 350}" step="0.1" required value="${variant[key] ?? ''}"></td>`).join('')}<td><button class="text" type="button" aria-label="Remover tamanho">✕</button></td>`;
    row.querySelector('button').onclick = () => row.remove();
    $('variant-body').append(row);
  }
  function open(product = null) {
    formVersion++;
    form.reset(); editingId = product?.id ?? null; image = product?.image ?? null;
    $('product-dialog-title').textContent = product ? 'Editar produto' : 'Cadastrar produto';
    $('product-form-status').textContent = '';
    if (product) {
      for (const key of ['name', 'description', 'price', 'category', 'defaultFit', 'color']) form.elements[key].value = product[key];
    }
    renderRows(product?.variants ?? ['P', 'M', 'G', 'GG'].map(size => ({ size })));
    dialog.showModal();
    form.elements.name.focus();
  }
  function readVariants() {
    const flat = form.elements.measurementMode.value === 'flat';
    return [...$('variant-body').children].map(row => Object.fromEntries([...row.querySelectorAll('input')].map(input => {
      const key = input.dataset.key;
      return [key, key === 'size' ? input.value.trim() : Number(input.value) * (flat && key !== 'length' ? 2 : 1)];
    })));
  }
  async function garmentData(file) {
    if (!file) return image;
    if (file.type !== 'image/png' || file.size > 2 * 1024 * 1024) throw new Error('Use uma imagem PNG de até 2 MB.');
    const bitmap = await createImageBitmap(file);
    try {
      if (bitmap.width * bitmap.height > 16000000) throw new Error('Reduza a imagem da peça para até 16 megapixels.');
      const canvas = document.createElement('canvas'); canvas.width = 480; canvas.height = 600;
      const factor = Math.min(480 / bitmap.width, 600 / bitmap.height);
      canvas.getContext('2d').drawImage(bitmap, (480 - bitmap.width * factor) / 2, (600 - bitmap.height * factor) / 2, bitmap.width * factor, bitmap.height * factor);
      return canvas.toDataURL('image/png');
    } finally { bitmap.close(); }
  }
  form.onsubmit = async event => {
    event.preventDefault();
    const version = formVersion, state = getState(), button = form.querySelector('[type=submit]');
    button.disabled = true;
    try {
      const fields = new FormData(form);
      const product = {
        id: editingId ?? `custom-${crypto.randomUUID().slice(0, 12)}`,
        name: String(fields.get('name')).trim(), description: String(fields.get('description')).trim(),
        subtitle: CATEGORY_RULES[category()].name, category: category(), price: Number(fields.get('price')),
        color: String(fields.get('color')), defaultFit: String(fields.get('defaultFit')),
        image: await garmentData($('garment-file').files[0]) || `/public/garments/${CATEGORY_RULES[category()].asset}.png`,
        variants: readVariants()
      };
      if (version !== formVersion) return;
      validateProduct(product);
      const index = state.products.findIndex(item => item.id === product.id);
      if (index >= 0) state.products[index] = product;
      else {
        if (state.products.length >= 30) throw new Error('Limite de 30 produtos na sessão.');
        state.products.push(product);
      }
      $('store-status').textContent = `${product.name} salvo somente nesta sessão. Exporte o JSON se quiser reutilizar o catálogo.`;
      dialog.close(); onCatalogChange(); render();
    } catch (error) { $('product-form-status').textContent = error.message; }
    finally { button.disabled = false; }
  };
  $('product-category').onchange = () => { image = null; renderRows(['P', 'M', 'G', 'GG'].map(size => ({ size }))); };
  $('add-variant').onclick = () => appendRow();
  $('new-product').onclick = () => open();
  $('close-product').onclick = () => { formVersion++; dialog.close(); };
  dialog.addEventListener('cancel', () => { formVersion++; });
  $('export-catalog').onclick = () => { downloadJson('fitvision-catalogo-demo.json', { version: 1, products: getState().products }); $('store-status').textContent = 'Catálogo exportado. Este arquivo não contém fotos corporais ou medidas do perfil.'; };
  $('import-catalog').onchange = async () => {
    const file = $('import-catalog').files[0]; if (!file) return;
    try {
      if (file.size > 12 * 1024 * 1024) throw new Error('Use JSON de até 12 MB.');
      const data = JSON.parse(await file.text());
      if (data.version !== 1 || !Array.isArray(data.products) || !data.products.length || data.products.length > 30) throw new Error('Formato de catálogo inválido. Use a exportação do FitVision (1 a 30 produtos).');
      const ids = new Set();
      const products = data.products.map(item => {
        validateProduct(item);
        if (ids.has(item.id)) throw new Error('Existem códigos de produto repetidos.');
        ids.add(item.id);
        return { id: item.id, name: item.name, description: item.description, category: item.category,
          price: item.price, color: item.color, defaultFit: item.defaultFit, image: item.image || `/public/garments/${CATEGORY_RULES[item.category].asset}.png`,
          subtitle: CATEGORY_RULES[item.category].name,
          variants: item.variants.map(variant => ({ size: variant.size, length: variant.length, ...Object.fromEntries(Object.keys(CATEGORY_RULES[item.category].dimensions).map(key => [key, variant[key]])) })) };
      });
      getState().products = products; getState().selectedId = products[0].id;
      getState().look = []; getState().cart = []; getState().savedLooks = [];
      onCatalogChange(); render(); $('store-status').textContent = 'Catálogo importado na sessão. Looks e carrinho anteriores foram limpos para evitar referências antigas.';
    } catch (error) { $('store-status').textContent = `Importação não realizada: ${error.message}`; }
    finally { $('import-catalog').value = ''; }
  };
  function render() {
    const state = getState();
    $('product-count').textContent = state.products.length;
    $('managed-products').innerHTML = state.products.map(product => `<article class="managed-product">${imageMarkup(product)}<div><b>${escapeHtml(product.name)}</b><p class="muted">${money(product.price)} · ${product.variants.length} tamanhos</p></div><button class="text" data-edit="${escapeHtml(product.id)}">Editar</button><button class="text" data-delete="${escapeHtml(product.id)}">Excluir</button></article>`).join('');
    $('managed-products').querySelectorAll('[data-edit]').forEach(button => button.onclick = () => open(state.products.find(product => product.id === button.dataset.edit)));
    $('managed-products').querySelectorAll('[data-delete]').forEach(button => button.onclick = () => {
      if (state.products.length === 1) { $('store-status').textContent = 'Mantenha ao menos um produto para demonstrar o provador.'; return; }
      const id = button.dataset.delete;
      state.products = state.products.filter(product => product.id !== id);
      state.look = state.look.filter(item => item.product.id !== id);
      state.cart = state.cart.filter(item => item.product.id !== id);
      state.savedLooks = state.savedLooks.map(look => ({ ...look, items: look.items.filter(item => item.product.id !== id) })).filter(look => look.items.length);
      if (state.selectedId === id) state.selectedId = state.products[0].id;
      onCatalogChange(); render(); $('store-status').textContent = 'Produto removido do catálogo, looks e carrinho desta sessão.';
    });
    $('size-table').innerHTML = state.products.flatMap(product => product.variants.map(variant => `<tr><td>${escapeHtml(product.name)}</td><td>${escapeHtml(variant.size)}</td><td>${variant.chest ?? '—'}</td><td>${variant.waist ?? '—'}</td><td>${variant.hips ?? '—'}</td><td>${variant.length}</td></tr>`)).join('');
  }
  return { render, close() { formVersion++; dialog.close(); } };
}

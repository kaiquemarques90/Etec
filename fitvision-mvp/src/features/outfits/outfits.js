import { $, escapeHtml, imageMarkup, money } from '../../utils/dom.js';

export function mountOutfits({ getState, onChange, showStudio, tryLook }) {
  function render() {
    const state = getState();
    $('look-count').textContent = state.look.length;
    $('look-items').innerHTML = state.look.length ? state.look.map((item, index) => `
      <article class="panel look-row">${imageMarkup(item.product)}
        <div><h3>${escapeHtml(item.product.name)}</h3><span>Tamanho ${escapeHtml(item.size)} · ${money(item.product.price)}</span></div>
        <button class="text" data-remove="${index}" aria-label="Remover ${escapeHtml(item.product.name)}">Remover</button>
      </article>`).join('') : '<p class="muted">Seu look começa no provador. Combine uma parte de cima, uma parte de baixo e uma jaqueta.</p>';
    $('saved-looks').innerHTML = state.savedLooks.length ? state.savedLooks.map((look, index) => `
      <article class="panel saved-look"><h3>${escapeHtml(look.name)}</h3><p class="muted">${look.items.length} peças · salvo somente nesta sessão</p>
        <button class="text" data-open-look="${index}">Abrir look</button>
        <button class="text" data-delete-look="${index}" aria-label="Excluir ${escapeHtml(look.name)}">Excluir</button>
      </article>`).join('') : '<p class="muted">Seus looks salvos aparecerão aqui enquanto a página estiver aberta.</p>';
    $('look-items').querySelectorAll('[data-remove]').forEach(button => button.onclick = () => {
      state.look.splice(Number(button.dataset.remove), 1); render(); onChange(); $('look-status').textContent = 'Peça removida do look atual.';
    });
    $('saved-looks').querySelectorAll('[data-open-look]').forEach(button => button.onclick = () => {
      state.look = structuredClone(state.savedLooks[Number(button.dataset.openLook)].items); render(); onChange(); $('look-status').textContent = 'Look restaurado na sessão.';
    });
    $('saved-looks').querySelectorAll('[data-delete-look]').forEach(button => button.onclick = () => {
      state.savedLooks.splice(Number(button.dataset.deleteLook), 1); render(); $('look-status').textContent = 'Look excluído.';
    });
    renderCart();
  }
  function renderCart() {
    const state = getState();
    $('cart-items').innerHTML = state.cart.length ? state.cart.map((item, index) => `
      <div class="cart-row"><span>${escapeHtml(item.product.name)} · ${escapeHtml(item.size)}</span><b>${money(item.product.price)}</b>
        <button class="text" data-cart-remove="${index}" aria-label="Remover ${escapeHtml(item.product.name)} do carrinho">Remover</button></div>`).join('') : '<p class="muted">Carrinho vazio.</p>';
    $('cart-total').textContent = money(state.cart.reduce((sum, item) => sum + item.product.price, 0));
    $('cart-items').querySelectorAll('[data-cart-remove]').forEach(button => button.onclick = () => { state.cart.splice(Number(button.dataset.cartRemove), 1); renderCart(); });
  }
  $('save-look').onclick = () => {
    const state = getState();
    if (!state.look.length) { $('look-status').textContent = 'Adicione uma peça antes de salvar.'; return; }
    if (state.savedLooks.length >= 20) { $('look-status').textContent = 'Limite de 20 looks na sessão. Exclua um look para continuar.'; return; }
    const name = $('look-name').value.trim() || `Look ${state.savedLooks.length + 1}`;
    state.savedLooks.push({ name: name.slice(0, 60), items: structuredClone(state.look) });
    render(); $('look-status').textContent = 'Look salvo nesta sessão. Recarregar a página apaga os dados.';
  };
  $('cart').onclick = () => {
    const state = getState();
    if (!state.look.length) { $('look-status').textContent = 'Seu look está vazio.'; return; }
    state.cart = structuredClone(state.look); renderCart();
    $('look-status').textContent = `Carrinho demonstrativo: ${state.cart.length} peças, total ${money(state.cart.reduce((sum, item) => sum + item.product.price, 0))}. Nenhuma compra realizada.`;
  };
  $('try-look').onclick = () => {
    if (!getState().look.length) { $('look-status').textContent = 'Adicione peças para experimentar o look.'; return; }
    tryLook(); showStudio();
  };
  $('continue-look').onclick = showStudio;
  $('clear-cart').onclick = () => { getState().cart = []; renderCart(); $('look-status').textContent = 'Carrinho demonstrativo esvaziado.'; };
  return { render, renderCart };
}

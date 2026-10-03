export const $ = id => document.getElementById(id);
export const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
export function downloadJson(name, data) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function photoSize(source) {
  return { width: source.naturalWidth || source.width, height: source.naturalHeight || source.height };
}
export function imageMarkup(product, className = '') {
  return `<img class="${className}" src="${escapeHtml(product.image || '/public/garments/tech.png')}" alt="Ilustração demonstrativa de ${escapeHtml(product.name)}" loading="lazy" width="240" height="300">`;
}

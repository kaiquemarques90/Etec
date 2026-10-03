/* FitVision demo widget: no customer data is sent by the widget. */
(() => {
  const script = document.currentScript;
  const origin = new URL(script.src).origin;
  function mount() {
    document.querySelectorAll('[data-fitvision-product]').forEach(container => {
      if (container.dataset.fitvisionMounted) return;
      const id = container.dataset.fitvisionProduct;
      if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id || '')) return;
      const link = document.createElement('a');
      link.href = `${origin}/?product=${encodeURIComponent(id)}#studio`;
      link.textContent = 'Descobrir meu tamanho · FitVision'; link.target = '_blank'; link.rel = 'noopener';
      link.className = 'fitvision-widget-button';
      container.append(link); container.dataset.fitvisionMounted = 'true';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();

import { $ } from '../../utils/dom.js';

export function mountOffline() {
  let registrationPromise;
  if ('serviceWorker' in navigator && window.isSecureContext) {
    registrationPromise = navigator.serviceWorker.register('/sw.js').catch(() => null);
  }
  $('prepare-offline').onclick = async () => {
    const button = $('prepare-offline');
    button.disabled = true; $('offline-status').textContent = 'Preparando aplicativo e modelo local (até 30 MB). Aguarde…';
    try {
      const registration = await registrationPromise;
      if (!registration) throw new Error('Este navegador não permitiu o cache offline. O perfil demo continua disponível com o aplicativo aberto.');
      const ready = await navigator.serviceWorker.ready;
      await new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        const timer = setTimeout(() => reject(new Error('Não foi possível concluir o cache. Verifique a conexão e tente novamente.')), 55000);
        channel.port1.onmessage = event => { clearTimeout(timer); event.data.ok ? resolve() : reject(new Error(event.data.error)); };
        ready.active.postMessage({ type: 'PREPARE_OFFLINE' }, [channel.port2]);
      });
      $('offline-status').textContent = 'Aplicativo e modelo preparados para uso sem rede neste navegador. O sistema pode remover o cache se faltar espaço.';
    } catch (error) { $('offline-status').textContent = error.message; }
    finally { button.disabled = false; }
  };
}

import { $, photoSize } from '../../utils/dom.js';
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_PIXELS = 32 * 1024 * 1024;
const MAX_SIDE = 1600;

/** Decode locally, normalize orientation using browser decoding, and limit inference resolution. */
export function mountPhotoInput({ onChange, onError }) {
  let version = 0, pendingUrl = null;
  function cancel() {
    version++;
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    pendingUrl = null;
  }
  $('photo').addEventListener('change', () => {
    cancel();
    const file = $('photo').files[0];
    if (!file) return;
    onChange(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > MAX_BYTES) {
      $('photo').value = ''; onError('Use JPG, PNG ou WebP de até 10 MB. Para HEIC, exporte como JPEG.'); return;
    }
    const request = version, url = URL.createObjectURL(file), image = new Image();
    pendingUrl = url;
    image.onload = () => {
      if (request !== version) return;
      const { width, height } = photoSize(image);
      if (!width || !height || width * height > MAX_PIXELS) {
        cancel(); onError('Imagem com resolução muito alta. Reduza para até 32 megapixels.'); return;
      }
      const ratio = Math.min(1, MAX_SIDE / Math.max(width, height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url); pendingUrl = null;
      onChange(canvas);
    };
    image.onerror = () => { if (request === version) { cancel(); onError('Não foi possível abrir a foto. Tente outro arquivo.'); } };
    image.src = url;
  });
  return { clear() { cancel(); $('photo').value = ''; } };
}

import { $, photoSize } from '../../utils/dom.js';
import { CATEGORY_RULES } from '../../domain/validation.js';
import { garmentTransform } from './geometry.js';

const WIDTH = 480, HEIGHT = 620;
const ORDER = { lower: 0, full: 1, upper: 2, outer: 3 };
export function createPreview({ getItems }) {
  const canvas = $('preview');
  canvas.width = WIDTH; canvas.height = HEIGHT;
  const context = canvas.getContext('2d');
  const images = new Map();
  let photo = null, pose = null;

  function frameForPhoto() {
    if (!photo) return { x: 0, y: 0, width: WIDTH, height: HEIGHT };
    const size = photoSize(photo);
    const ratio = Math.min(WIDTH / size.width, HEIGHT / size.height);
    return { x: (WIDTH - size.width * ratio) / 2, y: (HEIGHT - size.height * ratio) / 2, width: size.width * ratio, height: size.height * ratio };
  }
  function loadArtwork(product) {
    const path = product.image || `/public/garments/${CATEGORY_RULES[product.category].asset}.png`;
    if (!images.has(path)) {
      const image = new Image();
      image.onload = draw;
      image.onerror = () => { $('preview-status').textContent = 'Não foi possível carregar a imagem da peça. Selecione outra peça.'; };
      images.set(path, image); image.src = path;
    }
    return images.get(path);
  }
  function drawAvatar() {
    context.fillStyle = '#d1d9cf';
    context.beginPath(); context.arc(240, 76, 36, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.roundRect(186, 127, 108, 226, 22); context.fill();
    context.beginPath(); context.roundRect(145, 136, 28, 206, 14); context.roundRect(307, 136, 28, 206, 14); context.fill();
    context.beginPath(); context.roundRect(191, 349, 40, 215, 15); context.roundRect(249, 349, 40, 215, 15); context.fill();
  }
  function draw() {
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = '#edf0e8'; context.fillRect(0, 0, WIDTH, HEIGHT);
    const frame = frameForPhoto();
    if (photo) context.drawImage(photo, frame.x, frame.y, frame.width, frame.height); else drawAvatar();
    const controls = Object.fromEntries(['scale', 'position', 'horizontal', 'rotation'].map(id => [id, Number($(id).value)]));
    const items = getItems().slice().sort((a, b) => ORDER[CATEGORY_RULES[a.category].slot] - ORDER[CATEGORY_RULES[b.category].slot]);
    let automatic = false;
    for (const product of items) {
      const image = loadArtwork(product);
      if (!image.complete || !image.naturalWidth) continue;
      const transform = garmentTransform(product, pose, frame, controls);
      automatic ||= transform.automatic;
      context.save();
      context.translate(transform.x, transform.y); context.rotate(transform.angle);
      context.scale(transform.scaleX, transform.scaleY);
      context.globalAlpha = Number($('opacity').value) / 100;
      // Uploaded artwork is normalized to the same 480×600 template by the catalog editor.
      context.drawImage(image, -transform.anchorX, -transform.anchorY, 480, 600);
      context.restore();
    }
    context.fillStyle = '#274d3f'; context.fillRect(0, HEIGHT - 27, WIDTH, 27);
    context.fillStyle = '#fff'; context.font = '11px Arial';
    context.fillText(automatic ? 'PROTÓTIPO 2D · ALINHADO À POSE · SEM SIMULAÇÃO DE TECIDO' : 'PROTÓTIPO 2D · AJUSTE MANUAL · SEM SIMULAÇÃO DE TECIDO', 10, HEIGHT - 10);
    $('preview-status').textContent = automatic
      ? 'Alinhamento automático por ombros ou quadril. Ajuste os controles se necessário; a imagem não comprova o tamanho.'
      : 'Envie uma foto e detecte a pose para alinhar as peças. Sem pose válida, ajuste manualmente.';
  }
  ['scale', 'position', 'horizontal', 'rotation', 'opacity'].forEach(id => $(id).addEventListener('input', draw));
  return {
    draw,
    setPhoto(source) { photo = source; pose = null; draw(); },
    setPose(points) { pose = points; draw(); },
    getPhoto: () => photo,
    reset() { photo = null; pose = null; images.clear(); draw(); },
    exportImage() {
      if (!photo) { $('preview-status').textContent = 'Adicione uma foto antes de baixar a composição.'; return; }
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob), anchor = document.createElement('a');
        anchor.href = url; anchor.download = 'fitvision-prototipo-2d.png'; anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png');
    }
  };
}

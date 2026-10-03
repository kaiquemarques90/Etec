import { assessPose, estimateSegments, BODY_CONNECTIONS } from './pose-quality.js';
import { photoSize } from '../../utils/dom.js';
import { PROFILE_RANGES, MEASUREMENT_NAMES } from '../../domain/validation.js';

export function mountBodyAnalysis({ getPhoto, setPhoto, onPose = () => {}, onEstimates = () => {} }) {
  const section = document.createElement('section'); section.className = 'panel body-analysis';
  section.innerHTML = `<span class="eyebrow">ANÁLISE CORPORAL LOCAL</span><h3>Uma pose, um ponto de partida.</h3>
    <p class="muted">Informe a altura no perfil. Fotografe uma pessoa de frente, em pé, com cabeça e pés visíveis, braços levemente afastados e câmera nivelada. Use roupa próxima ao corpo e boa iluminação. A câmera só abre quando você solicitar.</p>
    <div class="camera-actions"><button id="camera-start" class="primary">Abrir câmera</button><button id="camera-capture" class="text" disabled>Capturar foto</button><button id="camera-stop" class="text" disabled>Desligar câmera</button><button id="pose-analyze" class="primary">Detectar pose na foto</button></div>
    <video id="camera-video" autoplay muted playsinline hidden aria-label="Prévia da câmera"></video>
    <p id="analysis-status" role="status">Use o upload ou capture uma foto. O modelo e a foto são processados neste dispositivo.</p>
    <canvas id="pose-canvas" width="480" height="560" hidden aria-label="Foto com pontos corporais detectados"></canvas>
    <label id="mask-control" class="checkbox-label" hidden><input id="show-mask" type="checkbox">Mostrar segmentação da pessoa (aproximada)</label>
    <div id="calibration" hidden><h3>Calibração experimental</h3>
      <p class="muted">Ajuste as linhas ao topo da cabeça e à base dos pés. As medidas são projeções 2D, sem precisão certificada, e não alteram a recomendação de tamanho. Postura, câmera e perspectiva afetam o resultado.</p>
      <label>Topo da cabeça<input id="cal-top" type="range" min="0" max="45" value="5"></label><label>Base dos pés<input id="cal-bottom" type="range" min="55" max="100" value="95"></label>
      <button id="estimate-shoulders" class="text">Estimar medidas projetadas →</button><p id="estimate-result" role="status"></p>
      <button id="review-estimates" class="primary" hidden>Levar estimativas para revisão</button>
    </div><p class="muted">Peito, cintura e quadril continuam manuais. Não há reconhecimento facial nem envio de fotos. Confiança do detector não equivale à precisão em centímetros.</p>`;
  document.getElementById('body-analysis-mount').append(section);
  const $ = id => section.querySelector('#' + id);
  let stream = null, worker = null, sequence = 0, points = null, source = null;
  let timer = null, cameraVersion = 0, maskCanvas = null, estimates = null;
  const status = message => $('analysis-status').textContent = message;

  function clearResults() {
    sequence++; clearTimeout(timer);
    if ($('pose-analyze').disabled) { worker?.terminate(); worker = null; }
    points = null; source = null; maskCanvas = null; estimates = null;
    $('pose-analyze').disabled = false;
    for (const id of ['pose-canvas', 'calibration', 'mask-control', 'review-estimates']) $(id).hidden = true;
    $('pose-canvas').getContext('2d').clearRect(0, 0, $('pose-canvas').width, $('pose-canvas').height);
    $('estimate-result').textContent = ''; $('show-mask').checked = false; onPose(null);
  }
  function stopCamera() {
    cameraVersion++; stream?.getTracks().forEach(track => track.stop()); stream = null;
    $('camera-video').srcObject = null; $('camera-video').hidden = true;
    $('camera-capture').disabled = true; $('camera-stop').disabled = true; $('camera-start').disabled = false;
  }
  function reset() { stopCamera(); clearResults(); status('Use o upload ou capture uma foto. Processamento local.'); }

  $('camera-start').onclick = async () => {
    stopCamera(); const version = cameraVersion; $('camera-start').disabled = true;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Câmera indisponível');
      const acquired = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } });
      if (version !== cameraVersion) { acquired.getTracks().forEach(track => track.stop()); return; }
      stream = acquired; $('camera-video').srcObject = stream; $('camera-video').hidden = false;
      await $('camera-video').play();
      if (version !== cameraVersion) return;
      $('camera-capture').disabled = false; $('camera-stop').disabled = false;
      status('Câmera ativa. Capture quando estiver com o corpo inteiro no quadro.');
    } catch {
      if (version !== cameraVersion) return;
      stopCamera(); status('Não foi possível abrir a câmera. Verifique a permissão e use HTTPS no celular, ou utilize o upload.');
    }
  };
  $('camera-stop').onclick = () => { stopCamera(); status('Câmera desligada.'); };
  $('camera-capture').onclick = () => {
    const video = $('camera-video'); if (!video.videoWidth) return;
    const canvas = document.createElement('canvas');
    const ratio = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * ratio); canvas.height = Math.round(video.videoHeight * ratio);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    reset(); setPhoto(canvas); status('Foto capturada em memória. Clique em Detectar pose.');
  };

  function prepareMask(mask) {
    if (!mask) return;
    maskCanvas = document.createElement('canvas'); maskCanvas.width = mask.width; maskCanvas.height = mask.height;
    const ctx = maskCanvas.getContext('2d'), data = ctx.createImageData(mask.width, mask.height);
    for (let index = 0; index < mask.pixels.length; index++) {
      data.data[index * 4] = 100; data.data[index * 4 + 1] = 220; data.data[index * 4 + 2] = 140;
      data.data[index * 4 + 3] = mask.pixels[index] > 127 ? 75 : 0;
    }
    ctx.putImageData(data, 0, 0); $('mask-control').hidden = false;
  }
  function render() {
    if (!source || !points) return;
    const canvas = $('pose-canvas'), ctx = canvas.getContext('2d'), size = photoSize(source);
    canvas.width = size.width; canvas.height = size.height; ctx.drawImage(source, 0, 0);
    if ($('show-mask').checked && maskCanvas) ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
    const point = index => ({ x: points[index].x * canvas.width, y: points[index].y * canvas.height });
    ctx.lineWidth = Math.max(2, canvas.width / 240); ctx.strokeStyle = '#b6ff84';
    for (const [a, b] of BODY_CONNECTIONS) {
      if (points[a].visibility < .65 || points[b].visibility < .65) continue;
      const pa = point(a), pb = point(b); ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
    }
    ctx.fillStyle = '#274d3f';
    for (let index = 11; index < 33; index++) {
      if (points[index].visibility < .65) continue;
      const p = point(index); ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(3, canvas.width / 160), 0, Math.PI * 2); ctx.fill();
    }
    if (!$('calibration').hidden) {
      ctx.strokeStyle = '#fff';
      for (const value of [$('cal-top').value, $('cal-bottom').value]) {
        const y = Number(value) / 100 * canvas.height; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    }
  }
  function createWorker() {
    worker = new Worker('/src/features/body-analysis/pose-worker.js');
    worker.onerror = () => { clearResults(); worker?.terminate(); worker = null; status('Falha ao carregar o detector. As medidas manuais continuam disponíveis.'); };
    worker.onmessage = ({ data }) => {
      if (data.id !== sequence) return;
      clearTimeout(timer); $('pose-analyze').disabled = false;
      if (data.error) { status('Não foi possível executar o modelo: ' + data.error); return; }
      const quality = assessPose(data.landmarks); status(quality.message);
      if (data.landmarks.length !== 1) return;
      points = data.landmarks[0]; prepareMask(data.segmentation);
      $('pose-canvas').hidden = false; $('calibration').hidden = !quality.valid;
      onPose(quality.valid ? points : null); render();
    };
  }
  $('pose-analyze').onclick = async () => {
    clearResults(); const photo = getPhoto();
    if (!photo) { status('Escolha ou capture uma foto antes de detectar a pose.'); return; }
    source = photo; const id = ++sequence; $('pose-analyze').disabled = true;
    status('Carregando modelo local e detectando pose…');
    try {
      if (!worker) createWorker();
      const bitmap = await createImageBitmap(photo);
      if (id !== sequence) { bitmap.close(); return; }
      worker.postMessage({ id, bitmap }, [bitmap]);
      timer = setTimeout(() => { clearResults(); status('A análise excedeu o tempo esperado. Tente novamente ou use medidas manuais.'); }, 45000);
    } catch { clearResults(); status('A imagem não pôde ser analisada. Tente outro arquivo.'); }
  };
  ['cal-top', 'cal-bottom'].forEach(id => $(id).oninput = () => { estimates = null; $('estimate-result').textContent = ''; $('review-estimates').hidden = true; render(); });
  $('show-mask').onchange = render;
  $('estimate-shoulders').onclick = () => {
    try {
      const size = photoSize(source);
      estimates = estimateSegments(points, size.width, size.height, Number(document.querySelector('[name=height]').value), Number($('cal-top').value) / 100, Number($('cal-bottom').value) / 100);
      $('estimate-result').textContent = 'Medidas projetadas estimadas: ' + Object.entries(estimates).map(([key, value]) => `${MEASUREMENT_NAMES[key]} ${value} cm`).join(' · ') + '. Experimental; confira com fita métrica. Nenhuma circunferência foi estimada.';
      const valid = Object.entries(estimates).every(([key, value]) => value >= PROFILE_RANGES[key][0] && value <= PROFILE_RANGES[key][1]);
      $('review-estimates').hidden = !valid;
      if (!valid) $('estimate-result').textContent += ' Valores fora da faixa do perfil; refaça a calibração.';
    } catch (error) { estimates = null; $('review-estimates').hidden = true; $('estimate-result').textContent = error.message; }
  };
  $('review-estimates').onclick = () => { if (!estimates) return; onEstimates(estimates); document.getElementById('profile-form').scrollIntoView({ behavior: 'smooth' }); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopCamera(); });
  window.addEventListener('pagehide', () => { reset(); worker?.terminate(); worker = null; });
  return { reset, stopCamera, photoChanged: clearResults };
}

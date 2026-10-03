# Visão e provador

## Detecção funcional

MediaPipe Tasks Vision 0.10.32, Pose Landmarker Lite float16 v1, CPU, modo IMAGE, até duas poses e máscara de segmentação. Modelo/WASM locais, sem CDN durante uso. Worker clássico importa o bundle ESM e deixa o loader usar importScripts; isso evita a incompatibilidade observada em module workers.

Câmera requer ação e permissão. Tracks são desligadas na captura, no botão de parada, na troca de tela, no reset e quando a página perde visibilidade. Upload é normalizado em Canvas até 1600 px por lado. Worker tem timeout e caminho manual.

Filtros: uma pessoa, pontos principais com visibilidade ≥0.65, enquadramento e ombros aproximadamente nivelados. São heurísticos: não comprovam postura frontal, iluminação ou precisão antropométrica. Landmarks faciais não são exibidos e não há reconhecimento de identidade.

## Estimativas experimentais

Altura informada / distância em pixels entre topo da cabeça e base dos pés fornece escala aproximada. Usuário ajusta ambas as linhas. Distâncias projetadas de ombros e segmentos de braços/pernas são calculadas em 2D. A média bilateral ajuda a apresentar segmentos, sem resolver perspectiva ou profundidade.

Resultados são identificados como estimados, revisados antes de confirmar e ficam nos campos opcionais. Não participam da recomendação. Peito/cintura/quadril continuam manuais; não são inferidos de landmarks frontais. Não existe porcentagem de precisão calibrada.

## Provador 2D

PNGs transparentes foram desenhados como ilustrações, não fotos de peças físicas. Ombros alinham parte superior, quadril alinha parte inferior; escala, comprimento projetado e rotação vêm da pose válida. Sem pose, usa ajuste manual. Camadas desenham calça, parte de cima e jaqueta; vestido substitui as duas primeiras.

Segmentação é exibida para inspeção da pessoa; não há oclusão anatômica por braços. Não há deformação de mangas, tecido, volume, IA generativa ou comprovação de ajuste. PNG enviado pela loja é normalizado ao molde 480×600 e pode precisar de ajuste manual.

## Verificação e evolução

Inferência real e segmentação verificadas com fixture pública oficial. Geometria, visibilidade e escala têm testes de negócio. Câmera em testes usa dispositivo artificial; aparelhos físicos precisam de teste após publicação. Próximos estudos: calibração validada, oclusão, duas fotos, provedores de try-on com licença comercial e eventual AR/3D.

Referência: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js . Atribuição e licença do código em public/vendor/mediapipe. Revise o model card e os termos do modelo antes da comercialização.

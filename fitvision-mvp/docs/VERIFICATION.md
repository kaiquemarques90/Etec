# Verificação da entrega — 02/10/2026

## Passou no ambiente local

- Build estático concluído, com 41 entradas no manifesto offline.
- 18 testes automatizados de domínio, geometria, validação e API HTTP.
- Fluxo de recomendação, caimento, tamanho inexistente, look, carrinho e reset.
- Inferência real MediaPipe em imagem de teste oficial, segmentação, alinhamento à pose, calibração e revisão de estimativas. Nenhuma requisição externa do aplicativo durante inferência.
- Captura e encerramento da câmera artificial; fallback quando permissão/câmera não estão disponíveis.
- Look de três camadas, nome, salvamento na sessão, remoção e restauração.
- Cadastro, edição e exclusão de produto, PNG enviado e conversão largura plana ×2 sem alterar comprimento.
- Escaping de texto do cadastro, exportação JSON, importação válida e rejeição de importação inválida.
- Vitrine com API de produto temporário, widget e links de produto conhecido/desconhecido.
- Cache sem API; recarga offline, inferência/segmentação offline e fallback local da vitrine.
- Ausência de overflow horizontal das telas em larguras 360, 390 e 768 px.
- Fluxo completo repetido em servidor que serve o build dist, com os mesmos handlers de API e headers de segurança.
- Sem erros JavaScript ou bloqueios de CSP nos testes completos.

## Não verificado remotamente

Esta entrega não fez deploy no Vercel. Configuração segue documentação oficial, mas domínio público, comportamento do provedor, câmeras físicas, Safari/iOS, Android e dispositivos antigos precisam da conferência em docs/DEPLOY.md após publicar.

Os testes de câmera usam um dispositivo artificial do navegador. A fixture de pose não é evidência de precisão antropométrica, de caimento ou de redução de devoluções. Essas avaliações exigem pilotos próprios.

## Reprodução

`npm test` e `npm run build`. Testes de navegador opcionais: tests/browser-check.cjs, vision-browser-check.cjs, mvp-browser-check.cjs e catalog-browser-check.cjs. Eles usam Playwright/Edge instalados separadamente; PLAYWRIGHT_MODULE indica um pacote em outro local. TEST_URL altera a origem nos testes completos e de catálogo.

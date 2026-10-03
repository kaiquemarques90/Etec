# FitVision AI — MVP

Protótipo demonstrativo de recomendação de tamanhos, visão corporal local e composição de looks. Pronto para gerar um build estático e usar funções da Vercel. Não possui contas, pagamentos ou banco comercial.

## Executar e testar

Instale Node.js 22. Não há dependências npm necessárias ao aplicativo.

```sh
npm start
npm test
npm run build
```

Abra http://localhost:3000. O build fica em `dist`. O servidor de desenvolvimento em `scripts/dev-server.js` usa os mesmos handlers de `api/v1` da publicação. Para inspecionar o build localmente, defina `SERVE_DIST=1` e execute `npm start`.

Nesta sessão há um Node disponível em `C:\Users\PC\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`. Se Node não estiver no PATH, use esse executável seguido de `scripts/dev-server.js`, `scripts/build.mjs` ou `--test tests/*.test.js`.

## Publicar e testar no celular

Siga [docs/DEPLOY.md](docs/DEPLOY.md). A configuração `vercel.json` define preset Other, build `npm run build` e saída `dist`. Publique a raiz do projeto, incluindo `api`, `src` e `public`; publicar somente dist omite a API.

## Funcional no MVP

- Perfil manual com revisão, validação, campos opcionais e reset.
- Quatro produtos fictícios e tabelas específicas, com categorias extensíveis.
- Recomendação, motivos, folgas, alternativas e ausência de tamanho adequado.
- Câmera e upload local com limite de tamanho/resolução.
- MediaPipe local em worker: landmarks, segmentação e filtros de enquadramento.
- Estimativas experimentais de distâncias projetadas de ombros, braços e pernas, com calibração manual pela altura e revisão.
- PNGs transparentes ilustrativos, alinhamento à pose, controles manuais e download da composição.
- Looks com camadas, múltiplos looks salvos na sessão e carrinho demonstrativo.
- Cadastro, edição, exclusão, importação/exportação JSON de produtos e upload PNG de roupa.
- Dashboard de eventos da sessão, vitrine que usa API e widget demonstrativo.
- Preparação de cache estático offline, sem fotos, medidas ou respostas de API.

## Limitações explícitas

Produtos, preços e tabelas iniciais são fictícios. O índice é heurístico; `confidence` é null, sem probabilidade inventada de servir. Peito, cintura e quadril continuam manuais. O provador é composição 2D, não simulação física ou generativa. A câmera física e o desempenho em cada celular devem ser conferidos presencialmente.

Todos os dados da pessoa ficam na sessão, exceto as medidas enviadas voluntariamente à API pelo botão da loja demo (sem gravação pelo aplicativo). Fotos nunca são enviadas. Exportações/downloads só acontecem quando solicitados. Recarregar apaga perfis, produtos personalizados, looks e carrinho. O cache offline contém somente arquivos públicos.

## Testes

`npm test` executa regras de negócio, geometria, validação e handlers HTTP. Os testes opcionais de navegador usam Playwright e Microsoft Edge locais:

```sh
node tests/browser-check.cjs
node tests/vision-browser-check.cjs
node tests/mvp-browser-check.cjs
```

Defina `PLAYWRIGHT_MODULE` se o pacote estiver fora da resolução padrão. O teste completo aceita `TEST_URL` para verificar um servidor do build. Testes usam fixture pública e câmera artificial, sem fotografar pessoas reais. Gerador de assets ilustrativos em scripts/create-garments.cjs é opcional e usa Sharp somente no desenvolvimento; os PNGs já estão incluídos.

Veja docs/ARCHITECTURE.md, AI.md, SIZE_ENGINE.md, PRIVACY.md, MVP.md e PITCH.md. O plano comercial e os recursos V2/V3 estão documentados separadamente do que funciona agora.

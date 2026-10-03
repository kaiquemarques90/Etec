# Publicar no Vercel e testar pelo celular

## Arquivos prontos

`vercel.json`: preset Other, build `npm run build`, saída `dist`, headers de privacidade e segurança. `api/v1/products.js` e `api/v1/recommend-size.js` são funções Node. Não é necessário banco, segredo ou chave de IA para o MVP. Não publique somente a pasta dist; importe a raiz para incluir as funções.

## Pelo painel com GitHub

1. Adicione os arquivos do projeto a um repositório GitHub. Inclua public/models, public/vendor e public/garments. Não inclua node_modules, screenshots ou tests se não desejar.
2. No Vercel, Add New → Project → importe o repositório.
3. Root Directory: a pasta que contém package.json e vercel.json.
4. Framework Preset: Other. Build Command: npm run build. Output Directory: dist. Node.js: 22.x. Não defina comando Start como build.
5. Deploy. Abra a URL HTTPS gerada no celular.

Alternativa pelo terminal, na raiz: `npx vercel`. Confira as mesmas configurações; depois `npx vercel --prod` para produção. A CLI exige login em sua conta. Esta entrega não publica ou cria contas automaticamente.

Referências oficiais: https://vercel.com/docs/project-configuration/vercel-json e https://vercel.com/docs/functions/runtimes/node-js .

## Conferência no telefone

- Abra a URL pública HTTPS no Safari ou Chrome; localhost no telefone aponta para o próprio telefone.
- Permita a câmera quando pressionar Abrir câmera. Se negar, altere a permissão do navegador ou use upload.
- Capture corpo inteiro com outra pessoa segurando o telefone, ou use foto da galeria. Fotos JPEG/PNG/WebP até 10 MB; para HEIC, exporte como JPEG.
- Detecte pose; inspecione landmarks e segmentação. Se o enquadramento falhar, corrija a foto ou continue manualmente.
- Calibre topo da cabeça/base dos pés, estime projeções e revise campos opcionais. Circunferências são manuais.
- Mude regular/oversized, compare tamanhos, adicione calça e jaqueta ao look, salve e experimente.
- Teste Loja demo → Descobrir meu tamanho. Com internet deve indicar API demonstrativa; sem API o motor local é identificado.
- Cadastre uma peça em Para lojas e confira as tabelas. Alterações não são compartilhadas entre celulares.
- Preparar demonstração offline → aguarde sucesso antes de desligar a rede. Cache é por navegador e pode ser removido pelo sistema. Use perfil demonstrativo como fallback.
- Apagar dados da sessão remove foto, perfil, catálogo personalizado, looks e carrinho; o cache contém só código/assets públicos.

## Se algo falhar

- Build: confira Node 22, Root Directory e presença dos arquivos do modelo. Execute npm test e npm run build localmente.
- API 404: confira inclusão da pasta api na raiz; não faça deploy isolado de dist.
- Modelo/WASM 404: confira uploads de public/vendor e public/models e as URLs /public/... . Esses caminhos são preservados no build.
- Câmera indisponível: use HTTPS, permita acesso e abra em navegador completo; alguns navegadores internos de redes sociais limitam câmera.
- Fotos de alta resolução: reduza resolução ou envie JPEG menor. O processamento usa CPU e pode demorar em aparelhos antigos.
- Cache antigo: recarregue com conexão e prepare offline novamente. Se necessário, limpe os dados deste site nas configurações do navegador.

## Limite desta entrega

Build e handlers são testáveis localmente; o deploy real e os celulares físicos precisam ser conferidos após você publicar. A área de loja e o widget são demonstrativos. Operação comercial exige contas, autorização por loja, persistência e validação de precisão.

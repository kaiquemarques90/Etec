# Escopo entregue e demonstração

| Função do briefing | Entrega |
|---|---|
| Perfil manual | Validado, revisável, medidas opcionais e reset |
| Captura/upload | Câmera sob permissão e foto local limitada |
| Landmarks | MediaPipe real, local e em worker |
| Estimativas | Projeções experimentais de ombros/braços/pernas, com calibração/revisão |
| Cadastro de roupas | Criar, editar, excluir, importar/exportar JSON na sessão |
| Tabela por peça | Valores explícitos fictícios; conversão de largura plana |
| Recomendação | P/M/G/GG ou códigos cadastrados, regras de caimento e rejeição fora da tabela |
| Explicações | Folgas, intervalos, alternativas e limitações |
| Provador 2D | PNG ilustrativo, escala/rotação/posição pela pose e controles manuais |
| Looks | Camadas, múltiplos salvos na sessão e carrinho demonstrativo |
| Integração de loja | Vitrine via API e widget que abre produto do catálogo padrão |
| Dashboard | Cadastro e contagens da sessão; conversões/devoluções não inventadas |

## Distinções

Funcional: regras, visão real, câmera, upload, CRUD de sessão, API, looks e build.
Demonstrativo: produtos, preços, tabelas, perfil inicial, políticas de folga e loja sem pedido real.
Protótipo/experimental: medidas projetadas, PNG sobreposto e widget sem autenticação comercial.
Futuro: contas, banco comercial, circunferências validadas por imagem, aprendizado por feedback, pagamentos, try-on generativo e AR/3D.

## Roteiro confiável

1. Perfil demonstrativo → Tech regular P → oversized G. Explique corpo 88 / peça 112 / folga 24.
2. Peito 160 → nenhum tamanho viável; restaurar perfil demo.
3. Foto/câmera opcional → detectar pose → mostrar landmarks e segmentação. Use foto adequada, sem depender disso para o motor.
4. Calibrar linhas → ver projeções → revisar campos opcionais, sem alegar circunferências exatas.
5. Adicionar camiseta, calça e jaqueta, experimentar look e salvar com nome.
6. Vitrine demo → API → carrinho sem compra.
7. Dashboard → cadastrar peça e tabela → exportar catálogo.
8. Prepare offline antes de desligar rede. Se câmera/modelo falhar, o caminho manual e perfil demo continuam funcionando.
9. Apagar dados da sessão.

## Evolução

V2: persistência consentida, catálogo por loja, autenticação/autorização, widget autenticado e feedback.
V3: métricas de negócio reais, calibração, provedores de try-on por IA e validação com lojas.
Pesquisa: duas fotos, medidas por profundidade, AR e avatar 3D. Não fazem parte da promessa do MVP.

# Privacidade e segurança do MVP

Fotos são decodificadas no navegador, normalizadas em Canvas e enviadas somente ao worker local. Nunca são transmitidas à API. URLs de objeto são revogadas após decodificação/cancelamento. Reset e saída limpam referências, canvas e tracks. Não há reconhecimento facial, treinamento, cookies ou localStorage de perfis.

Medidas ficam em memória. Somente o botão Descobrir meu tamanho na Loja demo envia medidas à API demonstrativa; o servidor calcula e não grava corpo de requisição. A interface normal usa o motor no navegador. O provedor de hospedagem ainda pode registrar metadados de acesso conforme seus próprios termos.

Produtos personalizados, looks e carrinho são temporários. JSON exportado contém catálogo, sem medidas do perfil ou fotos corporais. Baixar composição PNG grava a foto composta no dispositivo por solicitação explícita; esse arquivo não é apagado pelo reset.

O service worker só prepara código, modelo, WASM e assets públicos de um manifesto. Não cacheia API, URLs de foto, medidas ou catálogos personalizados. Reset apaga dados da sessão, mas não precisa apagar arquivos públicos do cache. O usuário pode limpar os dados do site nas configurações do navegador.

API sem autenticação é leitura/cálculo de demonstração; não altera catálogos públicos. Validação de entrada, limite de corpo, escaping HTML, imagens locais/PNG, CSP, Permissions-Policy e nosniff reduzem exposição. Esta entrega não possui segurança de SaaS com múltiplas lojas.

Evolução: contas, autorização por loja, consentimento para persistência, finalidade/retensão explícitas, exclusão, HTTPS, gestão de incidentes e revisão jurídica. LGPD é uma diretriz de projeto, não uma certificação de conformidade deste protótipo.

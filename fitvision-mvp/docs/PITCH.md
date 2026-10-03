# FitVision AI — roteiro para a banca

Problema: tabelas variam entre marcas e deixam compradores inseguros sobre o tamanho.

Solução: combinar perfil corporal, tabela específica da peça e preferência de caimento para sugerir um tamanho com motivos claros. Sem tamanho viável, o sistema informa isso.

Tecnologia demonstrável: motor determinístico compartilhado com API; visão local pelo MediaPipe; captura/upload; composição de PNGs pela pose; criador de looks e cadastro demonstrativo de loja.

Diferencial: recomendação por peça, explicável, com caimento e incerteza tratados de forma honesta. Fotos não saem do dispositivo. A análise de pose não é apresentada como fita métrica perfeita.

Modelo de negócio proposto: SaaS B2B por loja/volume, widget ou API. Preços e disposição a pagar serão validados em entrevistas e pilotos; nenhum pagamento está implementado.

Impacto esperado: reduzir dúvidas antes da compra. Aumento de conversão e redução de devoluções são hipóteses, não estatísticas comprovadas. Mediremos utilização, compra posterior e trocas em pilotos consentidos.

Escalabilidade: domínio desacoplado, contratos HTTP, catálogo versionável e caminho para autorização por loja/PostgreSQL. Provedores de visão/try-on podem evoluir independentemente da recomendação.

Na apresentação: compare regular/oversized, mostre folgas, monte um look e cadastre uma peça. Conclua explicando quais medidas são manuais, quais projeções são experimentais e o que falta para o SaaS comercial.

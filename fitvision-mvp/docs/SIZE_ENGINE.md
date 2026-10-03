# Motor de tamanhos

## Funcionamento

Valida perfil, produto, tamanhos e todas as dimensões relevantes. Trabalha em circunferências de corpo/peça em cm; comprimento é linear. Cadastro com largura plana converte ×2 antes de chegar ao domínio. Esta conversão depende da convenção da loja e não vale para todo tipo de peça.

Folga = circunferência da peça − corpo. Políticas de caimento definem intervalos desejados por categoria. Cada tamanho recebe a soma ponderada das distâncias fora do intervalo; cintura de calças/saias pesa mais. Dimensão menor que o corpo torna a variante inviável. Menor penalidade viável vence; empates seguem a ordem cadastrada. Se não houver tamanho viável, recommendedSize = null.

Categorias: superiores, jaquetas, inferiores, vestidos e saias. Dimensões ficam em configuração, não em cadeia enorme de condicionais. Elasticidade, tecido, comprimento e ombros ainda não são avaliados.

## Resultado e limites

compatibility = max(0, 100 − 4 × penalidade). Índice heurístico demonstrativo, sem equivalência a probabilidade. confidence = null até haver calibração estatística. Resultado inclui motivos, corpo/peça, folga, intervalo desejado, alternativas e limitações. Índices baixos recebem aviso de compatibilidade baixa.

Exemplo: peito 88 + camiseta Tech (circunferências 100/106/112/118) → P regular e G oversized. Não forçamos M para reproduzir um exemplo do briefing. Sem medidas suficientes ou tabela válida a entrada é rejeitada, sem números aleatórios.

## Testes e evolução

Testes cobrem preferências, outro corpo, ausência de tamanho viável, medidas inválidas, cintura/quadril, vestido/saia, tabelas defeituosas e código divergente na API. Políticas precisam de prova real por categoria e fabricante. Feedback de compra poderá ajudar a calibrar intervalos e probabilidade futura, com versões rastreáveis do motor.

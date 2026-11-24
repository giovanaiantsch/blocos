# Roteiro de demonstração — até 10 minutos

**Funcionalidade**: [specs/001-editor-blocos-portugol](../specs/001-editor-blocos-portugol/spec.md)
**Branch**: `001-editor-blocos-portugol`
**Apresentador (Q-14)**: um integrante da dupla navega; o outro narra o que
acontece nos três painéis e lê a saída em voz alta.

> Ressalva obrigatória, dita no início e repetida no fechamento: a **tag original
> da turma não pôde ser confirmada**. A dupla fixou `meuPia/core v1.4.1`, commit
> `68824d7f9e91f71670f3f466c0a5865a8685f020`, como versão substituta para a
> integração e para esta demonstração. O hash completo está no `README.md`.

Antes de começar, confirme em voz alta que o ambiente aponta para o venv com
`meupia-core==1.4.1` e que o editor está servido na porta 5200 com as variáveis
`MEUPIA_COMANDO` e `MEUPIA_PYTHON` configuradas. O comando de subida está em
[`verificacao-final.md`](verificacao-final.md).

## 0:00 — 0:45 | Abrir e mostrar os três painéis

Abra o editor. Aponte, na ordem, para **Blocos**, **Portugol gerado** e
**Saída da execução**. Diga que o Portugol é recalculado a cada mudança dos
blocos — não há botão “gerar”.

## 0:45 — 2:00 | Montar o exemplo canônico

Carregue `tests/fixtures/dobrar-entrada.json` pelo botão **Carregar JSON**.
Mostre os blocos `leia(x)`, `atribuir x <- x * 2` e `escreva(x)` e o campo de
entrada com `3`. Se sobrar tempo, arraste um bloco e devolva ao lugar para
mostrar o painel do meio mudando em tempo real.

## 2:00 — 3:00 | Executar: entrada `3` → saída `6`

Clique em **Executar**. Leia a mensagem de compilação e, quando o painel parar
de mostrar “Compilando”, aponte a saída **`6`**, uma linha. Reforce que ela veio
das CLIs públicas do Core fixado, sem mock.

## 3:00 — 4:30 | Mostrar os dois ramos e os dois laços

Carregue, um de cada vez, os projetos versionados em `tests/fixtures`:
`se-entao.json` com entrada `5` produz `maior`; `se-senao.json` com entrada `2`
produz `menor`; `enquanto.json` produz `0`, `1`, `2`; `para.json` produz `1`,
`2`, `3`. Não é preciso explicar a sintaxe em detalhe — apenas mostrar que os
dois ramos e os dois laços foram aceitos pelo Core real.

## 4:30 — 6:15 | Programa combinado com duas entradas

Carregue `escopo-minimo-combinado.json`. Com entrada `5`, leia em voz alta,
uma saída por linha: `maior`, `0`, `1`, `1`, `2`. Mude apenas a entrada para
`2`, execute de novo e leia: `menor`, `0`, `1`, `1`, `2`, também uma saída por
linha. Diga que a condição `x > 3` trocou de ramo e que `enquanto` e `para`
repetiram as mesmas quatro linhas depois da decisão.

## 6:15 — 8:00 | Salvar, reabrir e executar de novo

Com `dobrar-entrada.json` aberto, clique em **Salvar JSON** e depois em
**Carregar JSON** com o arquivo recém-salvo. Mostre que título, blocos,
Portugol e a entrada `3` voltaram idênticos; execute: a saída `6` aparece
outra vez. Agora mude somente a entrada para `4` e execute mais uma vez: a
saída é `8`. Isso prova que o arquivo salvo restaura o programa e que a entrada
é lida na reexecução. Se sobrar tempo, repita o ciclo com
`escopo-minimo-combinado.json` e confirme `maior / 0 / 1 / 1 / 2` novamente.

## 8:00 — 9:00 | Recusar um arquivo inválido

Carregue um JSON malformado ou com versão incompatível. Leia a mensagem em
português do Brasil e mostre que os blocos e o Portugol do programa aberto
continuam intactos.

## 9:00 — 9:45 | Fechar com a ressalva

Repita que a tag original da turma não pôde ser confirmada e que `v1.4.1` é a
versão substituta fixada pela dupla, com o hash completo registrado na
documentação. Convide a perguntar sobre o que ficou pendente: confirmação
documental de tipos/operadores, traduções definitivas das mensagens do Core e o
teste de aceite versionado de reabertura.

## 9:45 — 10:00 | Margem

Feche a aba de depuração e deixe o repositório na branch
`001-editor-blocos-portugol`. Se algo não carregar, use as tabelas de
[`verificacao-final.md`](verificacao-final.md) em vez de improvisar uma
explicação.

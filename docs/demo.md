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

Carregue o projeto `tests/fixtures/dobrar-entrada.json` pelo botão **Carregar
JSON**. Mostre os blocos `leia(x)`, `atribuir x <- x * 2` e `escreva(x)` e o
campo de entrada com `3`. Se sobrar tempo, arraste um bloco e devolva ao lugar
para mostrar o painel do meio mudando em tempo real.

## 2:00 — 3:00 | Executar e mostrar o resultado

Clique em **Executar**. Leia a mensagem de compilação e, quando o painel parar
de mostrar “Compilando”, aponte a saída **`6`**. Reforce que vieram das CLIs
públicas do Core fixado, sem mock.

## 3:00 — 5:00 | Mostrar o escopo mínimo completo

Carregue, um de cada vez, os projetos versionados em `tests/fixtures`:
`se-entao.json` com entrada `5` produz `maior`; `se-senao.json` com entrada `2`
produz `menor`; `enquanto.json` produz `0`, `1`, `2`; `para.json` produz `1`,
`2`, `3`. Não é preciso explicar a sintaxe em detalhe — apenas mostrar que os
dois ramos e os dois laços foram aceitos pelo Core real. A evidência com
entradas e saídas esperadas está em
[`verificacao-final.md`](verificacao-final.md).

## 5:00 — 7:00 | Salvar, reabrir e executar de novo

Carregue `escopo-minimo-combinado.json` (`se` + `enquanto` + `para`, entrada
`5`). Clique
em **Salvar JSON**, depois **Carregar JSON** com o arquivo recém-salvo. Mostre
que o título, a entrada, os blocos e o Portugol voltaram idênticos e que a saída
`maior / 0 / 1 / 1 / 2` aparece outra vez após **Executar**.

## 7:00 — 8:30 | Recusar um arquivo inválido

Carregue um JSON malformado ou com versão incompatível. Leia a mensagem em
português do Brasil e mostre que os blocos e o Portugol do programa aberto
continuam intactos.

## 8:30 — 9:30 | Fechar com a ressalva

Repita que a tag original da turma não pôde ser confirmada e que `v1.4.1` é a
versão substituta fixada pela dupla, com o hash completo registrado na
documentação. Convide a perguntar sobre o que ficou pendente: confirmação
documental de tipos/operadores, traduções definitivas das mensagens do Core e o
teste de aceite versionado de reabertura.

## 9:30 — 10:00 | Margem

Feche a aba de depuração e deixe o repositório na branch
`001-editor-blocos-portugol`. Se algo não carregar, use a tabela de evidências
de [`verificacao-final.md`](verificacao-final.md) em vez de improvisar uma
explicação.

# Decisões de implementação

**Funcionalidade**: [specs/001-editor-blocos-portugol](../specs/001-editor-blocos-portugol/spec.md)

## D-01 — Versão e licença do Blockly (T005)

| Item | Decisão | Fonte |
| --- | --- | --- |
| Pacote | `blockly@12.5.1` (versão exata, fixada em `package.json`) | Registro npm, consultado em 2026-11-23 |
| Licença | `Apache-2.0` | Metadado `license` do pacote `blockly@12.5.1` |
| Node exigido | `>=18` | Metadado `engines` do pacote — compatível com o Node 20 LTS do `plan.md` |
| Link | https://www.npmjs.com/package/blockly/v/12.5.1 | — |

A versão mais recente no registro é `13.5.0`, também Apache-2.0, porém declara
`engines.node >=22`, o que contradiz a meta "Node.js 20 LTS" do plano. Por isso
foi escolhida a última versão 12.x, que mantém a licença aprovada e a
compatibilidade com a stack planejada. Trocar para 13.x exigiria revisar o plano
e a meta de Node.

## D-02 — Adaptador do Core independente da versão (T012)

O contrato em `plan.md` descreve o *formato* do adaptador (arquivo `.por`
temporário, comando público, stdin, limite de 5 s e `ResultadoDaExecucao`) sem
fixar a versão do Core. Assim, a estrutura do runner pode ser implementada e
testada agora com a CLI **injetada como dependência**; apenas os valores
provisórios de comando, prefixos e mensagens dependem de T007.

- Comandos provisórios: `meupia <arquivo.por>` e `python output/<nome>.py`.
- Nenhum módulo interno do Core é importado (RT-02).
- O teste unitário usa CLI simulada; o aceite com o Core real (T017) continua
  pendente até T006/T007.

## D-03 — Execução indisponível na interface

Enquanto a tag não for confirmada, o botão "Executar" não finge sucesso: o
painel "Saída da execução" exibe, em pt-BR,
"Execução indisponível: tag do Core ainda não confirmada.", e o projeto aberto
permanece intacto.

> Atualização de 2026-11-23: com a ponte local de D-05 o botão passou a tentar
> a CLI real. Se a tag/core ainda não estiver confirmado — ou o comando não
> existir na máquina — a saída mostra o erro preciso do processo, sem simular
> sucesso. A mensagem original de D-03 continua reservada como fallback.

## D-04 — Sintaxe provisória dos novos blocos (T026/T028/T030/T032)

A tag da turma (Q-01) continua pendente, então a implementação de operadores,
`se/senão`, `enquanto` e `para` usa a **mesma tabela provisória** já adotada em
`src/generation/sintaxe.js`, extraída do Guia da Linguagem público do Core:

| Recurso | Forma provisória gerada |
| --- | --- |
| Operadores aritméticos | `+`, `-`, `*`, `/` |
| Operadores relacionais/lógicos | `>`, `<`, `>=`, `<=`, `==`, `e`, `ou`, `nao` |
| Decisão | `se <condição> entao` / `senao` / `fim_se` |
| Laço condicional | `enquanto <condição> faca` / `fim_enquanto` |
| Laço contado | `para <var> de <início> ate <fim> passo <passo> faca` / `fim_para` |

`src/generation/operadores.js` é o catálogo único: o gerador, o schema de JSON
e a toolbox consomem a mesma lista. Operadores fora desse catálogo são
recusados com mensagem em pt-BR. Qualquer divergência confirmada em T007 deve
ser corrigida primeiro em `sintaxe.js`/`operadores.js`, antes do aceite oficial.

## D-05 — Ponte local entre o navegador e a CLI do Core

O navegador não pode chamar `meupia`/`python` diretamente. `vite.config.js`
registra o middleware `/api/executar`, que recebe o `ProjetoJSON`, gera o
Portugol com o gerador puro e repassa ao adaptador de `src/core/runner.js`.
Nada é mockado: a ponte usa a CLI configurada em `CONFIGURACAO_PROVISORIA`.

Execução real tentada em 2026-11-23 no navegador (`http://127.0.0.1:5200/`):

- Projeto canônico `3 → 6` carregado; Portugol gerado com `leia(x)`,
  `x <- x * 2` e `escreva(x)`; entrada `3`.
- Saída obtida: `Erro na compilação: spawnSync meupia ENOENT`.

`meupia` não está instalado nesta máquina e a tag da turma não foi confirmada;
portanto T017/T036 continuam pendentes. Nenhum mock foi criado em
`tests/acceptance/`.

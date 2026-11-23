# Plano de implementação: Editor de blocos com Portugol e execução no Core

**Branch**: `001-editor-blocos-portugol` | **Data**: 2026-11-23 | **Especificação**: [spec.md](./spec.md)

**Entrada**: Feature specification from `/specs/001-editor-blocos-portugol/spec.md`

## Resumo

Entregar, em pt-BR, o escopo mínimo da PoC: um editor web com três painéis
(blocos, Portugol gerado e saída), geração automática de Portugol a partir dos
blocos, persistência em JSON e execução do código gerado no meuPiá Core real.
A stack inicial é **Blockly** para a área visual e **JavaScript** para o editor,
gerador, persistência e runner local. O Core é consumido somente pela interface
pública documentada: o comando `meupia <arquivo.por>`, que executa as etapas
léxica, sintática e semântica e gera um arquivo Python em `output/`; a execução
ocorre com `python output/<nome>.py` (ver [research.md](./research.md)).
Nenhum código do Core ou de módulos é alterado (RT-02).

A tag congelada da turma permanece **pendente de confirmação** (RT-01/Q-01).
O plano define o formato do adaptador, mas não fixa versão, assinatura nem
conjunto definitivo de tipos/operadores até essa confirmação.

## Contexto técnico

**Linguagem/versão**: JavaScript (ECMAScript 2022+) com Node.js 20 LTS para
build, testes e runner local; Python 3.8+ apenas como runtime exigido pelo Core.

**Dependências principais**: Blockly (área de encaixe), runner local em Node.js
que invoca a CLI documentada do Core, Vitest + `@vitest/coverage-v8` para
testes e cobertura.

**Armazenamento**: arquivos JSON exportados e importados pelo estudante; sem banco de
dados e sem persistência automática em nuvem.

**Testes**: Vitest para testes unitários e de integração do adaptador;
testes de aceitação ponta a ponta com o Core real, sem mocks do parser nem da
execução; cobertura com `npx vitest run --coverage`.

**Plataforma alvo**: navegador desktop moderno para a interface e processo
local Node.js para a integração com o Core.

**Tipo de projeto**: aplicação web local (frontend + runner local) que consome um
compilador externo.

**Metas de desempenho**: atualização do painel de Portugol em menos de 1 s após
cada alteração (SC-003); limite proposto de 5 s para uma execução na PoC.

**Restrições**: RT-01 a RT-04; apenas interfaces públicas documentadas do
Core; Core e módulos intocados; todo texto em pt-BR; cobertura mínima de 80%
sobre gerador, adaptador e persistência, com relatório versionado em
`coverage/`; `README.md` com métricas reais no topo.

**Escala/escopo**: somente RF-01 a RF-24. Um estudante por sessão, um projeto
aberto por vez. `EC-01`, `EC-02` e `BX-01` ficam fora.

**Esclarecimentos**: nenhum marcador `NEEDS CLARIFICATION` permanece. A tag
congelada é uma dependência externa conhecida, registrada como pendente, não
uma dúvida de escopo a resolver nesta spec.

### Verificações dependentes da tag congelada

- Fixar a versão do Core (e de módulos, se usados) no manifesto do projeto e
  no ambiente de teste de aceitação.
- Confirmar que o comando `meupia <arquivo.por>` e a saída
  `[COMPILED SUCCESSFULLY]` / `[COMPILATION ERROR]` se mantêm na tag da turma.
- Confirmar a gramática efetivamente aceita: `var`, tipos, `leia`, `escreva`,
  `se/senao`, `enquanto`, `para` e operadores (usar o Guia da Linguagem da tag).
- Confirmar o formato do arquivo Python gerado e o nome em `output/<nome>.py`.
- Confirmar que `leia` consome linhas da entrada padrão na ordem esperada.
- Confirmar quais erros de execução continuam em inglês e quais já vêm em
  pt-BR, para calibrar o catálogo de mensagens do editor.
- Confirmar a licença e a versão do Blockly na etapa de implementação.

## Verificação da constitution

*PORTA: deve passar antes da Fase 0 (pesquisa). Reverificar após o projeto da Fase 1.*

| Princípio / porta | Situação | Evidência neste plano |
| --- | --- | --- |
| I. Escopo mínimo primeiro | PASSA | Somente RF-01 a RF-24; EC/BX fora (Contexto técnico). |
| II. Ecossistema intocado | PASSA | Core consumido por CLI documentada; nada é modificado (contracts/core-runner.md). |
| III. Spec antes do código e rastreabilidade | PASSA | Spec existente; matriz de IDs no fim deste arquivo; nenhum código criado. |
| IV. Aceitação com Core real e cobertura ≥80% | PASSA | Testes a partir de JSON, parser e execução reais; Vitest com `coverage/` versionado. |
| V. pt-BR e experiência do estudante | PASSA | Três painéis, atualização automática e catálogo único de mensagens em pt-BR. |
| Stack inicial Blockly + JavaScript | PASSA | Registrada no Contexto técnico e em research.md. |
| Tag congelada pendente | PASSA | Pendência explícita, com verificações dependentes listadas acima. |

Reavaliação após a Fase 1: nenhuma violação introduzida pelos contratos, pelo
modelo de dados ou pelo guia de validação.

## Estrutura do projeto

### Documentação (esta funcionalidade)

```text
specs/001-editor-blocos-portugol/
├── plan.md              # este arquivo (/speckit.plan)
├── research.md          # Fase 0 (/speckit.plan)
├── data-model.md        # Fase 1 (/speckit.plan)
├── quickstart.md        # Fase 1 (/speckit.plan)
├── contracts/           # Fase 1 (/speckit.plan)
│   ├── core-runner.md
│   ├── project-json.md
│   └── portugol-generation.md
└── tasks.md             # Fase 2 (/speckit.tasks - NÃO criado aqui)
```

### Código-fonte (raiz do repositório)

```text
src/
├── blocks/         # definições de blocos e toolbox (Blockly)
├── generation/     # gerador puro blocos → Portugol
├── persistence/    # envelope JSON, validação e restauração
├── core/           # adaptador/runner que invoca a CLI documentada do Core
├── ui/             # três painéis e ações do estudante
└── messages/       # rótulos e erros em pt-BR

tests/
├── unit/           # gerador e persistência
├── integration/    # adaptador com CLI simulada apenas aqui
├── acceptance/     # JSON → Portugol → Core real → saída
└── fixtures/       # projetos JSON de aceitação

coverage/           # relatório gerado e versionado no repositório
```

**Decisão de estrutura**: adotar uma aplicação web local com um runner Node.js.
O navegador não pode invocar diretamente a CLI Python do Core; o runner é o
adaptador deste lado, concentrando chamada, stdin, timeout e captura de saída.
Essa escolha preserva o Core e mantém a interface pública documentada como
único ponto de integração. Nenhum arquivo de código é criado nesta etapa.

## Controle de complexidade

Nenhuma violação da constitution foi identificada; esta seção não registra
justificativas adicionais.

## Rastreabilidade dos requisitos de origem

| ID | Cobertura no desenho |
| --- | --- |
| RF-01 | `src/ui`, três painéis; quickstart cenário 1 |
| RF-02 | `src/blocks`, toolbox e encaixe; quickstart cenário 1 |
| RF-03 | `src/generation` + estado reativo; contrato `portugol-generation.md` |
| RF-04 | `src/core` + CLI `meupia`; contrato `core-runner.md` |
| RF-05 | `src/ui` + `src/messages`; contrato `core-runner.md` |
| RF-06 | blocos de `var`/atribuir; contrato `portugol-generation.md` |
| RF-07 | bloco `leia`; contrato `core-runner.md` (stdin) |
| RF-08 | bloco `escreva`; contrato `portugol-generation.md` |
| RF-09 | blocos `se`/`senao`; contrato `portugol-generation.md` |
| RF-10 | bloco `enquanto`; contrato `portugol-generation.md` |
| RF-11 | bloco `para`; contrato `portugol-generation.md` |
| RF-12 | operadores aceitos; research.md R1/R7 |
| RF-13 | envelope JSON; contrato `project-json.md` |
| RF-14 | restauração e regeneração; contrato `project-json.md` |
| RF-15 | validação antes de substituir estado; contrato `project-json.md` |
| RF-16 | catálogo pt-BR; `src/messages` |
| RF-17 | aceitação em `tests/acceptance`; quickstart cenário 2 |
| RF-18 | tasks e commits (próxima fase); matriz desta seção |
| RF-19 | Vitest + `coverage/` versionado |
| RF-20 | métricas reais no topo do `README.md` |
| RF-21 | constitution/spec/plan antes do código |
| RF-22 | spec sem detalhes técnicos; plan com arquitetura/stack/dados/integração |
| RF-23 | stack registrada na constitution e detalhada aqui |
| RF-24 | demo de até 10 min sem código nos slides |
| RT-01 | tag pendente; verificações dependentes listadas acima |
| RT-02 | Core intocado; contrato `core-runner.md` |
| RT-03 | adaptador local + issue no módulo se faltar interface |
| RT-04 | pt-BR obrigatório; `src/messages` |
| RT-05 | etapa anterior encerrada |
| RT-06 | escopo mínimo; EC/BX fora |
| RT-07 | SDD e PRs com requisito atendido |

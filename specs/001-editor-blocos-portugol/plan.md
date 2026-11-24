# Plano de implementação: Editor de blocos com Portugol e execução no Core

**Branch**: `001-editor-blocos-portugol` | **Data**: 2026-11-23 | **Especificação**: [spec.md](./spec.md)

**Entrada**: Feature specification from `/specs/001-editor-blocos-portugol/spec.md`

## Resumo

Entregar, em pt-BR, o escopo mínimo da PoC e, como segundo incremento aprovado
pela dupla em 2026-11-23, os itens EC-01 (toolbox por missão) e EC-02 (blocos
do módulo Grid). O editor web mantém três painéis (blocos, Portugol gerado e
saída), geração automática de Portugol a partir dos blocos, persistência em JSON
e execução do código gerado no meuPiá Core real. A stack inicial é **Blockly**
para a área visual e **JavaScript** para o editor, gerador, persistência e
runner local. O Core é consumido somente pela interface pública documentada: o
comando `meupia <arquivo.por>`, que executa as etapas léxica, sintática e
semântica e gera um arquivo Python em `output/`; a execução ocorre com
`python output/<nome>.py` (ver [research.md](./research.md)). Nenhum código do
Core ou de módulos é alterado (RT-02).

A tag original da turma **não pôde ser confirmada** (RT-01/Q-01). Como
substituto, a dupla fixou **`meuPia/core v1.4.1`**, commit
**`68824d7f9e91f71670f3f466c0a5865a8685f020`** (tag anotada conferida por
`git ls-remote --tags https://github.com/meuPia/core.git`:
`refs/tags/v1.4.1^{}`; objeto da tag `b6a8fc8963629af441267388c2ce218e18b5d877`).
O adaptador usa somente as interfaces públicas dessa versão e a configuração
fica centralizada em `src/core/configuracao.js`.

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

**Escala/escopo**: RF-01 a RF-24 como base, mais EC-01 e EC-02 como segundo
incremento (emenda 1.1.0 da constitution). `BX-01` fica fora. Um estudante por
sessão, um projeto aberto por vez e no máximo uma missão aplicada por vez.

**Esclarecimentos**: nenhum marcador `NEEDS CLARIFICATION` permanece. A tag
original da turma não pôde ser confirmada; a versão substituta fixada pela
dupla (`v1.4.1` @ `68824d7f9e91f71670f3f466c0a5865a8685f020`) é registrada como
dependência externa conhecida, não como dúvida de escopo.

### Verificações na versão fixada

| Verificação | Evidência em 2026-11-23 |
| --- | --- |
| Versão fixada no manifesto e no ambiente de aceitação | `src/core/configuracao.js` (tag + hash) e `.venv-core` com `meupia-core==1.4.1` (ignorado pelo git) |
| Comando `meupia <arquivo.por>` e prefixos `[COMPILED SUCCESSFULLY]` / `[COMPILATION ERROR]` | Confirmados na saída real da CLI; o runner só devolve `sucesso` com o prefixo de sucesso |
| Gramática `var`, `leia`, `escreva` e `atribuir` com `<-` | Aceita pelo parser real em `dobrar-entrada.json` |
| Gramática de `se/entao/senao/fim_se`, `enquanto/faca/fim_enquanto`, `para/de/ate/passo/faca/fim_para` e operadores `+`, `*`, `>`, `<` | Aceita pelo parser real no navegador: `5 → maior`, `2 → menor`, `0/1/2`, `1/2/3` e combinado `maior/0/1/1/2`; confirmação documental de D-04/T026 ainda pendente (`docs/verificacao-final.md`) |
| Arquivo Python gerado em `output/<nome>.py` | Confirmado: `✅ Code generated successfully at output\programa.py` |
| `leia` consome stdin na ordem esperada | Entrada `3` gerou saída `6` (teste real, sem mock) |
| Idioma dos erros de runtime | Parcial: erro de CLI observado em pt-BR ("Arquivo ... não encontrado."); catálogo de mensagens do Core permanece pendente (T019) |
| Licença e versão do Blockly | `blockly@12.5.1`, Apache-2.0 (D-01) |
| Schema das missões do Desafios (EC-01) | `id`, `titulo`, `descricao`, `codigoInicial`, `codigoTeste` nos arquivos reais; `instrucoes` só no README; sem lista de blocos (R8/D-07) |
| Diretiva e funções públicas do Grid (EC-02) | `usar "grid"` documentado no Guia `v1.4.1` e nas missões oficiais; `mpgp instale grid` instalou `meupia-grid==1.0.2`; compilação 338 ms, execução 193 ms e três linhas de saída medidas (R9/D-08) |

Comando de reprodução do aceite real: ver `README.md` e
`docs/verificacao-final.md`. Nenhum mock é usado em `tests/acceptance/`.

## Verificação da constitution

*PORTA: deve passar antes da Fase 0 (pesquisa). Reverificar após o projeto da Fase 1.*

| Princípio / porta | Situação | Evidência neste plano |
| --- | --- | --- |
| I. Escopo mínimo primeiro, depois escopo completo | PASSA | Mínimo entregue e medido antes do segundo incremento; EC-01/EC-02 especificados e planejados antes do código; BX fora (Contexto técnico e emenda 1.1.0). |
| II. Ecossistema intocado | PASSA | Core consumido por CLI documentada; nada é modificado (contracts/core-runner.md). |
| III. Spec antes do código e rastreabilidade | PASSA | Spec existente; matriz de IDs no fim deste arquivo; nenhum código criado. |
| IV. Aceitação com Core real e cobertura ≥80% | PASSA | Testes a partir de JSON, parser e execução reais; Vitest com `coverage/` versionado. |
| V. pt-BR e experiência do estudante | PASSA | Três painéis, atualização automática e catálogo único de mensagens em pt-BR. |
| Stack inicial Blockly + JavaScript | PASSA | Registrada no Contexto técnico e em research.md. |
| Versão do Core fixada | PASSA | `meuPia/core v1.4.1` @ `68824d7f9e91f71670f3f466c0a5865a8685f020`; tag original da turma não confirmada, registrada como ressalva. |

Reavaliação após a Fase 1: nenhuma violação introduzida pelos contratos, pelo
modelo de dados ou pelo guia de validação. Reavaliação após a emenda 1.1.0:
EC-01 e EC-02 preservam o princípio II (apenas interfaces públicas), o
princípio IV (aceitação com Core real) e o princípio V (pt-BR); a derivação de
blocos é determinística e a toolbox sem missão permanece completa.

## Arquitetura do segundo incremento

### EC-01 — Missões e filtro da toolbox

```text
public/missoes/*.json  (cópias locais no schema oficial do Desafios)
   └─ src/missoes/schema.js      valida id/titulo/descricao/codigoInicial/codigoTeste
        └─ src/missoes/derivar.js  codigoInicial + descricao → tipos de bloco permitidos
             └─ src/blocks/toolboxParaMissao.js  filtra TOOLBOX mantendo a ordem das categorias
                  └─ src/ui/main.js  Blockly.updateToolbox(...) ao trocar de missão
```

Regras de derivação (R8/D-07): remover comentários `//` e literais entre aspas;
procurar `leia(`, `escreva(`, `var`/`: tipo`, `<-`, `se`, `enquanto`, `para`,
operadores `+ - * / > < ==`, `e/ou/nao` e as funções do módulo; aceitar também
as palavras-chave explícitas da descrição (por exemplo "SE / SENAO"); limitar o
resultado ao catálogo implementado; ordenar pela ordem canônica da toolbox.
Um campo `blocosPermitidos` **não** é exigido nem lido, porque o schema oficial
não o possui.

### EC-02 — Blocos do módulo Grid

```text
src/blocks/modulo-grid.js   definições: usar_grid, grid_iniciar, grid_visitar
   ├─ serialização em BlocoSerializado (tipo + x/y/passo ou largura/altura)
   ├─ src/generation/gerador.js  emite `usar "grid"` uma vez após o cabeçalho
   │    e as chamadas grid_iniciar(...)/grid_visitar(...) no corpo
   └─ src/core/runner.js  inalterado: a CLI real importa o plugin instalado
```

O gerador continua puro e sem DOM. A diretiva `usar "grid"` é deduzida dos
blocos presentes, não de um campo separado do projeto, de modo que salvar e
reabrir um projeto com módulo preserva o Portugol. O limite de 5 s do runner
permanece; o Grid compilou e executou em 338 ms + 193 ms no ambiente de aceite.

### Rastreabilidade do segundo incremento

| ID | Cobertura no desenho |
| --- | --- |
| EC-01 | `src/missoes/`, `src/blocks/toolboxParaMissao.js`, `public/missoes/`, `contracts/mission-json.md`, tasks T043–T048 |
| EC-02 | `src/blocks/modulo-grid.js`, `src/generation/gerador.js`, `tests/fixtures/grid-visitar.json`, `contracts/module-grid.md`, tasks T049–T054 |
| Q-07 | R9, D-08, `docs/requisitos.md` (Grid escolhido) |
| Q-08 | R8, D-07, `docs/requisitos.md` (JSON estático no formato do Desafios) |

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
│   ├── portugol-generation.md
│   ├── mission-json.md   # EC-01: schema e derivação
│   └── module-grid.md    # EC-02: diretiva e funções públicas
└── tasks.md             # Fase 2 (/speckit.tasks)
```

Arquivos de missão no formato oficial ficam em `public/missoes/` para o
navegador e são lidos pelos testes pelo mesmo caminho (sem duplicação).

### Código-fonte (raiz do repositório)

```text
src/
├── blocks/         # definições de blocos, toolbox e filtro por missão (Blockly)
├── generation/     # gerador puro blocos → Portugol
├── persistence/    # envelope JSON, validação e restauração
├── core/           # adaptador/runner que invoca a CLI documentada do Core
├── missoes/        # loader do schema do Desafios e derivação de blocos (EC-01)
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
| RT-01 | versão fixada `v1.4.1` @ `68824d7f...`; verificações registradas acima |
| RT-02 | Core intocado; contrato `core-runner.md` |
| RT-03 | adaptador local + issue no módulo se faltar interface |
| RT-04 | pt-BR obrigatório; `src/messages` |
| RT-05 | etapa anterior encerrada |
| RT-06 | mínimo preservado; EC-01/EC-02 como segundo incremento; BX fora |
| RT-07 | SDD e PRs com requisito atendido |
| EC-01 | `src/missoes/` + `public/missoes/` + `contracts/mission-json.md` |
| EC-02 | `src/blocks/modulo-grid.js` + `contracts/module-grid.md` |
| Q-07 | `research.md` R9 + D-08 |
| Q-08 | `research.md` R8 + D-07 |

---
description: "Lista de tarefas para implementação do editor de blocos com Portugol e execução no Core"
---

# Tasks: Editor de blocos com Portugol e execução no Core

**Entrada**: documentos de design em `/specs/001-editor-blocos-portugol/`

**Pré-requisitos**: `plan.md` (obrigatório), `spec.md` (obrigatório), `research.md`, `data-model.md`, `contracts/`

**Testes**: incluídos porque a spec exige RF-17 e o usuário solicitou aceitação ponta a ponta, Vitest, cobertura mínima de 80% e métricas reais.

**Organização**: tarefas agrupadas por história de usuário, com um fluxo vertical de MVP primeiro, conforme pedido: JSON → Portugol → parser real → execução com entrada `3` → saída `6`. Depois vêm três painéis, geração em tempo real, blocos obrigatórios e persistência.

## Resumo da integração com o Core

- **API/Comando público previsto no plano**: `meupia <arquivo.por>` para compilação/validação (análises léxica, sintática e semântica) e `python output/<nome>.py` para execução. Entry point publicado: `meuPia.compiler:main`.
- **Não há API documentada** para “parsear string em memória”; o teste de aceitação usa arquivo `.por` e CLI reais, sem mocks (RF-17, RT-02).
- **Ainda precisa ser verificado na versão da turma**: tag exata, persistência dos comandos e prefixos `[COMPILED SUCCESSFULLY]` / `[COMPILATION ERROR]`, gramática aceita (`var`, `leia`, `escreva`, `se/senao`, `enquanto`, `para`), tipos e operadores, nome/caminho do Python gerado, ordem da stdin e idioma dos erros de runtime. Ver T006/T007 e `plan.md#verificações-dependentes-da-tag-congelada`.
- **Aceitação de ponta a ponta exige o Core real**; mocks ficam apenas em `tests/unit/core-runner.test.js`, conforme a constitution.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta).
- **[Story]**: usado apenas nas fases de história de usuário; mapeado para US1–US8 da spec.
- Toda tarefa traz requisitos atendidos, dependências e verificação de conclusão na própria descrição.

## Convenção de commit e PR

- `CONTRIBUTING.md` exige a cadeia **commit → task → requisito**. Use mensagens como `task: T009 — validar envelope JSON (RF-15/RT-04)`.
- O exemplo de `docs/requisitos.md` (Q-11), `task: RF-07 — bloco leia`, deve ser adaptado para incluir o ID da task, pois a convenção exata não foi fixada além dessa obrigação.
- Cada PR deve descrever a mudança, a task implementada, o requisito atendido e o resultado de testes e cobertura.

---

## Phase 1: Configuração (infraestrutura compartilhada)

**Objetivo**: preparar estrutura, scripts, testes e catálogo de mensagens sem implementar a lógica de negócio.

- [x] T001 [P] Criar a estrutura de diretórios em `src/blocks/`, `src/generation/`, `src/persistence/`, `src/core/`, `src/ui/`, `src/messages/`, `tests/unit/`, `tests/integration/`, `tests/acceptance/`, `tests/fixtures/` e `coverage/` conforme `plan.md`; atende RF-21/RF-22/RT-06; depende: nenhuma; verificação: todos os diretórios existem e nenhum arquivo de código de aplicação foi criado nesta tarefa.
- [x] T002 [P] Criar `package.json` com `"type": "module"`, scripts `dev`, `test`, `test:acceptance` e `coverage`, Node.js 20 LTS e dependências de teste `vitest` + `@vitest/coverage-v8`, sem fixar versão do Blockly até T005; atende RF-19/RF-23/RT-06; depende: T001; verificação: `npm install` termina sem erro e `npm run` lista os quatro scripts.
- [x] T003 [P] Configurar `vitest.config.js` com provider `@vitest/coverage-v8`, inclusão de `src/generation/`, `src/persistence/` e `src/core/`, exclusão de `src/ui/` e `src/blocks/`, e saída em `coverage/`; atende RF-19/RT-06; depende: T002; verificação: `npx vitest run --coverage --passWithNoTests` gera `coverage/coverage-summary.json`.
- [x] T004 [P] Criar `src/messages/index.js` com todas as mensagens em pt-BR do contrato (`O arquivo não contém um JSON válido.`, `Versão de projeto incompatível.`, `Bloco não reconhecido: <tipo>.`, `Informe um valor para cada bloco de leitura.`, `Informe um título de 1 a 80 caracteres.`, `Expressão incompleta.`, `Execução interrompida: limite de 5 segundos atingido.`); atende RF-05/RF-15/RF-16/RT-04; depende: T001; verificação: nenhuma string voltada ao usuário em inglês aparece no arquivo.
- [x] T005 Confirmar versão e licença do Blockly com a dupla, registrar a decisão em `docs/decisoes.md` e fixar a dependência em `package.json`; atende RF-23/Q-09/RT-04; depende: confirmação externa da dupla (não é a tag do Core); verificação: `docs/decisoes.md` e `package.json` contêm a mesma versão e licença aprovadas.

**Checkpoint**: infraestrutura pronta; as tarefas T001–T004 podem começar imediatamente. T005 é pendência externa separada da tag congelada.

---

## Phase 2: Fundamentação (pré-requisitos bloqueantes)

**Objetivo**: validar a tag, criar os núcleos puros (persistência, geração e adaptador) e o fixture canônico. Nenhuma história pode ser considerada concluída antes deste phase.

- [ ] T006 Confirmar a tag congelada da turma para meuPiá Core e módulos, registrar versão e data em `docs/decisoes.md` e marcar Q-01 em `docs/requisitos.md` como resolvido; atende RT-01/RT-07/Q-01; depende: dupla/professor; verificação: `docs/decisoes.md` contém a tag exata e a data da confirmação. **BLOQUEADA PELA TAG**.
- [ ] T007 Executar todas as verificações de `plan.md#verificações-dependentes-da-tag-congelada` e registrar evidências em `docs/decisoes.md` e `research.md`: comandos `meupia`/`python`, prefixos de sucesso/erro, gramática, tipos, operadores, caminho `output/<nome>.py`, stdin do `leia` e idioma dos erros de runtime; atende RF-04/RF-06/RF-07/RF-12/RT-01/RT-02/RT-03; depende: T006; verificação: cada item do checklist possui evidência anexada e `research.md` não mantém a pendência como aberta. **BLOQUEADA PELA TAG**.
- [x] T008 [P] Criar `tests/unit/persistence-schema.test.js` cobrindo `data-model.md → ProjetoJSON.versao`, `ProjetoJSON.titulo`, `ProjetoJSON.blocos`, `ProjetoJSON.entrada`, `BlocoSerializado.tipo`, `BlocoSerializado.variavel`, `BlocoSerializado.tipoVariavel`, `BlocoSerializado.expressao`, `BlocoSerializado.condicao`, `BlocoSerializado.inicio`, `BlocoSerializado.fim`, `BlocoSerializado.passo`, `BlocoSerializado.ramos`, `BlocoSerializado.corpo`, `EstadoDoEditor.projeto`, `EstadoDoEditor.portugolGerado`, `EstadoDoEditor.statusExecucao`, `EstadoDoEditor.mensagens`, `EstadoDoEditor.projetoAnterior`, `ResultadoDaExecucao.status`, `ResultadoDaExecucao.saida`, `ResultadoDaExecucao.erro`, `ResultadoDaExecucao.duracaoMs` e `ResultadoDaExecucao.interrompidoPorLimite`, incluindo recusa sem apagar o projeto; atende RF-15/RF-16/RF-19/RT-04; depende: T003/T004; verificação: `npx vitest run tests/unit/persistence-schema.test.js` falha antes da implementação de T009.
- [x] T009 Implementar `src/persistence/schema.js` com as validações e tipos de `data-model.md → ProjetoJSON.versao`, `ProjetoJSON.titulo`, `ProjetoJSON.blocos`, `ProjetoJSON.entrada`, `BlocoSerializado.tipo`, `BlocoSerializado.variavel`, `BlocoSerializado.tipoVariavel`, `BlocoSerializado.expressao`, `BlocoSerializado.condicao`, `BlocoSerializado.inicio`, `BlocoSerializado.fim`, `BlocoSerializado.passo`, `BlocoSerializado.ramos`, `BlocoSerializado.corpo`, `EstadoDoEditor.projeto`, `EstadoDoEditor.portugolGerado`, `EstadoDoEditor.statusExecucao`, `EstadoDoEditor.mensagens`, `EstadoDoEditor.projetoAnterior`, `ResultadoDaExecucao.status`, `ResultadoDaExecucao.saida`, `ResultadoDaExecucao.erro`, `ResultadoDaExecucao.duracaoMs` e `ResultadoDaExecucao.interrompidoPorLimite`; atende RF-13/RF-14/RF-15/RF-17/RT-04; depende: T008; verificação: `npx vitest run tests/unit/persistence-schema.test.js` passa e nenhuma validação substitui o estado antes da aceitação.
- [x] T010 [P] Criar `tests/unit/portugol-generation.test.js` verificando determinismo, projeto vazio, expressão incompleta e geração de `leia`, `atribuir` e `escreva` a partir de `BlocoSerializado.tipo`, `BlocoSerializado.variavel` e `BlocoSerializado.expressao`; atende RF-03/RF-06/RF-08/RF-12/RF-17/RF-19; depende: T003; verificação: teste falha antes da implementação de T011.
- [x] T011 Implementar o gerador puro em `src/generation/gerador.js` e a tabela de sintaxe em `src/generation/sintaxe.js`, produzindo `EstadoDoEditor.portugolGerado` a partir de `BlocoSerializado.tipo`, `BlocoSerializado.variavel`, `BlocoSerializado.tipoVariavel`, `BlocoSerializado.expressao`, `BlocoSerializado.condicao`, `BlocoSerializado.inicio`, `BlocoSerializado.fim`, `BlocoSerializado.passo`, `BlocoSerializado.ramos` e `BlocoSerializado.corpo`, sem DOM e com valores de sintaxe provisórios até T007; atende RF-03/RF-06/RF-08/RF-09/RF-10/RF-11/RF-12/RF-17/RT-02; depende: T010; verificação: `npx vitest run tests/unit/portugol-generation.test.js` passa e o módulo não importa bibliotecas de interface.
- [x] T012 [P] Criar `tests/unit/core-runner.test.js` com CLI simulada **apenas neste arquivo**, verificando escrita do `.por`, chamada a `meupia`, execução do Python gerado, stdin na ordem de `ProjetoJSON.entrada`, timeout de 5 s e retorno de `ResultadoDaExecucao.status`, `ResultadoDaExecucao.saida`, `ResultadoDaExecucao.erro`, `ResultadoDaExecucao.duracaoMs` e `ResultadoDaExecucao.interrompidoPorLimite`; atende RF-04/RF-05/RF-07/RF-17/RT-02/RT-03; depende: T003; verificação: teste falha antes da implementação de T013 e não existe mock em `tests/acceptance/`.
- [ ] T013 Implementar `src/core/runner.js` para gravar o Portugol em arquivo `.por` temporário, chamar `meupia <arquivo.por>` e `python output/<nome>.py` conforme confirmado em T007, entregar `ProjetoJSON.entrada` na stdin, aplicar limite de 5000 ms e devolver `ResultadoDaExecucao.status`, `ResultadoDaExecucao.saida`, `ResultadoDaExecucao.erro`, `ResultadoDaExecucao.duracaoMs` e `ResultadoDaExecucao.interrompidoPorLimite`; atende RF-04/RF-05/RF-07/RF-17/RT-01/RT-02/RT-03; depende: T007/T012; verificação: `npx vitest run tests/unit/core-runner.test.js` passa e nenhum módulo interno do Core é importado. **BLOQUEADA PELA TAG**.
  - Nota de 2026-11-23: a parte independente da versão foi implementada em `src/core/runner.js` com CLI e configuração injetadas; o teste unitário passa. Permanece pendente a confirmação dos comandos/prefixos em T007 para o aceite com o Core real (T017).
- [x] T014 [P] Criar `tests/fixtures/dobrar-entrada.json` exatamente como o contrato: `ProjetoJSON.versao` igual a `1`, título `Dobrar a entrada`, blocos `leia(x)`, `atribuir(x, "x * 2")` e `escreva(x)`, e `ProjetoJSON.entrada` igual a `[3]`; atende RF-13/RF-17/RT-04; depende: T001; verificação: arquivo é JSON válido e seu conteúdo é idêntico ao exemplo de `contracts/project-json.md`.
- [x] T015 Criar `tests/unit/persistence-carregar.test.js` verificando que o fixture de T014 carrega, que arquivos inválidos preservam `EstadoDoEditor.projetoAnterior` e que a carga válida atualiza `EstadoDoEditor.projeto` e dispara `EstadoDoEditor.portugolGerado`; atende RF-14/RF-15/RF-17/RT-04; depende: T003/T008/T014; verificação: teste falha antes da implementação de T016.
- [x] T016 Implementar `src/persistence/carregar.js` aplicando `src/persistence/schema.js` antes de substituir `EstadoDoEditor.projeto`, mantendo `EstadoDoEditor.projetoAnterior` e `EstadoDoEditor.mensagens` em pt-BR em caso de recusa e reconstruindo `ProjetoJSON.blocos`, `ProjetoJSON.titulo` e `ProjetoJSON.entrada`; atende RF-14/RF-15/RF-17/RT-04; depende: T009/T015; verificação: `npx vitest run tests/unit/persistence-carregar.test.js` passa e um JSON inválido não altera o projeto aberto.

**Checkpoint**: núcleo pronto para testes locais. O fluxo com Core real ainda depende de T006/T007/T013.

---

## Phase 3: User Story 3 — Execução no Core real com saída e erros (P1) — MVP vertical

**Meta**: carregar o JSON canônico, gerar o Portugol, passar pelo parser público real do Core, executar com entrada `3` e conferir saída `6`.

**Teste independente**: `npm run test:acceptance` executa `tests/acceptance/dobrar-entrada.test.js` com parser e execução reais, sem mocks, e a saída comparada é `6` após normalizar apenas CRLF/LF.

- [ ] T017 [US3] Criar `tests/acceptance/dobrar-entrada.test.js` que carrega `tests/fixtures/dobrar-entrada.json`, chama `src/generation/gerador.js`, envia o texto a `src/core/runner.js`, exige prova de aceitação do parser real (`[COMPILED SUCCESSFULLY]` confirmado em T007), executa com entrada `3`, compara a saída `6` normalizando somente `\r\n` e `\r` para `\n`, e não usa mock do Core; atende RF-04/RF-05/RF-17/RT-01/RT-02; depende: T007/T011/T013/T016; verificação: `npm run test:acceptance` falha antes da implementação de T018/T019 e passa ao final da história. **BLOQUEADA PELA TAG**.
- [ ] T018 [US3] Implementar `src/ui/saida-execucao.js` para exibir `ResultadoDaExecucao.saida` e `ResultadoDaExecucao.erro` no painel de saída, atualizar `EstadoDoEditor.statusExecucao` e `EstadoDoEditor.mensagens` e preservar `EstadoDoEditor.projeto` em qualquer falha; atende RF-05/RF-16/RT-04; depende: T004/T013/T017; verificação: erro de sintaxe provocado manualmente aparece em pt-BR e blocos/Portugol permanecem intactos.
  - Nota de 2026-11-23: `src/ui/saida-execucao.js` já exibe em pt-BR "Execução indisponível: tag do Core ainda não confirmada." sem alterar o projeto. A exibição de erros reais de compilação/execução depende de T007/T017.
- [ ] T019 [US3] Implementar `src/core/mensagens-core.js` para converter os prefixos e mensagens confirmados em T007 para frases em pt-BR, incluindo erros de runtime reconhecidos e registro de lacuna em issue quando não houver tradução oficial; atende RF-05/RF-16/RT-03/RT-04; depende: T004/T007/T013; verificação: `npx vitest run tests/unit/core-runner.test.js` cobre pelo menos um erro de compilação e um erro de execução traduzidos. **BLOQUEADA PELA TAG**.

**Checkpoint**: fluxo crítico validado com Core real. Este é o MVP técnico; a demonstração visual chega nas fases seguintes.

---

## Phase 4: User Story 1 — Área de blocos e três painéis visíveis (P1)

**Meta**: exibir, em uma única tela, "Blocos", "Portugol gerado" e "Saída da execução", com encaixe de blocos.

**Teste independente**: abrir o editor, encaixar dois blocos compatíveis e conferir que as três áreas estão visíveis e identificadas na mesma tela.

- [x] T020 [P] [US1] Criar `tests/unit/ui-tres-paineis.test.js` verificando a presença dos três rótulos em pt-BR e que nenhum painel usa texto em inglês; atende RF-01/RF-16/RT-04; depende: T003/T004; verificação: teste falha antes da implementação de T021.
- [x] T021 [US1] Implementar `index.html` e `src/ui/layout.js` com os painéis "Blocos", "Portugol gerado" e "Saída da execução", integrando `src/ui/saida-execucao.js` e o toolbox de `src/blocks/toolbox.js`; atende RF-01/RF-02/RF-16/RT-04; depende: T005/T018/T020; verificação: `npx vitest run tests/unit/ui-tres-paineis.test.js` passa e `npm run dev` mostra os três painéis na mesma tela.

**Checkpoint**: US1 independente e demonstrável.

---

## Phase 5: User Story 2 — Portugol gerado em tempo real (P1)

**Meta**: atualizar o painel de Portugol automaticamente a cada alteração nos blocos, sem ação manual.

**Teste independente**: encaixar um bloco, remover outro e alterar um valor; o texto do painel muda a cada alteração em menos de 1 s.

- [x] T022 [P] [US2] Criar `tests/unit/geracao-tempo-real.test.js` verificando inclusão, remoção e alteração de valor de bloco, atualização de `EstadoDoEditor.portugolGerado` e mensagem de projeto vazio sem erro; atende RF-03/RF-16/RT-04/SC-003; depende: T003/T011; verificação: teste falha antes da implementação de T023.
- [x] T023 [US2] Implementar `src/ui/estado.js` ligando eventos de `src/blocks/` ao gerador e ao painel, recalculando `EstadoDoEditor.portugolGerado` a partir de `EstadoDoEditor.projeto` em menos de 1 s e sem botão de "gerar"; atende RF-03/RF-16/RT-04/SC-003; depende: T011/T021/T022; verificação: `npx vitest run tests/unit/geracao-tempo-real.test.js` passa e o cenário 1 de `quickstart.md` é concluído manualmente.

**Checkpoint**: ponte blocos → Portugol funcionando ao vivo.

---

## Phase 6: User Story 5 — Blocos de leitura e escrita (P2)

**Meta**: oferecer `leia` e `escreva` com entrada informada antes da execução e saída visível.

**Teste independente**: executar programa com `leia` e `escreva` usando entrada `3` e conferir saída `6`.

- [x] T024 [P] [US5] Criar `tests/unit/blocks-leia-escreva.test.js` cobrindo as definições dos blocos, o uso de `BlocoSerializado.variavel` e `BlocoSerializado.expressao`, a ordem de `ProjetoJSON.entrada` e a geração de `leia`/`escreva`; atende RF-07/RF-08/RF-12/RF-17; depende: T011/T014; verificação: teste falha antes da implementação de T025.
- [x] T025 [US5] Implementar `src/blocks/leia-escreva.js` e registrar os blocos em `src/blocks/toolbox.js`, mantendo o campo de entradas no editor; atende RF-07/RF-08/RF-16/RT-04; depende: T005/T021/T024; verificação: `npx vitest run tests/unit/blocks-leia-escreva.test.js` passa e o exemplo `3 → 6` é executável pela interface.

**Checkpoint**: US5 independente; o exemplo canônico também funciona pela interface.

---

## Phase 7: User Story 4 — Variáveis e operadores (P2)

**Meta**: declarar/atribuir variáveis e usar operadores aritméticos, relacionais e lógicos aceitos pela tag.

**Teste independente**: montar uma atribuição com operador aritmético e conferir que o Portugol gerado é aceito na execução real.

- [ ] T026 [US4] Confirmar na documentação da tag os tipos de `BlocoSerializado.tipoVariavel` e os operadores válidos em `BlocoSerializado.expressao`, atualizar `src/generation/sintaxe.js` e `docs/decisoes.md`; atende RF-06/RF-12/RT-01/Q-03; depende: T007; verificação: tabela em `src/generation/sintaxe.js` cita a fonte da tag e `npx vitest run tests/unit/portugol-generation.test.js` passa com os operadores reais. **BLOQUEADA PELA TAG**.
- [ ] T027 [US4] Criar `tests/unit/blocks-variaveis.test.js` e `tests/unit/operadores.test.js` cobrindo declaração, atribuição e cada operador confirmado em T026, além da recusa de operador fora do catálogo; atende RF-06/RF-12/RF-15/RF-19; depende: T026; verificação: testes falham antes da implementação de T028.
- [ ] T028 [US4] Implementar `src/blocks/variaveis.js`, `src/generation/operadores.js` e a atualização de `src/blocks/toolbox.js`, usando `BlocoSerializado.tipoVariavel` e `BlocoSerializado.expressao` conforme T026; atende RF-06/RF-12/RF-16/RT-04; depende: T027/T026; verificação: `npx vitest run tests/unit/blocks-variaveis.test.js tests/unit/operadores.test.js` passa e nenhum operador não aceito é oferecido.

**Checkpoint**: US4 independente e alinhada à gramática da turma.

---

## Phase 8: User Story 6 — Decisão com se/senão (P2)

**Meta**: montar decisão com condição e ramo alternativo, observando `positivo` para `3` e `outro` para `-1`.

**Teste independente**: executar o mesmo programa com entradas `3` e `-1` e conferir cada ramo.

- [ ] T029 [P] [US6] Criar `tests/unit/blocks-se-senao.test.js` cobrindo `BlocoSerializado.condicao`, `BlocoSerializado.ramos.entao`, `BlocoSerializado.ramos.senao` e as saídas `positivo`/`outro`; atende RF-09/RF-17/RF-19; depende: T011; verificação: teste falha antes da implementação de T030.
- [ ] T030 [US6] Implementar `src/blocks/se-senao.js` e o gerador de ramos em `src/generation/gerador.js`, usando a sintaxe confirmada em T007; atende RF-09/RF-16/RT-01/RT-04; depende: T007/T021/T029; verificação: `npx vitest run tests/unit/blocks-se-senao.test.js` passa e as duas entradas produzem saídas distintas na interface. **BLOQUEADA PELA TAG**.

**Checkpoint**: US6 independente.

---

## Phase 9: User Story 7 — Repetições com enquanto e para (P2)

**Meta**: montar laços com condição e contador, com limite de execução de 5 s.

**Teste independente**: executar um `para` de 1 a 3 e conferir `1`, `2`, `3` na ordem; executar laço sem término e conferir a mensagem de limite.

- [ ] T031 [P] [US7] Criar `tests/unit/blocks-enquanto-para.test.js` cobrindo `BlocoSerializado.condicao`, `BlocoSerializado.corpo`, `BlocoSerializado.inicio`, `BlocoSerializado.fim` e `BlocoSerializado.passo`, três repetições e interrupção por limite; atende RF-10/RF-11/RF-17/RF-19; depende: T011/T012; verificação: teste falha antes da implementação de T032.
- [ ] T032 [US7] Implementar `src/blocks/repeticoes.js` e o gerador de laços em `src/generation/gerador.js`, usando a sintaxe confirmada em T007 e a mensagem de limite de `src/messages/index.js`; atende RF-10/RF-11/RF-16/RT-01/RT-04; depende: T007/T021/T031; verificação: `npx vitest run tests/unit/blocks-enquanto-para.test.js` passa e a interface permanece responsiva após 5 s. **BLOQUEADA PELA TAG**.

**Checkpoint**: US7 independente; todos os blocos obrigatórios estão cobertos.

---

## Phase 10: User Story 8 — Salvar, reabrir e validar projeto em JSON (P1)

**Meta**: salvar o projeto, reabrir em nova sessão e preservar o trabalho diante de arquivo inválido.

**Teste independente**: salvar o exemplo, reabrir em sessão nova, executar com `3` e conferir `6`; recusar JSON inválido sem apagar o programa.

- [x] T033 [P] [US8] Criar `tests/unit/persistence-salvar.test.js` verificando que o arquivo UTF-8 contém `ProjetoJSON.versao`, `ProjetoJSON.titulo`, `ProjetoJSON.blocos` e `ProjetoJSON.entrada` e que salvar não altera `EstadoDoEditor.projeto` nem `EstadoDoEditor.portugolGerado`; atende RF-13/RF-16/RF-19/RT-04; depende: T003/T009; verificação: teste falha antes da implementação de T034.
- [x] T034 [US8] Implementar `src/persistence/salvar.js` serializando `ProjetoJSON.versao`, `ProjetoJSON.titulo`, `ProjetoJSON.blocos` e `ProjetoJSON.entrada` a partir do estado atual, sem estado oculto; atende RF-13/RT-04; depende: T009/T033; verificação: `npx vitest run tests/unit/persistence-salvar.test.js` passa e o arquivo salvo é suficiente para restaurar o projeto em outra sessão.
- [x] T035 [US8] Implementar `src/ui/persistencia.js` e adicionar as ações "Salvar" e "Carregar" em `index.html`, integrando `src/persistence/salvar.js`, `src/persistence/carregar.js`, `src/ui/estado.js` e as mensagens de `src/messages/index.js`; atende RF-13/RF-14/RF-15/RF-16/RT-04; depende: T016/T021/T023/T034; verificação: carregar inválido mostra mensagem em pt-BR e mantém `EstadoDoEditor.projetoAnterior` intacto.
- [ ] T036 [US8] Criar `tests/acceptance/reabrir-projeto.test.js` salvando o projeto de T014, carregando-o em sessão nova, confirmando a reconstrução dos blocos e a atualização do Portugol, executando com entrada `3` e conferindo saída `6`, além de recusar JSON malformado, versão incompatível e bloco desconhecido sem apagar o projeto; atende RF-13/RF-14/RF-15/RF-17/RT-04; depende: T017/T035; verificação: `npm run test:acceptance` passa com parser e execução reais.

**Checkpoint**: persistência completa e fluxo de reabertura validado com Core real.

---

## Phase 11: Polimento e preocupações transversais

**Objetivo**: fechar os gates de qualidade, métricas, rastreabilidade e demonstração.

- [x] T037 Rodar `npm test` e `npx vitest run --coverage`, ajustar testes de `src/generation/`, `src/persistence/` e `src/core/` até `coverage/coverage-summary.json` registrar cobertura mínima de 80% no núcleo; atende RF-19/SC-005; depende: todas as tarefas de implementação; verificação: percentual de linhas do resumo é ≥80% e `npm test` passa sem falhas.
- [ ] T038 Versionar `coverage/index.html`, `coverage/lcov.info` e `coverage/coverage-summary.json`, garantindo que `.gitignore` não ignora `coverage/`; atende RF-19/RT-06; depende: T037; verificação: `git status --short coverage/` mostra os três arquivos como novos ou alterados e `git add coverage/` os inclui no commit.
- [ ] T039 Atualizar o topo de `README.md` com a quantidade real de testes e o percentual real de cobertura lidos de `coverage/coverage-summary.json`, substituindo `Testes: 0 · Cobertura: 0%`; atende RF-20/SC-005; depende: T037; verificação: os números do topo do README são idênticos aos do resumo gerado e não há valores estimados.
- [ ] T040 Preparar `docs/demo.md` com roteiro de até 10 minutos, sem código nos slides, seguindo o cenário 6 de `quickstart.md` e definindo apresentador (Q-14); atende RF-24/RT-06/SC-007; depende: T036; verificação: roteiro cronometrado termina em ≤10 min, não contém blocos de código e inclui os passos montar → ver Portugol → executar `3` → mostrar `6` → salvar/reabrir → recusar inválido.
- [ ] T041 Auditar em `git log --oneline`, conforme `CONTRIBUTING.md`, se todo commit possui ID de task e requisito `RF-`/`RT-`, corrigindo mensagens para o padrão `task: T0xx — resumo (RF-xx/RT-xx)`; atende RF-18/RT-07/SC-006; depende: todos os commits de implementação; verificação: nenhum commit da branch viola a cadeia commit → task → requisito e os PRs descrevem mudança, task, requisito, testes e cobertura.
- [ ] T042 Rodar o `quickstart.md` completo e registrar o resultado em `docs/verificacao-final.md`, incluindo os cinco gates da constitution e a confirmação de que a aceitação usou o Core real; atende RF-17/RF-19/RF-20/RF-24/RT-07; depende: T036/T037/T039/T040/T041; verificação: checklist final em `docs/verificacao-final.md` está integralmente marcado e sem pendência de tag aberta.

**Checkpoint**: entrega pronta para revisão de conformidade com a constitution.

---

## Dependências e ordem de execução

### Dependências entre fases

- **Phase 1 (configuração)**: sem dependências. T001–T004 podem começar agora.
- **Phase 2 (fundamentação)**: depende de Phase 1. T006/T007/T013 são bloqueantes para qualquer execução com Core real; os demais podem avançar em paralelo.
- **Phase 3 (US3)**: depende de T007, T011, T013 e T016; é o MVP vertical.
- **Phase 4 (US1)**: depende da base e de T018; não depende de outras histórias.
- **Phase 5 (US2)**: depende de T011 e da interface de US1 para inspeção visual.
- **Phase 6 (US5)**: depende de T005, T021 e do gerador.
- **Phase 7 (US4)**: depende de T026 (tag) e do gerador.
- **Phase 8 (US6)**: depende de T007 (tag) e do gerador.
- **Phase 9 (US7)**: depende de T007 (tag), gerador e runner.
- **Phase 10 (US8)**: depende de T016/T021/T023 e da aceitação de US3 para a reabertura real.
- **Phase 11 (polimento)**: depende de todas as histórias desejadas.

### Ordem das histórias

Ordem adotada a pedido do usuário, com a spec como fonte de requisitos:

1. **US3 (P1)** — fluxo crítico com Core real, antes de qualquer interface elaborada.
2. **US1 (P1)** — três painéis.
3. **US2 (P1)** — geração em tempo real.
4. **US5 (P2)** — `leia`/`escreva` na toolbox.
5. **US4 (P2)** — variáveis e operadores.
6. **US6 (P2)** — `se`/`senão`.
7. **US7 (P2)** — `enquanto`/`para`.
8. **US8 (P1)** — salvar/carregar, movido para depois dos blocos conforme solicitação explícita.

### Separação por disponibilidade da tag congelada

**Podem avançar agora** (sem depender da confirmação da tag): T001, T002, T003, T004, T008, T009, T010, T011, T012, T014, T015, T016, T020, T022, T024, T029, T031, T033 e T034. T005 depende de decisão externa distinta (versão/licença do Blockly). T037 a T042 são tarefas finais: não dependem da tag em si, mas da conclusão das histórias.

**Dependem diretamente da confirmação da tag**: T006, T007, T013, T017, T019, T026, T027, T028, T030 e T032.

**Dependem indiretamente da tag**: T018, T021, T023, T025, T035, T036, T038, T039, T040, T041 e T042 herdam a dependência por encadeamento.

### Oportunidades de paralelismo

- Phase 1: T001, T002, T003 e T004 em paralelo.
- Phase 2: T008, T010, T012, T014 e T015 em paralelo; T009 e T016 após seus testes; T011 após T010.
- Entre histórias: após T007 e T011, T024, T029 e T031 podem ser escritos em paralelo por pessoas diferentes.
- Phase 11: T041 pode ser preparado em paralelo; T037 e T040 dependem do fechamento das histórias.

### Exemplo de paralelismo (MVP)

```text
Em paralelo agora:
  T001 criar diretórios
  T002 criar package.json
  T003 configurar Vitest
  T004 criar catálogo pt-BR

Depois, em paralelo:
  T008 teste do schema
  T010 teste do gerador
  T012 teste do runner com CLI simulada
  T014 fixture dobra-entrada
  T015 teste de carregamento

Assim que a dupla confirmar a tag:
  T006 → T007 → T013 → T017
```

## Estratégia de implementação

### MVP primeiro

1. Concluir T001–T005 (T005 conforme disponibilidade da dupla).
2. Concluir T006–T016; sem T006/T007/T013 não há aceitação com Core real.
3. Concluir Phase 3 (US3) e validar `3 → 6` com parser e execução reais.
4. **PARAR E VALIDAR**: rodar `npm run test:acceptance`.
5. MVP técnico pronto; MVP demonstrável exige US1 e US2.

### Entrega incremental

1. Base + US3 → prova técnica do ecossistema real.
2. US1 + US2 → editor utilizável pelo estudante.
3. US5 → exemplo canônico pela interface.
4. US4, US6 e US7 → blocos obrigatórios completos.
5. US8 → persistência completa e reabertura.
6. Polimento → cobertura, README, demo e auditoria de commits.

### Validação do formato

Todas as 42 tarefas seguem o padrão obrigatório `- [ ] [ID] [P?] [Story] descrição com caminho de arquivo`: checkbox presente, IDs sequenciais de T001 a T042, `[Story]` somente nas fases de história, `[P]` apenas quando não há dependência pendente, e pelo menos um caminho de arquivo por tarefa.

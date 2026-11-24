# Especificação da funcionalidade: Editor de blocos com Portugol e execução no Core

**Branch da funcionalidade**: `001-editor-blocos-portugol`

**Criado**: 2026-11-23

**Situação**: Rascunho

**Entrada**: Descrição do usuário: "Leia docs/requisitos.md, CONTRIBUTING.md e .specify/memory/constitution.md. Crie a spec em pt-BR para o escopo mínimo da PoC meuPiá Blocos. Preserve os IDs dos requisitos de origem para rastreabilidade. Escreva histórias de usuário priorizadas com critérios de aceite no formato Dado/Quando/Então. Cubra os três painéis, a geração de Portugol em tempo real, os blocos de variáveis, leia, escreva, se/senão, enquanto, para e operadores, a execução pelo Core real e o salvamento e carregamento de projetos em JSON. Inclua exemplos com entradas e saídas concretas. Por exemplo: dado um projeto JSON com blocos que leem 3, multiplicam por 2 e escrevem o resultado, o Portugol gerado deve ser aceito pelo parser do Core e a execução deve exibir 6. Inclua também um cenário em que o projeto é salvo, reaberto e produz a mesma saída. Descreva o comportamento observável. Deixe arquitetura, bibliotecas e integração técnica para o plan. Preserve a tag congelada da turma como pendente e registre dúvidas de comportamento ainda abertas. Termine após gerar a spec e informe o caminho do arquivo, as histórias e as pendências."

## Cenários de usuário e testes *(obrigatório)*

### User Story 1 — Área de blocos e três painéis visíveis (Priority: P1)

O estudante abre o editor e encontra, em uma única tela, três áreas identificadas:
uma para montar o programa encaixando blocos, outra com o Portugol gerado e outra
com a saída da execução. Ele arrasta blocos e os encaixa para formar um programa.

**Por que esta prioridade**: sem os três painéis e a montagem por encaixe, nenhum outro
fluxo do escopo mínimo pode ser demonstrado ao estudante.

**Teste independente**: abrir o editor, encaixar dois blocos compatíveis e conferir
que as três áreas estão visíveis e identificadas na mesma tela.

**Cenários de aceitação**:

1. **Dado** que o editor foi aberto, **Quando** a tela é carregada, **Então** são
   exibidas três áreas distintas e identificadas na mesma tela: "Blocos",
   "Portugol gerado" e "Saída da execução".
2. **Dado** a área "Blocos" com blocos disponíveis, **Quando** o estudante arrasta
   um bloco e o encaixa em outro compatível, **Então** o programa em blocos passa
   a incluir a nova ligação e nenhuma mensagem de erro é apresentada.
3. **Dado** um programa em blocos montado, **Quando** o estudante desfaz um
   encaixe, **Então** o bloco volta a ficar disponível sem apagar os demais
   blocos do programa.

---

### User Story 2 — Portugol gerado em tempo real (Priority: P1)

À medida que o estudante monta ou altera o programa em blocos, o painel de
Portugol é atualizado sozinho. Não existe uma ação manual de "gerar código".

**Por que esta prioridade**: a visualização imediata do Portugol é o que cria a ponte
entre blocos e código escrito, objetivo central da PoC.

**Teste independente**: encaixar um bloco, remover outro e alterar um valor dentro
de um bloco, conferindo que o texto do painel muda a cada alteração.

**Cenários de aceitação**:

1. **Dado** um programa em blocos com um bloco de escrita, **Quando** o estudante
   remove esse bloco, **Então** a linha correspondente desaparece do painel
   "Portugol gerado" sem que ele clique em qualquer ação de geração.
2. **Dado** um bloco com um valor preenchido, **Quando** o estudante altera esse
   valor, **Então** o painel "Portugol gerado" passa a mostrar o novo valor.
3. **Dado** um programa em blocos vazio, **Quando** a tela é exibida, **Então** o
   painel "Portugol gerado" indica que ainda não há código, sem mensagem de erro.

---

### User Story 3 — Execução no Core real com saída e erros compreensíveis (Priority: P1)

O estudante solicita a execução do Portugol gerado. O código é submetido ao meuPiá
Core real, aceito pelo parser e executado; a saída aparece no terceiro painel.
Falhas são explicadas em português do Brasil, sem fechar a aplicação.

**Por que esta prioridade**: é a prova de que o Portugol gerado é válido no ecossistema
real, e não apenas bonito na tela.

**Teste independente**: carregar o projeto de exemplo abaixo, executar com entrada
`3` e conferir a saída `6` e a mensagem de erro em um segundo cenário inválido.

**Exemplo concreto de entrada e saída (RF-17)**:

```json
{
  "versao": 1,
  "titulo": "Dobrar a entrada",
  "blocos": [
    { "tipo": "leia", "variavel": "x" },
    { "tipo": "atribuir", "variavel": "x", "expressao": "x * 2" },
    { "tipo": "escreva", "expressao": "x" }
  ],
  "entrada": [3]
}
```

Saída esperada no painel "Saída da execução": `6`.
O Portugol correspondente foi aceito pelo parser real do Core fixado (`v1.4.1`
@ `68824d7f9e91f71670f3f466c0a5865a8685f020`) em 2026-11-23. A sintaxe dos
blocos de decisão e laços permanece provisória (D-04) até a confirmação
documental em T026/T007.

**Cenários de aceitação**:

1. **Dado** o projeto JSON acima, com entrada `3`, **Quando** o editor gera o
   Portugol e solicita a execução ao Core real, **Então** o parser real do Core
   aceita o código e o painel "Saída da execução" exibe `6`.
2. **Dado** um Portugol gerado com erro de sintaxe, **Quando** a execução é
   solicitada, **Então** o painel de saída apresenta uma mensagem compreensível
   em pt-BR e o editor permanece utilizável.
3. **Dado** um programa com bloco de escrita, **Quando** a execução produz saída,
   **Então** o texto aparece no painel "Saída da execução" sem ação manual
   adicional do estudante.

---

### User Story 4 — Variáveis e operadores (Priority: P2)

O estudante declara e atribui variáveis e monta expressões com operadores
aritméticos, relacionais e lógicos, sempre dentro do conjunto aceito pelo Core.

**Por que esta prioridade**: necessário para expressar os cálculos dos exemplos e das
condições, mas depende da confirmação da tag para fixar tipos e operadores.

**Teste independente**: montar uma atribuição com operador aritmético e conferir
que o Portugol gerado é aceito na execução real.

**Cenários de aceitação**:

1. **Dado** um bloco de declaração com um tipo aceito pelo parser na tag
   confirmada, **Quando** o estudante o encaixa e atribui um valor, **Então** o
   painel "Portugol gerado" mostra a declaração e a atribuição correspondentes.
2. **Dado** os operadores disponíveis no escopo mínimo, **Quando** o estudante
   usa apenas operadores aceitos pelo parser real, **Então** o Portugol gerado é
   aceito e a execução produz a saída esperada.
3. **Dado** um operador não aceito na tag confirmada, **Quando** o estudante
   tenta utilizá-lo, **Então** ele não é oferecido ou é recusado com mensagem em
   pt-BR, sem gerar Portugol inválido.

---

### User Story 5 — Blocos de leitura e escrita (Priority: P2)

O estudante usa um bloco para ler um valor e outro para escrever o resultado.
No exemplo de entrada `3`, o cálculo `3 * 2` produz saída `6`.

**Por que esta prioridade**: são os blocos de entrada e saída mais usados na primeira
experiência do estudante e dão suporte ao exemplo de aceitação da PoC.

**Teste independente**: executar um programa com `leia` e `escreva` usando entrada
`3` e conferir a saída `6` no painel.

**Cenários de aceitação**:

1. **Dado** um projeto com bloco `leia` e entrada `3`, **Quando** a execução
   ocorre no Core real, **Então** o valor `3` é usado pelo programa.
2. **Dado** `x = 3` e um bloco `escreva` com a expressão `x * 2`, **Quando** o
   programa é executado, **Então** a saída exibida é `6`.
3. **Dado** que a entrada não foi informada, **Quando** o programa com `leia` é
   executado, **Então** o painel exibe mensagem em pt-BR explicando a falta da
   entrada, sem encerrar a aplicação.

---

### User Story 6 — Decisão com se/senão (Priority: P2)

O estudante monta uma decisão com condição e ramo alternativo. O comportamento
observável é a escolha do ramo conforme o valor lido.

**Por que esta prioridade**: completa o conjunto de controle de fluxo mínimo, permitindo
programas com decisão simples.

**Teste independente**: executar o mesmo programa com entradas `3` e `-1` e conferir
que cada ramo produz sua saída específica.

**Cenários de aceitação**:

1. **Dado** um programa com `se x > 0` escrevendo `positivo` e `senão` escrevendo
   `outro`, **Quando** executado com entrada `3`, **Então** a saída é `positivo`.
2. **Dado** o mesmo programa, **Quando** executado com entrada `-1`, **Então** a
   saída é `outro`.

---

### User Story 7 — Repetições com enquanto e para (Priority: P2)

O estudante monta laços com condição e laços com contador, observando a saída
produzida pela repetição.

**Por que esta prioridade**: fecha a cobertura das estruturas de repetição do escopo
mínimo, mantendo-se fora do escopo as otimizações e missões futuras.

**Teste independente**: executar um `para` de 1 a 3 e conferir a saída ordenada;
executar um laço sem término e conferir a mensagem de limite.

**Cenários de aceitação**:

1. **Dado** um bloco `enquanto` com condição `contador < 3` e incremento do
   contador, **Quando** executado, **Então** o corpo do laço aparece exatamente
   três vezes na saída.
2. **Dado** um bloco `para` com contador de 1 a 3, **Quando** executado, **Então**
   a saída contém `1`, `2` e `3`, nessa ordem.
3. **Dado** um laço sem término, **Quando** o limite de execução é atingido,
   **Então** a interface permanece responsiva e exibe mensagem em pt-BR; o limite
   exato será definido no planejamento.

---

### User Story 8 — Salvar, reabrir e validar projeto em JSON (Priority: P1)

O estudante salva o programa atual em um arquivo JSON, fecha a sessão, reabre o
arquivo e continua exatamente de onde parou. Um arquivo inválido é recusado sem
apagar o trabalho aberto.

**Por que esta prioridade**: sem persistência, o estudante perde o programa ao fechar a
página, e o teste de aceitação ponta a ponta não pode partir de um JSON.

**Teste independente**: salvar o exemplo do dobro da entrada, reabrir o arquivo em
uma sessão nova e executar novamente com entrada `3`, conferindo a saída `6`.

**Cenários de aceitação**:

1. **Dado** um programa em blocos com entrada `3`, **Quando** o estudante
   solicita salvar, **Então** é gerado um arquivo JSON com os blocos e os
   metadados necessários para restaurá-lo.
2. **Dado** o arquivo salvo, **Quando** o estudante o carrega em uma sessão nova,
   **Então** os blocos são reconstruídos, o painel "Portugol gerado" é atualizado
   e, ao executar com a mesma entrada, a saída volta a ser `6`.
3. **Dado** um arquivo JSON inválido ou incompatível, **Quando** o estudante
   tenta carregá-lo, **Então** a interface recusa o arquivo com mensagem em
   pt-BR e o programa atual permanece intacto.

---

### User Story 9 — Missão que escolhe os blocos da toolbox (Priority: P2)

O estudante carrega uma missão do meuPiá Desafios e a área "Blocos" passa a
mostrar somente os blocos necessários àquela missão. Duas missões diferentes
podem oferecer conjuntos diferentes, e um bloco que a missão não pede não é
oferecido. Ao sair da missão, a toolbox volta ao conjunto completo.

**Por que esta prioridade**: é o segundo incremento aprovado pela dupla depois
de o fluxo mínimo ter passado nos gates; transforma o editor de uma ferramenta
genérica em um ponto de entrada para as missões do ecossistema, sem atrapalhar
quem apenas quer montar um programa livre.

**Teste independente**: carregar duas missões de conjuntos diferentes, conferir
os blocos presentes e ausentes em cada uma e, em seguida, conferir que sem
missão todos os blocos do catálogo continuam disponíveis.

**Cenários de aceitação**:

1. **Dado** uma missão carregada no formato público do meuPiá Desafios,
   **Quando** a missão é aplicada, **Então** a toolbox exibe somente os blocos
   necessários às construções presentes no código inicial e na descrição da
   missão, e o título da missão fica visível para o estudante.
2. **Dado** a missão oficial "O Taxímetro" (`calculo_gn_taximetro`), cujo código
   inicial declara variável e escreve uma soma, **Quando** a toolbox é montada,
   **Então** aparecem `declarar`, `escreva` e `op_soma`, e não aparecem
   `atribuir`, `se`, `enquanto`, `para` nem `leia`.
3. **Dado** a missão oficial "A Fila VIP" (`fila_prioridade_simples`), cuja
   descrição pede `SE / SENAO` e cujo código inicial usa `<-`, **Quando** essa
   missão é carregada, **Então** a toolbox troca para o conjunto da segunda
   missão: `atribuir` e `se` aparecem e `op_soma` da missão anterior não aparece,
   provando que as duas missões filtram de forma distinta.
4. **Dado** um bloco de uma missão anterior ainda no programa, **Quando** outra
   missão é carregada, **Então** o estudante recebe aviso em pt-BR e o programa
   aberto não é apagado sem confirmação.
5. **Dado** que nenhuma missão está carregada, **Quando** o editor abre, **Então**
   a toolbox mostra o catálogo completo usado no escopo mínimo e o exemplo
   `3 → 6` continua executável.
6. **Dado** uma missão inválida ou em formato desconhecido, **Quando** o
   estudante tenta carregá-la, **Então** a missão é recusada com mensagem em
   pt-BR, a toolbox e o programa atuais permanecem intactos.

---

### User Story 10 — Blocos de módulo executáveis no Core (Priority: P2)

O estudante encontra na toolbox blocos de um módulo do ecossistema meuPiá. Ao
usá-los, o Portugol gerado contém a forma pública de usar esse módulo e uma
chamada documentada, de modo que o programa seja aceito pelo Core real e
produza um efeito verificável na saída.

**Por que esta prioridade**: mostra que o editor não serve apenas ao Portugol
básico: ele fala a linguagem dos módulos oficiais pelo contrato público, sem
copiar ou modificar o módulo.

**Teste independente**: montar a missão de exemplo com bloco de módulo, gerar o
Portugol, executá-lo no Core fixado e conferir a saída esperada; conferir
também que nenhum arquivo do módulo foi copiado para este repositório.

**Cenários de aceitação**:

1. **Dado** o módulo escolhido e documentado no planejamento, **Quando** o
   estudante encaixa um bloco desse módulo, **Então** o painel "Portugol gerado"
   passa a conter a diretiva pública de uso do módulo e a chamada documentada,
   com argumentos preenchidos pelo estudante.
2. **Dado** um programa de exemplo com o bloco de módulo, **Quando** o Core real
   `v1.4.1` o recebe, **Então** o parser aceita o código e a execução produz na
   saída o efeito verificável descrito na missão de exemplo.
3. **Dado** um bloco de módulo com argumento incompleto, **Quando** o estudante
   tenta executar, **Então** a interface apresenta mensagem em pt-BR e o
   programa aberto permanece intacto.
4. **Dado** que a interface pública necessária ao módulo não existe ou não está
   documentada na versão fixada, **Quando** o impedimento é constatado,
   **Então** a lacuna é registrada com fonte e data, e a integração é resolvida
   por adaptador neste repositório, sem alterar o Core nem o módulo.

---

### Edge Cases

- Arquivo JSON sem versão, com versão diferente da aceita ou com blocos
  desconhecidos: recusa em pt-BR, sem substituir o programa aberto.
- Programa vazio: painel de Portugol indica ausência de código e a execução não
  apresenta saída, sem mensagem de erro.
- Entrada ausente ou incompatível com o tipo esperado pelo bloco `leia`:
  mensagem em pt-BR; o conjunto de tipos depende da tag confirmada.
- Laço sem término: limite de execução com mensagem em pt-BR e interface
  responsiva; valor do limite a definir no planejamento.
- Falha reportada pelo Core: mensagem compreensível em pt-BR no painel de saída,
  sem encerrar a aplicação e sem perder o programa em blocos.
- Bloco desencaixado no meio de uma expressão: Portugol gerado permanece
  coerente ou é sinalizado em pt-BR, sem saída enganosa.

## Requisitos *(obrigatório)*

### Requisitos funcionais

- **FR-001** (RF-01): O editor DEVE exibir, na mesma tela, três áreas
  identificadas: blocos, Portugol gerado e saída da execução.
- **FR-002** (RF-02): O estudante DEVE poder arrastar e encaixar blocos para
  compor um programa.
- **FR-003** (RF-03): A cada alteração no programa em blocos, o painel de
  Portugol DEVE ser atualizado automaticamente, sem ação manual.
- **FR-004** (RF-04, RT-01, RT-02, RT-03): A execução DEVE usar o meuPiá Core
  real por meio de interfaces públicas da tag confirmada; o Core e seus módulos
  NÃO DEVEM ser alterados, e a ausência de interface DEVE ser resolvida fora do
  Core, com registro do problema.
- **FR-005** (RF-05): O painel de saída DEVE mostrar a saída da execução e
  apresentar falhas de parsing e execução em mensagens compreensíveis em pt-BR.
- **FR-006** (RF-06): O editor DEVE oferecer blocos para declarar e atribuir
  variáveis, respeitando os tipos aceitos pelo parser na tag confirmada.
- **FR-007** (RF-07): O editor DEVE oferecer um bloco de leitura compatível com
  o Portugol aceito pelo Core.
- **FR-008** (RF-08): O editor DEVE oferecer um bloco de escrita cuja execução
  apareça no painel de saída.
- **FR-009** (RF-09): O editor DEVE oferecer blocos de decisão com condição e
  ramo alternativo `senão`.
- **FR-010** (RF-10): O editor DEVE oferecer bloco de repetição com condição
  (`enquanto`).
- **FR-011** (RF-11): O editor DEVE oferecer bloco de repetição com contador
  (`para`).
- **FR-012** (RF-12): O editor DEVE oferecer operadores aritméticos,
  relacionais e lógicos limitados ao conjunto aceito pelo parser real.
- **FR-013** (RF-13): O editor DEVE salvar o projeto atual em arquivo JSON com
  os blocos e os metadados necessários para restaurá-lo.
- **FR-014** (RF-14): O editor DEVE carregar um projeto JSON, reconstruir os
  blocos e, em consequência, atualizar o Portugol exibido.
- **FR-015** (RF-15): Um arquivo inválido ou incompatível DEVE ser recusado com
  mensagem em pt-BR, sem destruir o programa aberto.
- **FR-016** (RF-16, RT-04): Interface, documentação, rótulos e mensagens ao
  usuário DEVEM estar em português do Brasil, sem exceção no escopo mínimo.
- **FR-017** (RF-17): O teste de aceitação DEVE partir de um projeto em blocos
  em JSON, gerar o Portugol, submetê-lo ao parser real do Core, confirmar a
  aceitação, executá-lo e conferir a saída esperada, sem mocks do Core.
- **FR-018** (RF-18): Cada commit DEVE referenciar a task que implementa, e
  cada task DEVE referenciar o requisito de origem atendido.
- **FR-019** (RF-19): O núcleo da lógica DEVE ter cobertura mínima de 80%, com
  relatório gerado e versionado no repositório.
- **FR-020** (RF-20): O topo do `README.md` DEVE trazer a quantidade real de
  testes e o percentual real de cobertura, atualizados a cada entrega.
- **FR-021** (RF-21, RT-07): Os artefatos `constitution`, `spec`, `plan` e
  `tasks` DEVEM estar versionados antes da implementação.
- **FR-022** (RF-22): A `spec` DEVE descrever o quê e o porquê em user stories
  com critérios verificáveis e sem detalhes técnicos; o `plan` DEVE cobrir
  arquitetura, stack, dados e integrações; as `tasks` DEVEM ser fatias
  verticais rastreáveis até a spec.
- **FR-023** (RF-24): A entrega final DEVE prever demonstração ao vivo de até
  10 minutos, sem código nos slides.
- **FR-024** (EC-01, Q-08): O editor DEVE carregar missões no formato JSON
  público do meuPiá Desafios, aceitando `id`, `titulo`, `descricao` (ou
  `instrucoes`), `codigoInicial` e `codigoTeste`, e ignorando campos extras
  como `mapa`.
- **FR-025** (EC-01): O conjunto de blocos oferecido na toolbox DEVE ser
  derivado de forma determinística do código inicial e da descrição da missão,
  porque o schema oficial não traz lista explícita de blocos.
- **FR-026** (EC-01): Duas missões com construções diferentes DEVEM produzir
  toolboxes diferentes, e um bloco não exigido pela missão NÃO DEVE aparecer.
- **FR-027** (EC-01, RT-06): Sem missão carregada, a toolbox DEVE continuar
  exibindo o catálogo completo do escopo mínimo, com o exemplo `3 → 6`
  preservado.
- **FR-028** (EC-01): Uma missão inválida ou em formato desconhecido DEVE ser
  recusada em pt-BR sem alterar a toolbox nem o programa aberto.
- **FR-029** (EC-02, Q-07): O editor DEVE oferecer blocos do módulo Grid por
  meio da diretiva pública `usar "grid"` e das funções públicas
  `grid_iniciar` e `grid_visitar`, documentadas nas missões oficiais do
  Desafios e na interface do plugin.
- **FR-030** (EC-02): O Portugol gerado com blocos de módulo DEVE conter a
  diretiva `usar "grid"` logo após o cabeçalho e as chamadas das funções
  escolhidas, sem duplicar a diretiva.
- **FR-031** (EC-02, RF-17): Um programa de exemplo com bloco de módulo DEVE
  ser aceito pelo parser real do Core fixado e produzir saída verificável na
  execução real.
- **FR-032** (EC-02, RT-03): Nenhum código do Core ou do módulo Grid DEVE ser
  copiado para este repositório; a lacuna de documentação do README do Grid
  DEVE ser registrada com fonte e data, e a integração resolvida no adaptador.

### Entidades principais *(incluir se a funcionalidade envolver dados)*

- **Projeto em blocos**: programa do estudante exportado como JSON; contém
  versão, título, sequência de blocos e a entrada usada na demonstração.
- **Bloco**: unidade montável com tipo, parâmetros preenchidos e ligações com
  outros blocos; exemplos: `leia`, `atribuir`, `escreva`, `se`, `enquanto`,
  `para`, operadores e blocos de módulo (`usar_grid`, `grid_iniciar`,
  `grid_visitar`).
- **Missão do Desafios**: arquivo JSON público com `id`, `título`, descrição,
  código inicial e código de teste; a partir dele o editor obtém os blocos
  permitidos e o texto apresentado ao estudante.
- **Conjunto de blocos permitidos**: lista determinística de tipos de bloco
  derivada da missão; quando não há missão, é o catálogo completo.
- **Portugol gerado**: texto resultante do programa em blocos, observável no
  painel e submetido ao Core na execução.
- **Saída da execução**: texto produzido pelo Core, incluindo mensagens de erro
  compreensíveis em pt-BR.
- **Requisito de origem**: identificador (`RF-`, `RT-`) que vincula cada
  história, requisito funcional, task e commit.

### Rastreabilidade dos requisitos de origem

| ID | Onde é atendido nesta spec |
| --- | --- |
| RF-01 | US1 / FR-001 |
| RF-02 | US1 / FR-002 |
| RF-03 | US2 / FR-003 |
| RF-04 | US3 / FR-004 |
| RF-05 | US3 / FR-005 |
| RF-06 | US4 / FR-006 |
| RF-07 | US5 / FR-007 |
| RF-08 | US3, US5 / FR-008 |
| RF-09 | US6 / FR-009 |
| RF-10 | US7 / FR-010 |
| RF-11 | US7 / FR-011 |
| RF-12 | US4 / FR-012 |
| RF-13 | US8 / FR-013 |
| RF-14 | US8 / FR-014 |
| RF-15 | US8 / FR-015 |
| RF-16 | US3, US8 / FR-016 |
| RF-17 | US3 / FR-017 |
| RF-18 | FR-018 |
| RF-19 | FR-019, SC-005 |
| RF-20 | FR-020, SC-005 |
| RF-21 | FR-021, constitution |
| RF-22 | FR-022, estrutura desta spec |
| RF-23 | Constitution (Stack Inicial e Restrições Técnicas); detalhes no plan |
| RF-24 | FR-023, SC-007 |
| RT-01 | FR-004, Assumptions (tag pendente) |
| RT-02 | FR-004 |
| RT-03 | FR-004 |
| RT-04 | FR-016 |
| RT-05 | Etapa anterior encerrada; sem efeito nesta spec |
| RT-06 | US1 a US10; mínimo preservado e EC-01/EC-02 incluídos como segundo incremento; BX-01 fora |
| RT-07 | FR-021, FR-022, constitution |
| EC-01 | US9 / FR-024 a FR-028 / SC-009 a SC-011 |
| EC-02 | US10 / FR-029 a FR-032 / SC-012 |
| Q-07 | US10 / FR-029 / `plan.md` e `research.md` (módulo Grid) |
| Q-08 | US9 / FR-024 / `plan.md` e `research.md` (schema do Desafios) |

## Critérios de sucesso *(obrigatório)*

### Resultados mensuráveis

- **SC-001**: 100% dos cenários de aceitação prioritários (P1) são concluídos
  com sucesso, do JSON ao Core real e à saída esperada.
- **SC-002**: O exemplo concreto com entrada `3` produz a saída `6` em 100% das
  execuções de aceitação.
- **SC-003**: Em condições normais de uso, a atualização do painel de Portugol
  ocorre em menos de 1 segundo após cada alteração nos blocos.
- **SC-004**: 100% dos arquivos JSON inválidos ou incompatíveis são recusados com
  mensagem em pt-BR, com o programa aberto preservado.
- **SC-005**: A cada entrega, o relatório de cobertura registra no mínimo 80% do
  núcleo e o topo do `README.md` mostra a quantidade de testes e o percentual
  efetivamente medidos.
- **SC-006**: 100% dos commits verificados na revisão possuem task referenciada,
  e 100% das tasks possuem requisito de origem referenciado.
- **SC-007**: A demonstração final dura no máximo 10 minutos e não contém código
  nos slides.
- **SC-008**: Em um teste com cinco estudantes iniciantes, pelo menos quatro
  concluem o fluxo "montar blocos → ver Portugol → executar" sem ajuda.
- **SC-009**: 100% das missões de teste são carregadas sem erro e produzem o
  mesmo conjunto de blocos em execuções repetidas (derivação determinística).
- **SC-010**: Nas duas missões de conjuntos diferentes, 0 blocos não exigidos
  pela missão aparecem na toolbox filtrada.
- **SC-011**: Sem missão carregada, 100% dos blocos do catálogo do escopo
  mínimo continuam disponíveis e o exemplo `3 → 6` continua produzindo `6`.
- **SC-012**: 100% das execuções de aceite do programa de módulo Grid são
  aceitas pelo parser real do Core `v1.4.1` e produzem a saída verificável
  esperada, sem copiar código do módulo para este repositório.

## Premissas

- O público é formado por estudantes iniciantes em programação, usando um
  navegador em um computador com tela suficiente para os três painéis.
- A tag original da turma para o meuPiá Core e módulos **não pôde ser
  confirmada** (Q-01 em `docs/requisitos.md`). A dupla fixou, como substituto,
  `meuPia/core v1.4.1`, commit
  `68824d7f9e91f71670f3f466c0a5865a8685f020` (registrado na constitution, no
  `plan.md` e no `README.md`). A versão e as interfaces públicas estão fixadas;
  o conjunto definitivo de tipos e operadores ainda depende da confirmação
  documental em T026/T007.
- Tipos de variáveis, operadores aceitos e sintaxe exata do Portugol serão
  confirmados a partir da documentação da tag congelada; os exemplos usam apenas
  número inteiro e multiplicação por coerência com o pedido da PoC.
- A entrada do bloco `leia` é fornecida no momento da execução; a forma exata de
  informá-la no navegador fica para o planejamento.
- A comparação da saída esperada usa como premissa a normalização de quebras de
  linha e espaços; a regra definitiva fica para o planejamento.
- A stack inicial já está registrada na constitution; esta spec não fixa
  bibliotecas, arquitetura nem integrações técnicas.
- Os itens `EC-01` e `EC-02` entram nesta branch como segundo incremento,
  aprovado depois de o escopo mínimo passar nos gates (emenda 1.1.0 da
  constitution). O bônus `BX-01` continua fora.
- O schema oficial do Desafios não traz lista de blocos; por premissa, a
  derivação usa apenas construções presentes no código inicial e na descrição,
  e o catálogo da toolbox limita a oferta aos blocos implementados pelo editor.
- O módulo Grid é usado somente pelas funções públicas documentadas nas missões
  oficiais e pela diretiva `usar "grid"` da versão fixada; o README do repositório
  do Grid está vazio, lacuna registrada como pendência documental (RT-03).

**Dúvidas de comportamento ainda abertas (registradas, sem bloquear a spec):**

- **Q-02/Q-04**: como o Core reporta erros de parsing e de execução e quais
  mensagens devem ser exibidas ao estudante na tag confirmada.
- **Q-05**: o formato final do envelope JSON e os campos de metadados além de
  versão e título; a spec exige apenas que o arquivo permita restaurar o
  programa.
- **Q-06**: se a entrada do `leia` vem de campo interativo, fila pré-definida ou
  outro mecanismo observável pelo estudante.
- **Q-12**: se a saída é comparada por string exata ou após normalização de
  quebras de linha, espaços e acentuação.
- **Q-13**: qual limite de tempo usar para laços sem término e como avisar o
  estudante sem travar a interface.

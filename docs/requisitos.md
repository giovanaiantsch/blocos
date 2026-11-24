# Requisitos — Trilha 1: meuPiá Blocos

**Status:** rascunho para revisão da dupla. Nenhuma decisão técnica abaixo é definitiva; as propostas da seção final precisam de revisão explícita antes de virarem `constitution` ou `plan`.

**Fontes consultadas:** `README.md`, `CONTRIBUTING.md` deste fork e briefing do professor.

**Tag congelada da turma (meuPiá Core e módulos): ⚠️ PENDENTE DE CONFIRMAÇÃO.** A tag não aparece explicitamente nos arquivos oficiais do repositório (`README.md` e `CONTRIBUTING.md`). Confirmar com a dupla/professor antes de fixar versões, documentar a API consumida ou escrever o teste de aceitação.

**Convenções de numeração:**

| Prefixo | Uso |
| --- | --- |
| `RF-` | Requisitos (funcionais, não funcionais e de processo) |
| `RT-` | Restrições |
| `EC-` | Itens do escopo completo |
| `BX-` | Bônus |
| `Q-` | Perguntas em aberto para a dupla |
| `DT-` | Decisões técnicas **propostas** para revisão |

---

## 1. Objetivo

Entregar, como Trilha 1, um editor web em que o estudante monta um programa encaixando blocos, vê o Portugol correspondente surgir em tempo real e executa esse Portugol pelo meuPiá Core. O editor consome o ecossistema meuPiá; não o altera.

Prioridade esta entrega: **escopo mínimo**. Escopo completo e bônus ficam registrados para planejamento posterior.

---

## 2. Requisitos

### 2.1 Requisitos funcionais

- **RF-01 — Três painéis.** O editor deve exibir, na mesma tela do navegador, três áreas distintas e identificadas: (a) blocos, (b) Portugol gerado, (c) saída da execução.
- **RF-02 — Montagem por blocos.** O painel de blocos deve permitir arrastar e encaixar blocos para compor um programa.
- **RF-03 — Geração em tempo real.** A cada alteração do programa em blocos, o painel de Portugol deve ser atualizado automaticamente, sem ação manual do usuário.
- **RF-04 — Execução pelo Core.** O editor deve enviar o Portugol gerado ao meuPiá Core e executá-lo exclusivamente por meio de interfaces públicas do ecossistema, sem modificar o Core nem seus módulos.
- **RF-05 — Saída e erros.** O painel de saída deve mostrar a saída produzida pela execução e apresentar falhas de parsing/execução em mensagens compreensíveis, em pt-BR (ver RF-16).
- **RF-06 — Blocos de variáveis.** O escopo mínimo deve oferecer blocos para declarar/atribuir variáveis, respeitando os tipos efetivamente aceitos pelo parser do Core na tag confirmada (ver Q-03).
- **RF-07 — Bloco `leia`.** Deve haver um bloco de leitura de entrada compatível com o Portugol aceito pelo Core (ver Q-06).
- **RF-08 — Bloco `escreva`.** Deve haver um bloco de escrita de saída cuja execução apareça no painel de saída.
- **RF-09 — Blocos `se`/`senão`.** Deve haver blocos de decisão com condição e o ramo alternativo `senão`.
- **RF-10 — Bloco `enquanto`.** Deve haver bloco de repetição com condição.
- **RF-11 — Bloco `para`.** Deve haver bloco de repetição com contador.
- **RF-12 — Operadores.** Devem existir blocos de operadores (aritméticos, relacionais e lógicos) limitados ao conjunto aceito pelo parser real do Core na tag confirmada (ver Q-03).
- **RF-13 — Salvar em JSON.** O editor deve salvar o projeto atual em um arquivo JSON contendo o programa em blocos e os metadados necessários para restaurá-lo (ver Q-05).
- **RF-14 — Carregar JSON.** O editor deve carregar um projeto JSON, reconstruir os blocos e, em consequência, atualizar o Portugol exibido.
- **RF-15 — Validação do JSON carregado.** Um arquivo inválido ou incompatível deve ser recusado com mensagem em pt-BR, sem destruir o programa aberto no editor (ver Q-05).
- **RF-16 — Idioma.** Interface, documentação e todas as mensagens ao usuário devem estar em português do Brasil.
- **RF-17 — Teste de aceitação ponta a ponta.** O teste deve partir de um programa em blocos representado em JSON, gerar o Portugol, submetê-lo ao **parser real do Core** (não a um mock), confirmar que o parser aceita o código, executá-lo e conferir a saída esperada (ver Q-12).
- **RF-18 — Rastreabilidade.** Cada commit deve referenciar a task que implementa; cada task deve referenciar o requisito (`RF-`, `RT-` etc.) que atende.

### 2.2 Requisitos não funcionais e de qualidade

- **RF-19 — Cobertura.** O núcleo da lógica (no mínimo: geração de Portugol, adaptador de integração e serialização/carga de JSON) deve ter cobertura mínima de **80%**, com relatório gerado e versionado no repositório. Componentes de interface e renderização podem ficar fora da medição, conforme o `CONTRIBUTING.md`.
- **RF-20 — README.** O topo do `README.md` deve trazer a quantidade de testes e o percentual de cobertura, atualizados a cada entrega (o valor atual é `0` testes e `0%`).
- **RF-21 — Artefatos SDD.** O desenvolvimento deve usar GitHub SpecKit **ou** OpenSpec, com `constitution`, `spec`, `plan` e `tasks` versionados no repositório **antes** da implementação.
- **RF-22 — Conteúdo dos artefatos.** A `spec` deve descrever o quê e o porquê em user stories com critérios de aceite verificáveis e sem detalhes técnicos; o `plan` deve cobrir arquitetura, stack, dados e integrações; as `tasks` devem ser fatias verticais pequenas e rastreáveis até a spec.
- **RF-23 — Stack na constitution.** A stack escolhida (incluindo a biblioteca de blocos) deve ser registrada na `constitution`. Blockly é a sugestão do professor, não uma decisão automática (ver Q-09 e DT-01).
- **RF-24 — Pitch.** A entrega final prevê demonstração ao vivo de até **10 minutos**, sem código nos slides.

---

## 3. Restrições

- **RT-01 — Tag congelada.** Usar apenas interfaces públicas do meuPiá na versão fixada. ⚠️ A tag original da turma **não pôde ser confirmada** (não informada nos arquivos oficiais consultados); a dupla fixou `meuPia/core v1.4.1`, commit `68824d7f9e91f71670f3f466c0a5865a8685f020`, como substituta; ver Q-01 e `docs/decisoes.md` (D-06).
- **RT-02 — Ecossistema intocado.** Não modificar o meuPiá Core nem seus módulos. Mudanças no compilador pertencem ao repositório do Core.
- **RT-03 — Interface ausente.** Se faltar uma interface pública necessária, registrar a necessidade abrindo uma issue no repositório do módulo correspondente e resolver a integração com um **adaptador no editor**, sem alterar o módulo.
- **RT-04 — Idioma único.** Toda interface, documentação e mensagem ao usuário em pt-BR, sem exceções de escopo mínimo.
- **RT-05 — Etapa atual.** Nesta etapa, criar somente `docs/requisitos.md`: não alterar outros arquivos e não implementar código.
- **RT-06 — Prioridade.** Priorizar o escopo mínimo (RF-01 a RF-24). Itens de escopo completo e bônus não entram na primeira entrega.
- **RT-07 — Fluxo SDD.** Escrever/atualizar os artefatos de especificação antes do código; PRs devem descrever a mudança e o requisito atendido.

---

## 4. Escopo completo (após o escopo mínimo)

- **EC-01 — Toolbox por missão.** Oferecer conjuntos de blocos por missão, com carregamento de missões do meuPiá Desafios (a forma de distribuição dessas missões está em Q-08).
- **EC-02 — Blocos de módulo.** Acrescentar blocos de pelo menos um módulo do ecossistema — Grid, Maker ou IA — usando apenas interfaces públicas e respeitando a tag confirmada (a escolha está em Q-07).

## 5. Bônus

- **BX-01 — Portugol → blocos.** Converter um programa em Portugol de volta para blocos. É bônus, não requisito da Trilha 1.

---

## 6. Perguntas para a dupla resolver

- **Q-01** Qual é a tag exata congelada para a turma (Core e módulos)? Ela não aparece em `README.md` nem em `CONTRIBUTING.md` e **não pôde ser confirmada**. A dupla adotou `meuPia/core v1.4.1` (commit `68824d7f9e91f71670f3f466c0a5865a8685f020`) como versão substituta para integração e aceite, sem declarar que essa é a tag original da turma.
- **Q-02** Onde estão documentadas as interfaces públicas do Core nessa tag e quais são seus formatos de entrada/saída?
- **Q-03** Quais tipos de variáveis e quais operadores o parser real aceita na tag confirmada (inteiro, real, texto, lógico; `+`, `-`, `*`, `/`; comparadores; `e`/`ou`/`não`)?
- **Q-04** O Core expõe parser e execução como etapas separadas, de modo a validar o Portugol antes de executá-lo? Como ele reporta erros?
- **Q-05** Qual será o formato do JSON de projeto: serialização nativa da biblioteca de blocos ou formato próprio? Haverá versionamento do formato e campos como título/missão?
- **Q-06** Como o bloco `leia` obtém a entrada durante a execução no navegador (campo interativo, fila de valores pré-definida ou API do Core)?
- **Q-07** Qual módulo atenderá o EC-02 (Grid, Maker ou IA) e ele possui interfaces públicas utilizáveis na tag confirmada?
- **Q-08** Como as missões do meuPiá Desafios são identificadas e carregadas (arquivo JSON, URL, API) para o EC-01?
- **Q-09** Adotar Blockly? Se sim, qual versão, qual licença e como ele convive com a camada de adaptador?
- **Q-10** Qual ferramenta de cobertura será usada, em qual diretório o relatório será versionado e quem atualiza o topo do `README.md` a cada entrega?
- **Q-11** Qual convenção de mensagem de commit vinculará commit → task → requisito (por exemplo, `task: RF-07 — bloco leia`)?
- **Q-12** Como a saída esperada do teste de aceitação será comparada (string exata ou normalização de quebras de linha, espaços e acentuação)?
- **Q-13** Como tratar laços sem término e limite de tempo de execução no navegador, mantendo a interface responsiva?
- **Q-14** Quem apresentará a demo ao vivo e qual roteiro de 10 minutos será usado no pitch?

---

## 7. Decisões técnicas propostas (para revisão da dupla)

> Estas são **propostas**, não decisões tomadas. Cada item depende da confirmação da dupla e, quando aplicável, da tag definida em Q-01.

- **DT-01 — Blockly como base visual.** Adotar Blockly para a área de encaixe, com gerador de Portugol próprio (a geração padrão da biblioteca produz outras linguagens). Depende de Q-09; alternativa deve ser registrada se a dupla optar por outra biblioteca.
- **DT-02 — Adaptador único para o Core.** Isolar toda comunicação com o meuPiá Core em um adaptador no editor. Assim, uma interface faltante vira issue no módulo + ajuste local, sem tocar no Core (RT-03).
- **DT-03 — Gerador puro e testável.** Manter a geração de blocos → Portugol como lógica independente de DOM/interface, para permitir testes unitários e o teste de aceitação RF-17 sem renderizar a tela.
- **DT-04 — JSON com envelope versionado.** Serializar os blocos da biblioteca dentro de um envelope com `versao`, `titulo` e os dados dos blocos, facilitando a validação do RF-15. Depende de Q-05.
- **DT-05 — Aceitação em três etapas.** Estruturar RF-17 como: JSON de blocos → Portugol gerado → parser real do Core aceita → execução → comparação da saída. Usar mocks apenas nos testes unitários do adaptador, nunca no teste de aceitação.
- **DT-06 — Mensagens centralizadas.** Manter rótulos e mensagens de erro em pt-BR em um único ponto do código, para consistência com RF-16 e RT-04.
- **DT-07 — Separação em módulos.** Organizar a implementação em módulos de blocos, geração de Portugol, adaptador do Core, persistência JSON e interface, de modo a viabilizar a medição de cobertura do RF-19 apenas sobre o núcleo.
- **DT-08 — SpecKit como primeira opção.** Adotar GitHub SpecKit como ferramenta SDD, registrando a escolha na `constitution` (RF-21/RF-23); OpenSpec permanece como alternativa se a dupla preferir.
- **DT-09 — Cobertura do núcleo.** Medir gerador, adaptador e serialização; gerar relatório versionado e atualizar `README.md` junto com a contagem de testes a cada entrega (RF-19/RF-20). Depende de Q-10.
- **DT-10 — Validação antes da execução.** Validar o Portugol gerado (pelo parser real, quando disponível) antes de executar, e converter eventuais erros do Core em mensagens pt-BR no adaptador. Depende de Q-04.

---

## 8. Critérios de conclusão desta etapa

- [x] `README.md` e `CONTRIBUTING.md` lidos.
- [x] Requisitos do escopo mínimo numerados como `RF-01` a `RF-24`.
- [x] Restrições, escopo completo, bônus e perguntas registrados.
- [x] Tag da turma sinalizada como não confirmada; versão substituta fixada pela dupla registrada em `docs/decisoes.md` (D-06).
- [x] Decisões técnicas apresentadas como propostas sujeitas à revisão da dupla.
- [x] Nenhum outro arquivo alterado e nenhum código implementado.

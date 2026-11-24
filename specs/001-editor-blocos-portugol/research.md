# Pesquisa: Editor de blocos com Portugol e execução no Core

**Funcionalidade**: [spec.md](./spec.md) | **Plano**: [plan.md](./plan.md)

**Data**: 2026-11-23

**Situação**: Fase 0 concluído. Não restam marcadores `NEEDS CLARIFICATION`; a
tag original da turma não pôde ser confirmada e a dupla fixou a versão
substituta `meuPia/core v1.4.1` @ `68824d7f9e91f71670f3f466c0a5865a8685f020`,
conferida remotamente e registrada em `docs/decisoes.md` (D-06).

## Tarefas de pesquisa

| Tema | Pergunta | Resultado |
| --- | --- | --- |
| R1 | Qual interface pública do Core compila/valida Portugol? | CLI documentada `meupia <arquivo.por>` |
| R2 | Como o `leia` recebe entrada? | Uma linha por `leia`; viável via stdin no processo gerado |
| R3 | Como erros são reportados? | Compilação em pt-BR; execução pode vir em inglês |
| R4 | Existe timeout documentado? | Não; precisa ser imposto pelo editor/runner |
| R5 | Como comparar a saída? | Normalizar só CRLF/LF; `escreva` sempre quebra linha |
| R6 | Qual ferramenta de cobertura? | Vitest + `@vitest/coverage-v8` |
| R7 | Qual tag fixar? | Pendente de confirmação da turma |

## Constatações

### R1 — Interface pública do Core para parsing e execução

- **Decisão**: usar o comando público `meupia <arquivo.por>` como etapa de
  validação/compilação e `python output/<nome>.py` como etapa de execução. O
  adaptador envia o Portugol gerado em um arquivo `.por` temporário e captura
  a saída do comando; mocks são permitidos apenas em testes unitários.
- **Justificativa**: é a única interface de compilação documentada oficialmente no
  README e no Guia da Linguagem. O código publicado mostra que `main()` executa
  analisadores léxico, sintático e semântico e só então gera o Python; portanto
  o sucesso da compilação é a prova de que o parser real aceitou o código.
  Não há API documentada para "parsear string em memória", então o teste de
  aceitação usa arquivo e CLI reais. Mocks são permitidos apenas em testes
  unitários e de integração do adaptador, nunca no teste de aceitação.
- **Alternativas consideradas**: importar módulos internos (`lexical_analyzer`,
  `syntax_analyzer.Parser`, `semantic_analyzer.SemanticAnalyzer`) foi
  descartado por não ser interface pública documentada e por acoplar o editor
  à estrutura interna do compilador. Reimplementar o parser foi descartado por
  violar RT-02 e a própria finalidade da PoC.
- **Fontes** (consultados em 2026-11-23):
  - README oficial: https://github.com/meuPia/core
  - Guia da Linguagem: https://raw.githubusercontent.com/meuPia/core/main/docs/guia-da-linguagem.md
  - `setup.py` (entry point `meupia=meuPia.compiler:main`): https://raw.githubusercontent.com/meuPia/core/main/setup.py
  - `meuPia/compiler.py`: https://raw.githubusercontent.com/meuPia/core/main/meuPia/compiler.py
  - PyPI `meupia-core` 1.4.1: https://pypi.org/pypi/meupia-core/json

### R2 — Entrada do bloco `leia`

- **Decisão**: proposta da PoC é oferecer um campo "Entradas" no editor, com
  um valor por bloco `leia`, salvo no JSON como `entrada`. Antes da execução, o
  runner entrega esses valores à entrada padrão do processo Python gerado, na
  ordem em que os blocos aparecem.
- **Justificativa**: o Guia da Linguagem define que `leia(v)` espera o usuário
  digitar uma linha e mostra blocos `entrada` com uma linha por `leia`. Isso é
  compatível com fornecer as linhas previamente ao processo, sem tocar no Core.
- **Alternativas consideradas**: prompt interativo no navegador foi descartado
  para a PoC porque exigiria interromper a execução e sincronizar a interface;
  o CLI não expõe uma API documentada de injeção de entrada.

### R3 — Erros e idioma

- **Decisão**: erros de compilação são exibidos no painel de saída, sem
  apagar o projeto. O adaptador preserva o programa atual e mostra a mensagem
  recebida; erros de execução em inglês são mapeados para frases em pt-BR
  sempre que reconhecidos.
- **Justificativa**: o Guia da Linguagem documenta mensagens de compilação no
  formato `Erro <etapa> na linha L, coluna C: <descrição>`, em pt-BR, com
  etapas léxico/sintático/semântico. No código, o CLI prefixa falhas com
  `[COMPILATION ERROR]:`. Porém o próprio guia afirma que erros durante a
  execução são mostrados pelo Python em inglês (ex.: `ZeroDivisionError`),
  com exceção de coleções, que têm mensagens em pt-BR.
- **Alternativas consideradas**: traduzir no Core foi descartado por RT-02;
  exibir a mensagem crua em inglês violaria RF-05/RT-04.
- **Incompatibilidade**: a proposta "erros exibidos no painel de saída" é
  compatível, mas a exigência de que *todas* as mensagens sejam pt-BR não é
  plenamente atendida pelo Core real. Mitigação: catálogo no adaptador e issue
  no repositório do Core para erros de runtime não traduzidos.

### R4 — Limite de tempo para execução

- **Decisão**: limite proposto de 5 s por execução, medido pelo runner;
  ao expirar, o runner encerra o processo e o painel mostra
  "Execução interrompida: limite de 5 segundos atingido."
- **Justificativa**: nem o README, nem o Guia da Linguagem, nem o `main()` do
  compilador documentam parâmetro de timeout. Laços como
  `enquanto verdadeiro faca` podem não terminar, então o controle precisa
  estar fora do Core.
- **Alternativas consideradas**: depender de timeout do navegador foi
  descartado por não cancellar o processo Python; alterar o Core foi
  descartado por RT-02.
- **Incompatibilidade**: nenhuma contradição com a interface pública — o limite
  é responsabilidade do adaptador, não do Core. É uma lacuna da interface,
  confirmada na versão fixada `v1.4.1` (o Core não documenta timeout).

### R5 — Comparação da saída

- **Decisão**: a comparação do teste de aceitação normaliza apenas
  `\r\n` → `\n` e `\r` → `\n` antes de comparar esperado e obtido. Espaços,
  acentuação e pontuação continuam exatos.
- **Justificativa**: o Guia da Linguagem afirma que `escreva` mostra os valores
  colados e pula uma linha no final. A diferença CRLF/LF depende do sistema
  operacional do processo, não do programa. Normalizar espaços ou acentos
  esconderia defeitos reais na geração do Portugol.
- **Alternativas consideradas**: comparação byte a byte foi descartada por
  tornar o teste frágil entre Windows e Linux; normalização ampla foi
  descartada por mascarar erros de saída.

### R6 — Ferramenta e comando de cobertura

- **Decisão**: Vitest com provider `@vitest/coverage-v8`. Comando canônico:
  `npx vitest run --coverage`. Scripts propostos: `npm test`,
  `npm run test:acceptance` e `npm run coverage`.
- **Justificativa**: integra nativamente com JavaScript/Node, gera resumo legível
  e relatório HTML/LCOV; atende RF-19 com medição do núcleo (gerador,
  adaptador e persistência).
- **Alternativas consideradas**: Jest foi descartado por configuração adicional
  para ESM e cobertura; Istanbul puro foi descartado por exigir integração
  manual com o runner de testes.
- **Local do relatório**: `coverage/` na raiz do repositório, versionado, com
  `index.html`, `lcov.info` e `coverage-summary.json`. O `.gitignore` não deve
  ignorar esse diretório. O topo do `README.md` é atualizado com os valores
  reais do resumo a cada entrega (RF-20).

### R7 — Versão do Core (substituta da tag da turma)

- **Decisão**: a tag original da turma (Q-01/RT-01) não pôde ser confirmada. A
  dupla fixou `meuPia/core v1.4.1`, commit
  `68824d7f9e91f71670f3f466c0a5865a8685f020`, como versão substituta para o
  manifesto, o adaptador e o ambiente de aceitação. Ela não é apresentada como
  a tag original da turma.
- **Evidência**: `git ls-remote --tags https://github.com/meuPia/core.git
  "refs/tags/v1.4.1*"` retorna `b6a8fc8963629af441267388c2ce218e18b5d877`
  (objeto da tag anotada) e `68824d7f9e91f71670f3f466c0a5865a8685f020`
  (`refs/tags/v1.4.1^{}`). O `direct_url.json` do pacote instalado
  (`meupia-core==1.4.1`) aponta para o mesmo commit.
- **Justificativa**: a tag não aparece nos arquivos oficiais consultados
  (`README.md` e `CONTRIBUTING.md` deste fork). A dupla explicitamente assumiu
  a versão `1.4.1` em 2026-11-23, o que a torna uma decisão registrada, não uma
  suposição.
- **Resultado**: o aceite real com `dobrar-entrada.json` (entrada `3` → saída
  `6`) passou nessa versão; ver `docs/verificacao-final.md` e D-06.

## Incompatibilidades das propostas da PoC com a interface pública

| Proposta da PoC | Compatibilidade | Ajuste necessário |
| --- | --- | --- |
| Entrada do `leia` fornecida antes da execução | Compatível no comportamento | Não há API documentada de injeção; o runner entrega linhas via stdin do processo gerado. |
| Erros no painel de saída sem apagar o projeto | Parcialmente compatível | Erros de compilação já vêm em pt-BR; erros de runtime podem vir em inglês e exigem catálogo no adaptador + issue no Core. |
| Limite de tempo para execução | Lacuna da interface | Confirmado em `v1.4.1`: o Core não documenta timeout; o runner aplica o limite de 5 s. |
| Comparação normalizando só quebras de linha Windows/Linux | Compatível | Aplicar normalização apenas no comparador do teste, não na exibição ao usuário. |
| Chamada ao parser e à execução por interface pública | Compatível | Usar `meupia <arquivo.por>` e `python output/<nome>.py`; não importar módulos internos. |

## Pendências

- Confirmação da tag **original** da turma (Q-01) — substituída, para fins de
  integração, pela versão fixada em D-06. As verificações já executadas nela
  estão em [plan.md](./plan.md#verificações-na-versão-fixada) e em
  `docs/verificacao-final.md`.
- Confirmação documental de tipos/operadores na versão fixada (T026/T007).
- Versão/licença do Blockly e diretório de cobertura já registrados em D-01
  (`blockly@12.5.1`, Apache-2.0, `coverage/`).
- Regra definitiva de mensagens de erro de runtime traduzidas versus exibidas
  conforme recebidas do Core.

# Modelo de dados: Editor de blocos com Portugol e execução no Core

**Funcionalidade**: [spec.md](./spec.md) | **Plano**: [plan.md](./plan.md)

**Data**: 2026-11-23

## Visão geral

O modelo descreve apenas dados observáveis pelo estudante ou necessários aos
contratos entre editor, gerador e runner. A versão do Core está fixada em
`meuPia/core v1.4.1` (commit `68824d7f9e91f71670f3f466c0a5865a8685f020`, D-06);
a tag original da turma não pôde ser confirmada. Tipos e operadores exatos
continuam pendentes de confirmação documental em T026/T007 (RT-01).

## Entidades

### Projeto em blocos (`ProjetoJSON`)

Artefato salvo e carregado pelo estudante (RF-13, RF-14, RF-15).

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `versao` | inteiro | sim | Deve ser `1` nesta PoC. |
| `titulo` | texto | sim | De 1 a 80 caracteres; exibido no cabeçalho. |
| `blocos` | lista de `BlocoSerializado` | sim | Pode ser vazia; a ordem define a execução. |
| `entrada` | lista de valores | sim | Uma posição por bloco `leia`, na ordem dos blocos. |

### Bloco serializado (`BlocoSerializado`)

Unidade de programa no JSON (spec, "Entidades principais").

| Campo | Tipo | Obrigatório | Quando aparece |
| --- | --- | --- | --- |
| `tipo` | texto | sim | Sempre; deve pertencer ao catálogo da tag confirmada. |
| `variavel` | texto | não | Blocos `leia`, `atribuir` e declaração de variável. |
| `tipoVariavel` | texto | não | Declaração de variável; valor aceito depende da tag. |
| `expressao` | texto | não | `atribuir`, `escreva`, condições e operadores. |
| `condicao` | texto | não | Blocos `se` e `enquanto`. |
| `inicio`, `fim`, `passo` | inteiro | não | Bloco `para`. |
| `ramos` | objeto | não | Bloco `se`: mapa `entao` e `senao` com listas de blocos. |
| `corpo` | lista de blocos | não | Blocos `enquanto` e `para`. |

### Estado do editor (`EstadoDoEditor`)

Estado em memória que alimenta os três painéis (RF-01, RF-03).

| Campo | Tipo | Regra |
| --- | --- | --- |
| `projeto` | `ProjetoJSON` | Única fonte de verdade do programa atual. |
| `portugolGerado` | texto | Recalculado a cada mudança em `projeto.blocos`. |
| `statusExecucao` | enum | `parado`, `compilando`, `executando`, `sucesso`, `erro`, `limite`. |
| `mensagens` | lista de texto | Todas em pt-BR; exibidas no painel de saída. |
| `projetoAnterior` | `ProjetoJSON` ou nulo | Guardado antes de uma tentativa de carga para permitir reversão. |

### Resultado da execução (`ResultadoDaExecucao`)

Retorno do runner para o editor (RF-05, RF-17).

| Campo | Tipo | Regra |
| --- | --- | --- |
| `status` | enum | `sucesso`, `erro_compilacao`, `erro_execucao`, `limite`. |
| `saida` | texto | Conteúdo capturado da saída padrão; exibido sem alteração. |
| `erro` | texto | Mensagem em pt-BR, inclusive quando traduzida pelo adaptador. |
| `duracaoMs` | inteiro | Tempo decorrido; usado para verificar o limite de 5 s. |
| `interrompidoPorLimite` | booleano | Verdadeiro somente no status `limite`. |

### Missão do Desafios (`MissaoJSON`) — EC-01

Artefato JSON público consumido pelo editor (FR-024).

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `id` | texto | sim | Identificador sem espaços; usado no seletor da interface. |
| `titulo` | texto | sim | Exibido ao estudante quando a missão está ativa. |
| `descricao` | texto | sim* | Texto em Markdown; `instrucoes` é aceito como apelido. |
| `codigoInicial` | texto | sim | Fonte das construções usadas na derivação dos blocos. |
| `codigoTeste` | texto | sim | Metadado do Desafios; não é executado pelo editor. |
| `mapa` | objeto | não | Campo extra de missões de grid; ignorado (R8). |

\* Um dos dois (`descricao` ou `instrucoes`) deve estar presente.

### Conjunto de blocos permitidos (`BlocosPermitidos`) — EC-01

| Campo | Tipo | Regra |
| --- | --- | --- |
| `missaoId` | texto ou nulo | `null` representa "sem missão", isto é, catálogo completo. |
| `tipos` | lista de texto | Subconjunto do catálogo do editor, em ordem canônica; pode ser vazia somente se a missão não usar construções conhecidas. |

Derivação determinística: `codigoInicial` + `descricao` → remoção de comentários
`//` e literais entre aspas → mapeamento de construções para tipos de bloco →
interseção com o catálogo → ordenação pela toolbox. Nenhum campo
`blocosPermitidos` é lido do arquivo da missão (D-07).

### Blocos de módulo (`BlocoModulo`) — EC-02

Extensão de `BlocoSerializado` para o módulo Grid.

| `tipo` | Campos | Portugol gerado |
| --- | --- | --- |
| `usar_grid` | nenhum | `usar "grid"` (uma vez, logo após `algoritmo`) |
| `grid_iniciar` | `largura`, `altura` (inteiros) | `grid_iniciar(largura, altura)` |
| `grid_visitar` | `x`, `y`, `passo` (inteiros) | `grid_visitar(x, y, passo)` |

A diretiva é deduzida da presença de `usar_grid`; blocos de módulo sem esse
tipo não devem ser oferecidos, e a geração não duplica a diretiva quando há
mais de um bloco de módulo.

## Regras de validação

- `versao` diferente de `1` ⇒ recusar com "Versão de projeto incompatível."
  e manter `EstadoDoEditor.projeto` inalterado (RF-15).
- `tipo` desconhecido ⇒ recusar com "Bloco não reconhecido: <tipo>."
  (RF-15); o catálogo é fixado após a confirmação da tag.
- `entrada` com quantidade diferente do número de blocos `leia` ⇒ recusar
  com "Informe um valor para cada bloco de leitura." (RF-07, RF-15).
- `expressao`, `condicao`, `inicio`, `fim` e `passo` são validados somente
  contra tipos e operadores aceitos na tag confirmada (RF-06, RF-12).
- `titulo` vazio ou maior que 80 caracteres ⇒ recusar com mensagem em pt-BR.
- JSON sintaticamente inválido ⇒ recusar com "O arquivo não contém um JSON
  válido." sem tocar no programa aberto.
- Missão sem `id`, sem `titulo`, sem texto de descrição ou sem `codigoInicial`
  ⇒ recusar em pt-BR sem trocar a toolbox nem o programa aberto (FR-028).
- Bloco de módulo com coordenada, passo ou dimensão não inteira ⇒ recusar em
  pt-BR antes da geração (US10, cenário 3).
- Nenhuma validação pode apagar `projetoAnterior` antes de a carga ser aceita.

## Transições de estado

```text
Vazio
  └─ encaixar bloco → Montado
Montado
  ├─ alterar bloco → PortugolAtualizado → Montado
  ├─ salvar → Salvo → Montado
  ├─ carregar válido → Carregado → PortugolAtualizado
  ├─ carregar inválido → Montado (inalterado, mensagem em pt-BR)
  └─ executar → Compilando
Compilando
  ├─ parser aceita → Executando → Sucesso | ErroExecucao | Limite
  └─ parser recusa → ErroCompilacao → Montado (projeto preservado)
Sucesso | ErroExecucao | Limite
  └─ nova alteração → PortugolAtualizado → Montado
```

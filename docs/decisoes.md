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
temporário, comando público, stdin, limite de 5 s e `ResultadoDaExecucao`). A
estrutura do runner mantém a CLI **injetada como dependência**, o que permite o
teste unitário sem Python; os valores de comando, prefixos e mensagens foram
confirmados na versão fixada (D-06).

- Comandos confirmados: `meupia <arquivo.por>` e `python output/<nome>.py`.
- Prefixos confirmados: `[COMPILED SUCCESSFULLY]` e `[COMPILATION ERROR]:`.
- Nenhum módulo interno do Core é importado (RT-02).
- O teste unitário usa CLI simulada **somente fora de `tests/acceptance/`**; o
  aceite real (T017) passou com o Core `v1.4.1` (D-06).

## D-03 — Execução indisponível na interface

Enquanto a tag original não era confirmada, o botão "Executar" não fingia
sucesso: o painel "Saída da execução" exibia, em pt-BR,
"Execução indisponível: tag do Core ainda não confirmada.", e o projeto aberto
permanecia intacto.

> Atualização de 2026-11-23: com a ponte local de D-05 o botão passou a tentar
> a CLI real. Sem o Core fixado instalado, a saída mostrava
> `Erro na compilação: spawnSync meupia ENOENT`, sem simular sucesso. Após a
> instalação da versão de D-06, o botão executa o Core real e a saída é a do
> processo. A mensagem original continua reservada como fallback.

## D-04 — Sintaxe provisória dos novos blocos (T026/T028/T030/T032)

A tag original da turma (Q-01) não pôde ser confirmada. A versão substituta
`v1.4.1` (D-06) está fixada, mas a **confirmação documental** de tipos e
operadores em T026/T007 ainda está pendente; por isso a implementação de
operadores, `se/senão`, `enquanto` e `para` continua usando a **mesma tabela
provisória** já adotada em `src/generation/sintaxe.js`, extraída do Guia da
Linguagem público do Core:

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

> Atualização de 2026-11-23: as formas efetivamente usadas na demo — `+`, `*`,
> `>`, `<`, `<-`, `leia`, `escreva`, `se/entao/senao/fim_se`,
> `enquanto/faca/fim_enquanto` e `para/de/ate/passo/faca/fim_para` — foram
> **executadas com sucesso no Core `v1.4.1`**, no navegador e pelo adaptador real
> (`docs/verificacao-final.md`). A tabela continua marcada como provisória apenas
> porque a confirmação **documental** de D-04/T026/T007 ainda não foi feita.

## D-05 — Ponte local entre o navegador e a CLI do Core

O navegador não pode chamar `meupia`/`python` diretamente. `vite.config.js`
registra o middleware `/api/executar`, que recebe o `ProjetoJSON`, gera o
Portugol com o gerador puro e repassa ao adaptador de `src/core/runner.js`.
Nada é mockado: a ponte usa a configuração centralizada em
`src/core/configuracao.js` e a CLI apontada por `MEUPIA_COMANDO`/`MEUPIA_PYTHON`.

Execução real tentada em 2026-11-23 no navegador (`http://127.0.0.1:5200/`),
**antes** de instalar o Core fixado:

- Projeto canônico `3 → 6` carregado; Portugol gerado com `leia(x)`,
  `x <- x * 2` e `escreva(x)`; entrada `3`.
- Saída obtida: `Erro na compilação: spawnSync meupia ENOENT`.

Depois de instalar a versão de D-06, o mesmo projeto foi executado pelo
adaptador real com saída `6\r\n` (ver D-06). Nenhum mock foi criado em
`tests/acceptance/`.

## D-06 — Versão substituta do Core e aceite real (T006/T007/T013/T017)

A tag original da turma **não pôde ser confirmada** (Q-01). A dupla fixou
`meuPia/core v1.4.1` como versão substituta:

| Campo | Valor |
| --- | --- |
| Repositório | `https://github.com/meuPia/core.git` |
| Tag | `v1.4.1` (anotada) |
| Objeto da tag | `b6a8fc8963629af441267388c2ce218e18b5d877` |
| **Commit (`refs/tags/v1.4.1^{}`)** | **`68824d7f9e91f71670f3f466c0a5865a8685f020`** |
| Pacote instalado | `meupia-core==1.4.1` |
| Conferência local | `direct_url.json` do venv aponta para o mesmo commit |

Comando de conferência da referência remota:

```bash
git ls-remote --tags https://github.com/meuPia/core.git "refs/tags/v1.4.1*"
# b6a8fc8963629af441267388c2ce218e18b5d877  refs/tags/v1.4.1
# 68824d7f9e91f71670f3f466c0a5865a8685f020  refs/tags/v1.4.1^{}
```

A configuração do editor fica em `src/core/configuracao.js`: comandos públicos
`meupia <arquivo.por>` e `python output/<nome>.py`, prefixos
`[COMPILED SUCCESSFULLY]` / `[COMPILATION ERROR]:`, diretório `output`, limite
de 5 s, e as variáveis opcionais `MEUPIA_COMANDO`/`MEUPIA_PYTHON` para apontar
ao ambiente que instalou exatamente essa tag. `vite.config.js` e o runner
consomem essa mesma configuração.

Resultado medido em 2026-11-23 com `tests/fixtures/dobrar-entrada.json`
(entrada `3`; Portugol com `leia(x)`, `x <- x * 2`, `escreva(x)`):

```json
{"status":"sucesso","saida":"6\r\n","erro":"","duracaoMs":343,"interrompidoPorLimite":false}
```

Comando para reproduzir (Windows/PowerShell, na raiz do repositório):

```powershell
python -m venv .venv-core
.\.venv-core\Scripts\python.exe -m pip install "git+https://github.com/meuPia/core.git@v1.4.1"
$env:MEUPIA_COMANDO = "$PWD\.venv-core\Scripts\meupia.exe"
$env:MEUPIA_PYTHON  = "$PWD\.venv-core\Scripts\python.exe"
npm run test:core-real
npm run test:acceptance
```

`npm run test:core-real` imprime o Portugol gerado, o `ResultadoDaExecucao` e a
linha `ACEITE REAL: OK (entrada 3 -> saída 6)`. O teste em
`tests/acceptance/dobrar-entrada.test.js` usa o Core real, sem mock.

## D-07 — Formato e derivação das missões do Desafios (EC-01, Q-08)

Fonte consultada em 2026-11-23:
https://raw.githubusercontent.com/meuPia/desafios/main/README.md e os 14
arquivos `.json` listados por
`https://api.github.com/repos/meuPia/desafios/git/trees/main?recursive=1`.

O README documenta `id`, `titulo`, `instrucoes` e `codigoTeste`, mas **todos**
os arquivos reais usam `descricao` e `codigoInicial` (três também trazem
`mapa`). Nenhum traz lista de blocos, ferramentas ou categorias. Decisão:

- O loader aceita `id`, `titulo`, `descricao` (ou `instrucoes` como apelido),
  `codigoInicial` e `codigoTeste`, e ignora `mapa` e outros campos extras.
- A derivação do conjunto permitido lê `codigoInicial` e `descricao`, remove
  comentários `//` e literais de texto, e mapeia construções para os tipos de
  bloco do catálogo do editor em ordem canônica (a ordem do arquivo não altera
  o resultado).
- Missões usadas no teste de filtros: `calculo_gn_taximetro` (deriva
  `declarar`, `escreva`, `op_soma`) e `fila_prioridade_simples` (deriva
  `declarar`, `atribuir`, `escreva`, `se`, ambos do código e da descrição).
- Sem missão, a toolbox completa do escopo mínimo é preservada (RT-06).

## D-08 — Módulo escolhido para EC-02 (Q-07)

O README de `meuPia/grid` contém apenas `# grid` (6 bytes): não há API
documentada lá. Ainda assim, as missões oficiais
`a_estrela_manhattan.json`, `entregador_pizza.json` e `fuga_labirinto.json`
documentam o uso público `usar "grid"` com `grid_olhar(x, y)`,
`grid_visitar(x, y, passo)` e `grid_chegou_objetivo(x, y)`; o Core `v1.4.1`
registra `grid` em `PLUGIN_IMPORT_MAP`
(`from meupia_grid.plugin_grid import *`). Essa é a interface pública
considerada. A lacuna do README é registrada como pendência documental
(RT-03), sem issue publicada nesta entrega porque nenhum push foi feito.

Alternativas avaliadas:

| Módulo | Motivo da não escolha |
| --- | --- |
| Maker | README com sintaxe antiga (`fimenquanto`, `fimalgoritmo`), comando `mpm install` obsoleto, `iot_ler` documentado mas não implementado e pacote em `maker/` enquanto o Core espera `meupia_maker`. |
| IA | Interface documentada e instalável (`mpgp instale ia`), porém a primeira execução com scikit-learn levou ~38 s no ambiente de aceite, incompatível com o limite de 5 s do runner; a chamada `ia_treinar(0.0)` também falha nas versões atuais do scikit-learn. |

Evidência real com Grid (`mpgp instale grid`, commit
`3ae471fff99c7a7aa6d3da254db660f1756bc9f1`, `meupia-grid==1.0.2`):

```portugol
algoritmo "Grid do Iniciante"
usar "grid"

inicio
    grid_iniciar(3, 3)
    grid_visitar(2, 3, 1)
    escreva("celula visitada")
fim_algoritmo
```

Compilação em 338 ms com `[COMPILED SUCCESSFULLY]` e execução em 193 ms com:

```text
[Mock Grid] Grid inicializado com tamanho 3x3
[Mock Grid] Célula (2, 3) visitada no passo 1
celula visitada
```

As linhas `[Mock Grid]` são o comportamento do plugin fora do navegador; o
Core e o plugin executados são os reais, sem mock no editor. Nenhum arquivo do
Core ou do módulo foi copiado para este repositório (RT-02).

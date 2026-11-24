# Verificação final — meuPiá Blocos

**Funcionalidade**: [specs/001-editor-blocos-portugol](../specs/001-editor-blocos-portugol/spec.md)
**Data da medição**: 2026-11-23
**Branch**: `001-editor-blocos-portugol`

## Resultados medidos

| Comando | Resultado |
| --- | --- |
| `npm test` | 18 arquivos, **67 testes**, 0 falhas com o Core configurado (sem ele: 66 passam e 1 aceite é `skipped`) |
| `npm run coverage` | **93,69% linhas**, **93,69% declarações**, **80,58% desvios**, **94,28% funções** |
| `npm run test:acceptance` | **1 arquivo, 1 teste, 0 falhas** com o Core real `v1.4.1` |
| `npm run test:core-real` | **ACEITE REAL: OK (entrada 3 -> saída 6)** |
| Verificação no navegador | **8/8 cenários** com Core `v1.4.1`: `3 → 6`, salvar/reabrir `4 → 8`, dois ramos de `se`, `enquanto`, `para` e combinado com entradas `5` e `2`; passada instrumentada com 0 erros de console |

Fonte: `coverage/coverage-summary.json`, regenerado na revisão final.

Durante uma passagem com o Chrome de depuração e o Vite rodando ao mesmo tempo,
o aceite real excedeu o limite de 5 s por carga na máquina. Os processos
temporários foram encerrados e a suíte final passou com 67/67; o limite de 5 s
permanece como requisito de execução, não foi alterado.

### Escopo da cobertura

Conforme `vitest.config.js` e T003, o percentual acima considera apenas o
núcleo puro: `src/generation/`, `src/persistence/` e `src/core/`. Os diretórios
`src/ui/` e `src/blocks/` ficam fora do cálculo, mas são exercitados por testes
unitários de integração e pela verificação no navegador descrita abaixo.

| Arquivo do núcleo | Linhas | Desvios |
| --- | --- | --- |
| `src/core/configuracao.js` | 100% | 25,00% |
| `src/core/runner.js` | 94,95% | 76,66% |
| `src/generation/gerador.js` | 95,61% | 82,50% |
| `src/generation/operadores.js` | 97,95% | 90,00% |
| `src/generation/sintaxe.js` | 100% | 100% |
| `src/persistence/carregar.js` | 100% | 100% |
| `src/persistence/salvar.js` | 100% | 100% |
| `src/persistence/schema.js` | 86,02% | 76,27% |

## Verificação no Blockly real

Ambiente: Chrome headless com CDP, editor servido por
`http://127.0.0.1:5200/`, Blockly `12.5.1`. O programa aninhado abaixo foi
montado pela API pública do workspace (sem mock de blocos), salvo e reaberto:

```text
declarar soma: inteiro
atribuir soma <- 0
para i de 1 ate 3 passo 1 faca
    atribuir soma <- soma + i
    se i > 1 entao
        escreva("sim")
    senao
        escreva("nao")
    fim_se
fim_para
escreva(soma)
```

Observações:

- 4 blocos de topo serializados na ordem esperada; `para` contém `se` com os
  dois ramos aninhados; 2 blocos de operador criados na árvore de expressões.
- Portugol gerado com `se i > 1 entao`, `senao`, `fim_se`, `fim_para` e a seção
  `var` com `soma: inteiro` e `i: inteiro`.
- `Salvar` → `Carregar` preservou **JSON idêntico** e **Portugol idêntico**
  (`portugolPreservado: true`), sem mensagens de erro.
- Painéis "Blocos", "Portugol gerado" e "Saída da execução" visíveis na mesma
  tela; nenhuma exceção ou erro de console registrado no navegador.
- Smoke final sem instrumentação: `temHookDeDebug: false`.

## Execução real no Core fixado

A tag original da turma **não pôde ser confirmada** (Q-01). A dupla fixou
`meuPia/core v1.4.1`, commit
`68824d7f9e91f71670f3f466c0a5865a8685f020`, conferido por
`git ls-remote --tags https://github.com/meuPia/core.git "refs/tags/v1.4.1*"`
(`refs/tags/v1.4.1^{}` aponta para esse commit; o objeto da tag anotada é
`b6a8fc8963629af441267388c2ce218e18b5d877`). O hash completo está registrado na
constitution, no `plan.md`, no `README.md`, em `docs/decisoes.md` (D-06) e em
`src/core/configuracao.js`.

O botão **Executar** usa a ponte `/api/executar` (`vite.config.js`) e o runner
com a configuração fixada, sempre pelas interfaces públicas. Com
`tests/fixtures/dobrar-entrada.json`:

- Portugol gerado: `leia(x)`, `x <- x * 2`, `escreva(x)`, entrada `3`.
- Compilação: `[COMPILED SUCCESSFULLY]`; Python gerado em `output\programa.py`.
- Resultado medido:
  `{"status":"sucesso","saida":"6\r\n","erro":"","duracaoMs":343,"interrompidoPorLimite":false}`.
- `npm run test:acceptance` (teste real, **sem mock**): 1 teste, 0 falhas.

Antes de instalar o Core fixado, a mesma tentativa no navegador produziu
`Erro na compilação: spawnSync meupia ENOENT`; esse erro preciso registrou a
ausência da CLI e motiva a versão fixada.

Comando para reproduzir (Windows/PowerShell, na raiz do repositório):

```powershell
python -m venv .venv-core
.\.venv-core\Scripts\python.exe -m pip install "git+https://github.com/meuPia/core.git@v1.4.1"
$env:MEUPIA_COMANDO = "$PWD\.venv-core\Scripts\meupia.exe"
$env:MEUPIA_PYTHON  = "$PWD\.venv-core\Scripts\python.exe"
npm run test:core-real
npm run test:acceptance
```

## Verificação do escopo mínimo no navegador (Core `v1.4.1`)

Ambiente medido em 2026-11-23: editor servido por
`http://127.0.0.1:5200/` com `MEUPIA_COMANDO`/`MEUPIA_PYTHON` apontando para
`.venv-core` (`meupia-core==1.4.1`), Chrome headless com CDP na porta 9333,
Blockly `12.5.1`. Cada projeto foi carregado pelo input de arquivo real, a
entrada foi preenchida no painel e o botão **Executar** foi acionado por clique
real. Nenhum mock foi usado: a ponte `/api/executar` devolveu
`versaoCore.tag = v1.4.1` e `versaoCore.commit =
68824d7f9e91f71670f3f466c0a5865a8685f020` em todas as execuções.

| Fixture versionada | Cenário | Entrada | Saída esperada | Saída obtida | Resultado |
| --- | --- | --- | --- | --- | --- |
| `tests/fixtures/se-entao.json` | `se` → ramo `entao` | `5` | `maior` | `maior` | OK (`status: sucesso`) |
| `tests/fixtures/se-senao.json` | `se` → ramo `senao` | `2` | `menor` | `menor` | OK (`status: sucesso`) |
| `tests/fixtures/enquanto.json` | `enquanto` (`x < 3`) | — | `0`, `1`, `2` | `0`, `1`, `2` | OK (`status: sucesso`) |
| `tests/fixtures/para.json` | `para` (`1` a `3`, passo `1`) | — | `1`, `2`, `3` | `1`, `2`, `3` | OK (`status: sucesso`) |
| `tests/fixtures/escopo-minimo-combinado.json` | `se` + `enquanto` + `para` | `5` | `maior`, `0`, `1`, `1`, `2` | `maior`, `0`, `1`, `1`, `2` | OK (`status: sucesso`) |

Comparação realizada após normalizar apenas CRLF/CR para LF. O Portugol gerado
no programa combinado incluiu `se x > 3 entao` / `senao` / `fim_se`,
`enquanto n < 2 faca` / `fim_enquanto` e `para i de 1 ate 2 passo 1 faca` /
`fim_para`, todos aceitos pelo parser real.

**Salvar → reabrir → executar novamente:** o JSON gerado pelo botão **Salvar**
continha `se`, `enquanto` e `para`; após recarregá-lo, título `Escopo minimo
combinado`, entrada `5`, 12 blocos no DOM e Portugol idêntico ao anterior
(`portugolPreservado: true`). A reexecução produziu novamente
`maior / 0 / 1 / 1 / 2` com `status: sucesso`.

Os três painéis ("Blocos", "Portugol gerado", "Saída da execução") estavam
visíveis na mesma tela. A primeira passada registrou apenas um `404` de
`favicon.ico`; foi corrigido com um ícone SVG embutido em `index.html` e a
reexecução final registrou **0 exceções e 0 erros de console**.

Para repetir a verificação no navegador, suba a ponte com o Core configurado e
use o roteiro de [`docs/demo.md`](demo.md):

```powershell
$env:MEUPIA_COMANDO = "$PWD\.venv-core\Scripts\meupia.exe"
$env:MEUPIA_PYTHON = "$PWD\.venv-core\Scripts\python.exe"
npx vite --host 127.0.0.1 --port 5200 --strictPort
```

A suíte foi rodada novamente após a correção do ícone: `npm test` com 18
arquivos/67 testes/0 falhas e `npm run coverage` com 93,69% linhas e
declarações, 80,58% desvios e 94,28% funções — mesmos valores do resumo
versionado, atualizados no topo do `README.md`.

## Validação manual final (Core `v1.4.1`)

Validação concluída no navegador em 2026-11-23, com o editor servido na porta
5200 e `MEUPIA_COMANDO`/`MEUPIA_PYTHON` apontando para `.venv-core`
(`meupia-core==1.4.1`). Os projetos foram carregados pelo botão **Carregar
JSON**, os campos de entrada foram preenchidos na interface e a execução foi
disparada pelo botão **Executar**; nenhum mock foi usado. As saídas foram
comparadas **uma por linha**, após normalizar apenas CRLF/CR para LF.

| Projeto | Ação na interface | Entrada | Saída esperada (por linha) | Saída obtida (por linha) | Resultado |
| --- | --- | --- | --- | --- | --- |
| `tests/fixtures/dobrar-entrada.json` | Carregar → Executar | `3` | `6` | `6` | OK (`status: sucesso`) |
| `tests/fixtures/dobrar-entrada.json` | Salvar → Reabrir → alterar entrada → Executar | `4` | `8` | `8` | OK (`status: sucesso`) |
| `tests/fixtures/escopo-minimo-combinado.json` | Carregar → Executar | `5` | `maior`, `0`, `1`, `1`, `2` | `maior`, `0`, `1`, `1`, `2` | OK (`status: sucesso`) |
| `tests/fixtures/escopo-minimo-combinado.json` | Carregar → alterar entrada → Executar | `2` | `menor`, `0`, `1`, `1`, `2` | `menor`, `0`, `1`, `1`, `2` | OK (`status: sucesso`) |

A reabertura do `dobrar-entrada.json` restaurou blocos, Portugol e campo de
entrada; ao trocar apenas `3` por `4`, a saída passou de `6` para `8`. No
programa combinado, a condição `x > 3` escolheu `maior` com entrada `5` e
`menor` com entrada `2`, enquanto `enquanto` e `para` produziram as mesmas
quatro linhas (`0`, `1`, `1`, `2`) depois do ramo.

> Ressalva mantida: a **tag original da turma não pôde ser confirmada**. A dupla
> fixou `meuPia/core v1.4.1`, commit
> `68824d7f9e91f71670f3f466c0a5865a8685f020`, como versão substituta usada em
> todas as execuções acima.

Ainda pendente, mesmo com a versão fixada:

- Confirmação **documental** de tipos e operadores (T026/T007). A sintaxe de
  `se/senão`, `enquanto`, `para` e dos operadores usados já foi executada com
  sucesso no Core fixado, mas a fonte documental da versão ainda não foi
  registrada como T026 concluído (D-04).
- Traduções definitivas das mensagens do Core (T019).
- Teste de aceite versionado que una reabertura e execução `3 → 6` (T036). O
  fluxo foi verificado manualmente no navegador, inclusive com entrada `4 → 8`
  após salvar e reabrir, mas `tests/acceptance/reabrir-projeto.test.js` ainda
  não existe; por isso T036 continua aberto.
- Fechamento de T042 (quickstart completo, incluindo a recusa de JSON inválido
  na sessão final) e confirmação da tag original da turma (T006). A validação
  manual acima cobre execução e reabertura, mas não substitui o checklist
  integral do quickstart.

## Publicação da branch

Nenhum `push` foi realizado. Para publicar no fork:

```bash
git push -u <remote-do-fork> 001-editor-blocos-portugol
```

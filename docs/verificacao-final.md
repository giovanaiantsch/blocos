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

Fonte: `coverage/coverage-summary.json`, regenerado na revisão final.

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

Ainda pendente, mesmo com a versão fixada:

- Confirmação documental de tipos e operadores (T026/T007) — a sintaxe de
  `se/senão`, `enquanto`, `para` e operadores continua provisória (D-04).
- Traduções definitivas das mensagens do Core (T019).
- Aceite de reabertura com execução real (T036) e fechamento de T040/T042.

## Publicação da branch

Nenhum `push` foi realizado. Para publicar no fork:

```bash
git push -u <remote-do-fork> 001-editor-blocos-portugol
```

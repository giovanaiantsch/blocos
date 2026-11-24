# Verificação final — meuPiá Blocos

**Funcionalidade**: [specs/001-editor-blocos-portugol](../specs/001-editor-blocos-portugol/spec.md)
**Data da medição**: 2026-11-23
**Branch**: `001-editor-blocos-portugol`

## Resultados medidos

| Comando | Resultado |
| --- | --- |
| `npm test` | 17 arquivos, **66 testes**, 0 falhas |
| `npm run coverage` | **93,25% linhas**, **93,25% declarações**, **81,81% desvios**, **94,11% funções** |
| `npm run test:acceptance` | **não executado com sucesso**: depende do Core real e da tag (T006/T007) |

Fonte: `coverage/coverage-summary.json`, regenerado na revisão final.

### Escopo da cobertura

Conforme `vitest.config.js` e T003, o percentual acima considera apenas o
núcleo puro: `src/generation/`, `src/persistence/` e `src/core/`. Os diretórios
`src/ui/` e `src/blocks/` ficam fora do cálculo, mas são exercitados por testes
unitários de integração e pela verificação no navegador descrita abaixo.

| Arquivo do núcleo | Linhas | Desvios |
| --- | --- | --- |
| `src/core/runner.js` | 95,27% | 75,86% |
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

## Tentativa de execução no Core real

O botão **Executar** foi ligado ao adaptador real por `/api/executar`
(`vite.config.js`, D-05). Com o projeto canônico `3 → 6` carregado:

- Portugol gerado: `leia(x)`, `x <- x * 2`, `escreva(x)`, entrada `3`.
- Resultado observado na saída: `Erro na compilação: spawnSync meupia ENOENT`.

O comando `meupia` não está instalado nesta máquina e a tag congelada da turma
(Q-01/T006) não foi confirmada. Logo:

- **A saída `6` não foi validada com o Core real.** Nenhum mock foi usado em
  `tests/acceptance/`.
- Aceite oficial de T017/T036 permanece pendente.
- Traduções definitivas de mensagens do Core (T019) dependem de T007.
- Sintaxe dos novos blocos é provisória (D-04); comandos e prefixos do runner
  são provisórios (D-02).

## Pendências externas

1. Confirmar a tag exata da turma e registrá-la em `docs/decisoes.md` (T006).
2. Repetir as verificações de `plan.md` na tag confirmada (T007).
3. Instalar o Core e rodar `npm run test:acceptance` para validar `3 → 6`
   (T017/T036).
4. Fechar T040/T041 e revisar este documento sem pendências (T042).

## Publicação da branch

Nenhum `push` foi realizado. Para publicar no fork:

```bash
git push -u <remote-do-fork> 001-editor-blocos-portugol
```

# Contrato: Runner do Core

**Funcionalidade**: [spec.md](../spec.md) | **Plano**: [plan.md](../plan.md)

**Data**: 2026-11-23

## Interface pública documentada do Core

Fonte: README oficial, Guia da Linguagem e `setup.py` do repositório
`https://github.com/meuPia/core` (consultados em 2026-11-23).

| Etapa | Comando público | Efeito observável |
| --- | --- | --- |
| Compilação/validação | `meupia <arquivo.por>` | Executa análise léxica, sintática e semântica; gera `output/<nome>.py`. |
| Execução | `python output/<nome>.py` | Executa o programa; `leia` consome uma linha da entrada padrão por chamada. |

O entry point publicado é `meupia=meuPia.compiler:main`. O código publicado
usa os prefixos `[COMPILED SUCCESSFULLY]` e `[COMPILATION ERROR]:`; esses
textos são sinais observáveis, mas precisam ser confirmados na tag da turma.
Não usar módulos internos do compilador: eles não são interface pública
documentada.

## Responsabilidades do adaptador/runner local

Este é um contrato **interno do editor**, não uma alteração do Core.

| Entrada recebida do editor | Tipo | Descrição |
| --- | --- | --- |
| `portugol` | texto | Código gerado pelos blocos. |
| `entrada` | lista de valores | Um valor por bloco `leia`, em ordem. |
| `limiteMs` | inteiro | Limite proposto de 5000 ms para a PoC. |

| Saída devolvida ao editor | Tipo | Descrição |
| --- | --- | --- |
| `status` | enum | `sucesso`, `erro_compilacao`, `erro_execucao`, `limite`. |
| `saida` | texto | stdout capturado, sem normalização. |
| `erro` | texto | Mensagem em pt-BR, com texto do Core quando disponível. |
| `duracaoMs` | inteiro | Tempo total da compilação + execução. |

## Regras

1. Gravar `portugol` em arquivo `.por` temporário e invocar `meupia` com esse
   arquivo; o parser real decide se o código é aceito (RF-17).
2. Somente após sucesso da compilação, executar o Python gerado com a entrada
   informada na stdin, uma linha por valor (RF-07).
3. Cancelar o processo quando `limiteMs` for atingido e devolver `status=limite`
   com mensagem "Execução interrompida: limite de 5 segundos atingido."
4. Manter o projeto intacto em qualquer falha; erros aparecem no painel de
   saída (RF-05).
5. Não substituir o Core por mock no teste de aceitação; mocks só em
   `tests/integration` (constitution, princípio IV).
6. Registrar em pt-BR mensagens de erro de compilação recebidas no formato
   `Erro <etapa> na linha L, coluna C: <descrição>`.
7. Para erros de execução em inglês, aplicar catálogo do adaptador e sinalizar
   a lacuna em issue do Core quando não houver tradução oficial.

## Exemplo de sequência observável (RF-17)

```text
1. Entrada: projeto JSON com blocos [leia(x), atribuir(x, x * 2), escreva(x)]
2. Entrada de execução: [3]
3. Portugol gerado: algoritmo "Dobrar" ... leia(x) ... x <- x * 2 ... escreva(x)
4. Comando: meupia <temporario>.por
5. Resultado esperado: [COMPILED SUCCESSFULLY]
6. Comando: python output/<temporario>.py   (stdin: 3)
7. Saída capturada: "6\n"
8. Comparação com esperado "6\n": igual após normalização CRLF/LF
```

## Verificações dependentes da tag congelada

- Confirmar que o comando e os prefixos de sucesso/erro se mantêm.
- Confirmar o diretório e o padrão de nome do arquivo Python gerado.
- Confirmar a sintaxe de `var`, `leia`, `escreva`, `se/senao`, `enquanto`,
  `para` e dos operadores aceitos.
- Confirmar codificação de caracteres e quebras de linha na saída.
- Confirmar quais erros de runtime ainda são exibidos em inglês.

# Contrato: Missão do Desafios e filtro da toolbox (EC-01)

**Funcionalidade**: [spec.md](../spec.md) | **Plano**: [plan.md](../plan.md) |
**Modelo de dados**: [data-model.md](../data-model.md)

**Data**: 2026-11-23

## Finalidade

Definir como o editor carrega uma missão publicada no meuPiá Desafios e como
dela obtém o conjunto de blocos da toolbox (FR-024 a FR-028). O schema oficial
não possui lista de blocos; portanto a derivação é determinística e testável.

## Formato aceito

```json
{
  "id": "calculo_gn_taximetro",
  "titulo": "Missão: O Taxímetro - Calculando o g(n)",
  "descricao": "### Desafio\nCrie uma função ... some p1, p2 e p3.",
  "codigoInicial": "algoritmo \"Taximetro\"\n\nvar\n    custo_total : inteiro\n...",
  "codigoTeste": "esperar_igual(calcular_gn(15, 20, 10), 45, \"Soma\")"
}
```

| Campo | Obrigatório | Regra |
| --- | --- | --- |
| `id` | sim | Texto não vazio, sem espaços; identifica a missão no seletor. |
| `titulo` | sim | Texto não vazio; exibido na interface. |
| `descricao` | sim* | Texto não vazio; `instrucoes` é apelido aceito (README oficial). |
| `codigoInicial` | sim | Texto; fonte principal da derivação. |
| `codigoTeste` | sim | Texto; metadado, não executado pelo editor. |
| `mapa` | não | Objeto extra de missões de grid; ignorado. |

\* Pelo menos um dos dois: `descricao` ou `instrucoes`.

## Derivação dos blocos permitidos

1. Detectar `usar "grid"` no texto **original** do `codigoInicial`, antes de
   remover literais de texto (a aspas fazem parte do padrão).
2. Limpar o `codigoInicial`: remover comentários `//` até o fim da linha e
   literais entre aspas simples ou duplas. Limpar a descrição: remover marcas
   de Markdown (`*`, `_`, `` ` ``, `#`).
3. Caixar ambos para minúsculas. Procurar operadores **somente no código**
   (a descrição usa `**negrito**` e outros marcadores que não são operadores) e
   procurar as demais construções no código ou na descrição.
4. intersectar o resultado com o catálogo implementado pelo editor e ordenar
   pela ordem canônica da toolbox, ignorando categorias vazias.

| Padrão observado | Tipo de bloco |
| --- | --- |
| `leia(` | `leia` |
| `escreva(` | `escreva`, `expressao_livre` |
| `var` ou `:` seguido de tipo | `declarar` |
| `<-` | `atribuir` |
| `se`, `senao` (código ou descrição) | `se` |
| `enquanto` | `enquanto` |
| `para` | `para` |
| `+`, `-`, `*`, `/` | `op_soma`, `op_subtracao`, `op_multiplicacao`, `op_divisao` |
| `>`, `<`, `==` | `op_maior`, `op_menor`, `op_igual` |
| `e`, `ou`, `nao` como palavras | `op_e`, `op_ou`, `op_nao` |
| `usar "grid"` | `usar_grid` |
| `grid_iniciar(` | `grid_iniciar` |
| `grid_visitar(` | `grid_visitar` |

Construções presentes mas não implementadas (por exemplo `funcao`, `retorne`,
`dicionario`) são **ignoradas**: não geram bloco e não impedem o carregamento.
Isso mantém o editor utilizável com missões reais do Desafios.

## Casos de teste obrigatórios

| Missão | Blocos presentes | Blocos ausentes (prova do filtro) |
| --- | --- | --- |
| `calculo_gn_taximetro` | `declarar`, `escreva`, `expressao_livre`, `op_soma` | `atribuir`, `se`, `enquanto`, `para`, `leia` |
| `fila_prioridade_simples` | `declarar`, `atribuir`, `escreva`, `expressao_livre`, `se` | `op_soma`, `enquanto`, `para`, `leia` |
| `grid-visitar` (exemplo local) | `usar_grid`, `grid_iniciar`, `grid_visitar`, `escreva`, `expressao_livre` | `declarar`, `atribuir`, `se`, `enquanto`, `para` |
| nenhuma | catálogo completo | nenhum |

A mesma missão aplicada duas vezes deve produzir o mesmo conjunto (SC-009).
Uma missão inválida não deve alterar `toolbox` nem `EstadoDoEditor.projeto`.

## Mensagens de recusa

| Situação | Mensagem em pt-BR |
| --- | --- |
| JSON malformado | O arquivo não contém um JSON válido. |
| Campo obrigatório ausente | Missão inválida: informe id, título, descrição e código inicial. |
| Missão inexistente no catálogo | Missão não encontrada. |
| Troca com blocos incompatíveis | A missão usa blocos diferentes dos do programa aberto. Deseja continuar? |

## Rastreabilidade

EC-01 → US9/FR-024–FR-028; Q-08 → R8/D-07; RT-04 → mensagens em pt-BR;
SC-009/SC-010/SC-011 → casos de teste acima.

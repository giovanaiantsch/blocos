# Contrato: Blocos do módulo Grid (EC-02)

**Funcionalidade**: [spec.md](../spec.md) | **Plano**: [plan.md](../plan.md) |
**Modelo de dados**: [data-model.md](../data-model.md)

**Data**: 2026-11-23

## Finalidade

Definir os blocos do módulo Grid, o Portugol que eles geram e a prova de que
esse código é aceito pelo Core real `v1.4.1` (FR-029 a FR-032). Nenhum código
do Core ou do plugin é copiado para este repositório (RT-02).

## Interface pública considerada

A diretiva `usar "grid"` é documentada no Guia da Linguagem `v1.4.1`, seção 10,
e o gerador do Core a converte em `from meupia_grid.plugin_grid import *`. As
funções são documentadas nas missões oficiais `a_estrela_manhattan.json` e
`fuga_labirinto.json` e confirmadas no código publicado do plugin. O README do
repositório do Grid contém apenas `# grid` (lacuna registrada em R9/D-08).

| Bloco | Campos | Uma linha de Portugol |
| --- | --- | --- |
| `usar_grid` | nenhum | `usar "grid"` |
| `grid_iniciar` | `largura`, `altura` | `grid_iniciar(largura, altura)` |
| `grid_visitar` | `x`, `y`, `passo` | `grid_visitar(x, y, passo)` |

Os quatro campos numéricos devem ser inteiros. Valores ausentes ou não
inteiros são recusados antes da geração com mensagem em pt-BR.

## Regras de geração

1. A diretiva é emitida **uma única vez**, imediatamente após a linha
   `algoritmo "<titulo>"`, quando existe pelo menos um bloco `usar_grid` no
   projeto — inclusive em ramos aninhados.
2. A diretiva não é emitida quando não há bloco `usar_grid`, mesmo que o título
   mencione Grid.
3. `grid_iniciar` e `grid_visitar` são comandos de corpo, na ordem em que
   aparecem na lista `ProjetoJSON.blocos`, respeitando a indentação dos ramos.
4. O gerador permanece puro: nenhuma chamada ao plugin, ao Core ou ao DOM.

## Exemplo canônico

Projeto (`tests/fixtures/grid-visitar.json`):

```json
{
  "versao": 1,
  "titulo": "Grid do Iniciante",
  "blocos": [
    { "tipo": "usar_grid" },
    { "tipo": "grid_iniciar", "largura": 3, "altura": 3 },
    { "tipo": "grid_visitar", "x": 2, "y": 3, "passo": 1 },
    { "tipo": "escreva", "expressao": "\"celula visitada\"" }
  ],
  "entrada": []
}
```

Portugol gerado:

```portugol
algoritmo "Grid do Iniciante"
usar "grid"

inicio
    grid_iniciar(3, 3)
    grid_visitar(2, 3, 1)
    escreva("celula visitada")
fim_algoritmo
```

Saída real medida no Core `v1.4.1` com `meupia-grid==1.0.2` (commit
`3ae471fff99c7a7aa6d3da254db660f1756bc9f1`):

```text
[Mock Grid] Grid inicializado com tamanho 3x3
[Mock Grid] Célula (2, 3) visitada no passo 1
celula visitada
```

As duas primeiras linhas vêm do plugin em modo console; a terceira é a saída do
programa. O aceite compara as linhas do programa e exige `[COMPILED SUCCESSFULLY]`.

## Instalação no ambiente de aceite

```bash
mpgp instale grid
```

O `mpgp` da versão fixada exige `setuptools<81` (usa `pkg_resources`); no venv
de aceite foi fixado `setuptools==80.9.0`. Nenhuma alteração foi feita no Core.

## Mensagens de recusa

| Situação | Mensagem em pt-BR |
| --- | --- |
| Campo inteiro ausente ou inválido | Informe um número inteiro para este bloco. |
| Bloco de módulo desconhecido | Bloco não reconhecido: <tipo>. |
| Plugin ausente na execução | Erro de execução reportado pelo Core, sem alterar o projeto aberto. |

## Rastreabilidade

EC-02 → US10/FR-029–FR-032; Q-07 → R9/D-08; RT-02 → nenhuma cópia do Core ou
do plugin; RT-03 → lacuna do README registrada; SC-012 → aceite com Core real.

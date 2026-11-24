# Contrato: Geração de Portugol em tempo real

**Funcionalidade**: [spec.md](../spec.md) | **Plano**: [plan.md](../plan.md) |
**Modelo de dados**: [data-model.md](../data-model.md)

**Data**: 2026-11-23

## Finalidade

Definir a ponte observável entre o painel "Blocos" e o painel "Portugol
gerado" (RF-01, RF-03). O texto produzido aqui é a entrada do runner descrito
em [core-runner.md](./core-runner.md); não existe etapa manual de geração.

## Fluxo entre os três painéis

```text
Blocos (Blockly)
  └─ evento de alteração → EstadoDoEditor.projeto (serialização canônica)
       └─ gerador puro → portugolGerado → painel "Portugol gerado"
            └─ ação "Executar" → runner (CLI pública do Core)
                 └─ saida/erro → painel "Saída da execução"
```

Regras de ligação:

1. Toda alteração em `projeto.blocos`, incluindo inclusão, remoção, desencaixe
   e edição de valor, dispara a regeneração antes de o navegador pintar a tela.
2. O painel de Portugol mostra o texto gerado ou a indicação "Ainda não há
   código.", sem mensagem de erro para projeto vazio (US2, edge case).
3. A ação "Executar" envia exatamente o texto visível no painel ao runner; não
   existe uma segunda geração com parâmetros diferentes (RF-04, RF-17).
4. Falha de compilação ou execução atualiza somente o painel de saída; blocos,
   título e Portugol gerado permanecem intactos (RF-05, RF-15).

## Interface interna do gerador

| Item | Contrato |
| --- | --- |
| Entrada | `ProjetoJSON.blocos` e `titulo`, já validados. |
| Saída | texto Portugol determinístico para a mesma entrada. |
| Efeitos colaterais | nenhum; sem arquivo, rede, relógio ou estado global. |
| Tempo | conclusão em menos de 1 s em condições normais (SC-003). |
| Idioma | palavras-chave do Portugol conforme a tag; mensagens de ausência em pt-BR. |

## Mapeamento conceitual dos blocos

A sintaxe abaixo é **provisória** até a confirmação documental em T026/T007 na
versão fixada `meuPia/core v1.4.1` (tag original da turma não confirmada,
RT-01/D-06). O gerador fica isolado em `src/generation/sintaxe.js` e
`src/generation/operadores.js` para que apenas essas tabelas sejam ajustadas.

| Bloco (`tipo`) | Campos usados | Saída conceitual | Requisito |
| --- | --- | --- | --- |
| `declarar` | `variavel`, `tipoVariavel` | declaração da variável com tipo aceito | RF-06 |
| `atribuir` | `variavel`, `expressao` | atribuição à variável | RF-06 |
| `leia` | `variavel` | leitura do valor informado antes da execução | RF-07 |
| `escreva` | `expressao` | escrita do valor calculado | RF-08 |
| `se` | `condicao`, `ramos.entao`, `ramos.senao` | decisão com ramo alternativo opcional | RF-09 |
| `enquanto` | `condicao`, `corpo` | repetição enquanto a condição for verdadeira | RF-10 |
| `para` | `variavel`, `inicio`, `fim`, `passo`, `corpo` | repetição com contador | RF-11 |
| `operador` | `expressao` | composição de expressões aritméticas, relacionais e lógicas | RF-12 |

Regras de composição:

- A ordem da lista `blocos` é a ordem das linhas geradas.
- `ramos` e `corpo` são gerados recursivamente, preservando o aninhamento.
- Bloco desencaixado no meio de uma expressão não produz código enganoso: o
  painel sinaliza "Expressão incompleta." em pt-BR e a execução é bloqueada
  (edge case da spec).
- Operadores e tipos fora do conjunto da tag não são oferecidos ou são
  recusados antes da geração, com mensagem em pt-BR (RF-12, RF-15).
- Um bloco `leia` consome uma posição de `entrada`; o gerador não inventa valor.

## Exemplo de aceitação (RF-17)

Entrada canônica do JSON:

```json
{
  "versao": 1,
  "titulo": "Dobrar a entrada",
  "blocos": [
    { "tipo": "leia", "variavel": "x" },
    { "tipo": "atribuir", "variavel": "x", "expressao": "x * 2" },
    { "tipo": "escreva", "expressao": "x" }
  ],
  "entrada": [3]
}
```

Este é o mesmo fixture de [project-json.md](./project-json.md) e da spec;
deve ser copiado exatamente para `tests/fixtures/dobrar-entrada.json`.

Sequência observável esperada:

1. Gerar Portugol equivalente a: leitura de `x`, atribuição `x = x * 2`,
   escrita de `x`.
2. Enviar o texto ao comando público `meupia <arquivo.por>`; o parser real
   aceita o código.
3. Executar o Python gerado com `3` na entrada padrão.
4. Capturar `6` no painel "Saída da execução"; comparação com `6\n` após
   normalizar apenas CRLF/LF.

## Verificações na versão fixada

- ✅ Palavras-chave e pontuação de `var`, `leia`, `escreva` e `<-` confirmadas
  pelo aceite real em `v1.4.1`.
- ✅ `se/entao/senao/fim_se`, `enquanto/faca/fim_enquanto`,
  `para/de/ate/passo/faca/fim_para` e operadores `+`, `*`, `>`, `<`: executados
  com sucesso no navegador com o Core `v1.4.1` (entradas/saídas em
  `docs/verificacao-final.md`). A confirmação documental de todos os tipos e
  operadores de D-04/T026/T007 continua pendente.
- ⏳ Declaração prévia/escopo e formato da mensagem de expressão incompleta:
  pendentes de T026/T007.
- ✅ Codificação e quebras de linha: saída `6\r\n` no Windows (normalização
  CRLF/LF no teste).

## Rastreabilidade

RF-01/RF-03 → fluxo entre painéis; RF-04/RF-17 → texto enviado ao Core real;
RF-05 → preservação do projeto em falhas; RF-06 a RF-12 → tabela de blocos;
RF-15 → recusa em pt-BR; SC-003 → requisito de tempo; RT-01 → verificações
dependentes da tag; RT-02 → nenhuma alteração no Core.

# Contrato: Projeto JSON

**Funcionalidade**: [spec.md](../spec.md) | **Plano**: [plan.md](../plan.md)

**Data**: 2026-11-23

## Finalidade

Definir o envelope salvo e carregado pelo estudante (RF-13, RF-14, RF-15),
usado também como ponto de partida do teste de aceitação (RF-17).

## Formato

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

| Campo | Obrigatório | Tipo | Regra |
| --- | --- | --- | --- |
| `versao` | sim | inteiro | Literal `1` nesta PoC. |
| `titulo` | sim | texto | 1 a 80 caracteres. |
| `blocos` | sim | lista | Ordenada; cada item segue `data-model.md`. |
| `entrada` | sim | lista | Um valor por bloco `leia`, na mesma ordem. |

## Fluxo de carregamento

1. Validar sintaxe do JSON; se inválido, exibir "O arquivo não contém um JSON
   válido." e manter o programa atual.
2. Validar `versao`; se diferente de `1`, exibir "Versão de projeto
   incompatível." e manter o programa atual.
3. Validar cada bloco e a quantidade de entradas; em qualquer falha, exibir a
   mensagem em pt-BR correspondente e manter o programa atual.
4. Se válido, substituir o estado, reconstruir os blocos na área visual e
   disparar a geração automática do Portugol (RF-03, RF-14).
5. Ao executar sem alterações, o projeto reaberto deve produzir a mesma saída
   do projeto original com a mesma entrada (spec, US8).

## Fluxo de salvamento

1. Serializar `versao`, `titulo`, `blocos` e `entrada` a partir do estado atual.
2. Gerar um arquivo `.json` legível, com codificação UTF-8.
3. Não alterar o programa aberto nem o Portugol exibido.
4. O arquivo salvo deve ser suficiente para restaurar o programa em uma nova
   sessão, sem depender de estado local oculto.

## Mensagens de recusa

| Situação | Mensagem exibida |
| --- | --- |
| JSON malformado | O arquivo não contém um JSON válido. |
| Versão diferente de 1 | Versão de projeto incompatível. |
| Tipo de bloco desconhecido | Bloco não reconhecido: <tipo>. |
| Entrada incompleta | Informe um valor para cada bloco de leitura. |
| Título inválido | Informe um título de 1 a 80 caracteres. |

## Rastreabilidade

RF-13 → formato; RF-14 → fluxo de carregamento; RF-15 → mensagens de recusa;
RF-17 → fixture de aceitação; RT-04 → todas as mensagens em pt-BR.

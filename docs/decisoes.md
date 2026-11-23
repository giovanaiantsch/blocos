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
temporário, comando público, stdin, limite de 5 s e `ResultadoDaExecucao`) sem
fixar a versão do Core. Assim, a estrutura do runner pode ser implementada e
testada agora com a CLI **injetada como dependência**; apenas os valores
provisórios de comando, prefixos e mensagens dependem de T007.

- Comandos provisórios: `meupia <arquivo.por>` e `python output/<nome>.py`.
- Nenhum módulo interno do Core é importado (RT-02).
- O teste unitário usa CLI simulada; o aceite com o Core real (T017) continua
  pendente até T006/T007.

## D-03 — Execução indisponível na interface

Enquanto a tag não for confirmada, o botão "Executar" não finge sucesso: o
painel "Saída da execução" exibe, em pt-BR,
"Execução indisponível: tag do Core ainda não confirmada.", e o projeto aberto
permanece intacto.

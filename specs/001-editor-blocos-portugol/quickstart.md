# Guia rápido: validação local da PoC

**Funcionalidade**: [spec.md](./spec.md) | **Plano**: [plan.md](./plan.md) |
**Pesquisa**: [research.md](./research.md)

**Data**: 2026-11-23

Este guia descreve como validar o desenho quando a implementação existir. Nenhum
comando abaixo foi executado nesta etapa de planejamento e nenhum arquivo de
código foi criado aqui.

## Pré-requisitos

- Branch `001-editor-blocos-portugol`.
- Node.js 20 LTS e npm.
- Python 3.8+ com o comando `meupia` disponível no `PATH`.
- Tag congelada da turma confirmada e fixada no manifesto (RT-01); até lá,
  qualquer execução é considerada provisional.
- Blockly na versão/licença aprovada na etapa de implementação.
- Comandos propostos no `package.json`: `dev`, `test`,
  `test:acceptance` e `coverage`.

## 1. Conferir os três painéis e a geração em tempo real (RF-01 a RF-03)

1. Rodar `npm install` e `npm run dev`.
2. Abrir o endereço local indicado no terminal.
3. Confirmar, em uma única tela, os painéis "Blocos", "Portugol gerado" e
   "Saída da execução".
4. Encaixar um bloco de escrita: o Portugol correspondente aparece sem clicar
   em "gerar".
5. Alterar o valor do bloco e removê-lo: o texto muda a cada ação e, ao remover,
   a linha desaparece. Com a área vazia, o painel indica ausência de código sem
   erro (US1, US2, SC-003).

## 2. Validar o exemplo 3 × 2 → 6 com o Core real (RF-04, RF-05, RF-17)

Fixture canônico: `tests/fixtures/dobrar-entrada.json`.

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

Procedimento do teste de aceitação:

1. Carregar o JSON acima como ponto de partida, sem montar blocos à mão.
2. Gerar o Portugol e conferir que ele contém leitura de `x`, atribuição de
   `x * 2` e escrita de `x` (contrato `portugol-generation.md`).
3. Enviar o texto ao comando público `meupia <arquivo.por>` e exigir a prova de
   aceitação do parser real; não usar mock do Core (constitution, princípio IV).
4. Executar o Python gerado com `3` na entrada padrão; o valor é informado
   **antes** da execução, um por bloco `leia` (proposta registrada em
   `research.md` R2).
5. Capturar a saída e conferir `6`. O comparador normaliza somente `\r\n` e
   `\r` para `\n`; espaços, acentos e pontuação permanecem exatos (R5).
6. Rodar `npm run test:acceptance`. O cenário deve passar com parser e execução
   reais, inclusive na esteira de integração contínua.

Critério de sucesso: SC-001 e SC-002 — 100% dos cenários P1 e saída `6` em
todas as execuções do exemplo.

## 3. Salvar, reabrir e repetir (RF-13 a RF-15, US8)

1. No editor, solicitar "Salvar"; conferir que o arquivo JSON contém `versao`,
   `titulo`, `blocos` e `entrada`, em UTF-8.
2. Encerrar a sessão, iniciar uma nova e carregar o arquivo salvo.
3. Confirmar que os blocos foram reconstruídos e que o painel de Portugol foi
   atualizado automaticamente.
4. Executar com a mesma entrada `3` e conferir novamente a saída `6`.
5. Tentar carregar um JSON malformado, com `versao` diferente de `1` ou com
   bloco desconhecido. Cada tentativa deve exibir mensagem em pt-BR e manter o
   programa aberto intacto:
   - "O arquivo não contém um JSON válido."
   - "Versão de projeto incompatível."
   - "Bloco não reconhecido: <tipo>."
   - "Informe um valor para cada bloco de leitura."

Critério de sucesso: SC-004.

## 4. Conferir erros, entrada ausente e limite de tempo (RF-05, RF-07, RF-11)

- Provocar erro de sintaxe no Portugol gerado: a falha aparece no painel de
  saída em pt-BR, sem apagar blocos nem Portugol.
- Executar um programa com `leia` sem informar `entrada`: mensagem em pt-BR,
  aplicação utilizável.
- Executar um laço sem término: após 5 s o runner encerra o processo e exibe
  "Execução interrompida: limite de 5 segundos atingido."; a interface continua
  responsiva (US7, R4). Erros de runtime em inglês recebem tradução do catálogo
  do adaptador; lacunas são registradas em issue do Core (R3).

## 5. Medir cobertura e atualizar métricas (RF-19, RF-20, SC-005)

```bash
npm test
npm run coverage
```

- Ferramenta: Vitest com `@vitest/coverage-v8`.
- Comando canônico equivalente: `npx vitest run --coverage`.
- Relatório versionado: `coverage/` na raiz do repositório, com `index.html`,
  `lcov.info` e `coverage-summary.json`. O diretório não pode estar no
  `.gitignore`.
- Núcleo medido: `src/generation`, `src/persistence` e `src/core`.
- Após a medição, atualizar o topo de `README.md` com a quantidade real de
  testes e o percentual real de cobertura. Nunca publicar `0%` ou números
  estimados.
- Cada commit referencia sua task e cada task referencia `RF-`/`RT-`
  (RF-18/SC-006).

## 6. Demonstração final (RF-24, SC-007)

Roteiro de no máximo 10 minutos, sem código nos slides: abrir o editor →
encaixar blocos do dobro da entrada → mostrar o Portugol atualizando → informar
`3` → executar no Core real → mostrar `6` → salvar e reabrir o JSON → mostrar
a recusa de um arquivo inválido sem perder o programa.

## Pendências antes da implementação

- Confirmar a tag congelada e executar todas as verificações de
  [plan.md](./plan.md#verificações-dependentes-da-tag-congelada).
- Confirmar versão e licença do Blockly.
- Confirmar se o ambiente da turma aceita o diretório `coverage/` versionado.

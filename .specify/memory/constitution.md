<!--
SYNC IMPACT REPORT
Version change: 1.0.0 → 1.1.0 (emenda aprovada pela dupla em 2026-11-23 para
  incluir EC-01 e EC-02 nesta branch, após o escopo mínimo ter passado nos gates)
Modified principles:
  - I. Escopo mínimo primeiro → I. Escopo mínimo primeiro, depois escopo completo
Added sections:
  - parágrafo sobre missões e blocos de módulo em Stack Inicial e Restrições
    Técnicas
Removed sections: nenhuma
Follow-up TODOs:
  - Versão do Core fixada pela dupla: `meuPia/core v1.4.1`, commit
    `68824d7f9e91f71670f3f466c0a5865a8685f020` (Q-01 em docs/requisitos.md).
    A tag original da turma não pôde ser confirmada; esta é a versão substituta
    adotada para a integração e o aceite.
  - Tag original da turma (T006), confirmação documental de tipos/operadores
    (T007/T026), mensagens de runtime (T019), teste de aceite de reabertura
    (T036) e checklist integral do quickstart (T042) permanecem abertos.
  - A derivação dos blocos permitidos a partir de missões e a interface pública
    do módulo escolhido para EC-02 DEVEM ser registradas em `plan.md`,
    `research.md` e `docs/decisoes.md` antes da implementação.
-->

# meuPiá Blocos Constitution

## Core Principles

### I. Escopo mínimo primeiro, depois escopo completo

O editor DEVE entregar primeiro o escopo mínimo (RF-01 a RF-24) e, somente
depois de os gates de qualidade do princípio IV terem passado, DEVE acrescentar
os itens de escopo completo **EC-01** (toolbox por missão) e **EC-02** (blocos
de módulo). O bônus **BX-01** (Portugol → blocos) continua fora desta entrega.
EC-01 e EC-02 DEVEM ser especificados, planejados e decompostos em tasks antes
de qualquer código e NÃO DEVEM regressar o fluxo mínimo já aceito: sem missão
carregada, a toolbox completa e o exemplo `3 → 6` permanecem intactos.

**Justificativa:** a PoC precisava demonstrar primeiro o fluxo essencial do
estudante sem diluir esforço em missões ou módulos não validados. Em
2026-11-23, com o aceite real `3 → 6` e a cobertura medidos, a dupla aprovou a
emenda que inclui EC-01 e EC-02 nesta branch como segundo incremento, mantendo
o mínimo como base e a rastreabilidade SDD integral.

### II. Ecossistema intocado e interfaces públicas

Toda comunicação com o meuPiá Core e seus módulos DEVE ocorrer exclusivamente
pelas interfaces públicas da versão fixada (`meuPia/core v1.4.1`, commit
`68824d7f9e91f71670f3f466c0a5865a8685f020`). O código do Core e dos
módulos NÃO DEVE ser modificado, copiado para este repositório nem substituído
por reimplementação local. Se faltar uma interface pública necessária, a equipe
DEVE abrir issue no repositório do módulo e resolver a integração com um
adaptador no editor (RT-03). Mocks do Core SÃO permitidos apenas em testes
unitários do adaptador, nunca no teste de aceitação.

**Justificativa:** mudanças no compilador pertencem ao repositório do Core; o
adaptador local preserva o ecossistema e concentra o impacto de qualquer API
ausente.

### III. Especificação antes do código e rastreabilidade (NON-NEGOTIABLE)

Nenhum código de aplicação DEVE ser escrito antes de `constitution`, `spec`,
`plan` e `tasks` estarem versionados no repositório. A `spec` DEVE descrever o
quê e o por quê em user stories com critérios de aceite verificáveis e sem
detalhes técnicos. O `plan` DEVE cobrir arquitetura, stack, dados e
integrações. As `tasks` DEVEM ser fatias verticais pequenas. Cada task DEVE
referenciar ao menos um requisito (`RF-`, `RT-` etc.), e cada commit DEVE
referenciar a task que implementa, formando a cadeia commit → task →
requisito. Todo pull request DEVE descrever a mudança e o requisito atendido.

**Justificativa:** a rastreabilidade é o mecanismo que garante que cada linha
de código e cada revisão possam ser ligadas a uma necessidade aprovada.

### IV. Qualidade verificável: aceitação com Core real e cobertura mínima

O teste de aceitação DEVE partir de um projeto em blocos representado em JSON,
gerar o Portugol, submetê-lo ao parser real do meuPiá Core, confirmar que o
parser aceitou o código, executá-lo e comparar a saída obtida com a esperada.
Nenhum mock do parser ou da execução do Core PODE substituir o Core real nesse
teste. O núcleo da lógica — gerador de Portugol, adaptador de integração e
serialização/carga de JSON — DEVE ter cobertura mínima de 80%, com relatório
gerado e versionado no repositório. Componentes de interface e renderização
PODEM ficar fora da medição. O topo do `README.md` DEVE trazer a quantidade
real de testes e o percentual real de cobertura, atualizados a cada entrega;
valores estimados, zerados sem execução ou copiados de outra versão NÃO DEVEM
ser publicados.

**Justificativa:** só o Core real comprova que o Portugol gerado é válido, e
só métricas executadas tornam a qualidade auditável na revisão.

### V. Português do Brasil e experiência do estudante

Interface, documentação, rótulos e todas as mensagens ao usuário DEVEM estar
em português do Brasil, sem exceção no escopo mínimo. O editor DEVE exibir, na
mesma tela, três áreas distintas e identificadas: blocos, Portugol gerado e
saída da execução. Toda alteração no programa em blocos DEVE atualizar o
Portugol automaticamente, sem ação manual. Falhas de parsing e execução DEVEM
ser convertidas pelo adaptador em mensagens compreensíveis em pt-BR, sem
interromper a aplicação. O projeto DEVE ser salvo e carregado em JSON, e um
arquivo inválido ou incompatível DEVE ser recusado com mensagem em pt-BR sem
destruir o programa aberto no editor.

**Justificativa:** o idioma único e o feedback imediato reduzem a barreira de
entrada do estudante e evitam que um erro de JSON apague seu trabalho.

## Stack Inicial e Restrições Técnicas

A stack inicial registada é **Blockly** para a área de encaixe de blocos e
**JavaScript** para a implementação do editor e da lógica de geração. Esta é a
escolha inicial da PoC; qualquer troca DEVE ser feita por emenda desta
constitution, com registro no `plan` e análise de impacto nas tasks e nos
testes. O gerador de blocos → Portugol DEVE ser próprio e independente de DOM,
pois a geração padrão do Blockly produz outras linguagens. Toda comunicação com
o Core DEVE passar por um único adaptador no editor.

A serialização DEVE usar um envelope JSON versionado com `versao`, `titulo` e
os dados dos blocos. A validação do JSON carregado DEVE ocorrer antes de
substituir o programa aberto. Tipos de variáveis, operadores aceitos e o
contrato de entrada/saída do parser DEVEM ser fixados no `plan` a partir da
documentação da versão fixada.

O carregamento de missões (EC-01) DEVE aceitar o schema JSON público do
meuPiá Desafios sem exigir campo proprietário para funcionar. Quando o schema
oficial não trouxer uma lista explícita de blocos, a derivação do conjunto
permitido DEVE ser determinística, documentada no `plan` e testada com pelo
menos duas missões de conjuntos diferentes; sem missão, a toolbox DEVE
permanecer completa. Blocos de módulo (EC-02) DEVEM gerar Portugol compatível
com a diretiva pública `usar "<módulo>"` da versão fixada. Se a interface
pública do módulo estiver ausente ou insuficientemente documentada, aplicam-se
o princípio II e a RT-03 (registro da lacuna + adaptador local), sem copiar,
reimplementar ou alterar o módulo.

**Versão fixada (substituta):** a tag original da turma para o meuPiá Core e
módulos **não pôde ser confirmada** (Q-01 em `docs/requisitos.md`). A dupla
fixou `meuPia/core v1.4.1`, commit
`68824d7f9e91f71670f3f466c0a5865a8685f020`, conferido em
`https://github.com/meuPia/core.git` (`refs/tags/v1.4.1^{}`; objeto da tag
anotada `b6a8fc8963629af441267388c2ce218e18b5d877`). Essa versão — e somente
ela — é a referência para a interface pública, o ambiente de aceitação e o
registro de hash nesta constitution, no `plan` e no `README.md`. O aceite real
com `dobrar-entrada.json` (entrada `3` → saída `6`) está registrado em
`docs/verificacao-final.md`.

A versão e a licença do Blockly, a ferramenta e o diretório do relatório de
cobertura, a convenção exata de mensagem de commit e a regra de comparação da
saída (string exata ou normalização) DEVEM ser definidas no `plan`, sem alterar
os princípios acima.

## Fluxo de Desenvolvimento, Qualidade e Entrega

O fluxo DEVE seguir SDD: especificar → planejar → decompor em tasks →
implementar → testar → abrir pull request. Os artefatos DEVEM ser escritos ou
atualizados antes do código correspondente. Cada pull request DEVE descrever a
mudança, a task implementada, o requisito atendido e o resultado dos testes e
da cobertura.

Os gates de qualidade são: (1) aceitação ponta a ponta com
JSON → Portugol → parser real do Core → execução → saída esperada;
(2) cobertura mínima de 80% sobre o núcleo com relatório versionado;
(3) métricas reais no topo do `README.md`; (4) cadeia
commit → task → requisito íntegra; (5) revisão de conformidade com esta
constitution.

A entrega final DEVE prever demonstração ao vivo de até 10 minutos, sem código
nos slides. O limite de tempo para laços sem término e a forma de entrada do
bloco `leia` no navegador DEVEM ser decididos no `plan`, mantendo a interface
responsiva.

## Governance

Esta constitution prevalece sobre qualquer prática informal do repositório.
Emendas DEVEM ser propostas com descrição da mudança, justificativa, impacto em
`spec`/`plan`/`tasks` e plano de migração quando aplicável; a aprovação da
dupla é necessária antes da aplicação. Toda alteração DEVE atualizar a versão e
o `LAST_AMENDED_DATE`, além de registrar o impacto no relatório de sincronização.

O versionamento segue SEMVER: **MAJOR** para remoção ou redefinição
incompatível de princípio; **MINOR** para princípio ou seção novo(a) ou
orientação materialmente ampliada; **PATCH** para esclarecimentos, correções de
redação e refinamentos sem mudança semântica.

Toda revisão de pull request DEVE verificar a conformidade com os princípios e
com os gates desta constitution. Complexidade adicional DEVE ser justificada no
`plan` e vinculada a um requisito. Para orientação operacional em tempo de
desenvolvimento, usar os artefatos versionados em `.specify/` e o
`CONTRIBUTING.md`.

**Version**: 1.1.0 | **Ratified**: 2026-11-23 | **Last Amended**: 2026-11-23

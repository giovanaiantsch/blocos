# 🧩 meuPiá Blocos

![meuPia](assets/meuPia-blocos-cover.png)

Editor de programação por blocos do ecossistema **meuPiá**. O estudante monta o
programa encaixando blocos, vê o Portugol correspondente nascer ao lado e o
executa pelo meuPiá Core, tudo no navegador. É o primeiro degrau da trilha
meuPiá, antes do Portugol escrito.

> 🚧 **Em construção.** Editor implementado com Spec-Driven Development. A tag
> original da turma **não pôde ser confirmada** (Q-01); a dupla fixou
> **`meuPia/core v1.4.1`**, commit
> `68824d7f9e91f71670f3f466c0a5865a8685f020`, como versão substituta para a
> integração e o aceite.

**Testes:** 95 (24 arquivos, 0 falhas) · **Cobertura:** 95,58% de linhas e
declarações · 80,12% de desvios · 96,42% de funções

Sem `MEUPIA_COMANDO`/`MEUPIA_PYTHON`, `npm test` executa 93 testes e marca os
dois aceites reais como `skipped`; com o Core fixado configurado, os 95 passam.

A cobertura é medida por `npm run coverage` e abrange
`src/generation/`, `src/persistence/`, `src/core/`, `src/missoes/` e
`src/blocks/` (T053). A interface (`src/ui/`) fica fora do percentual e é
verificada por testes de HTML e pela validação no Blockly real. Os números
acima vieram de `coverage/coverage-summary.json`, regenerado no segundo
incremento.

**Aceite real:** `tests/fixtures/dobrar-entrada.json` com entrada `3` produziu
saída **`6`** (`status: sucesso`), usando apenas as interfaces públicas do Core:
`meupia <arquivo.por>` e `python output/<nome>.py`. O segundo aceite,
`tests/fixtures/grid-visitar.json`, gerou `usar "grid"`, `grid_iniciar(3, 3)` e
`grid_visitar(2, 3, 1)` e produziu **`celula visitada`** com o plugin oficial
instalado por `mpgp instale grid`. No navegador, os dois ramos de `se/senão`,
`enquanto`, `para`, salvar → reabrir → executar novamente, o programa combinado,
a troca de missões e o módulo Grid também passaram com o Core `v1.4.1`.
Evidência completa em [`docs/verificacao-final.md`](docs/verificacao-final.md);
roteiro de apresentação em [`docs/demo.md`](docs/demo.md).

Os blocos de operadores, `se/senão`, `enquanto` e `para` usam a sintaxe
registrada em `docs/decisoes.md` (D-04): ela foi **executada com sucesso** na
versão fixada, mas ainda depende da confirmação documental em T026/T007. O botão
Executar chama a CLI real por uma ponte local (D-05); o runner e a ponte leem
`src/core/configuracao.js`, que centraliza a versão e o hash acima.

### Como reproduzir o aceite com o Core real

```powershell
python -m venv .venv-core
.\.venv-core\Scripts\python.exe -m pip install "git+https://github.com/meuPia/core.git@v1.4.1"
$env:MEUPIA_COMANDO = "$PWD\.venv-core\Scripts\meupia.exe"
$env:MEUPIA_PYTHON  = "$PWD\.venv-core\Scripts\python.exe"
npm run test:core-real
npm run test:acceptance
```

Para o aceite do módulo Grid, instale também o plugin no mesmo venv com
`.\.venv-core\Scripts\mpgp.exe instale grid` (`meupia-grid==1.0.2`).

## 🎯 Missões do Desafios e módulo Grid

O seletor **Missão** carrega os JSON versionados em `public/missoes/` e ajusta a
toolbox ao conteúdo da missão, sem lista de blocos no arquivo: a derivação é
determinística e lê o código inicial, os comentários e a descrição. A missão
`O Taxímetro` oferece declarar/escreva/soma, enquanto `A Fila VIP` troca a soma
por atribuição e `se`; `Missão livre` devolve os 18 blocos do catálogo. Também
é possível carregar uma missão local pelo botão de arquivo; trocar de missão com
blocos incompatíveis pede confirmação.

A missão **Visitar uma célula do Grid** exemplifica o módulo oficial: os blocos
`usar "grid"`, `grid_iniciar` e `grid_visitar` aparecem numa categoria própria.
O gerador emite a diretiva uma única vez, logo após o cabeçalho, e as chamadas
na seção `inicio`. O editor não importa nem copia código do plugin; a execução
usa somente a CLI pública do Core e o módulo instalado pelo gerenciador oficial.
Detalhes e contratos em
[`specs/001-editor-blocos-portugol/contracts`](specs/001-editor-blocos-portugol/contracts)
e [`docs/decisoes.md`](docs/decisoes.md) (D-07/D-08).

A referência remota foi conferida com
`git ls-remote --tags https://github.com/meuPia/core.git "refs/tags/v1.4.1*"`:
o objeto da tag anotada é `b6a8fc8963629af441267388c2ce218e18b5d877` e o commit
apontado (`refs/tags/v1.4.1^{}`) é `68824d7f9e91f71670f3f466c0a5865a8685f020`,
idêntico ao `direct_url.json` do pacote `meupia-core==1.4.1` instalado.

## 💡 Por que o meuPiá Blocos?
Muitos iniciantes travam antes mesmo de escrever a primeira linha de Portugol.
O meuPiá Blocos é o degrau anterior: a lógica é construída com blocos visuais e
o código Portugol é mostrado em tempo real, para que a transição para o código
escrito aconteça naturalmente.

## ✨ Visão do produto
* 🧱 **Blocos:** área para montar o programa arrastando e encaixando blocos.
* 📝 **Portugol:** o código gerado a partir dos blocos, atualizado em tempo real.
* 🖥️ **Execução:** a saída do programa, executado pelo meuPiá Core.

## 🔗 Relação com o ecossistema
O meuPiá Blocos **consome** o ecossistema e não o modifica. O Core e os módulos
são usados apenas pelas interfaces públicas.

| Projeto | Papel |
| --- | --- |
| [meuPiá Core](https://github.com/meuPia/core) | Compila e executa o Portugol gerado |
| [meuPiá Lab](https://github.com/meuPia/lab) | IDE web onde o Portugol escrito continua a jornada |
| [meuPiá Maker](https://github.com/meuPia/maker) | Módulo para ESP32 e Pico |
| [meuPiá Desafios](https://github.com/meuPia/desafios) | Missões que o editor pode carregar |

## 📚 Referências
* [Scratch](https://scratch.mit.edu)
* [Snap!](https://snap.berkeley.edu)
* [Pencil Code](https://pencilcode.net)
* [Blockly](https://developers.google.com/blockly)
* [Microsoft MakeCode](https://makecode.microsoft.com)

## 🤝 Como contribuir
Leia o [CONTRIBUTING.md](CONTRIBUTING.md). Mudanças no compilador pertencem ao
[meuPiá Core](https://github.com/meuPia/core), não a este repositório.

## 📄 Licença
Distribuído sob a licença GPL-3.0. Veja [LICENSE](LICENSE).

## 🙌 Credits

Desenvolvido como parte do ecossistema educacional **meuPiá** por ___

* **Core Compiler:** [meuPia-core](https://github.com/meuPia/core)
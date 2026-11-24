import { blocoParaJSON } from './leia-escreva.js';

const CAMPOS_POR_TIPO = Object.freeze({
  leia: { variavel: 'VAR' },
  atribuir: { variavel: 'VAR', expressao: 'EXPR' },
  escreva: { expressao: 'EXPR' },
});

/** Converte a pilha de blocos do workspace em `ProjetoJSON.blocos`. */
export function serializarWorkspace(workspace) {
  const blocos = [];

  for (const topo of workspace.getTopBlocks(true)) {
    let atual = topo;
    while (atual) {
      const dados = blocoParaJSON(atual);
      if (dados) {
        blocos.push(dados);
      }
      atual = atual.getNextBlock();
    }
  }

  return blocos;
}

/**
 * O Blockly expõe `nextConnection`/`previousConnection` como propriedades.
 * Aceitar também os métodos antigos evita que uma versão diferente do pacote
 * interrompa a importação no meio e deixe campos preenchidos sem blocos.
 */
function conexoes(bloco, tipo) {
  const propriedade = tipo === 'next' ? bloco.nextConnection : bloco.previousConnection;
  if (propriedade) {
    return propriedade;
  }

  const metodo = tipo === 'next' ? 'getNextConnection' : 'getPreviousConnection';
  if (typeof bloco[metodo] === 'function') {
    return bloco[metodo]();
  }

  return null;
}

/** Reconstrói os blocos a partir de um projeto já validado. */
export function carregarProjetoNoWorkspace(projeto, workspace) {
  workspace.clear();

  let anterior = null;
  for (const dados of projeto.blocos) {
    const bloco = workspace.newBlock(dados.tipo);
    const campos = CAMPOS_POR_TIPO[dados.tipo] ?? {};

    for (const [chave, nomeCampo] of Object.entries(campos)) {
      if (dados[chave] !== undefined) {
        bloco.setFieldValue(String(dados[chave]), nomeCampo);
      }
    }

    bloco.initSvg();
    bloco.render();

    if (anterior) {
      const origem = conexoes(anterior, 'next');
      const destino = conexoes(bloco, 'previous');
      if (!origem || !destino) {
        throw new Error(
          `Não foi possível conectar os blocos: versão do Blockly incompatível (${dados.tipo}).`,
        );
      }
      origem.connect(destino);
    }
    anterior = bloco;
  }

  return serializarWorkspace(workspace).length;
}

export default serializarWorkspace;

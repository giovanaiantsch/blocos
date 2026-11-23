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

    if (anterior && anterior.nextConnection && bloco.previousConnection) {
      anterior.nextConnection.connect(bloco.previousConnection);
    }
    anterior = bloco;
  }

  return serializarWorkspace(workspace).length;
}

export default serializarWorkspace;

import { blocoParaJSON, restaurarBloco } from './registro.js';

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

function conectarSequencia(anterior, bloco) {
  const origem = conexoes(anterior, 'next');
  const destino = conexoes(bloco, 'previous');
  if (!origem || !destino) {
    throw new Error('Não foi possível conectar os blocos: versão do Blockly incompatível.');
  }
  origem.connect(destino);
}

function renderizar(bloco, workspace) {
  const comSvg = typeof workspace.getRenderer === 'function' && workspace.getRenderer();
  if (comSvg && typeof bloco.initSvg === 'function') {
    bloco.initSvg();
  }
  if (comSvg && typeof bloco.render === 'function') {
    bloco.render();
  }
}

function serializarCadeia(blocoInicial) {
  const blocos = [];
  for (let atual = blocoInicial; atual; atual = atual.getNextBlock()) {
    const dados = blocoParaJSON(atual, serializarCadeia);
    if (dados) {
      blocos.push(dados);
    }
  }
  return blocos;
}

function restaurarCadeia(lista, workspace) {
  let primeiro = null;
  let anterior = null;

  for (const dados of lista ?? []) {
    const bloco = restaurarBloco(dados, workspace, restaurarCadeia);
    renderizar(bloco, workspace);
    if (anterior) {
      conectarSequencia(anterior, bloco);
    } else {
      primeiro = bloco;
    }
    anterior = bloco;
  }

  return primeiro;
}

/** Converte as pilhas do workspace em `ProjetoJSON.blocos`, inclusive ramos. */
export function serializarWorkspace(workspace) {
  const blocos = [];
  for (const topo of workspace.getTopBlocks(true)) {
    blocos.push(...serializarCadeia(topo));
  }
  return blocos;
}

/** Reconstrói blocos, expressões e ramos a partir de um projeto já validado. */
export function carregarProjetoNoWorkspace(projeto, workspace) {
  workspace.clear();
  restaurarCadeia(projeto.blocos, workspace);
  return serializarWorkspace(workspace).length;
}

export default serializarWorkspace;

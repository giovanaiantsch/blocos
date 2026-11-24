import { conectarEntrada, expressaoDaEntrada, preencherEntradasPadrao, restaurarExpressao } from './operadores.js';

/**
 * Definições puras dos blocos de entrada e saída. Nenhuma referência a DOM ou
 * ao Blockly no carregamento do módulo: o registro recebe o Blockly injetado.
 */
export const DEFINICOES_BLOCOS = Object.freeze([
  {
    type: 'leia',
    message0: 'leia a variável %1',
    args0: [{ type: 'field_input', name: 'VAR', text: 'x' }],
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: 'Lê um valor informado antes da execução e guarda na variável.',
    helpUrl: '',
  },
  {
    type: 'atribuir',
    message0: 'atribua %1 <- %2',
    args0: [
      { type: 'field_input', name: 'VAR', text: 'x' },
      { type: 'input_value', name: 'EXPR', check: 'Expression' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'Atribui o resultado da expressão à variável.',
    helpUrl: '',
  },
  {
    type: 'escreva',
    message0: 'escreva %1',
    args0: [{ type: 'input_value', name: 'EXPR', check: 'Expression' }],
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: 'Mostra o valor da expressão na saída.',
    helpUrl: '',
  },
]);

export function registrarBlocosLeiaEscreva(Blockly) {
  Blockly.defineBlocksWithJsonArray(DEFINICOES_BLOCOS);
}

export function blocoParaJSON(bloco) {
  switch (bloco.type) {
    case 'leia':
      return { tipo: 'leia', variavel: bloco.getFieldValue('VAR') };
    case 'atribuir':
      return {
        tipo: 'atribuir',
        variavel: bloco.getFieldValue('VAR'),
        expressao: expressaoDaEntrada(bloco, 'EXPR'),
      };
    case 'escreva':
      return { tipo: 'escreva', expressao: expressaoDaEntrada(bloco, 'EXPR') };
    default:
      return null;
  }
}

export function restaurarBlocoLeiaEscreva(dados, workspace) {
  const bloco = workspace.newBlock(dados.tipo);
  if (dados.tipo === 'leia') {
    bloco.setFieldValue(String(dados.variavel ?? 'x'), 'VAR');
  } else {
    const expressao = String(dados.expressao ?? 'x');
    const conectado = conectarEntrada(bloco, 'EXPR', restaurarExpressao(expressao, workspace));
    // Workspaces de teste e versões antigas podem usar campo de texto em vez
    // de entrada conectável: preservar a expressão é mais importante que a
    // árvore visual nesses casos.
    if (!conectado && typeof bloco.setFieldValue === 'function') {
      bloco.setFieldValue(expressao, 'EXPR');
    }
  }
  preencherEntradasPadrao(bloco, workspace);
  return bloco;
}

export default DEFINICOES_BLOCOS;

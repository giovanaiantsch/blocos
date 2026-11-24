import {
  conectarEntrada,
  expressaoDaEntrada,
  preencherEntradasPadrao,
  restaurarExpressao,
} from './operadores.js';

export const DEFINICOES_SE_SENAO = Object.freeze([
  {
    type: 'se',
    message0: 'se %1 entao %2 senao %3',
    args0: [
      { type: 'input_value', name: 'COND', check: 'Expression' },
      { type: 'input_statement', name: 'ENTAO' },
      { type: 'input_statement', name: 'SENAO' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 20,
    tooltip: 'Escolhe um ramo conforme a condição.',
    helpUrl: '',
  },
]);

const filhosDaEntrada = (bloco, nome) => {
  const entrada = bloco.getInput(nome);
  return entrada?.connection?.targetBlock() ?? null;
};

export function blocoSeSenaoParaJSON(bloco, serializarCadeia) {
  if (bloco.type !== 'se') {
    return null;
  }
  return {
    tipo: 'se',
    condicao: expressaoDaEntrada(bloco, 'COND'),
    ramos: {
      entao: serializarCadeia(filhosDaEntrada(bloco, 'ENTAO')),
      senao: serializarCadeia(filhosDaEntrada(bloco, 'SENAO')),
    },
  };
}

export function restaurarBlocoSeSenao(dados, workspace, restaurarCadeia) {
  const bloco = workspace.newBlock('se');
  conectarEntrada(bloco, 'COND', restaurarExpressao(dados.condicao, workspace));

  const entao = restaurarCadeia(dados.ramos?.entao ?? [], workspace);
  const senao = restaurarCadeia(dados.ramos?.senao ?? [], workspace);
  const entradaEntao = bloco.getInput('ENTAO');
  const entradaSenao = bloco.getInput('SENAO');
  if (entradaEntao?.connection && entao?.previousConnection) {
    entradaEntao.connection.connect(entao.previousConnection);
  }
  if (entradaSenao?.connection && senao?.previousConnection) {
    entradaSenao.connection.connect(senao.previousConnection);
  }

  preencherEntradasPadrao(bloco, workspace);
  return bloco;
}

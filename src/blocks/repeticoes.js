import {
  conectarEntrada,
  expressaoDaEntrada,
  preencherEntradasPadrao,
  restaurarExpressao,
} from './operadores.js';

export const DEFINICOES_REPETICOES = Object.freeze([
  {
    type: 'enquanto',
    message0: 'enquanto %1 faca %2',
    args0: [
      { type: 'input_value', name: 'COND', check: 'Expression' },
      { type: 'input_statement', name: 'CORPO' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 300,
    tooltip: 'Repete o corpo enquanto a condição for verdadeira.',
    helpUrl: '',
  },
  {
    type: 'para',
    message0: 'para %1 de %2 ate %3 passo %4 faca %5',
    args0: [
      { type: 'field_input', name: 'VAR', text: 'i' },
      { type: 'field_number', name: 'INICIO', value: 1, precision: 1 },
      { type: 'field_number', name: 'FIM', value: 3, precision: 1 },
      { type: 'field_number', name: 'PASSO', value: 1, precision: 1 },
      { type: 'input_statement', name: 'CORPO' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 300,
    tooltip: 'Repete o corpo com um contador.',
    helpUrl: '',
  },
]);

const corpoDoBloco = (bloco) => bloco.getInput('CORPO')?.connection?.targetBlock() ?? null;

const numero = (valor, padrao) => {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : padrao;
};

export function blocoRepeticaoParaJSON(bloco, serializarCadeia) {
  if (bloco.type === 'enquanto') {
    return {
      tipo: 'enquanto',
      condicao: expressaoDaEntrada(bloco, 'COND'),
      corpo: serializarCadeia(corpoDoBloco(bloco)),
    };
  }
  if (bloco.type === 'para') {
    return {
      tipo: 'para',
      variavel: bloco.getFieldValue('VAR'),
      inicio: numero(bloco.getFieldValue('INICIO'), 1),
      fim: numero(bloco.getFieldValue('FIM'), 3),
      passo: numero(bloco.getFieldValue('PASSO'), 1),
      corpo: serializarCadeia(corpoDoBloco(bloco)),
    };
  }
  return null;
}

export function restaurarBlocoRepeticao(dados, workspace, restaurarCadeia) {
  const bloco = workspace.newBlock(dados.tipo);
  if (bloco.type === 'enquanto') {
    conectarEntrada(bloco, 'COND', restaurarExpressao(dados.condicao, workspace));
  } else {
    bloco.setFieldValue(String(dados.variavel ?? 'i'), 'VAR');
    bloco.setFieldValue(numero(dados.inicio, 1), 'INICIO');
    bloco.setFieldValue(numero(dados.fim, 3), 'FIM');
    bloco.setFieldValue(numero(dados.passo, 1), 'PASSO');
  }

  const corpo = restaurarCadeia(dados.corpo ?? [], workspace);
  const entradaCorpo = bloco.getInput('CORPO');
  if (entradaCorpo?.connection && corpo?.previousConnection) {
    entradaCorpo.connection.connect(corpo.previousConnection);
  }

  preencherEntradasPadrao(bloco, workspace);
  return bloco;
}

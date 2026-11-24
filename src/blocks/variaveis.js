import SINTAXE from '../generation/sintaxe.js';
import {
  conectarEntrada,
  expressaoDaEntrada,
  preencherEntradasPadrao,
  restaurarExpressao,
} from './operadores.js';

const opcoesTipo = SINTAXE.tiposAceitos.map((tipo) => [tipo, tipo]);

// `atribuir` é definido em `leia-escreva.js` para evitar registro duplicado;
// aqui ficam apenas as definições exclusivas de variáveis.
export const DEFINICOES_VARIAVEIS = Object.freeze([
  {
    type: 'declarar',
    message0: 'declare %1 do tipo %2',
    args0: [
      { type: 'field_input', name: 'VAR', text: 'x' },
      { type: 'field_dropdown', name: 'TIPO', options: opcoesTipo },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'Declara uma variável com o tipo provisório da turma.',
    helpUrl: '',
  },
]);

export function blocoVariavelParaJSON(bloco) {
  if (bloco.type === 'declarar') {
    return {
      tipo: 'declarar',
      variavel: bloco.getFieldValue('VAR'),
      tipoVariavel: bloco.getFieldValue('TIPO'),
    };
  }
  if (bloco.type === 'atribuir') {
    return {
      tipo: 'atribuir',
      variavel: bloco.getFieldValue('VAR'),
      expressao: expressaoDaEntrada(bloco, 'EXPR'),
    };
  }
  return null;
}

export function restaurarBlocoVariavel(dados, workspace) {
  const bloco = workspace.newBlock(dados.tipo);
  if (dados.tipo === 'declarar') {
    bloco.setFieldValue(String(dados.variavel ?? 'x'), 'VAR');
    bloco.setFieldValue(String(dados.tipoVariavel ?? SINTAXE.tipoPadrao), 'TIPO');
  } else {
    bloco.setFieldValue(String(dados.variavel ?? 'x'), 'VAR');
    const expressao = String(dados.expressao ?? 'x');
    const conectado = conectarEntrada(bloco, 'EXPR', restaurarExpressao(expressao, workspace));
    if (!conectado && typeof bloco.setFieldValue === 'function') {
      bloco.setFieldValue(expressao, 'EXPR');
    }
  }
  preencherEntradasPadrao(bloco, workspace);
  return bloco;
}

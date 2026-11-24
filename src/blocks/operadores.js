import { OPERADORES_PROVISORIOS } from '../generation/operadores.js';

const SIMBOLO_PARA_TIPO = Object.freeze({
  '+': 'op_soma',
  '-': 'op_subtracao',
  '*': 'op_multiplicacao',
  '/': 'op_divisao',
  '>': 'op_maior',
  '<': 'op_menor',
  '>=': 'op_maiorOuIgual',
  '<=': 'op_menorOuIgual',
  '==': 'op_igual',
  e: 'op_e',
  ou: 'op_ou',
  nao: 'op_nao',
});

/** Ordem do operador mais externo (menor precedência) para o mais interno. */
const ORDEM_OPERADORES = Object.freeze(['nao', 'ou', 'e', '==', '>=', '<=', '>', '<', '+', '-', '*', '/']);

const entrada = (nome) => ({
  type: 'input_value',
  name: nome,
  check: 'Expression',
});

export const DEFINICOES_OPERADORES = Object.freeze([
  {
    type: 'expressao_livre',
    message0: '%1',
    args0: [{ type: 'field_input', name: 'VALOR', text: 'x' }],
    output: 'Expression',
    colour: 60,
    tooltip: 'Escreva um valor ou uma expressão simples.',
    helpUrl: '',
  },
  ...Object.entries(OPERADORES_PROVISORIOS).map(([chave, operador]) => {
    const unario = chave === 'nao';
    return {
      type: SIMBOLO_PARA_TIPO[operador.simbolo],
      message0: unario ? 'nao %1' : `%1 ${operador.simbolo} %2`,
      args0: unario ? [entrada('A')] : [entrada('A'), entrada('B')],
      output: 'Expression',
      colour: 60,
      tooltip: `Operador ${operador.categoria}: ${operador.simbolo} (catálogo provisório).`,
      helpUrl: '',
    };
  }),
]);

export const PADROES_ENTRADA = Object.freeze({
  EXPR: 'x * 2',
  COND: 'x > 0',
  A: 'x',
  B: '1',
});

function alvoDaEntrada(bloco, nome) {
  return typeof bloco?.getInputTargetBlock === 'function'
    ? bloco.getInputTargetBlock(nome)
    : null;
}

function campoLegado(bloco, nome) {
  return typeof bloco?.getFieldValue === 'function' ? bloco.getFieldValue(nome) : null;
}

/** Converte a árvore de blocos de expressão em texto Portugol. */
export function expressaoDeBloco(bloco) {
  if (!bloco) {
    return '';
  }

  if (bloco.type === 'expressao_livre') {
    return campoLegado(bloco, 'VALOR') ?? '';
  }

  const operador = Object.values(OPERADORES_PROVISORIOS)
    .find((item) => SIMBOLO_PARA_TIPO[item.simbolo] === bloco.type);
  if (!operador) {
    return campoLegado(bloco, 'EXPR') ?? campoLegado(bloco, 'COND') ?? '';
  }

  const a = expressaoDeBloco(alvoDaEntrada(bloco, 'A'));
  if (bloco.type === 'op_nao') {
    return a ? `nao ${a}` : '';
  }
  const b = expressaoDeBloco(alvoDaEntrada(bloco, 'B'));
  return a && b ? `${a} ${operador.simbolo} ${b}` : '';
}

/** Lê uma entrada de expressão, aceitando blocos antigos com field_input. */
export function expressaoDaEntrada(bloco, nome) {
  const alvo = alvoDaEntrada(bloco, nome);
  if (alvo) {
    return expressaoDeBloco(alvo);
  }
  return campoLegado(bloco, nome) ?? '';
}

function blocoDeTexto(valor, workspace) {
  const bloco = workspace.newBlock('expressao_livre');
  bloco.setFieldValue(String(valor ?? ''), 'VALOR');
  return bloco;
}

function encontrarOperador(texto) {
  let melhor = null;
  let aspas = null;

  for (let indice = 0; indice < texto.length; indice += 1) {
    const caractere = texto[indice];
    if (aspas) {
      if (caractere === aspas && texto[indice - 1] !== '\\') {
        aspas = null;
      }
      continue;
    }
    if (caractere === '"' || caractere === "'") {
      aspas = caractere;
      continue;
    }

    ORDEM_OPERADORES.forEach((simbolo, posicao) => {
      if (!texto.startsWith(simbolo, indice) || (melhor && posicao >= melhor.posicao)) {
        return;
      }
      const palavra = /^[A-Za-z]+$/.test(simbolo);
      const antes = texto[indice - 1];
      const depois = texto[indice + simbolo.length];
      const limite = !palavra || (!antes || !/\w/.test(antes)) && (!depois || !/\w/.test(depois));
      if (limite) {
        melhor = { simbolo, indice, posicao };
      }
    });
  }

  return melhor ? { simbolo: melhor.simbolo, indice: melhor.indice } : null;
}

export function conectarEntrada(bloco, nomeEntrada, filho) {
  const entradaDoBloco = typeof bloco?.getInput === 'function'
    ? bloco.getInput(nomeEntrada)
    : null;
  if (entradaDoBloco?.connection && filho?.outputConnection) {
    entradaDoBloco.connection.connect(filho.outputConnection);
    return true;
  }
  return false;
}

/** Reconstrói a árvore visual de uma expressão serializada como texto. */
export function restaurarExpressao(texto, workspace) {
  const limpo = String(texto ?? PADROES_ENTRADA.EXPR).trim();
  const encontrado = encontrarOperador(limpo);

  if (!encontrado) {
    return blocoDeTexto(limpo, workspace);
  }

  if (encontrado.simbolo === 'nao' && encontrado.indice === 0) {
    const operando = limpo.slice(encontrado.simbolo.length).trim();
    if (operando) {
      const bloco = workspace.newBlock('op_nao');
      conectarEntrada(bloco, 'A', restaurarExpressao(operando, workspace));
      return bloco;
    }
  }

  const esquerda = limpo.slice(0, encontrado.indice).trim();
  const direita = limpo.slice(encontrado.indice + encontrado.simbolo.length).trim();
  if (!esquerda || !direita) {
    return blocoDeTexto(limpo, workspace);
  }

  const tipo = SIMBOLO_PARA_TIPO[encontrado.simbolo];
  const bloco = workspace.newBlock(tipo);
  conectarEntrada(bloco, 'A', restaurarExpressao(esquerda, workspace));
  if (tipo !== 'op_nao') {
    conectarEntrada(bloco, 'B', restaurarExpressao(direita, workspace));
  }
  return bloco;
}

/** Tipo `INPUT_VALUE` do Blockly; evita conectar expressão em entrada de pilha. */
const TIPO_ENTRADA_VALOR = 1;

function entradasDoBloco(bloco) {
  if (Array.isArray(bloco?.inputList)) {
    return bloco.inputList;
  }
  return typeof bloco?.getInputs === 'function' ? bloco.getInputs() : [];
}

/** Preenche entradas de valor vazias com valores padrão em pt-BR. */
export function preencherEntradasPadrao(bloco, workspace) {
  if (!bloco || bloco.type === 'expressao_livre') {
    return;
  }

  for (const item of entradasDoBloco(bloco)) {
    const nome = item.name;
    if (
      !nome ||
      !item.connection ||
      (item.type !== undefined && item.type !== TIPO_ENTRADA_VALOR) ||
      item.connection.targetBlock?.()
    ) {
      continue;
    }
    const padrao = PADROES_ENTRADA[nome] ?? (nome === 'COND' ? 'x > 0' : 'x');
    conectarEntrada(bloco, nome, blocoDeTexto(padrao, workspace));
  }
}

export default DEFINICOES_OPERADORES;

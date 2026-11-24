/**
 * Workspace mínimo com a mesma superfície usada pelo código de blocos:
 * `inputList`, conexões como propriedades e `getInputTargetBlock()`.
 * Não substitui o Blockly real nos testes de navegador — apenas mantém os
 * testes unitários legíveis e independentes de DOM.
 */
const VALOR = 1;
const PILHA = 3;

const CAMPOS = {
  leia: { VAR: 'x' },
  escreva: {},
  atribuir: { VAR: 'x' },
  declarar: { VAR: 'x', TIPO: 'inteiro' },
  expressao_livre: { VALOR: 'x' },
  se: {},
  enquanto: {},
  para: { VAR: 'i', INICIO: 1, FIM: 3, PASSO: 1 },
};

const OPERADORES_BINARIOS = [
  'op_soma',
  'op_subtracao',
  'op_multiplicacao',
  'op_divisao',
  'op_maior',
  'op_menor',
  'op_maiorOuIgual',
  'op_menorOuIgual',
  'op_igual',
  'op_e',
  'op_ou',
];

const ENTRADAS = {
  escreva: { EXPR: VALOR },
  atribuir: { EXPR: VALOR },
  se: { COND: VALOR, ENTAO: PILHA, SENAO: PILHA },
  enquanto: { COND: VALOR, CORPO: PILHA },
  para: { CORPO: PILHA },
};

for (const tipo of OPERADORES_BINARIOS) {
  ENTRADAS[tipo] = { A: VALOR, B: VALOR };
}
ENTRADAS.op_nao = { A: VALOR };

function criarEntrada(dono, nome, tipo) {
  const conexao = {
    dono,
    target: null,
    targetBlock() {
      return this.target;
    },
    connect(outro) {
      this.target = outro.dono;
      if (tipo === PILHA) {
        outro.dono.pai = dono;
      }
    },
  };
  return { name: nome, type: tipo, connection: conexao };
}

export function criarWorkspaceFake() {
  const blocos = [];

  function novoBloco(tipo) {
    const bloco = {
      type: tipo,
      campos: { ...(CAMPOS[tipo] ?? {}) },
      inputList: [],
      proximo: null,
      anterior: null,
      pai: null,
      getFieldValue(nome) {
        return Object.prototype.hasOwnProperty.call(this.campos, nome) ? this.campos[nome] : null;
      },
      setFieldValue(valor, nome) {
        this.campos[nome] = String(valor);
      },
      getInput(nome) {
        return this.inputList.find((entrada) => entrada.name === nome) ?? null;
      },
      getInputTargetBlock(nome) {
        return this.getInput(nome)?.connection.targetBlock() ?? null;
      },
      getNextBlock() {
        return this.proximo;
      },
      initSvg() {},
      render() {},
    };

    for (const [nome, tipoEntrada] of Object.entries(ENTRADAS[tipo] ?? {})) {
      bloco.inputList.push(criarEntrada(bloco, nome, tipoEntrada));
    }

    if (OPERADORES_BINARIOS.includes(tipo) || tipo === 'op_nao' || tipo === 'expressao_livre') {
      bloco.outputConnection = { dono: bloco, type: 2 };
    }
    if (!bloco.outputConnection && tipo !== 'expressao_livre') {
      bloco.previousConnection = { dono: bloco, type: 4 };
      bloco.nextConnection = {
        dono: bloco,
        type: 3,
        connect(destino) {
          bloco.proximo = destino.dono;
          destino.dono.anterior = bloco;
        },
      };
    }

    return bloco;
  }

  return {
    clear() {
      blocos.length = 0;
    },
    newBlock(tipo) {
      const bloco = novoBloco(tipo);
      blocos.push(bloco);
      return bloco;
    },
    getTopBlocks() {
      return blocos.filter((bloco) => !bloco.anterior && !bloco.pai);
    },
    getRenderer() {
      return null;
    },
    blocos,
  };
}

export function conectarValor(bloco, nome, filho) {
  bloco.getInput(nome).connection.connect(filho.outputConnection);
  return bloco;
}

export function conectarPilha(bloco, nome, primeiro) {
  bloco.getInput(nome).connection.connect(primeiro.previousConnection);
  return bloco;
}

export function ligarCadeia(blocos) {
  for (let indice = 1; indice < blocos.length; indice += 1) {
    blocos[indice - 1].nextConnection.connect(blocos[indice].previousConnection);
  }
  return blocos[0];
}

import { describe, expect, it } from 'vitest';

import { carregarProjetoNoWorkspace, serializarWorkspace } from '../../src/blocks/serializacao.js';

const PROJETO = {
  versao: 1,
  titulo: 'Dobrar a entrada',
  blocos: [
    { tipo: 'leia', variavel: 'x' },
    { tipo: 'atribuir', variavel: 'x', expressao: 'x * 2' },
    { tipo: 'escreva', expressao: 'x' },
  ],
  entrada: [3],
};

function criarWorkspace({ comMetodos = false, semConexoes = false } = {}) {
  const blocos = [];

  function criarBloco(tipo) {
    const bloco = {
      type: tipo,
      campos: {},
      proximo: null,
      setFieldValue(valor, nome) {
        this.campos[nome] = valor;
      },
      getFieldValue(nome) {
        return this.campos[nome] ?? null;
      },
      initSvg() {},
      render() {},
      getNextBlock() {
        return this.proximo;
      },
    };

    const origem = {
      dono: bloco,
      connect(destino) {
        bloco.proximo = destino.dono;
      },
    };
    const destino = { dono: bloco };

    Object.defineProperty(bloco, 'nextConnection', {
      value: comMetodos || semConexoes ? undefined : origem,
    });
    Object.defineProperty(bloco, 'previousConnection', {
      value: comMetodos || semConexoes ? undefined : destino,
    });
    if (comMetodos) {
      bloco.getNextConnection = () => origem;
      bloco.getPreviousConnection = () => destino;
    }

    return bloco;
  }

  return {
    clear() {
      blocos.length = 0;
    },
    newBlock(tipo) {
      const bloco = criarBloco(tipo);
      blocos.push(bloco);
      return bloco;
    },
    getTopBlocks() {
      return blocos.filter((bloco) => !blocos.some((outro) => outro.proximo === bloco));
    },
  };
}

describe('restauração de blocos conforme a API do Blockly', () => {
  it('usa nextConnection/previousConnection como propriedades (Blockly real)', () => {
    const workspace = criarWorkspace();

    expect(carregarProjetoNoWorkspace(PROJETO, workspace)).toBe(3);
    expect(serializarWorkspace(workspace)).toEqual(PROJETO.blocos);
  });

  it('ainda aceita implementações antigas com getNextConnection()', () => {
    const workspace = criarWorkspace({ comMetodos: true });

    expect(carregarProjetoNoWorkspace(PROJETO, workspace)).toBe(3);
    expect(serializarWorkspace(workspace)).toEqual(PROJETO.blocos);
  });

  it('falha com mensagem clara se o Blockly não oferecer conexões', () => {
    const workspace = criarWorkspace({ semConexoes: true });

    expect(() => carregarProjetoNoWorkspace(PROJETO, workspace)).toThrow(
      /versão do Blockly incompatível/,
    );
  });
});

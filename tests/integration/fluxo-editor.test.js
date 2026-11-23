import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { serializarWorkspace, carregarProjetoNoWorkspace } from '../../src/blocks/serializacao.js';
import { gerarPortugol } from '../../src/generation/gerador.js';
import { carregarProjeto } from '../../src/persistence/carregar.js';
import { serializarProjeto } from '../../src/persistence/salvar.js';

const fixtureTexto = readFileSync(
  new URL('../fixtures/dobrar-entrada.json', import.meta.url),
  'utf8',
);
const fixture = JSON.parse(fixtureTexto);

function criarBlocoFake(tipo) {
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

  bloco.previousConnection = { dono: bloco };
  bloco.nextConnection = {
    dono: bloco,
    connect: (destino) => {
      bloco.proximo = destino.dono;
    },
  };

  return bloco;
}

function criarWorkspaceFake() {
  const blocos = [];
  return {
    clear() {
      blocos.length = 0;
    },
    newBlock(tipo) {
      const bloco = criarBlocoFake(tipo);
      blocos.push(bloco);
      return bloco;
    },
    add() {},
    getTopBlocks() {
      return blocos.filter((bloco) => !blocos.some((b) => b.proximo === bloco));
    },
  };
}

describe('fluxo do editor com o projeto dobrar-entrada', () => {
  it('JSON -> blocos -> JSON -> Portugol -> JSON sem perder dados', () => {
    const workspace = criarWorkspaceFake();

    const quantidade = carregarProjetoNoWorkspace(fixture, workspace, {});
    const blocos = serializarWorkspace(workspace);
    const portugol = gerarPortugol({ ...fixture, blocos });
    const reapertura = carregarProjeto(
      serializarProjeto({ ...fixture, blocos }),
    );

    expect(quantidade).toBe(3);
    expect(blocos).toEqual(fixture.blocos);
    expect(portugol).toContain('leia(x)');
    expect(portugol).toContain('x <- x * 2');
    expect(portugol).toContain('escreva(x)');
    expect(reapertura.mensagens).toEqual([]);
    expect(reapertura.projeto.entrada).toEqual([3]);
  });
});

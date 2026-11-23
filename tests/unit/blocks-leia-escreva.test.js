import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  DEFINICOES_BLOCOS,
  blocoParaJSON,
  registrarBlocosLeiaEscreva,
} from '../../src/blocks/leia-escreva.js';
import { TOOLBOX } from '../../src/blocks/toolbox.js';
import { gerarPortugol } from '../../src/generation/gerador.js';

const fixture = JSON.parse(
  readFileSync(new URL('../fixtures/dobrar-entrada.json', import.meta.url), 'utf8'),
);

describe('blocos de leitura e escrita (RF-07/RF-08)', () => {
  it('define os blocos leia, atribuir e escreva em pt-BR', () => {
    const tipos = DEFINICOES_BLOCOS.map((definicao) => definicao.type);

    expect(tipos).toEqual(expect.arrayContaining(['leia', 'atribuir', 'escreva']));
    for (const definicao of DEFINICOES_BLOCOS) {
      expect(definicao.message0).toMatch(/[a-zà-ú]/);
      expect(definicao.tooltip.length).toBeGreaterThan(0);
    }
  });

  it('mapeia campos do Blockly para BlocoSerializado', () => {
    const bloco = (tipo, campos) => ({
      type: tipo,
      getFieldValue: (nome) => campos[nome],
    });

    expect(
      blocoParaJSON(bloco('leia', { VAR: 'x' })),
    ).toEqual({ tipo: 'leia', variavel: 'x' });
    expect(
      blocoParaJSON(bloco('atribuir', { VAR: 'x', EXPR: 'x * 2' })),
    ).toEqual({ tipo: 'atribuir', variavel: 'x', expressao: 'x * 2' });
    expect(
      blocoParaJSON(bloco('escreva', { EXPR: 'x' })),
    ).toEqual({ tipo: 'escreva', expressao: 'x' });
  });

  it('oferece os blocos no toolbox com categorias em pt-BR', () => {
    const categorias = TOOLBOX.contents.map((categoria) => categoria.name);

    expect(categorias).toEqual(expect.arrayContaining(['Entrada e saída', 'Variáveis']));
    expect(JSON.stringify(TOOLBOX)).toContain('"leia"');
    expect(JSON.stringify(TOOLBOX)).toContain('"escreva"');
  });

  it('registra as definições no Blockly injetado', () => {
    const chamadas = [];
    registrarBlocosLeiaEscreva({
      defineBlocksWithJsonArray(definicoes) {
        chamadas.push(definicoes);
      },
    });

    expect(chamadas).toHaveLength(1);
    expect(chamadas[0]).toEqual(DEFINICOES_BLOCOS);
  });

  it('gera o Portugol do exemplo canônico a partir dos blocos serializados', () => {
    const portugol = gerarPortugol(fixture);

    expect(portugol).toContain('leia(x)');
    expect(portugol).toContain('x <- x * 2');
    expect(portugol).toContain('escreva(x)');
    expect(fixture.entrada).toEqual([3]);
  });
});

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  DEFINICOES_MODULO_GRID,
  blocoModuloParaJSON,
  restaurarBlocoModulo,
} from '../../src/blocks/modulo-grid.js';
import { DEFINICOES_BLOCOS_TODAS, registrarBlocos } from '../../src/blocks/registro.js';
import { gerarPortugol } from '../../src/generation/gerador.js';
import MENSAGENS from '../../src/messages/index.js';
import { validarProjeto } from '../../src/persistence/schema.js';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = JSON.parse(readFileSync(resolve(raiz, 'tests/fixtures/grid-visitar.json'), 'utf8'));
const blocoFalso = (tipo, campos) => ({
  type: tipo,
  getFieldValue: (nome) => campos[nome],
});

describe('blocos do módulo Grid (EC-02)', () => {
  it('registra exatamente os três tipos públicos, sem importar o plugin', () => {
    expect(DEFINICOES_MODULO_GRID.map((definicao) => definicao.type)).toEqual([
      'usar_grid',
      'grid_iniciar',
      'grid_visitar',
    ]);
    expect(DEFINICOES_BLOCOS_TODAS.map((definicao) => definicao.type)).toEqual(
      expect.arrayContaining(DEFINICOES_MODULO_GRID.map((definicao) => definicao.type)),
    );
    const registrados = [];
    registrarBlocos({ defineBlocksWithJsonArray: (definicoes) => registrados.push(...definicoes) });
    expect(registrados).toHaveLength(DEFINICOES_BLOCOS_TODAS.length);
  });

  it('serializa e restaura campos inteiros', () => {
    expect(blocoModuloParaJSON(blocoFalso('usar_grid', {}))).toEqual({ tipo: 'usar_grid' });
    expect(blocoModuloParaJSON(blocoFalso('grid_iniciar', { LARGURA: 4, ALTURA: 5 }))).toEqual({
      tipo: 'grid_iniciar',
      largura: 4,
      altura: 5,
    });
    expect(
      blocoModuloParaJSON(blocoFalso('grid_visitar', { X: 2, Y: 3, PASSO: 1 })),
    ).toEqual({ tipo: 'grid_visitar', x: 2, y: 3, passo: 1 });

    const campos = {};
    const workspace = {
      newBlock: (tipo) => ({ type: tipo, setFieldValue: (valor, nome) => (campos[nome] = valor) }),
    };
    restaurarBlocoModulo(
      { tipo: 'grid_visitar', x: 7, y: 8, passo: 2 },
      workspace,
    );
    expect(campos).toEqual({ X: 7, Y: 8, PASSO: 2 });
  });

  it('aceita o fixture canônico e gera o Portugol do contrato', () => {
    expect(validarProjeto(fixture).valido).toBe(true);
    const portugol = gerarPortugol(fixture);
    expect(portugol).toBe(
      [
        'algoritmo "Grid do Iniciante"',
        'usar "grid"',
        '',
        'inicio',
        '    grid_iniciar(3, 3)',
        '    grid_visitar(2, 3, 1)',
        '    escreva("celula visitada")',
        'fim_algoritmo',
      ].join('\n'),
    );
    expect(portugol.match(/usar "grid"/g)).toHaveLength(1);
  });

  it('não emite a diretiva quando não há bloco usar_grid', () => {
    const semDiretiva = {
      ...fixture,
      blocos: fixture.blocos.filter((bloco) => bloco.tipo !== 'usar_grid'),
    };
    expect(gerarPortugol(semDiretiva)).not.toContain('usar "grid"');
  });

  it('emite uma diretiva única mesmo com blocos aninhados', () => {
    const aninhado = {
      ...fixture,
      blocos: [
        { tipo: 'usar_grid' },
        {
          tipo: 'se',
          condicao: 'x > 0',
          ramos: {
            entao: [{ tipo: 'usar_grid' }, { tipo: 'grid_visitar', x: 1, y: 1, passo: 1 }],
            senao: [],
          },
        },
      ],
    };
    const portugol = gerarPortugol(aninhado);
    expect(portugol.match(/usar "grid"/g)).toHaveLength(1);
    expect(portugol).toContain('        grid_visitar(1, 1, 1)');
  });

  it('recusa coordenadas não inteiras antes de gerar', () => {
    const invalido = structuredClone(fixture);
    invalido.blocos[2].x = 2.5;
    expect(validarProjeto(invalido).erros).toContain(
      `blocos[2]: ${MENSAGENS.valorInteiroInvalido}`,
    );
    expect(() => gerarPortugol(invalido)).toThrow(MENSAGENS.valorInteiroInvalido);
  });
});

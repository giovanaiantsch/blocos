import { describe, expect, it } from 'vitest';

import { TOOLBOX } from '../../src/blocks/toolbox.js';
import { toolboxParaMissao } from '../../src/blocks/toolboxParaMissao.js';
import { derivarBlocosPermitidos } from '../../src/missoes/derivar.js';

const tipos = (toolbox) => toolbox.contents.flatMap((categoria) => categoria.contents.map((item) => item.type));

describe('toolbox filtrada por missão (EC-01)', () => {
  it('devolve a toolbox original quando não há missão', () => {
    expect(toolboxParaMissao(null)).toBe(TOOLBOX);
    expect(toolboxParaMissao(undefined)).toBe(TOOLBOX);
    expect(tipos(toolboxParaMissao())).toHaveLength(18);
  });

  it('remove categorias inteiras quando nenhum bloco delas é permitido', () => {
    const filtrada = toolboxParaMissao(['declarar', 'escreva', 'expressao_livre', 'op_soma']);
    expect(filtrada.contents.map((categoria) => categoria.name)).toEqual([
      'Entrada e saída',
      'Variáveis',
      'Operadores',
    ]);
    expect(tipos(filtrada)).toEqual(['escreva', 'expressao_livre', 'declarar', 'op_soma']);
  });

  it('acrescenta a categoria do módulo somente quando ele é permitido', () => {
    const filtrada = toolboxParaMissao(
      derivarBlocosPermitidos({
        codigoInicial: 'algoritmo "G"\nusar "grid"\ninicio\ngrid_visitar(1, 1, 1)\nfim_algoritmo',
        descricao: 'Visite uma célula.',
      }),
    );
    expect(filtrada.contents.map((categoria) => categoria.name)).toEqual(['Módulo Grid']);
    expect(tipos(filtrada)).toEqual(['usar_grid', 'grid_visitar']);
  });

  it('não altera a toolbox original', () => {
    const antes = JSON.stringify(TOOLBOX);
    toolboxParaMissao(['leia']);
    expect(JSON.stringify(TOOLBOX)).toBe(antes);
  });
});

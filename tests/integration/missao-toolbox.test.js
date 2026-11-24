import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { toolboxParaMissao } from '../../src/blocks/toolboxParaMissao.js';
import { derivarBlocosPermitidos } from '../../src/missoes/derivar.js';
import { lerMissao } from '../../src/missoes/schema.js';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const tiposDaMissao = (nome) => {
  const carregada = lerMissao(readFileSync(resolve(raiz, 'public/missoes', nome), 'utf8'));
  expect(carregada.valido).toBe(true);
  return derivarBlocosPermitidos(carregada.missao);
};
const tipos = (toolbox) => toolbox.contents.flatMap((categoria) => categoria.contents.map((item) => item.type));

describe('duas missões, duas toolboxes diferentes (EC-01/SC-010)', () => {
  const taximetro = tipos(toolboxParaMissao(tiposDaMissao('calculo_gn_taximetro.json')));
  const fila = tipos(toolboxParaMissao(tiposDaMissao('fila_prioridade_simples.json')));

  it('a do taxímetro não oferece atribuição nem decisão', () => {
    expect(taximetro).toEqual(['escreva', 'expressao_livre', 'declarar', 'op_soma']);
    expect(taximetro).not.toContain('atribuir');
    expect(taximetro).not.toContain('se');
    expect(taximetro).not.toContain('leia');
  });

  it('a da Fila VIP troca o conjunto e não oferece soma', () => {
    expect(fila).toEqual(['escreva', 'expressao_livre', 'declarar', 'atribuir', 'se']);
    expect(fila).toContain('se');
    expect(fila).toContain('atribuir');
    expect(fila).not.toContain('op_soma');
  });

  it('os conjuntos não são iguais (prova do filtro por missão)', () => {
    expect(taximetro).not.toEqual(fila);
    expect(taximetro.filter((tipo) => !fila.includes(tipo))).toEqual(['op_soma']);
    expect(fila.filter((tipo) => !taximetro.includes(tipo))).toEqual(['atribuir', 'se']);
  });

  it('sem missão, todos os 18 blocos do catálogo continuam disponíveis', () => {
    expect(tipos(toolboxParaMissao())).toHaveLength(18);
  });
});

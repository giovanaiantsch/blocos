import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { derivarBlocosPermitidos } from '../../src/missoes/derivar.js';
import { validarMissao } from '../../src/missoes/schema.js';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const missao = (nome) =>
  validarMissao(
    JSON.parse(readFileSync(resolve(raiz, 'public/missoes', nome), 'utf8')),
  ).missao;

describe('derivação determinística dos blocos permitidos (EC-01)', () => {
  it('deriva da missão do taxímetro sem inventar atribuição ou decisão', () => {
    expect(derivarBlocosPermitidos(missao('calculo_gn_taximetro.json'))).toEqual([
      'escreva',
      'expressao_livre',
      'declarar',
      'op_soma',
    ]);
  });

  it('deriva da Fila VIP com atribuição e se, mas sem operador de soma', () => {
    const tipos = derivarBlocosPermitidos(missao('fila_prioridade_simples.json'));
    expect(tipos).toEqual(['escreva', 'expressao_livre', 'declarar', 'atribuir', 'se']);
    expect(tipos).not.toContain('op_soma');
  });

  it('deriva a diretiva e as funções do módulo antes de remover aspas', () => {
    expect(derivarBlocosPermitidos(missao('grid-visitar.json'))).toEqual([
      'escreva',
      'expressao_livre',
      'usar_grid',
      'grid_iniciar',
      'grid_visitar',
    ]);
  });

  it('produz a mesma lista em execuções repetidas', () => {
    const taxa = missao('calculo_gn_taximetro.json');
    const primeiro = derivarBlocosPermitidos(taxa);
    for (let indice = 0; indice < 10; indice += 1) {
      expect(derivarBlocosPermitidos(taxa)).toEqual(primeiro);
    }
  });

  it('ignora construções não implementadas e reconhece leia explícito', () => {
    const tipos = derivarBlocosPermitidos({
      codigoInicial:
        'algoritmo "Teste"\nvar x : inteiro\nfuncao f()\nretorne 0\ninicio\nleia(x)\nescreva(x)\nfim_algoritmo',
      descricao: 'Use `funcao` e `retorne`.',
    });
    expect(tipos).toContain('leia');
    expect(tipos).toContain('declarar');
    expect(tipos).not.toContain('funcao');
    expect(tipos).not.toContain('retorne');
  });

  it('não confunde o sinal de atribuição com operador de menor', () => {
    const tipos = derivarBlocosPermitidos({
      codigoInicial: 'algoritmo "Teste"\nvar x : inteiro\ninicio\nx <- 1\nfim_algoritmo',
      descricao: 'Atribua 1 a x.',
    });
    expect(tipos).toContain('atribuir');
    expect(tipos).not.toContain('op_menor');
  });

  it('reconhece todos os operadores e laços do catálogo quando o código os usa', () => {
    const tipos = derivarBlocosPermitidos({
      codigoInicial: [
        'algoritmo "Tudo"',
        'var x : inteiro',
        'inicio',
        'leia(x)',
        'x <- 1 + 2 * 3 / 4 - 5',
        'escreva(x > 1)',
        'escreva(x < 2)',
        'escreva(x == 1)',
        'escreva(x e x)',
        'escreva(x ou x)',
        'escreva(nao x)',
        'enquanto x > 0 faca',
        'escreva(x)',
        'fim_enquanto',
        'para i de 1 ate 3 faca',
        'escreva(i)',
        'fim_para',
        'fim_algoritmo',
      ].join('\n'),
      descricao: 'Use todos os operadores, enquanto e para.',
    });
    expect(tipos).toEqual(
      expect.arrayContaining([
        'leia',
        'escreva',
        'declarar',
        'atribuir',
        'op_soma',
        'op_subtracao',
        'op_multiplicacao',
        'op_divisao',
        'op_maior',
        'op_menor',
        'op_igual',
        'op_e',
        'op_ou',
        'op_nao',
        'enquanto',
        'para',
      ]),
    );
  });

  it('não transforma prosa em laço e lida com missão sem texto', () => {
    const tipos = derivarBlocosPermitidos({ codigoInicial: '', descricao: '' });
    expect(tipos).toEqual([]);
    expect(
      derivarBlocosPermitidos({
        codigoInicial: 'algoritmo "Teste"\ninicio\nfim_algoritmo',
        descricao: 'Visite o mapa para praticar a busca.',
      }),
    ).toEqual([]);
  });
});

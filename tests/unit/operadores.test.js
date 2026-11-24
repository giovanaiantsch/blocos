import { describe, expect, it } from 'vitest';

import {
  DEFINICOES_OPERADORES,
  expressaoDaEntrada,
  expressaoDeBloco,
  preencherEntradasPadrao,
  restaurarExpressao,
} from '../../src/blocks/operadores.js';
import { OPERADORES_PROVISORIOS, expressaoAceita } from '../../src/generation/operadores.js';
import { criarWorkspaceFake, conectarValor } from '../helpers/workspace-fake.js';

describe('operadores provisórios (T027 — aguardando T006/T007 para aceite)', () => {
  it('oferece apenas o catálogo provisório documentado', () => {
    const simbolos = Object.values(OPERADORES_PROVISORIOS).map((item) => item.simbolo);

    expect(simbolos).toEqual(
      expect.arrayContaining(['+', '-', '*', '/', '>', '<', '>=', '<=', '==', 'e', 'ou', 'nao']),
    );
    for (const definicao of DEFINICOES_OPERADORES.filter((item) => item.type.startsWith('op_'))) {
      expect(definicao.output).toBe('Expression');
      expect(definicao.tooltip).toContain('provisório');
    }
  });

  it('aceita expressões do catálogo e recusa operadores fora dele', () => {
    expect(expressaoAceita('x * 2')).toBe(true);
    expect(expressaoAceita('x > 0 e y < 3')).toBe(true);
    expect(expressaoAceita('nao x')).toBe(true);
    expect(expressaoAceita('x ** 2')).toBe(false);
    expect(expressaoAceita('x % 2')).toBe(false);
    expect(expressaoAceita('')).toBe(false);
  });

  it('reconstrói e volta a serializar uma expressão com precedência', () => {
    const workspace = criarWorkspaceFake();
    const bloco = restaurarExpressao('x * 2 + 1', workspace);

    expect(expressaoDeBloco(bloco)).toBe('x * 2 + 1');
  });

  it('reconstrói o operador unário nao', () => {
    const workspace = criarWorkspaceFake();
    const bloco = restaurarExpressao('nao x', workspace);

    expect(bloco.type).toBe('op_nao');
    expect(expressaoDeBloco(bloco)).toBe('nao x');
  });

  it('não interpreta palavras de operador dentro de texto entre aspas', () => {
    const workspace = criarWorkspaceFake();
    const bloco = restaurarExpressao('"nao"', workspace);

    expect(bloco.type).toBe('expressao_livre');
    expect(expressaoDeBloco(bloco)).toBe('"nao"');
  });

  it('preenche entradas de valor vazias sem tocar em entradas de pilha', () => {
    const workspace = criarWorkspaceFake();
    const se = workspace.newBlock('se');

    preencherEntradasPadrao(se, workspace);

    expect(expressaoDaEntrada(se, 'COND')).toBe('x > 0');
    expect(se.getInput('ENTAO').connection.targetBlock()).toBeNull();
    expect(se.getInput('SENAO').connection.targetBlock()).toBeNull();
  });

  it('lê expressão de bloco conectado e de campo legado', () => {
    const workspace = criarWorkspaceFake();
    const escreva = workspace.newBlock('escreva');
    const expressao = workspace.newBlock('expressao_livre');
    expressao.setFieldValue('"olá"', 'VALOR');
    conectarValor(escreva, 'EXPR', expressao);

    expect(expressaoDaEntrada(escreva, 'EXPR')).toBe('"olá"');
    expect(expressaoDaEntrada({ getFieldValue: () => 'x + 1' }, 'EXPR')).toBe('x + 1');
  });
});

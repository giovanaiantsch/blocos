import { describe, expect, it } from 'vitest';

import { conectarValor, criarWorkspaceFake } from '../helpers/workspace-fake.js';
import { DEFINICOES_BLOCOS_TODAS } from '../../src/blocks/registro.js';
import {
  DEFINICOES_VARIAVEIS,
  blocoVariavelParaJSON,
  restaurarBlocoVariavel,
} from '../../src/blocks/variaveis.js';
import { gerarPortugol } from '../../src/generation/gerador.js';

describe('blocos de variáveis (T027/T028 — sintaxe provisória)', () => {
  it('define declarar uma única vez e mantém atribuir na categoria de entrada e saída', () => {
    const tipos = DEFINICOES_BLOCOS_TODAS.map((definicao) => definicao.type);
    const declarar = DEFINICOES_VARIAVEIS.find((definicao) => definicao.type === 'declarar');

    expect(tipos.filter((tipo) => tipo === 'declarar')).toHaveLength(1);
    expect(tipos.filter((tipo) => tipo === 'atribuir')).toHaveLength(1);
    expect(declarar.args0.map((argumento) => argumento.name)).toEqual(['VAR', 'TIPO']);
  });

  it('serializa declaração e atribuição a partir do Blockly', () => {
    const bloco = (tipo, campos, conexoes = {}) => ({
      type: tipo,
      getFieldValue: (nome) => campos[nome] ?? null,
      ...conexoes,
    });

    expect(blocoVariavelParaJSON(bloco('declarar', { VAR: 'x', TIPO: 'real' }))).toEqual({
      tipo: 'declarar',
      variavel: 'x',
      tipoVariavel: 'real',
    });

    const Expressao = { getFieldValue: () => 'x * 2' };
    expect(
      blocoVariavelParaJSON(
        bloco('atribuir', { VAR: 'x' }, { getInputTargetBlock: () => Expressao }),
      ),
    ).toEqual({ tipo: 'atribuir', variavel: 'x', expressao: 'x * 2' });
  });

  it('restaura declaração e atribuição com expressão conectada', () => {
    const workspace = criarWorkspaceFake();
    const declarar = restaurarBlocoVariavel(
      { tipo: 'declarar', variavel: 'soma', tipoVariavel: 'inteiro' },
      workspace,
    );
    const atribuir = restaurarBlocoVariavel(
      { tipo: 'atribuir', variavel: 'soma', expressao: 'soma + 1' },
      workspace,
    );

    expect(blocoVariavelParaJSON(declarar)).toEqual({
      tipo: 'declarar',
      variavel: 'soma',
      tipoVariavel: 'inteiro',
    });
    expect(blocoVariavelParaJSON(atribuir)).toEqual({
      tipo: 'atribuir',
      variavel: 'soma',
      expressao: 'soma + 1',
    });
  });

  it('gera a seção var com o tipo da declaração', () => {
    const portugol = gerarPortugol({
      versao: 1,
      titulo: 'Tipos',
      blocos: [
        { tipo: 'declarar', variavel: 'soma', tipoVariavel: 'real' },
        { tipo: 'atribuir', variavel: 'soma', expressao: '1.5' },
      ],
      entrada: [],
    });

    expect(portugol).toContain('var');
    expect(portugol).toContain('soma: real');
    expect(portugol).toContain('soma <- 1.5');
  });

  it('mantém compatibilidade com bloco de atribuição com campo de texto', () => {
    const workspace = criarWorkspaceFake();
    const atribuir = workspace.newBlock('atribuir');
    const expressao = workspace.newBlock('expressao_livre');
    expressao.setFieldValue('x - 1', 'VALOR');
    conectarValor(atribuir, 'EXPR', expressao);

    expect(blocoVariavelParaJSON(atribuir)).toEqual({
      tipo: 'atribuir',
      variavel: 'x',
      expressao: 'x - 1',
    });
  });
});

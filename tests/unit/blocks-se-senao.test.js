import { describe, expect, it } from 'vitest';

import { DEFINICOES_SE_SENAO } from '../../src/blocks/se-senao.js';
import { serializarWorkspace } from '../../src/blocks/serializacao.js';
import { gerarPortugol } from '../../src/generation/gerador.js';
import { conectarPilha, conectarValor, criarWorkspaceFake } from '../helpers/workspace-fake.js';

function escrevaComExpressao(workspace, texto) {
  const bloco = workspace.newBlock('escreva');
  const expressao = workspace.newBlock('expressao_livre');
  expressao.setFieldValue(texto, 'VALOR');
  conectarValor(bloco, 'EXPR', expressao);
  return bloco;
}

function montarSe(workspace) {
  const se = workspace.newBlock('se');
  const condicao = workspace.newBlock('expressao_livre');
  condicao.setFieldValue('x > 0', 'VALOR');
  conectarValor(se, 'COND', condicao);
  conectarPilha(se, 'ENTAO', escrevaComExpressao(workspace, '"positivo"'));
  conectarPilha(se, 'SENAO', escrevaComExpressao(workspace, '"outro"'));
  return se;
}

describe('decisão com se/senão (T029 — aceite com Core depende de T007)', () => {
  it('define o bloco com condição e dois ramos em pt-BR', () => {
    const definicao = DEFINICOES_SE_SENAO[0];

    expect(definicao.type).toBe('se');
    expect(definicao.message0).toContain('senao');
    expect(definicao.args0.map((argumento) => argumento.name)).toEqual([
      'COND',
      'ENTAO',
      'SENAO',
    ]);
  });

  it('serializa condição e ramos aninhados', () => {
    const workspace = criarWorkspaceFake();
    montarSe(workspace);

    expect(serializarWorkspace(workspace)[0]).toEqual({
      tipo: 'se',
      condicao: 'x > 0',
      ramos: {
        entao: [{ tipo: 'escreva', expressao: '"positivo"' }],
        senao: [{ tipo: 'escreva', expressao: '"outro"' }],
      },
    });
  });

  it('gera as duas saídas distintas no Portugol', () => {
    const workspace = criarWorkspaceFake();
    montarSe(workspace);
    const blocos = serializarWorkspace(workspace);
    const portugol = gerarPortugol({
      versao: 1,
      titulo: 'Decisão',
      blocos,
      entrada: [],
    });

    expect(blocos).toHaveLength(1);
    expect(portugol).toContain('se x > 0 entao');
    expect(portugol).toContain('escreva("positivo")');
    expect(portugol).toContain('senao');
    expect(portugol).toContain('escreva("outro")');
    expect(portugol).toContain('fim_se');
  });
});

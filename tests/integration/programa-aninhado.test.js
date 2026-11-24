import { describe, expect, it } from 'vitest';

import { carregarProjetoNoWorkspace, serializarWorkspace } from '../../src/blocks/serializacao.js';
import { gerarPortugol } from '../../src/generation/gerador.js';
import { carregarProjeto } from '../../src/persistence/carregar.js';
import { serializarProjeto } from '../../src/persistence/salvar.js';
import { criarWorkspaceFake } from '../helpers/workspace-fake.js';

/** Programa com declaração, laço, decisão e saída dentro do laço. */
const PROJETO_ANINHADO = {
  versao: 1,
  titulo: 'Soma ate tres',
  blocos: [
    { tipo: 'declarar', variavel: 'soma', tipoVariavel: 'inteiro' },
    { tipo: 'atribuir', variavel: 'soma', expressao: '0' },
    {
      tipo: 'para',
      variavel: 'i',
      inicio: 1,
      fim: 3,
      passo: 1,
      corpo: [
        { tipo: 'atribuir', variavel: 'soma', expressao: 'soma + i' },
        {
          tipo: 'se',
          condicao: 'i > 1',
          ramos: {
            entao: [{ tipo: 'escreva', expressao: 'i' }],
            senao: [{ tipo: 'escreva', expressao: '0' }],
          },
        },
      ],
    },
    { tipo: 'escreva', expressao: 'soma' },
  ],
  entrada: [],
};

describe('programa aninhado: blocos -> Portugol -> JSON -> blocos', () => {
  it('preserva a árvore e o Portugol após salvar e reabrir', () => {
    const portugolAntes = gerarPortugol(PROJETO_ANINHADO);
    const workspace = criarWorkspaceFake();

    expect(carregarProjetoNoWorkspace(PROJETO_ANINHADO, workspace)).toBe(4);
    const blocos = serializarWorkspace(workspace);
    expect(blocos).toEqual(PROJETO_ANINHADO.blocos);

    const json = serializarProjeto({ ...PROJETO_ANINHADO, blocos });
    const reaberto = carregarProjeto(json);
    expect(reaberto.mensagens).toEqual([]);
    expect(reaberto.projeto.blocos).toEqual(PROJETO_ANINHADO.blocos);

    const workspaceReaberto = criarWorkspaceFake();
    carregarProjetoNoWorkspace(reaberto.projeto, workspaceReaberto);
    const portugolDepois = gerarPortugol({
      ...reaberto.projeto,
      blocos: serializarWorkspace(workspaceReaberto),
    });

    expect(portugolDepois).toBe(portugolAntes);
    expect(portugolDepois).toContain('para i de 1 ate 3 passo 1 faca');
    expect(portugolDepois).toContain('se i > 1 entao');
    expect(portugolDepois).toContain('escreva(soma)');
  });
});

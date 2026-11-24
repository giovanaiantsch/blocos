import { describe, expect, it } from 'vitest';

import { DEFINICOES_REPETICOES } from '../../src/blocks/repeticoes.js';
import { carregarProjetoNoWorkspace, serializarWorkspace } from '../../src/blocks/serializacao.js';
import { executarCore } from '../../src/core/runner.js';
import { gerarPortugol } from '../../src/generation/gerador.js';
import MENSAGENS from '../../src/messages/index.js';
import { validarProjeto } from '../../src/persistence/schema.js';
import { criarWorkspaceFake } from '../helpers/workspace-fake.js';

const PROJETO_LACOS = {
  versao: 1,
  titulo: 'Laços',
  blocos: [
    {
      tipo: 'enquanto',
      condicao: 'i < 3',
      corpo: [{ tipo: 'atribuir', variavel: 'i', expressao: 'i + 1' }],
    },
    {
      tipo: 'para',
      variavel: 'i',
      inicio: 1,
      fim: 3,
      passo: 1,
      corpo: [{ tipo: 'escreva', expressao: 'i' }],
    },
  ],
  entrada: [],
};

describe('repetições enquanto e para (T031 — aceite com Core depende de T007)', () => {
  it('define os blocos com campos e ramos em pt-BR', () => {
    const tipos = DEFINICOES_REPETICOES.map((definicao) => definicao.type);

    expect(tipos).toEqual(expect.arrayContaining(['enquanto', 'para']));
    const para = DEFINICOES_REPETICOES.find((definicao) => definicao.type === 'para');
    expect(para.args0.map((argumento) => argumento.name)).toEqual([
      'VAR',
      'INICIO',
      'FIM',
      'PASSO',
      'CORPO',
    ]);
  });

  it('faz ida e volta dos laços pelo workspace e gera as três repetições', () => {
    const workspace = criarWorkspaceFake();

    expect(carregarProjetoNoWorkspace(PROJETO_LACOS, workspace)).toBe(2);
    const blocos = serializarWorkspace(workspace);
    expect(blocos).toEqual(PROJETO_LACOS.blocos);
    expect(validarProjeto({ ...PROJETO_LACOS, blocos }).valido).toBe(true);

    const portugol = gerarPortugol({ ...PROJETO_LACOS, blocos });
    expect(portugol).toContain('enquanto i < 3 faca');
    expect(portugol).toContain('i <- i + 1');
    expect(portugol).toContain('fim_enquanto');
    expect(portugol).toContain('para i de 1 ate 3 passo 1 faca');
    expect(portugol).toContain('escreva(i)');
    expect(portugol).toContain('fim_para');
  });

  it('devolve a mensagem de limite quando o compilador estoura o tempo', () => {
    const spawn = () => ({
      status: null,
      stdout: '',
      stderr: '',
      error: Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' }),
    });

    const resultado = executarCore({ portugol: 'algoritmo "x"\ninicio\nfim_algoritmo', spawn });

    expect(resultado.status).toBe('limite');
    expect(resultado.interrompidoPorLimite).toBe(true);
    expect(resultado.erro).toBe(MENSAGENS.limiteExecucao);
  });
});

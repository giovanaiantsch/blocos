import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { gerarPortugol } from '../../src/generation/gerador.js';
import MENSAGENS from '../../src/messages/index.js';

const fixture = JSON.parse(
  readFileSync(new URL('../fixtures/dobrar-entrada.json', import.meta.url), 'utf8'),
);

describe('geração pura de Portugol', () => {
  it('gera o programa do fixture com a gramática documentada no plano/guia', () => {
    const portugol = gerarPortugol(fixture);

    expect(portugol).toContain('algoritmo "Dobrar a entrada"');
    expect(portugol).toContain('var');
    expect(portugol).toContain('x: inteiro');
    expect(portugol).toContain('inicio');
    expect(portugol).toContain('leia(x)');
    expect(portugol).toContain('x <- x * 2');
    expect(portugol).toContain('escreva(x)');
    expect(portugol).toContain('fim_algoritmo');
  });

  it('é determinístico para a mesma entrada', () => {
    expect(gerarPortugol(fixture)).toBe(gerarPortugol(fixture));
  });

  it('indica ausência de código para projeto vazio, sem erro', () => {
    expect(gerarPortugol({ titulo: 'Vazio', blocos: [] })).toBe(MENSAGENS.vazio);
  });

  it('recusa expressão incompleta em português do Brasil', () => {
    const projeto = {
      ...fixture,
      blocos: [{ tipo: 'escreva' }],
      entrada: [],
    };

    expect(() => gerarPortugol(projeto)).toThrow(MENSAGENS.expressaoIncompleta);
  });

  it('mantém aninhamento de se/senao, enquanto e para', () => {
    const projeto = {
      versao: 1,
      titulo: 'Estruturas',
      blocos: [
        {
          tipo: 'se',
          condicao: 'x > 0',
          ramos: {
            entao: [{ tipo: 'escreva', expressao: '"positivo"' }],
            senao: [{ tipo: 'escreva', expressao: '"outro"' }],
          },
        },
        {
          tipo: 'enquanto',
          condicao: 'x < 3',
          corpo: [{ tipo: 'atribuir', variavel: 'x', expressao: 'x + 1' }],
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
    const portugol = gerarPortugol(projeto);

    expect(portugol).toContain('se x > 0 entao');
    expect(portugol).toContain('senao');
    expect(portugol).toContain('fim_se');
    expect(portugol).toContain('enquanto x < 3 faca');
    expect(portugol).toContain('fim_enquanto');
    expect(portugol).toContain('para i de 1 ate 3 passo 1 faca');
    expect(portugol).toContain('fim_para');
  });
});

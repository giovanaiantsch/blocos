import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { carregarProjeto } from '../../src/persistence/carregar.js';
import { serializarProjeto } from '../../src/persistence/salvar.js';

const fixtureTexto = readFileSync(
  new URL('../fixtures/dobrar-entrada.json', import.meta.url),
  'utf8',
);
const fixture = JSON.parse(fixtureTexto);

describe('salvamento de projeto JSON (RF-13)', () => {
  it('serializa versao, titulo, blocos e entrada em UTF-8', () => {
    const json = serializarProjeto(fixture);
    const salvo = JSON.parse(json);

    expect(salvo).toEqual({
      versao: 1,
      titulo: 'Dobrar a entrada',
      blocos: fixture.blocos,
      entrada: [3],
    });
    expect(json).toContain('"versao"');
  });

  it('não altera o projeto nem o Portugol exibido', () => {
    const estado = carregarProjeto(fixtureTexto);
    const projetoAntes = estado.projeto;
    const portugolAntes = estado.portugolGerado;

    serializarProjeto(estado.projeto);

    expect(estado.projeto).toBe(projetoAntes);
    expect(estado.portugolGerado).toBe(portugolAntes);
  });

  it('produz um arquivo suficiente para restaurar o projeto em outra sessão', () => {
    const json = serializarProjeto(fixture);
    const estado = carregarProjeto(json);

    expect(estado.mensagens).toEqual([]);
    expect(estado.projeto).toEqual(fixture);
    expect(estado.portugolGerado).toContain('x <- x * 2');
  });
});

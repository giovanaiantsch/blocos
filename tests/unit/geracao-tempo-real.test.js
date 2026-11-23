import { describe, expect, it } from 'vitest';

import { calcularPortugol, registrarObservador } from '../../src/ui/estado.js';
import MENSAGENS from '../../src/messages/index.js';

const vazio = { versao: 1, titulo: 'Vazio', blocos: [], entrada: [] };

function bloco(tipo, campos) {
  return { tipo, ...campos };
}

describe('atualização automática do Portugol (RF-03/SC-003)', () => {
  it('recupera o estado quando um bloco é incluído, alterado e removido', () => {
    const estado = calcularPortugol({}, vazio);
    expect(estado.portugolGerado).toBe(MENSAGENS.vazio);

    const incluido = calcularPortugol(estado, {
      ...vazio,
      blocos: [bloco('escreva', { expressao: '1' })],
    });
    expect(incluido.portugolGerado).toContain('escreva(1)');

    const alterado = calcularPortugol(incluido, {
      ...vazio,
      blocos: [bloco('escreva', { expressao: '2' })],
    });
    expect(alterado.portugolGerado).toContain('escreva(2)');
    expect(alterado.portugolGerado).not.toContain('escreva(1)');

    const removido = calcularPortugol(alterado, vazio);
    expect(removido.portugolGerado).toBe(MENSAGENS.vazio);
  });

  it('atualiza em menos de 1 segundo e sem ação manual', () => {
    const inicio = performance.now();
    const estado = calcularPortugol({}, {
      ...vazio,
      blocos: [
        bloco('leia', { variavel: 'x' }),
        bloco('atribuir', { variavel: 'x', expressao: 'x * 2' }),
        bloco('escreva', { expressao: 'x' }),
      ],
    });
    const duracao = performance.now() - inicio;

    expect(duracao).toBeLessThan(1000);
    expect(estado.portugolGerado).toContain('x <- x * 2');
  });

  it('liga eventos do workspace ao recálculo e à pintura do painel', () => {
    let ouvinte;
    const workspace = {
      addChangeListener(callback) {
        ouvinte = callback;
      },
    };
    const pinturas = [];
    const estado = registrarObservador({
      workspace,
      estadoInicial: {},
      obterProjeto: () => ({ ...vazio, blocos: [bloco('escreva', { expressao: '7' })] }),
      pintar: (texto) => pinturas.push(texto),
    });

    expect(typeof ouvinte).toBe('function');
    ouvinte();
    expect(estado.portugolGerado).toContain('escreva(7)');
    expect(pinturas.at(-1)).toBe(estado.portugolGerado);
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import MENSAGENS from '../../src/messages/index.js';
import { carregarProjeto } from '../../src/persistence/carregar.js';
import { criarAcoesPersistencia } from '../../src/ui/persistencia.js';

const textoFixture = readFileSync(
  new URL('../fixtures/dobrar-entrada.json', import.meta.url),
  'utf8',
);
const fixture = JSON.parse(textoFixture);

function criarInterface() {
  const projetoInicial = carregarProjeto(textoFixture).projeto;
  let projeto = projetoInicial;
  const mensagens = [];
  const aplicacoes = [];

  const acoes = criarAcoesPersistencia({
    obterProjeto: () => projeto,
    aplicarProjeto: (novoProjeto) => {
      aplicacoes.push(novoProjeto);
      projeto = novoProjeto;
    },
    exibirMensagem: (mensagem) => mensagens.push(mensagem),
  });

  return { acoes, mensagens, aplicacoes, obterProjeto: () => projeto };
}

describe('ações de salvar e carregar da interface (T033-T035)', () => {
  it('aplica um projeto válido e avisa em pt-BR', () => {
    const interfaceFake = criarInterface();
    const outro = { ...fixture, titulo: 'Outro projeto' };

    const resultado = interfaceFake.acoes.carregar(JSON.stringify(outro));

    expect(resultado.mensagens).toEqual([]);
    expect(interfaceFake.aplicacoes).toHaveLength(1);
    expect(interfaceFake.obterProjeto().titulo).toBe('Outro projeto');
    expect(interfaceFake.mensagens).toContain(MENSAGENS.carregadoComSucesso);
  });

  it('recusa JSON inválido sem tocar no projeto aberto', () => {
    const interfaceFake = criarInterface();
    const antes = interfaceFake.obterProjeto();

    const resultado = interfaceFake.acoes.carregar('{');

    expect(resultado.mensagens).toEqual([MENSAGENS.jsonInvalido]);
    expect(resultado.projetoAnterior).toBe(antes);
    expect(interfaceFake.aplicacoes).toEqual([]);
    expect(interfaceFake.obterProjeto()).toBe(antes);
    expect(interfaceFake.mensagens.at(-1)).toBe(MENSAGENS.jsonInvalido);
  });

  it('salva sem alterar o estado exibido', () => {
    const interfaceFake = criarInterface();
    const antes = interfaceFake.obterProjeto();

    const json = interfaceFake.acoes.salvar();

    expect(JSON.parse(json).titulo).toBe(fixture.titulo);
    expect(interfaceFake.obterProjeto()).toBe(antes);
    expect(interfaceFake.mensagens.at(-1)).toBe(MENSAGENS.salvoComSucesso);
  });
});

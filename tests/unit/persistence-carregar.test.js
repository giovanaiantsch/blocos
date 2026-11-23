import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { carregarProjeto } from '../../src/persistence/carregar.js';
import { criarEstadoInicial } from '../../src/persistence/schema.js';
import MENSAGENS, { mensagemBlocoDesconhecido } from '../../src/messages/index.js';

const fixtureTexto = readFileSync(
  new URL('../fixtures/dobrar-entrada.json', import.meta.url),
  'utf8',
);

describe('carregamento de projeto JSON', () => {
  it('carrega o fixture, reconstrói os blocos e gera o Portugol', () => {
    const estado = carregarProjeto(fixtureTexto);

    expect(estado.projeto.titulo).toBe('Dobrar a entrada');
    expect(estado.projeto.blocos).toHaveLength(3);
    expect(estado.projeto.entrada).toEqual([3]);
    expect(estado.portugolGerado).toContain('x <- x * 2');
    expect(estado.mensagens).toEqual([]);
  });

  it('preserva o projeto aberto quando o JSON é inválido', () => {
    const projetoAtual = { titulo: 'Projeto aberto', blocos: [], entrada: [] };
    const estadoAtual = { ...criarEstadoInicial(), projeto: projetoAtual };

    const estado = carregarProjeto('{', estadoAtual);

    expect(estado.projeto).toBe(projetoAtual);
    expect(estado.projetoAnterior).toBe(projetoAtual);
    expect(estado.mensagens).toEqual([MENSAGENS.jsonInvalido]);
  });

  it('recusa versão incompatível sem substituir o projeto', () => {
    const projetoAtual = { titulo: 'Projeto aberto', blocos: [], entrada: [] };
    const estadoAtual = { ...criarEstadoInicial(), projeto: projetoAtual };
    const conteudo = fixtureTexto.replace('"versao": 1', '"versao": 2');

    const estado = carregarProjeto(conteudo, estadoAtual);

    expect(estado.projeto).toBe(projetoAtual);
    expect(estado.mensagens).toEqual([MENSAGENS.versaoIncompativel]);
  });

  it('recusa bloco desconhecido sem substituir o projeto', () => {
    const conteudo = fixtureTexto.replace('"tipo": "leia"', '"tipo": "inexistente"');

    const estado = carregarProjeto(conteudo);

    expect(estado.projeto).toBeNull();
    expect(estado.mensagens).toContain(mensagemBlocoDesconhecido('inexistente'));
  });
});

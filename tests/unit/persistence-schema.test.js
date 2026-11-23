import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  criarEstadoInicial,
  criarResultadoExecucao,
  STATUS_EXECUCAO,
  STATUS_RESULTADO,
  validarProjeto,
} from '../../src/persistence/schema.js';
import MENSAGENS, { mensagemBlocoDesconhecido } from '../../src/messages/index.js';

const fixture = JSON.parse(
  readFileSync(new URL('../fixtures/dobrar-entrada.json', import.meta.url), 'utf8'),
);

function copiar(valor) {
  return JSON.parse(JSON.stringify(valor));
}

describe('validação do envelope JSON (data-model.md)', () => {
  it('aceita o fixture canônico', () => {
    const resultado = validarProjeto(fixture);

    expect(resultado.valido).toBe(true);
    expect(resultado.erros).toEqual([]);
    expect(resultado.projeto).toEqual(fixture);
  });

  it('rejeita ProjetoJSON.versao diferente de 1', () => {
    const projeto = copiar(fixture);
    projeto.versao = 2;

    expect(validarProjeto(projeto).erros).toContain(MENSAGENS.versaoIncompativel);
  });

  it('rejeita ProjetoJSON.titulo vazio ou longo demais', () => {
    const vazio = copiar(fixture);
    vazio.titulo = '';
    const longo = copiar(fixture);
    longo.titulo = 'x'.repeat(81);

    expect(validarProjeto(vazio).erros).toContain(MENSAGENS.tituloInvalido);
    expect(validarProjeto(longo).erros).toContain(MENSAGENS.tituloInvalido);
  });

  it('rejeita ProjetoJSON.blocos que não seja lista', () => {
    const projeto = copiar(fixture);
    projeto.blocos = {};

    expect(validarProjeto(projeto).valido).toBe(false);
  });

  it('rejeita BlocoSerializado.tipo desconhecido', () => {
    const projeto = copiar(fixture);
    projeto.blocos[0].tipo = 'desconhecido';

    expect(validarProjeto(projeto).erros).toContain(
      mensagemBlocoDesconhecido('desconhecido'),
    );
  });

  it('valida BlocoSerializado.variavel, tipoVariavel, expressao e condicao', () => {
    const semVariavel = copiar(fixture);
    semVariavel.blocos[0].variavel = '';
    const semExpressao = copiar(fixture);
    semExpressao.blocos[1].expressao = '';
    const semTipo = {
      ...copiar(fixture),
      blocos: [{ tipo: 'declarar', variavel: 'x', tipoVariavel: '' }],
      entrada: [],
    };
    const semCondicao = {
      ...copiar(fixture),
      blocos: [{ tipo: 'se', condicao: '' }],
      entrada: [],
    };

    expect(validarProjeto(semVariavel).valido).toBe(false);
    expect(validarProjeto(semExpressao).erros).toContain(MENSAGENS.expressaoIncompleta);
    expect(validarProjeto(semTipo).valido).toBe(false);
    expect(validarProjeto(semCondicao).valido).toBe(false);
  });

  it('valida BlocoSerializado.inicio, fim, passo, ramos e corpo', () => {
    const projetoInvalido = {
      ...copiar(fixture),
      blocos: [
        {
          tipo: 'para',
          variavel: 'i',
          inicio: 'um',
          fim: 3,
          passo: 1,
          corpo: [{ tipo: 'escreva', expressao: 'i' }],
        },
        {
          tipo: 'se',
          condicao: 'x > 0',
          ramos: { entao: [{ tipo: 'escreva', expressao: 'x' }], senao: 'invalido' },
        },
      ],
      entrada: [],
    };

    const erros = validarProjeto(projetoInvalido).erros;

    expect(erros.length).toBeGreaterThan(0);
    expect(erros.join(' ')).toMatch(/início|fim|passo|ramos/i);
  });

  it('rejeita ProjetoJSON.entrada com quantidade diferente de leituras', () => {
    const projeto = copiar(fixture);
    projeto.entrada = [];

    expect(validarProjeto(projeto).erros).toContain(MENSAGENS.entradaIncompleta);
  });

  it('expõe EstadoDoEditor e ResultadoDaExecucao conforme o modelo', () => {
    expect(criarEstadoInicial()).toEqual({
      projeto: null,
      portugolGerado: '',
      statusExecucao: 'parado',
      mensagens: [],
      projetoAnterior: null,
    });
    expect(STATUS_EXECUCAO).toEqual([
      'parado',
      'compilando',
      'executando',
      'sucesso',
      'erro',
      'limite',
    ]);
    expect(STATUS_RESULTADO).toEqual([
      'sucesso',
      'erro_compilacao',
      'erro_execucao',
      'limite',
    ]);
    expect(
      criarResultadoExecucao({
        status: 'limite',
        saida: '',
        erro: MENSAGENS.limiteExecucao,
        duracaoMs: 5000,
        interrompidoPorLimite: true,
      }),
    ).toEqual({
      status: 'limite',
      saida: '',
      erro: MENSAGENS.limiteExecucao,
      duracaoMs: 5000,
      interrompidoPorLimite: true,
    });
  });
});

import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { CONFIGURACAO_CORE } from '../../src/core/configuracao.js';
import { executarCore } from '../../src/core/runner.js';
import MENSAGENS from '../../src/messages/index.js';

function criarContexto() {
  return mkdtempSync(join(tmpdir(), 'meupia-runner-'));
}

function criarSpawn({ stdoutMeupia = '[COMPILED SUCCESSFULLY]\n', stdoutPython = '6\n', statusMeupia = 0, statusPython = 0, erroPython } = {}) {
  const chamadas = [];
  const spawn = (comando, args, opcoes) => {
    chamadas.push({ comando, args, opcoes });
    if (comando === 'meupia') {
      return { status: statusMeupia, stdout: stdoutMeupia, stderr: '', error: undefined };
    }
    return { status: statusPython, stdout: stdoutPython, stderr: '', error: erroPython };
  };
  return { chamadas, spawn };
}

describe('adaptador do Core com CLI simulada (somente teste unitário)', () => {
  it('compila, executa e devolve a saída com a entrada na ordem', () => {
    const diretorioTemporario = criarContexto();
    const { chamadas, spawn } = criarSpawn();

    try {
      const resultado = executarCore({
        portugol: 'algoritmo "Teste"\ninicio\nleia(x)\nescreva(x)\nfimalgoritmo',
        entrada: [3],
        limiteMs: 5000,
        configuracao: CONFIGURACAO_CORE,
        spawn,
        diretorioTemporario,
      });

      expect(chamadas[0].comando).toBe('meupia');
      expect(chamadas[0].args[0]).toMatch(/\.por$/);
      expect(readFileSync(chamadas[0].args[0], 'utf8')).toContain('leia(x)');
      expect(chamadas[1].comando).toBe('python');
      expect(chamadas[1].args[0]).toContain('output/');
      expect(chamadas[1].opcoes.input).toBe('3\n');
      expect(resultado).toMatchObject({
        status: 'sucesso',
        saida: '6\n',
        erro: '',
        interrompidoPorLimite: false,
      });
      expect(resultado.duracaoMs).toBeGreaterThanOrEqual(0);
    } finally {
      rmSync(diretorioTemporario, { recursive: true, force: true });
    }
  });

  it('devolve status de limite quando a execução expira', () => {
    const diretorioTemporario = criarContexto();
    const erro = Object.assign(new Error('ETIMEDOUT'), { code: 'ETIMEDOUT' });
    const { spawn } = criarSpawn({ statusPython: null, erroPython: erro });

    try {
      const resultado = executarCore({
        portugol: 'algoritmo "Teste"\ninicio\nescreva(1)\nfimalgoritmo',
        entrada: [],
        limiteMs: 5000,
        configuracao: CONFIGURACAO_CORE,
        spawn,
        diretorioTemporario,
      });

      expect(resultado.status).toBe('limite');
      expect(resultado.interrompidoPorLimite).toBe(true);
      expect(resultado.erro).toBe(MENSAGENS.limiteExecucao);
    } finally {
      rmSync(diretorioTemporario, { recursive: true, force: true });
    }
  });

  it('devolve erro de compilação em português do Brasil', () => {
    const diretorioTemporario = criarContexto();
    const { spawn } = criarSpawn({
      statusMeupia: 1,
      stdoutMeupia: '[COMPILATION ERROR]: Erro sintático na linha 1, coluna 1: teste',
    });

    try {
      const resultado = executarCore({
        portugol: 'algoritmo inválido',
        entrada: [],
        limiteMs: 5000,
        configuracao: CONFIGURACAO_CORE,
        spawn,
        diretorioTemporario,
      });

      expect(resultado.status).toBe('erro_compilacao');
      expect(resultado.erro).toMatch(/Erro/);
      expect(resultado.saida).toBe('');
    } finally {
      rmSync(diretorioTemporario, { recursive: true, force: true });
    }
  });
});

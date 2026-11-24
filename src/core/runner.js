import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import MENSAGENS from '../messages/index.js';
import { criarResultadoExecucao } from '../persistence/schema.js';

/**
 * Valores observáveis extraídos do contrato público (`contracts/core-runner.md`).
 * A tag da turma ainda não foi confirmada (T006/T007): comandos, prefixos e
 * caminho do Python são parâmetros injetáveis. Nada aqui importa módulo
 * interno do Core (RT-02).
 */
export const CONFIGURACAO_PROVISORIA = Object.freeze({
  comandoCompilador: 'meupia',
  comandoPython: 'python',
  prefixoSucesso: '[COMPILED SUCCESSFULLY]',
  prefixoErro: '[COMPILATION ERROR]:',
  diretorioSaida: 'output',
  limiteMs: 5000,
});

const NOME_BASE = 'programa';

function ehLimite(erro) {
  return erro?.code === 'ETIMEDOUT' || erro?.code === 'ABORT_ERR';
}

function texto(value) {
  return String(value ?? '');
}

function erroDeCompilacao(textoCompilacao, configuracao, duracaoMs, detalheProcesso = '') {
  const fonte = textoCompilacao || detalheProcesso;
  const semPrefixo = fonte
    .replace(configuracao.prefixoErro, '')
    .replace(configuracao.prefixoSucesso, '')
    .trim();
  const descricao = semPrefixo || MENSAGENS.problemaAoCompilar;
  const erro = /^erro/i.test(descricao)
    ? descricao
    : `Erro na compilação: ${descricao}`;

  return criarResultadoExecucao({
    status: 'erro_compilacao',
    erro,
    duracaoMs,
  });
}

function executarCom(diretorioTemporario, opcoes) {
  const {
    portugol,
    entrada = [],
    limiteMs = CONFIGURACAO_PROVISORIA.limiteMs,
    spawn = spawnSync,
    configuracao = CONFIGURACAO_PROVISORIA,
  } = opcoes;

  const inicio = Date.now();
  const concluir = (resultado) => ({
    ...resultado,
    duracaoMs: Math.max(resultado.duracaoMs, Date.now() - inicio),
  });

  const arquivoPor = join(diretorioTemporario, `${NOME_BASE}.por`);
  writeFileSync(arquivoPor, texto(portugol), 'utf8');

  const compilacao = spawn(
    configuracao.comandoCompilador,
    [arquivoPor],
    { cwd: diretorioTemporario, encoding: 'utf8', timeout: limiteMs },
  );

  if (ehLimite(compilacao.error)) {
    return concluir(criarResultadoExecucao({
      status: 'limite',
      erro: MENSAGENS.limiteExecucao,
      interrompidoPorLimite: true,
    }));
  }

  const stdoutCompilacao = texto(compilacao.stdout);
  if (
    compilacao.status !== 0 ||
    stdoutCompilacao.includes(configuracao.prefixoErro) ||
    !stdoutCompilacao.includes(configuracao.prefixoSucesso)
  ) {
    return concluir(erroDeCompilacao(
      stdoutCompilacao || texto(compilacao.stderr),
      configuracao,
      0,
      texto(compilacao.error?.message),
    ));
  }

  const arquivoPython = `${configuracao.diretorioSaida}/${NOME_BASE}.py`;
  const stdin = entrada.map(texto).map((valor) => `${valor}\n`).join('');
  const execucao = spawn(
    configuracao.comandoPython,
    [arquivoPython],
    {
      cwd: diretorioTemporario,
      encoding: 'utf8',
      timeout: limiteMs,
      input: stdin,
    },
  );

  if (ehLimite(execucao.error)) {
    return concluir(criarResultadoExecucao({
      status: 'limite',
      erro: MENSAGENS.limiteExecucao,
      interrompidoPorLimite: true,
    }));
  }

  if (execucao.error || execucao.status !== 0) {
    const detalhe = texto(execucao.stderr) || texto(execucao.error?.message);
    return concluir(criarResultadoExecucao({
      status: 'erro_execucao',
      erro: detalhe ? `Erro na execução: ${detalhe}` : MENSAGENS.problemaAoExecutar,
    }));
  }

  return concluir(criarResultadoExecucao({
    status: 'sucesso',
    saida: texto(execucao.stdout),
  }));
}

/**
 * Adaptador síncrono e puro em relação ao Core: a CLI é uma dependência
 * injetada, o que permite testar o contrato sem instalar o Python.
 */
export function executarCore(opcoes = {}) {
  const criouDiretorio = opcoes.diretorioTemporario === undefined;
  const diretorioTemporario =
    opcoes.diretorioTemporario ??
    mkdtempSync(join(tmpdir(), 'meupia-runner-'));

  try {
    return executarCom(diretorioTemporario, opcoes);
  } finally {
    if (criouDiretorio) {
      rmSync(diretorioTemporario, { recursive: true, force: true });
    }
  }
}

export default executarCore;

/**
 * Versão do meuPiá Core fixada pela dupla em 2026-11-23.
 *
 * A tag original da turma (Q-01) NÃO pôde ser confirmada. Como alternativa, a
 * dupla fixou `meuPia/core v1.4.1`. A referência remota foi conferida com
 * `git ls-remote --tags`: `refs/tags/v1.4.1` é uma tag anotada cujo objeto é
 * `b6a8fc8963629af441267388c2ce218e18b5d877` e aponta para o commit abaixo
 * (`refs/tags/v1.4.1^{}`), que também está registrado no `direct_url.json` do
 * pacote instalado.
 */
export const VERSAO_CORE = Object.freeze({
  tag: 'v1.4.1',
  commit: '68824d7f9e91f71670f3f466c0a5865a8685f020',
  objetoTag: 'b6a8fc8963629af441267388c2ce218e18b5d877',
  repositorio: 'https://github.com/meuPia/core.git',
  pacote: 'meupia-core==1.4.1',
  confirmadaEm: '2026-11-23',
  tagOriginalTurmaConfirmada: false,
});

/**
 * Interface pública confirmada nessa versão (RT-02): nenhum módulo interno do
 * Core é importado — apenas as CLIs `meupia <arquivo.por>` e
 * `python output/<nome>.py`. prefixos e caminhos foram validados pelo teste real
 * em `tests/acceptance/dobrar-entrada.test.js`.
 */
export const CONFIGURACAO_CORE = Object.freeze({
  versao: VERSAO_CORE,
  comandoCompilador: 'meupia',
  comandoPython: 'python',
  prefixoSucesso: '[COMPILED SUCCESSFULLY]',
  prefixoErro: '[COMPILATION ERROR]:',
  diretorioSaida: 'output',
  limiteMs: 5000,
});

/**
 * Permite apontar para o ambiente que instalou exatamente `VERSAO_CORE.tag`
 * sem alterar os valores padrão da interface pública.
 *
 * Variáveis aceitas: `MEUPIA_COMANDO` e `MEUPIA_PYTHON`.
 */
export function configuracaoDoAmbiente(ambiente = globalThis.process?.env ?? {}) {
  return Object.freeze({
    ...CONFIGURACAO_CORE,
    comandoCompilador: ambiente.MEUPIA_COMANDO || CONFIGURACAO_CORE.comandoCompilador,
    comandoPython: ambiente.MEUPIA_PYTHON || CONFIGURACAO_CORE.comandoPython,
  });
}

export default CONFIGURACAO_CORE;

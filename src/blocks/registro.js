import { DEFINICOES_OPERADORES, preencherEntradasPadrao } from './operadores.js';
import { DEFINICOES_SE_SENAO, blocoSeSenaoParaJSON, restaurarBlocoSeSenao } from './se-senao.js';
import { DEFINICOES_REPETICOES, blocoRepeticaoParaJSON, restaurarBlocoRepeticao } from './repeticoes.js';
import { DEFINICOES_VARIAVEIS, blocoVariavelParaJSON, restaurarBlocoVariavel } from './variaveis.js';
import { DEFINICOES_BLOCOS, blocoParaJSON as blocoLeiaEscrevaParaJSON, restaurarBlocoLeiaEscreva } from './leia-escreva.js';
import { DEFINICOES_MODULO_GRID, blocoModuloParaJSON, restaurarBlocoModulo } from './modulo-grid.js';

export const DEFINICOES_BLOCOS_TODAS = Object.freeze([
  ...DEFINICOES_BLOCOS,
  ...DEFINICOES_VARIAVEIS,
  ...DEFINICOES_OPERADORES,
  ...DEFINICOES_SE_SENAO,
  ...DEFINICOES_REPETICOES,
  ...DEFINICOES_MODULO_GRID,
]);

export function registrarBlocos(Blockly) {
  Blockly.defineBlocksWithJsonArray(DEFINICOES_BLOCOS_TODAS);
}

/**
 * Converte um bloco (inclusive ramos aninhados) em `BlocoSerializado`.
 * As funções de cadeia são injetadas para evitar importação circular.
 */
export function blocoParaJSON(bloco, serializarCadeia) {
  switch (bloco.type) {
    case 'leia':
    case 'escreva':
      return blocoLeiaEscrevaParaJSON(bloco);
    case 'declarar':
    case 'atribuir':
      return blocoVariavelParaJSON(bloco);
    case 'se':
      return blocoSeSenaoParaJSON(bloco, serializarCadeia);
    case 'enquanto':
    case 'para':
      return blocoRepeticaoParaJSON(bloco, serializarCadeia);
    case 'usar_grid':
    case 'grid_iniciar':
    case 'grid_visitar':
      return blocoModuloParaJSON(bloco);
    default:
      return null;
  }
}

/** Reconstrói um bloco e seus ramos a partir de `BlocoSerializado`. */
export function restaurarBloco(dados, workspace, restaurarCadeia) {
  switch (dados.tipo) {
    case 'leia':
    case 'escreva':
      return restaurarBlocoLeiaEscreva(dados, workspace);
    case 'declarar':
    case 'atribuir':
      return restaurarBlocoVariavel(dados, workspace);
    case 'se':
      return restaurarBlocoSeSenao(dados, workspace, restaurarCadeia);
    case 'enquanto':
    case 'para':
      return restaurarBlocoRepeticao(dados, workspace, restaurarCadeia);
    case 'usar_grid':
    case 'grid_iniciar':
    case 'grid_visitar':
      return restaurarBlocoModulo(dados, workspace);
    default:
      throw new Error(`Bloco não reconhecido: ${dados.tipo}.`);
  }
}

/** Usado pelo observer para dar valores iniciais a blocos recém-criados. */
export function inicializarBloco(bloco, workspace) {
  preencherEntradasPadrao(bloco, workspace);
}

export default registrarBlocos;

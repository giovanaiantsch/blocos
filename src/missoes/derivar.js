import { TOOLBOX } from '../blocks/toolbox.js';

/** Blocos do módulo Grid, acrescentados depois do catálogo do escopo mínimo. */
export const BLOCOS_MODULO = Object.freeze(['usar_grid', 'grid_iniciar', 'grid_visitar']);

const ORDEM_CANONICA = Object.freeze([
  ...TOOLBOX.contents.flatMap((categoria) => categoria.contents.map((item) => item.type)),
  ...BLOCOS_MODULO,
]);

const PADRAO_SE = /\bsenao\b|\bse\s*\/\s*senao\b|\bse\b[^\n]*\bentao\b/i;
const PADRAO_ENQUANTO_CODIGO = /\benquanto\b/i;
const PADRAO_ENQUANTO_PISTA = /\benquanto\b[^\n]*\bfaca\b/i;
const PADRAO_PARA_CODIGO = /\bpara\b/i;
const PADRAO_PARA_PISTA = /\bpara\b[^\n]*\b(?:faca|ate)\b/i;

/** Comentários `//` e literais entre aspas não são construções do Portugol. */
function limparCodigo(texto) {
  return String(texto ?? '')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/"(?:[^"\\]|\\.)*"/g, ' ')
    .replace(/'(?:[^'\\]|\\.)*'/g, ' ');
}

/** Marcas de Markdown da descrição não podem virar operadores do Portugol. */
function limparDescricao(texto) {
  return String(texto ?? '').replace(/[*_`#]/g, ' ');
}

/** Comentários do código e descrição: pistas explícitas de construções. */
function pistasDaMissao(codigoOriginal, descricao) {
  const comentarios = String(codigoOriginal).match(/\/\/[^\n]*/g)?.join('\n') ?? '';
  return limparDescricao(`${comentarios}\n${descricao ?? ''}`);
}

/**
 * Conjunto de blocos permitidos, determinístico e limitado ao catálogo do
 * editor. Construções presentes na missão mas não implementadas (funcao,
 * retorne, dicionario...) são ignoradas em vez de impedir o carregamento.
 */
export function derivarBlocosPermitidos(missao) {
  const codigoOriginal = String(missao?.codigoInicial ?? '');
  const codigo = limparCodigo(codigoOriginal).toLowerCase();
  const pistas = pistasDaMissao(codigoOriginal, missao?.descricao).toLowerCase();
  const tipos = new Set();

  // A diretiva precisa ser lida antes de remover as aspas do literal.
  if (/\busar\s*["']grid["']/i.test(codigoOriginal)) {
    tipos.add('usar_grid');
  }
  if (/\bgrid_iniciar\s*\(/i.test(codigoOriginal)) {
    tipos.add('grid_iniciar');
  }
  if (/\bgrid_visitar\s*\(/i.test(codigoOriginal)) {
    tipos.add('grid_visitar');
  }

  if (/\bleia\s*\(/.test(codigo)) {
    tipos.add('leia');
  }
  if (/\bescreva\s*\(/.test(codigo)) {
    tipos.add('escreva');
    tipos.add('expressao_livre');
  }
  if (/\bvar\b|:\s*(inteiro|real|float|cadeia|string|logico)\b/i.test(codigo)) {
    tipos.add('declarar');
  }
  if (/<-/.test(codigo)) {
    tipos.add('atribuir');
  }
  if (PADRAO_SE.test(codigo) || PADRAO_SE.test(pistas)) {
    tipos.add('se');
  }
  if (PADRAO_ENQUANTO_CODIGO.test(codigo) || PADRAO_ENQUANTO_PISTA.test(pistas)) {
    tipos.add('enquanto');
  }
  if (PADRAO_PARA_CODIGO.test(codigo) || PADRAO_PARA_PISTA.test(pistas)) {
    tipos.add('para');
  }

  // Operadores vêm apenas do código: `**negrito**` e "para" da prosa não são
  // multiplicação nem laço. O hífen de `<-` também não é subtração.
  if (/\+/.test(codigo)) {
    tipos.add('op_soma');
  }
  if (/\*/.test(codigo)) {
    tipos.add('op_multiplicacao');
  }
  if (/\//.test(codigo)) {
    tipos.add('op_divisao');
  }
  if (/(?<![\w<])-(?!\w)/.test(codigo)) {
    tipos.add('op_subtracao');
  }
  if (/>(?!=)/.test(codigo)) {
    tipos.add('op_maior');
  }
  if (/<(?![-=])/.test(codigo)) {
    tipos.add('op_menor');
  }
  if (/==/.test(codigo)) {
    tipos.add('op_igual');
  }
  if (/\be\b/i.test(codigo)) {
    tipos.add('op_e');
  }
  if (/\bou\b/i.test(codigo)) {
    tipos.add('op_ou');
  }
  if (/\bnao\b/i.test(codigo)) {
    tipos.add('op_nao');
  }

  return ORDEM_CANONICA.filter((tipo) => tipos.has(tipo));
}

export default derivarBlocosPermitidos;

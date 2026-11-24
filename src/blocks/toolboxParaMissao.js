import { TOOLBOX } from './toolbox.js';

/** Categoria extra: só aparece quando a missão usa o módulo Grid. */
export const CATEGORIA_MODULO = Object.freeze({
  kind: 'category',
  name: 'Módulo Grid',
  colour: 285,
  contents: Object.freeze([
    Object.freeze({ kind: 'block', type: 'usar_grid' }),
    Object.freeze({ kind: 'block', type: 'grid_iniciar' }),
    Object.freeze({ kind: 'block', type: 'grid_visitar' }),
  ]),
});

/**
 * Sem missão, devolve exatamente a toolbox do escopo mínimo. Com missão,
 * mantém a ordem das categorias, remove categorias vazias e acrescenta o
 * módulo somente quando ele foi derivado da missão.
 */
export function toolboxParaMissao(tiposPermitidos) {
  if (!Array.isArray(tiposPermitidos)) {
    return TOOLBOX;
  }

  const permitidos = new Set(tiposPermitidos);
  const contents = [];

  for (const categoria of TOOLBOX.contents) {
    const blocos = categoria.contents.filter((item) => permitidos.has(item.type));
    if (blocos.length > 0) {
      contents.push({ ...categoria, contents: blocos });
    }
  }

  const blocosModulo = CATEGORIA_MODULO.contents.filter((item) => permitidos.has(item.type));
  if (blocosModulo.length > 0) {
    contents.push({ ...CATEGORIA_MODULO, contents: blocosModulo });
  }

  return { kind: TOOLBOX.kind, contents };
}

export default toolboxParaMissao;

/**
 * Definições puras dos blocos do módulo Grid (EC-02).
 * Nenhum código do plugin é importado: a diretiva e as funções são apenas
 * texto gerado, executado depois pela CLI pública do Core (RT-02).
 */
export const DEFINICOES_MODULO_GRID = Object.freeze([
  {
    type: 'usar_grid',
    message0: 'usar "grid"',
    previousStatement: null,
    nextStatement: null,
    colour: 285,
    tooltip: 'Carrega o módulo oficial Grid antes da seção inicio.',
    helpUrl: '',
  },
  {
    type: 'grid_iniciar',
    message0: 'iniciar grid %1 por %2',
    args0: [
      { type: 'field_number', name: 'LARGURA', value: 3, min: 1, precision: 1 },
      { type: 'field_number', name: 'ALTURA', value: 3, min: 1, precision: 1 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 285,
    tooltip: 'Cria um mapa com as dimensões informadas.',
    helpUrl: '',
  },
  {
    type: 'grid_visitar',
    message0: 'visitar a célula x %1 y %2 no passo %3',
    args0: [
      { type: 'field_number', name: 'X', value: 2, min: 0, precision: 1 },
      { type: 'field_number', name: 'Y', value: 3, min: 0, precision: 1 },
      { type: 'field_number', name: 'PASSO', value: 1, min: 0, precision: 1 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 285,
    tooltip: 'Marca uma célula como visitada no passo informado.',
    helpUrl: '',
  },
]);

function inteiroDoCampo(bloco, nome, padrao) {
  const valor = Number(bloco?.getFieldValue?.(nome) ?? padrao);
  return Number.isInteger(valor) ? valor : padrao;
}

export function blocoModuloParaJSON(bloco) {
  switch (bloco.type) {
    case 'usar_grid':
      return { tipo: 'usar_grid' };
    case 'grid_iniciar':
      return {
        tipo: 'grid_iniciar',
        largura: inteiroDoCampo(bloco, 'LARGURA', 3),
        altura: inteiroDoCampo(bloco, 'ALTURA', 3),
      };
    case 'grid_visitar':
      return {
        tipo: 'grid_visitar',
        x: inteiroDoCampo(bloco, 'X', 2),
        y: inteiroDoCampo(bloco, 'Y', 3),
        passo: inteiroDoCampo(bloco, 'PASSO', 1),
      };
    default:
      return null;
  }
}

export function restaurarBlocoModulo(dados, workspace) {
  const bloco = workspace.newBlock(dados.tipo);
  const campos = {
    grid_iniciar: [
      ['LARGURA', dados.largura ?? 3],
      ['ALTURA', dados.altura ?? 3],
    ],
    grid_visitar: [
      ['X', dados.x ?? 2],
      ['Y', dados.y ?? 3],
      ['PASSO', dados.passo ?? 1],
    ],
  }[dados.tipo];

  for (const [nome, valor] of campos ?? []) {
    bloco.setFieldValue(Number(valor), nome);
  }
  return bloco;
}

export default DEFINICOES_MODULO_GRID;

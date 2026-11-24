export const TOOLBOX = Object.freeze({
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Entrada e saída',
      colour: 210,
      contents: [
        { kind: 'block', type: 'leia' },
        { kind: 'block', type: 'escreva' },
        { kind: 'block', type: 'expressao_livre' },
      ],
    },
    {
      kind: 'category',
      name: 'Variáveis',
      colour: 230,
      contents: [
        { kind: 'block', type: 'declarar' },
        { kind: 'block', type: 'atribuir' },
      ],
    },
    {
      kind: 'category',
      name: 'Operadores',
      colour: 60,
      contents: [
        { kind: 'block', type: 'op_soma' },
        { kind: 'block', type: 'op_subtracao' },
        { kind: 'block', type: 'op_multiplicacao' },
        { kind: 'block', type: 'op_divisao' },
        { kind: 'block', type: 'op_maior' },
        { kind: 'block', type: 'op_menor' },
        { kind: 'block', type: 'op_igual' },
        { kind: 'block', type: 'op_e' },
        { kind: 'block', type: 'op_ou' },
        { kind: 'block', type: 'op_nao' },
      ],
    },
    {
      kind: 'category',
      name: 'Decisão',
      colour: 20,
      contents: [{ kind: 'block', type: 'se' }],
    },
    {
      kind: 'category',
      name: 'Repetições',
      colour: 300,
      contents: [
        { kind: 'block', type: 'enquanto' },
        { kind: 'block', type: 'para' },
      ],
    },
  ],
});

export default TOOLBOX;

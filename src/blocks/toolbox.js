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
      ],
    },
    {
      kind: 'category',
      name: 'Variáveis',
      colour: 230,
      contents: [{ kind: 'block', type: 'atribuir' }],
    },
  ],
});

export default TOOLBOX;

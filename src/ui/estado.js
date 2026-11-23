import { gerarPortugol } from '../generation/gerador.js';

/** Recalcula o Portugol a partir da única fonte de verdade: o projeto. */
export function calcularPortugol(estado = {}, projeto) {
  return {
    ...estado,
    projeto,
    portugolGerado: gerarPortugol(projeto),
  };
}

/**
 * Liga as alterações do workspace ao gerador e ao painel. Não há botão "gerar":
 * qualquer evento do Blockly recalcula e repinta o Portugol.
 */
export function registrarObservador({
  workspace,
  estadoInicial = {},
  obterProjeto,
  pintar = () => {},
}) {
  let estado = calcularPortugol(estadoInicial, obterProjeto());
  pintar(estado.portugolGerado);

  workspace.addChangeListener(() => {
    estado = calcularPortugol(estado, obterProjeto());
    pintar(estado.portugolGerado);
  });

  return estado;
}

export default calcularPortugol;
